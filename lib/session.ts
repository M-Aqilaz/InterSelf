import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "jose";
import { DEFAULT_SESSION_MAX_AGE, SESSION_COOKIE_NAME } from "@/lib/constants";

export interface SessionPayload extends JWTPayload {
  userId: string;
}

const encoder = new TextEncoder();

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set. Please configure it in your environment.");
  }
  if (process.env.NODE_ENV === "production" && (secret.length < 32 || secret === "change-me")) {
    throw new Error("AUTH_SECRET must be a random string of at least 32 characters in production.");
  }
  return encoder.encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DEFAULT_SESSION_MAX_AGE}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, getSecretKey());
    return payload;
  } catch (error) {
    console.error("Failed to verify session token", error);
    return null;
  }
}

export { SESSION_COOKIE_NAME };
