import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { adminRoles } from "@/lib/rbac";

const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/admin/login"];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const pathname = request.nextUrl.pathname;

  if (pathname === "/admin/login") {
    if (token?.role && adminRoles.includes(token.role as never)) {
      return NextResponse.redirect(new URL("/admin/overview", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!token) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (!token.role || !adminRoles.includes(token.role as never)) {
      return NextResponse.redirect(new URL("/dashboard/overview", request.url));
    }
  }

  if (pathname.startsWith("/dashboard") && !token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`)) && token) {
    const target = token.role && adminRoles.includes(token.role as never) ? "/admin/overview" : "/dashboard/overview";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register", "/forgot-password", "/reset-password/:path*", "/admin/login"]
};
