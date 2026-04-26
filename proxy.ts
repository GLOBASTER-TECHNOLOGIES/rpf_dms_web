import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ["/login"];
const OPTIONAL_AUTH_ROUTES = ["/api/app-config"];
const AUTH_API_ROUTES = ["/api/auth/login", "/api/auth/refresh"];

// 🔥 VERSION HELPER
function isVersionLower(current: string, minimum: string) {
  const c = current.split(".").map(Number);
  const m = minimum.split(".").map(Number);

  for (let i = 0; i < m.length; i++) {
    const cv = c[i] || 0;
    const mv = m[i] || 0;
    if (cv < mv) return true;
    if (cv > mv) return false;
  }
  return false;
}

// 🚨 CHANGED THIS FROM 'middleware' TO 'proxy' 🚨
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── 1. IMPROVED SKIP (Static Files + Assets) ──────────────────
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".apk")
  ) {
    return NextResponse.next();
  }

  // 🚨 2. INTERNAL CALL GUARD
  const isInternalConfigCall = req.headers.get("x-internal-call") === "true";
  if (isInternalConfigCall) {
    return NextResponse.next();
  }

  // ── 3. AUTH & OPTIONAL ROUTES ─────────────────────────────
  if (
    AUTH_API_ROUTES.some((r) => pathname.startsWith(r)) ||
    OPTIONAL_AUTH_ROUTES.some((r) => pathname.startsWith(r))
  ) {
    return NextResponse.next();
  }

  // ── 4. VERSION CHECK (MOBILE ONLY) ──────────────────────────
  const platform = req.headers.get("x-platform");
  const version = req.headers.get("x-app-version");

  if (platform === "mobile") {
    try {
      const res = await fetch(new URL("/api/app-config", req.url).toString(), {
        cache: "no-store",
        headers: {
          "x-internal-call": "true",
        },
      });

      if (res.ok) {
        const result = await res.json();
        const config = result.data;

        if (!config) throw new Error("NO_CONFIG_IN_DB");

        const { latestVersion, forceUpdate, downloadUrl } = config;

        if (forceUpdate) {
          if (!version || isVersionLower(version, latestVersion)) {
            return NextResponse.json(
              {
                success: false,
                error: "APP_OUTDATED",
                message: "Please update your app to continue",
                downloadUrl: downloadUrl,
              },
              { status: 426 },
            );
          }
        }
      } else {
        throw new Error("CONFIG_API_FAILURE");
      }
    } catch (e) {
      console.error("Proxy Version Check Error:", e);
      return NextResponse.json(
        {
          success: false,
          error: "APP_FROZEN",
          message:
            "The app is temporarily unavailable. Please contact support.",
        },
        { status: 503 },
      );
    }
  }

  // ── 5. PUBLIC ROUTES LOGIC ────────────────────────────────────
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
    return NextResponse.next();
  }

  // ── 6. PROTECTED ROUTES LOGIC ─────────────────────────────────
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
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|app-release.apk).*)",
  ],
};
