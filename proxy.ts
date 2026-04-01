import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ["/login"];
const OPTIONAL_AUTH_ROUTES = [
  // "/api/trainschedule/get",
  // "/api/debrief/get",
  "/api/app-config", // 👈 Add this
];
const AUTH_API_ROUTES = ["/api/auth/login", "/api/auth/refresh"];

// 🔥 VERSION HELPER
function isVersionLower(current: string, minimum: string) {
  const c = current.split(".").map(Number);
  const m = minimum.split(".").map(Number);

  for (let i = 0; i < m.length; i++) {
    if ((c[i] || 0) < m[i]) return true;
    if ((c[i] || 0) > m[i]) return false;
  }
  return false;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── 1. STATIC FILES ─────────────────────────────────────
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  // ── 2. AUTH API ROUTES ──────────────────────────────────
  if (AUTH_API_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // ── 3. OPTIONAL AUTH ROUTES ─────────────────────────────
  if (OPTIONAL_AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // ── 4. VERSION CHECK (🔥 DB BASED)
  const platform = req.headers.get("x-platform");
  const version = req.headers.get("x-app-version");

  // 🔥 ADD THESE LOGS HERE
  // console.log("---- VERSION DEBUG ----");
  // console.log("PATH:", pathname);
  // console.log("PLATFORM:", platform);
  // console.log("VERSION:", version);
  // console.log("-----------------------");

  if (platform === "mobile") {
    try {
      const res = await fetch(new URL("/api/app-config", req.url).toString(), {
        cache: "no-store",
      });

      if (res.ok) {
        const result = await res.json();

        const latestVersion = result.data?.latestVersion ?? "1.0.0";
        const forceUpdate = result.data?.forceUpdate ?? false;
        const updateUrl = result.data?.updateUrl ?? "";

        if (
          forceUpdate &&
          (!version || isVersionLower(version, latestVersion))
        ) {
          return NextResponse.json(
            {
              success: false,
              error: "APP_OUTDATED",
              message: "Please update your app to continue",
              updateUrl:
                updateUrl ||
                "https://play.google.com/store/apps/details?id=your.app",
            },
            { status: 426 },
          );
        }
      }

      // 🔥 If config API fails → freeze app
      else {
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
    } catch (e) {
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

  // ── 5. PUBLIC ROUTES ────────────────────────────────────
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

  // ── 6. PROTECTED ROUTES ─────────────────────────────────
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
