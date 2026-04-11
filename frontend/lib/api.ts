import { headers as requestHeaders } from "next/headers";

type ApiFetchOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: BodyInit | object | null;
  headers?: HeadersInit;
  forwardCookies?: boolean;
};

export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const { body, forwardCookies = true, headers, ...init } = options;
  const outgoingHeaders = new Headers(headers);

  if (body && typeof body === "object" && !(body instanceof FormData)) {
    outgoingHeaders.set("Content-Type", "application/json");
  }

  if (forwardCookies) {
    const cookieHeader = (await requestHeaders()).get("cookie");

    if (cookieHeader) {
      outgoingHeaders.set("cookie", cookieHeader);
    }
  }

  return fetch(`${getApiBaseUrl()}${normalizeApiPath(path)}`, {
    ...init,
    headers: outgoingHeaders,
    body: serializeBody(body),
    cache: init.cache ?? "no-store",
  });
}

export function getApiBaseUrl(): string {
  const apiBaseUrl = process.env.SHORTEN_URL_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("SHORTEN_URL_API_BASE_URL is not configured.");
  }

  return apiBaseUrl.replace(/\/$/, "");
}

function normalizeApiPath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function serializeBody(body: ApiFetchOptions["body"]): BodyInit | null | undefined {
  if (!body || body instanceof FormData || typeof body !== "object") {
    return body;
  }

  return JSON.stringify(body);
}
