import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/maintenance", // Add this so it doesn't redirect itself
  "/api(.*)",
  "/sign-up(.*)",
  "/sign-in(.*)",
]);

// Toggle for maintenance mode
const MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE === "true";

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // Allow access to the maintenance page itself
  if (MAINTENANCE_MODE && !pathname.startsWith("/maintenance")) {
    const maintenanceUrl = request.nextUrl.clone();
    maintenanceUrl.pathname = "/maintenance";
    return NextResponse.rewrite(maintenanceUrl);
  }

  // Normal Clerk protection
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});
