import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  issueSessionCookie,
  fetchSafeUserById,
} from "@/lib/auth";

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
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user?.hashedPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const passwordMatches = await verifyPassword(parsed.data.password, user.hashedPassword);

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
