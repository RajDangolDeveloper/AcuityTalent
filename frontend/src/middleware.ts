import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(request) {
    const { nextUrl } = request;
    const token = request.nextauth.token;
    const userRole = token?.role as string;
    const isOnAdmin = nextUrl.pathname.startsWith("/admin");
    const isOnCandidate = nextUrl.pathname.startsWith("/candidate");
    const isOnRecruiter = nextUrl.pathname.startsWith("/recruiter");
    const isOnLogin = nextUrl.pathname.includes("/login");
    const isOnRegister = nextUrl.pathname.includes("/register");

    if (token?.error === "RefreshAccessTokenError") {
      return NextResponse.redirect(
        new URL("/candidate/login?error=SessionExpired", request.url),
      );
    }

    if (isOnLogin && token) {
      return NextResponse.redirect(
        new URL("/" + userRole.toLowerCase() + "/dashboard", nextUrl),
      );
    }

    if (isOnRegister && token) {
      return NextResponse.redirect(
        new URL("/" + userRole.toLowerCase() + "/dashboard", nextUrl),
      );
    }

    if (isOnAdmin && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }

    if (
      isOnCandidate &&
      !isOnLogin &&
      userRole !== "CANDIDATE" &&
      userRole !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }

    if (
      isOnRecruiter &&
      !isOnLogin &&
      userRole !== "RECRUITER" &&
      userRole !== "ADMIN"
    ) {
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
          pathname.includes("/login") ||
          pathname === "/" ||
          pathname.startsWith("/api/auth") // Important: allow NextAuth API routes
        ) {
          return true;
        }

        // Protected routes require token
        if (
          pathname.startsWith("/dashboard") ||
          pathname.startsWith("/admin") ||
          pathname.startsWith("/candidate") ||
          pathname.startsWith("/recruiter") ||
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
      signIn: "/recruiter/login",
      signOut: "/logout",
    },
  },
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
