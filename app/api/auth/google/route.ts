import { NextRequest, NextResponse } from "next/server";
import { createGoogleAuthorizationResponse } from "@/lib/google-oauth";

export async function GET(request: NextRequest) {
  try {
    return createGoogleAuthorizationResponse(request);
  } catch (error) {
    console.error("GET /api/auth/google failed", error);
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "google_oauth_not_configured");
    return NextResponse.redirect(url);
  }
}
