import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/overview", request.url));
    }
  }

  if (pathname.startsWith("/dashboard") && !token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`)) && token) {
    const target = token.role === "ADMIN" ? "/admin/overview" : "/dashboard/overview";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register", "/forgot-password", "/reset-password/:path*"]
};
