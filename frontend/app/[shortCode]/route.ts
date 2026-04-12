import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> },
): Promise<Response> {
  const { shortCode } = await params;
  const backendUrl = buildBackendShortLinkUrl(shortCode, request.nextUrl.search);
  const backendResponse = await fetch(backendUrl, {
    method: "GET",
    headers: buildTrackingHeaders(request),
    redirect: "manual",
    cache: "no-store",
  });
  const redirectLocation = backendResponse.headers.get("location");

  if (isRedirectStatus(backendResponse.status) && redirectLocation) {
    return NextResponse.redirect(redirectLocation, backendResponse.status);
  }

  return new Response(backendResponse.body, {
    status: backendResponse.status,
    headers: {
      "content-type":
        backendResponse.headers.get("content-type") ?? "application/json",
    },
  });
}

function buildBackendShortLinkUrl(shortCode: string, search: string): string {
  const apiBaseUrl = process.env.SHORTEN_URL_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("SHORTEN_URL_API_BASE_URL is not configured.");
  }

  const url = new URL(apiBaseUrl);
  url.pathname = `/${encodeURIComponent(shortCode)}`;
  url.search = search;

  return url.toString();
}

function buildTrackingHeaders(request: NextRequest): Headers {
  const headers = new Headers();

  copyHeader(request.headers, headers, "referer");
  copyHeader(request.headers, headers, "user-agent");
  copyHeader(request.headers, headers, "x-forwarded-for");
  copyHeader(request.headers, headers, "x-real-ip");
  copyHeader(request.headers, headers, "x-vercel-forwarded-for");
  copyHeader(request.headers, headers, "x-vercel-ip-country");
  copyHeader(request.headers, headers, "x-vercel-ip-country-region");
  copyHeader(request.headers, headers, "x-vercel-ip-city");

  return headers;
}

function copyHeader(
  fromHeaders: Headers,
  toHeaders: Headers,
  headerName: string,
): void {
  const value = fromHeaders.get(headerName);

  if (value) {
    toHeaders.set(headerName, value);
  }
}

function isRedirectStatus(status: number): boolean {
  return status >= 300 && status < 400;
}
