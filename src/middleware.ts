import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Dummy medical template slugs from initial template that Google indexed and must be permanently purged
const DELETED_DUMMY_TEMPLATE_SLUGS = [
  "cardiology-diagnostic-panel",
  "general-consultation",
  "pediatric-wellness-vaccination",
  "neurology-migraine-care",
  "dental-prophylaxis-hygiene",
  "executive-health-concierge",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Immediately return HTTP 410 Gone for any dummy medical template pages
  // This instructs Googlebot & Bingbot to immediately drop the indexed pages, snippets, and cache
  const isDeletedDummyMedicalRoute = DELETED_DUMMY_TEMPLATE_SLUGS.some((slug) => {
    return (
      pathname === `/services/${slug}` ||
      pathname === `/treatments/${slug}` ||
      pathname.startsWith(`/services/${slug}/`) ||
      pathname.startsWith(`/treatments/${slug}/`)
    );
  });

  if (isDeletedDummyMedicalRoute) {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>410 Gone - Template Page Permanently Deleted</title>
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 100px 20px; background: #fafafa; color: #18181b; }
    h1 { font-size: 1.875rem; font-weight: 800; margin-bottom: 0.75rem; color: #0f172a; }
    p { max-width: 520px; margin: 0 auto 2rem; color: #64748b; line-height: 1.6; font-size: 0.95rem; }
    a { display: inline-block; background: #0d9488; color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 0.875rem; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.2); }
  </style>
</head>
<body>
  <h1>410 - Medical Template Page Permanently Deleted</h1>
  <p>This dummy medical template page has been permanently deleted from CA Smile Dental Clinic. We are a specialized dental clinic in Bilimora, Gujarat offering advanced dentistry, root canals, dental implants, and smile designing.</p>
  <a href="/">Return to CA Smile Dental Clinic</a>
</body>
</html>`,
      {
        status: 410,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }

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
  matcher: [
    "/admin/:path*",
    "/services/:path*",
    "/treatments/:path*",
  ],
};
