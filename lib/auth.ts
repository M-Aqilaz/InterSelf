import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SESSION_MAX_AGE, SESSION_COOKIE_NAME } from "@/lib/constants";
import { signSession, verifySessionToken, type SessionPayload } from "@/lib/session";

const SALT_ROUNDS = 12;

type SafeUser = Awaited<ReturnType<typeof fetchSafeUserById>>;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function issueSessionCookie(response: NextResponse, userId: string) {
  const token = await signSession({ userId });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: DEFAULT_SESSION_MAX_AGE,
    path: "/",
  });
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}

export async function getCurrentUser(request?: NextRequest) {
  const token = await getSessionToken(request);
  if (!token) {
    return null;
  }

  const payload = await verifySessionToken(token);
  if (!payload?.userId) {
    return null;
  }

  return fetchSafeUserById(payload.userId);
}

export async function requireUser(request?: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function getSessionToken(request?: NextRequest) {
  if (request) {
    return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
  }

  const store = await cookies();
  return store.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function fetchSafeUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      stats: true,
    },
  });

  if (!user) {
    return null;
  }

  const { hashedPassword: _hashedPassword, ...safeUser } = user;
  void _hashedPassword;
  return safeUser;
}

export function sanitizeUser(user: SafeUser) {
  if (!user) {
    return null;
  }
  return user;
}

export type { SessionPayload };
