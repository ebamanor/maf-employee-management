import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "employee-media-secret"
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session")?.value;

  let session: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      session = payload;
    } catch {
      session = null;
    }
  }

  if (pathname.startsWith("/admin") && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/employee") && session?.role !== "EMPLOYEE") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && session) {
    const dest = session.role === "ADMIN" ? "/admin" : "/employee";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/employee/:path*", "/settings", "/login"],
};
