import { cookies } from "next/headers";

type SameSiteCookieValue = "lax" | "strict" | "none";

type SetCookie = {
  name: string;
  value: string;
  httpOnly?: boolean;
  secure?: boolean;
  path?: string;
  maxAge?: number;
  expires?: Date;
  sameSite?: SameSiteCookieValue;
};

export async function applyResponseCookies(response: Response): Promise<void> {
  const cookieStore = await cookies();

  for (const cookie of getSetCookieHeaders(response.headers)) {
    const parsedCookie = parseSetCookie(cookie);

    if (parsedCookie) {
      cookieStore.set(parsedCookie);
    }
  }
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

function parseSetCookie(header: string): SetCookie | null {
  const [nameValue, ...attributes] = header.split(";").map((part) => part.trim());
  const separatorIndex = nameValue.indexOf("=");

  if (separatorIndex < 1) {
    return null;
  }

  const cookie: SetCookie = {
    name: nameValue.slice(0, separatorIndex),
    value: nameValue.slice(separatorIndex + 1),
  };

  for (const attribute of attributes) {
    const [rawKey, ...rawValue] = attribute.split("=");
    const key = rawKey.toLowerCase();
    const value = rawValue.join("=");

    if (key === "httponly") {
      cookie.httpOnly = true;
    } else if (key === "secure") {
      cookie.secure = true;
    } else if (key === "path" && value) {
      cookie.path = value;
    } else if (key === "max-age" && value) {
      cookie.maxAge = Number(value);
    } else if (key === "expires" && value) {
      cookie.expires = new Date(value);
    } else if (key === "samesite") {
      const normalizedSameSite = value.toLowerCase();

      if (isSameSite(normalizedSameSite)) {
        cookie.sameSite = normalizedSameSite;
      }
    }
  }

  return cookie;
}

function isSameSite(value: string): value is SameSiteCookieValue {
  return value === "lax" || value === "strict" || value === "none";
}
