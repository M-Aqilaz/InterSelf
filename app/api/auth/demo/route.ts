import { NextRequest, NextResponse } from "next/server";
import { fetchSafeUserById, issueSessionCookie } from "@/lib/auth";
import { createDemoUser, isDemoLoginEnabled, pruneExpiredDemoUsers } from "@/lib/demo";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// POST /api/auth/demo: one click, no credentials. Signs the visitor into a fresh sandbox account.
export async function POST(request: NextRequest) {
  if (!isDemoLoginEnabled()) {
    return NextResponse.json({ error: "Demo login is disabled" }, { status: 404 });
  }

  const limit = rateLimit(`demo:${clientIp(request)}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan demo. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    // Cleanup must never block a visitor from getting in.
    await pruneExpiredDemoUsers().catch((error) => console.error("Demo cleanup failed", error));

    const user = await createDemoUser();
    const safeUser = await fetchSafeUserById(user.id);
    const response = NextResponse.json({ user: safeUser }, { status: 201 });
    await issueSessionCookie(response, user.id);
    return response;
  } catch (error) {
    console.error("POST /api/auth/demo failed", error);
    return NextResponse.json({ error: "Tidak bisa membuat akun demo. Coba lagi." }, { status: 500 });
  }
}
