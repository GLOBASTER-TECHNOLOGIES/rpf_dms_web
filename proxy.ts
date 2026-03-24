import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ["/login"];
const OPTIONAL_AUTH_ROUTES = ["/api/trainschedule/get", "/api/debrief/get"];
const AUTH_API_ROUTES = ["/api/auth/login", "/api/auth/refresh"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Static files — exit immediately
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  // 2. Auth API routes — always allow
  if (AUTH_API_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // 2b. Optional auth routes — always allow, route handles its own auth
  if (OPTIONAL_AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // 3. Public routes — redirect to dashboard if already logged in
  if (PUBLIC_ROUTES.includes(pathname)) {
    const accessToken = req.cookies.get("accessToken")?.value;

    if (accessToken) {
      try {
        const { payload } = await jwtVerify(
          accessToken,
          new TextEncoder().encode(process.env.JWT_ACCESS_SECRET),
        );
        const role = payload.role as string;
        return NextResponse.redirect(
          new URL(role === "post" ? "/post" : "/admin", req.url),
        );
      } catch {}
    }

    // No valid access token — show login page
    return NextResponse.next();
  }

  // 4. Protected routes — verify tokens
  const accessToken =
    req.cookies.get("accessToken")?.value ??
    req.headers.get("authorization")?.replace("Bearer ", "");
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (!accessToken && !refreshToken) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (accessToken) {
    try {
      await jwtVerify(
        accessToken,
        new TextEncoder().encode(process.env.JWT_ACCESS_SECRET),
      );
      return NextResponse.next();
    } catch {}
  }

  if (refreshToken) {
    try {
      const refreshRes = await fetch(
        new URL("/api/auth/refresh", req.url).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        },
      );

      if (refreshRes.ok) {
        const { accessToken: newAccessToken } = await refreshRes.json();
        const response = NextResponse.next();
        response.cookies.set("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 15,
          path: "/",
        });
        return response;
      }

      // Refresh failed — clear cookies and redirect to login
      const loginUrl = new URL("/login", req.url);
      const redirectRes = NextResponse.redirect(loginUrl);
      redirectRes.cookies.delete("accessToken");
      redirectRes.cookies.delete("refreshToken");
      return redirectRes;
    } catch {}
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("expired", "1");
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
