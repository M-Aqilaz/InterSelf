import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  verifyPassword,
  issueSessionCookie,
  fetchSafeUserById,
} from "@/lib/auth";

// Compared against when the email is unknown, so response time does not reveal which emails exist.
const DUMMY_HASH = "$2b$12$Pt3giakE7x1KUs3.WbBa/u5DrT5h64YnaVtXXifpxmku4Tw8eWrvm";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = loginSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid credentials", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const email = parsed.data.email;

    const limit = rateLimit(`login:${clientIp(request)}:${email}`, 8, 15 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    const passwordMatches = await verifyPassword(
      parsed.data.password,
      user?.hashedPassword ?? DUMMY_HASH
    );

    if (!user?.hashedPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!passwordMatches) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const safeUser = await fetchSafeUserById(user.id);
    const response = NextResponse.json({ user: safeUser }, { status: 200 });
    await issueSessionCookie(response, user.id);
    return response;
  } catch (error) {
    console.error("POST /api/auth/login failed", error);
    return NextResponse.json({ error: "Unable to login" }, { status: 500 });
  }
}
