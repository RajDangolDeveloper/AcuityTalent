import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(request) {
    const { nextUrl } = request;
    const token = request.nextauth.token;
    const userRole = token?.role as string;

    const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
    const isOnAdmin = nextUrl.pathname.startsWith("/admin");
    const isOnLogin = nextUrl.pathname.startsWith("/login");

    if (isOnLogin && token) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    if (isOnAdmin && userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes (no token required)
        if (
          pathname.startsWith("/login") ||
          pathname === "/" ||
          pathname.startsWith("/api/auth") // Important: allow NextAuth API routes
        ) {
          return true;
        }

        // Protected routes require token
        if (
          pathname.startsWith("/dashboard") ||
          pathname.startsWith("/admin") ||
          pathname.startsWith("/profile") ||
          pathname.startsWith("/settings")
        ) {
          return !!token; // Must have valid token
        }

        // Default: allow
        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
