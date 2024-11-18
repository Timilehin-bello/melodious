// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Read the listener type from cookies
  const userType = request.cookies.get("userType")?.value;

  // If userType is missing, redirect to login for protected paths
  if (
    !userType &&
    (pathname.startsWith("/artist") || pathname.startsWith("/listener"))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect to correct dashboard if listener is trying to access an unauthorized route
  if (
    (userType === "artist" && pathname.startsWith("/listener")) ||
    (userType === "listener" && pathname.startsWith("/artist"))
  ) {
    // Determine the target dashboard URL based on userType
    const targetDashboard =
      userType === "artist" ? "/artist/dashboard" : "/listener/dashboard";
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  // Allow the request to continue if no redirection is needed
  return NextResponse.next();
}

// Apply this middleware only to paths that start with /artist or /listener
export const config = {
  matcher: ["/artist/:path*", "/listener/:path*"],
};
