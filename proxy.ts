import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_ROUTES = [
  "/dashboard",
  "/tasks",
  "/battle",
  "/leaderboard",
  "/profile",
  "/friends",
  "/weekly",
  "/achievements",
  "/inventory",
  "/stats",
  "/settings",
];

const PROTECTED_API_PREFIXES = ["/api/tasks"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api/auth") || pathname === "/api/auth/me") {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionToken ? await verifySessionToken(sessionToken) : null;

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const requiresAuth = isProtectedPage(pathname) || isProtectedApi(pathname);

  if (!requiresAuth) {
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

function isProtectedPage(pathname: string) {
  return PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isProtectedApi(pathname: string) {
  if (!pathname.startsWith("/api")) {
    return false;
  }

  return PROTECTED_API_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
