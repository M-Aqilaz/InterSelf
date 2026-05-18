import { createHash, randomBytes } from "crypto";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { issueSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createUserGameRecords } from "@/lib/user-provisioning";

const GOOGLE_AUTHORIZATION_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

const OAUTH_COOKIE_MAX_AGE = 10 * 60;
const GOOGLE_STATE_COOKIE = "interself.google.state";
const GOOGLE_NONCE_COOKIE = "interself.google.nonce";
const GOOGLE_VERIFIER_COOKIE = "interself.google.verifier";
const GOOGLE_REDIRECT_COOKIE = "interself.google.redirect";

type GoogleIdTokenPayload = JWTPayload & {
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
  nonce?: string;
};

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  id_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

function oauthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: OAUTH_COOKIE_MAX_AGE,
    path: "/",
  };
}

function clearOauthCookies(response: NextResponse) {
  for (const name of [
    GOOGLE_STATE_COOKIE,
    GOOGLE_NONCE_COOKIE,
    GOOGLE_VERIFIER_COOKIE,
    GOOGLE_REDIRECT_COOKIE,
  ]) {
    response.cookies.set({
      name,
      value: "",
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }
}

function createRandomString(byteLength = 32) {
  return randomBytes(byteLength).toString("base64url");
}

function createCodeChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

function getGoogleCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured.");
  }

  return { clientId, clientSecret };
}

export function getSafeRedirectPath(value: string | null | undefined) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export function getGoogleRedirectUri(request: NextRequest) {
  return new URL("/api/auth/google/callback", request.nextUrl.origin).toString();
}

export function createGoogleAuthorizationResponse(request: NextRequest) {
  const { clientId } = getGoogleCredentials();
  const redirectTo = getSafeRedirectPath(request.nextUrl.searchParams.get("redirect"));
  const state = createRandomString();
  const nonce = createRandomString();
  const verifier = createRandomString(64);
  const codeChallenge = createCodeChallenge(verifier);

  const url = new URL(GOOGLE_AUTHORIZATION_ENDPOINT);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", getGoogleRedirectUri(request));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(url);
  response.cookies.set(GOOGLE_STATE_COOKIE, state, oauthCookieOptions());
  response.cookies.set(GOOGLE_NONCE_COOKIE, nonce, oauthCookieOptions());
  response.cookies.set(GOOGLE_VERIFIER_COOKIE, verifier, oauthCookieOptions());
  response.cookies.set(GOOGLE_REDIRECT_COOKIE, redirectTo, oauthCookieOptions());
  return response;
}

function redirectToLogin(request: NextRequest, error: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", error);
  const response = NextResponse.redirect(url);
  clearOauthCookies(response);
  return response;
}

async function exchangeCodeForTokens({
  code,
  codeVerifier,
  redirectUri,
}: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}) {
  const { clientId, clientSecret } = getGoogleCredentials();
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    code_verifier: codeVerifier,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const tokens = (await response.json()) as GoogleTokenResponse;

  if (!response.ok || !tokens.id_token) {
    throw new Error(tokens.error_description ?? tokens.error ?? "Unable to exchange Google code.");
  }

  return tokens;
}

async function verifyGoogleIdToken(idToken: string, expectedNonce: string) {
  const { clientId } = getGoogleCredentials();
  const { payload } = await jwtVerify<GoogleIdTokenPayload>(idToken, GOOGLE_JWKS, {
    audience: clientId,
    issuer: ["https://accounts.google.com", "accounts.google.com"],
  });

  if (payload.nonce !== expectedNonce) {
    throw new Error("Invalid Google nonce.");
  }

  if (!payload.sub || !payload.email || payload.email_verified !== true) {
    throw new Error("Google account email is not verified.");
  }

  return {
    sub: payload.sub,
    email: payload.email.trim().toLowerCase(),
    name: payload.name?.trim() || payload.email.split("@")[0],
    picture: payload.picture,
  };
}

function normalizeUsername(seed: string) {
  const normalized = seed.toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
  return (normalized || "hunter").slice(0, 20).padEnd(3, "0");
}

async function createUniqueUsername(tx: Prisma.TransactionClient, seed: string) {
  const base = normalizeUsername(seed);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const suffix = attempt === 0 ? "" : `_${createRandomString(3).slice(0, 5).toLowerCase()}`;
    const candidate = `${base}${suffix}`.slice(0, 24);
    const existing = await tx.profile.findUnique({ where: { username: candidate } });

    if (!existing) {
      return candidate;
    }
  }

  return `hunter_${createRandomString(8).slice(0, 16).toLowerCase()}`;
}

async function upsertGoogleUser(
  tokens: GoogleTokenResponse,
  googleUser: Awaited<ReturnType<typeof verifyGoogleIdToken>>
) {
  return prisma.$transaction(async (tx) => {
    const linkedAccount = await tx.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: googleUser.sub,
        },
      },
      include: { user: true },
    });

    const accountData = {
      type: "oauth",
      provider: "google",
      providerAccountId: googleUser.sub,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : null,
      token_type: tokens.token_type,
      scope: tokens.scope,
      id_token: tokens.id_token,
    };

    if (linkedAccount) {
      await tx.account.update({
        where: { id: linkedAccount.id },
        data: accountData,
      });

      return tx.user.update({
        where: { id: linkedAccount.userId },
        data: {
          email: googleUser.email,
          emailVerified: new Date(),
          image: googleUser.picture,
          name: linkedAccount.user.name ?? googleUser.name,
        },
      });
    }

    const existingUser = await tx.user.findUnique({ where: { email: googleUser.email } });

    if (existingUser) {
      await tx.user.update({
        where: { id: existingUser.id },
        data: {
          emailVerified: new Date(),
          image: existingUser.image ?? googleUser.picture,
          name: existingUser.name ?? googleUser.name,
        },
      });

      await tx.account.create({
        data: {
          ...accountData,
          userId: existingUser.id,
        },
      });

      return existingUser;
    }

    const username = await createUniqueUsername(tx, googleUser.name || googleUser.email.split("@")[0]);
    const user = await tx.user.create({
      data: {
        email: googleUser.email,
        emailVerified: new Date(),
        image: googleUser.picture,
        name: googleUser.name,
        accounts: {
          create: accountData,
        },
      },
    });

    await createUserGameRecords(tx, user.id, username);
    return user;
  });
}

export async function handleGoogleCallback(request: NextRequest) {
  const error = request.nextUrl.searchParams.get("error");
  if (error) {
    return redirectToLogin(request, "google_oauth_denied");
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(GOOGLE_STATE_COOKIE)?.value;
  const expectedNonce = request.cookies.get(GOOGLE_NONCE_COOKIE)?.value;
  const codeVerifier = request.cookies.get(GOOGLE_VERIFIER_COOKIE)?.value;
  const redirectTo = getSafeRedirectPath(request.cookies.get(GOOGLE_REDIRECT_COOKIE)?.value);

  if (!code || !state || state !== expectedState || !expectedNonce || !codeVerifier) {
    return redirectToLogin(request, "google_oauth_invalid");
  }

  try {
    const tokens = await exchangeCodeForTokens({
      code,
      codeVerifier,
      redirectUri: getGoogleRedirectUri(request),
    });
    const googleUser = await verifyGoogleIdToken(tokens.id_token!, expectedNonce);
    const user = await upsertGoogleUser(tokens, googleUser);

    const response = NextResponse.redirect(new URL(redirectTo, request.url));
    await issueSessionCookie(response, user.id);
    clearOauthCookies(response);
    return response;
  } catch (callbackError) {
    console.error("Google OAuth callback failed", callbackError);
    return redirectToLogin(request, "google_oauth_failed");
  }
}
