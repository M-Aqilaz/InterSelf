import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const PROTECTED_PAGES = ["/dashboard", "/onboarding"];

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients (curl, server-to-server) send no Origin

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CSRF guard: state-changing API calls must come from this site.
  if (pathname.startsWith("/api/") && !SAFE_METHODS.has(request.method) && !isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request blocked" }, { status: 403 });
  }

  // Cheap early redirect for signed-out visitors. The pages and API routes still verify
  // the session token itself; this only avoids rendering a protected shell for no cookie.
  const needsSession = PROTECTED_PAGES.some((page) => pathname === page || pathname.startsWith(`${page}/`));
  if (needsSession && !request.cookies.get(SESSION_COOKIE_NAME)?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
