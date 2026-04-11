import { NextResponse, type NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/access-token";

const authRoutes = new Set(["/login", "/register"]);

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(getAccessCookieName())?.value;
  const refreshToken = request.cookies.get(getRefreshCookieName())?.value;
  const payload = await verifyAccessToken(accessToken);

  if (payload) {
    return handleVerifiedAccessToken(request, payload);
  }

  if (!refreshToken) {
    return NextResponse.next();
  }

  const refreshedSession = await refreshAccessToken(request);

  if (!refreshedSession) {
    return NextResponse.next();
  }

  return handleRefreshedSession(request, refreshedSession);
}

export const config = {
  matcher: [
    "/",
    "/analytics/:path*",
    "/links/:path*",
    "/pages/:path*",
    "/qr-codes/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/admin/:path*",
  ],
};

function handleVerifiedAccessToken(
  request: NextRequest,
  payload: { tier: string },
) {
  if (authRoutes.has(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    payload.tier !== "admin"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

function handleRefreshedSession(
  request: NextRequest,
  session: RefreshedSession,
) {
  const response = createSessionAwareResponse(request, session.user.tier);

  for (const cookie of session.setCookieHeaders) {
    response.headers.append("set-cookie", cookie);
  }

  return response;
}

function createSessionAwareResponse(request: NextRequest, tier: string) {
  if (authRoutes.has(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/admin") && tier !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

async function refreshAccessToken(
  request: NextRequest,
): Promise<RefreshedSession | null> {
  const apiBaseUrl = process.env.SHORTEN_URL_API_BASE_URL;

  if (!apiBaseUrl) {
    return null;
  }

  try {
    const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/auth/me`, {
      cache: "no-store",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    });

    if (!response.ok) {
      return null;
    }

    const json = (await response.json().catch(() => null)) as unknown;
    const user = parseAuthenticatedUser(json);

    if (!user) {
      return null;
    }

    return {
      setCookieHeaders: getSetCookieHeaders(response.headers),
      user,
    };
  } catch {
    return null;
  }
}

function parseAuthenticatedUser(body: unknown): AuthenticatedUser | null {
  if (!body || typeof body !== "object" || !Object.hasOwn(body, "user")) {
    return null;
  }

  const user = (body as { user: unknown }).user;

  if (!user || typeof user !== "object") {
    return null;
  }

  if (
    !Object.hasOwn(user, "id") ||
    !Object.hasOwn(user, "email") ||
    !Object.hasOwn(user, "fullName") ||
    !Object.hasOwn(user, "tier")
  ) {
    return null;
  }

  const candidate = user as Record<string, unknown>;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.email !== "string" ||
    typeof candidate.fullName !== "string" ||
    typeof candidate.tier !== "string"
  ) {
    return null;
  }

  return {
    email: candidate.email,
    fullName: candidate.fullName,
    id: candidate.id,
    tier: candidate.tier,
  };
}

function getSetCookieHeaders(headers: Headers): string[] {
  const getSetCookie = Reflect.get(headers, "getSetCookie");

  if (typeof getSetCookie === "function") {
    return getSetCookie.call(headers);
  }

  const combinedHeader = headers.get("set-cookie");

  if (!combinedHeader) {
    return [];
  }

  return combinedHeader.split(/,(?=\s*[^;,=\s]+=[^;,]+)/);
}

function getAccessCookieName(): string {
  return process.env.JWT_ACCESS_COOKIE_NAME ?? "access_token";
}

function getRefreshCookieName(): string {
  return process.env.JWT_REFRESH_COOKIE_NAME ?? "refresh_token";
}

type AuthenticatedUser = {
  email: string;
  fullName: string;
  id: string;
  tier: string;
};

type RefreshedSession = {
  setCookieHeaders: string[];
  user: AuthenticatedUser;
};
