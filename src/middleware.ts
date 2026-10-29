import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow login page, NextAuth internal routes, and static assets
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Intercept all other /admin routes
  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req,
      secret:
        process.env.NEXTAUTH_SECRET ||
        "super-secret-clinic-auth-token-for-dev-session-key-32-chars-min",
    });

    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Strict Owner/Admin Role-based route restriction
    // Staff members can only access daily operational views (pending, calendar, appointments, whatsapp, patients)
    const adminOnlyRoutes = [
      "/admin/staff",
      "/admin/booking-form",
      "/admin/settings",
      "/admin/blog",
      "/admin/services",
      "/admin/reviews",
      "/admin/setup",
    ];

    const isAdminOnly = adminOnlyRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isAdminOnly && token.role !== "ADMIN") {
      const redirectUrl = new URL("/admin/today", req.url);
      redirectUrl.searchParams.set("error", "admin_only");
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
