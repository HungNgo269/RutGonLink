import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next();
  const accessCookieName = process.env.JWT_ACCESS_COOKIE_NAME ?? "access_token";
  const refreshCookieName = process.env.JWT_REFRESH_COOKIE_NAME ?? "refresh_token";
  const hasAccessToken = request.cookies.has(accessCookieName);
  const hasRefreshToken = request.cookies.has(refreshCookieName);

  if (hasAccessToken || !hasRefreshToken) {
    return response;
  }

  try {
    const authResponse = await fetch(`${getApiBaseUrl()}/auth/me`, {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });
    const setCookie = authResponse.headers.get("set-cookie");

    if (authResponse.ok && setCookie) {
      response.headers.append("set-cookie", setCookie);
    }
  } catch {
    return response;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

function getApiBaseUrl(): string {
  const apiBaseUrl = process.env.SHORTEN_URL_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("SHORTEN_URL_API_BASE_URL is not configured.");
  }

  return apiBaseUrl.replace(/\/$/, "");
}
