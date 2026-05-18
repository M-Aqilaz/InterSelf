import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { hashPassword, issueSessionCookie, fetchSafeUserById } from "@/lib/auth";
import { createUserGameRecords } from "@/lib/user-provisioning";

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z
    .string()
    .trim()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .transform((value) => value.toLowerCase()),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = registerSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const email = parsed.data.email;
    const username = parsed.data.username;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          {
            profile: {
              username,
            },
          },
        ],
      },
      include: { profile: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Account already exists with that email or username" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(parsed.data.password);

    const newUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          email,
          name: username,
          hashedPassword,
        },
      });

      await createUserGameRecords(tx, user.id, username);

      return user;
    });

    const safeUser = await fetchSafeUserById(newUser.id);
    const response = NextResponse.json({ user: safeUser }, { status: 201 });
    await issueSessionCookie(response, newUser.id);
    return response;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Account already exists with that email or username" },
        { status: 409 }
      );
    }

    console.error("POST /api/auth/register failed", error);
    return NextResponse.json({ error: "Unable to register" }, { status: 500 });
  }
}
