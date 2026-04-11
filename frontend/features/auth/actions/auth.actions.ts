"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthFormState } from "@/features/auth/interfaces/auth-form-state.interface";
import {
  authResponseSchema,
  loginSchema,
  registerSchema,
} from "@/features/auth/schemas/auth.schema";
import { apiFetch } from "@/lib/api";

const loginBackendErrorMessage = "Invalid email or password.";
const registerBackendErrorMessage = "Unable to register.";
const fallbackBackendErrorMessage = "Something went wrong. Please try again.";

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

type AuthAttempt =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
    };

export async function login(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const payload = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!payload.success) {
    return createInvalidState(payload.error.flatten().fieldErrors);
  }

  const authenticated = await authenticate(
    "/auth/login",
    payload.data,
    loginBackendErrorMessage,
  );

  if (!authenticated.ok) {
    return createBackendErrorState(authenticated.message);
  }

  redirect("/");
}

export async function register(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const payload = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!payload.success) {
    return createInvalidState(payload.error.flatten().fieldErrors);
  }

  const authenticated = await authenticate(
    "/auth/register",
    payload.data,
    registerBackendErrorMessage,
  );

  if (!authenticated.ok) {
    return createBackendErrorState(authenticated.message);
  }

  redirect("/");
}

export async function logout(): Promise<void> {
  try {
    const response = await apiFetch("/auth/logout", {
      method: "POST",
    });

    await applyResponseCookies(response);
  } catch {
    // The local session should still be removed if the backend is unreachable.
  }

  await clearAuthCookies();
  redirect("/login");
}

async function authenticate(
  path: string,
  payload: object,
  defaultMessage: string,
): Promise<AuthAttempt> {
  try {
    const response = await apiFetch(path, {
      method: "POST",
      body: payload,
      forwardCookies: false,
    });
    const json = await response.json().catch(() => null);

    if (!response.ok || !authResponseSchema.safeParse(json).success) {
      return {
        ok: false,
        message: getBackendErrorMessage(json, defaultMessage),
      };
    }

    await applyResponseCookies(response);
    return { ok: true };
  } catch {
    return { ok: false, message: fallbackBackendErrorMessage };
  }
}

function getBackendErrorMessage(body: unknown, defaultMessage: string): string {
  if (!body || typeof body !== "object") {
    return defaultMessage;
  }

  const response = "response" in body ? body.response : body;

  if (typeof response === "string") {
    return response || defaultMessage;
  }

  if (!response || typeof response !== "object") {
    return defaultMessage;
  }

  const message = "message" in response ? response.message : null;

  if (typeof message === "string") {
    return message || defaultMessage;
  }

  if (Array.isArray(message)) {
    return message.find((item) => typeof item === "string") ?? defaultMessage;
  }

  return defaultMessage;
}

async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(process.env.JWT_ACCESS_COOKIE_NAME ?? "access_token");
  cookieStore.delete(process.env.JWT_REFRESH_COOKIE_NAME ?? "refresh_token");
}

async function applyResponseCookies(response: Response): Promise<void> {
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
  const [nameValue, ...attributes] = header
    .split(";")
    .map((part) => part.trim());
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

function createInvalidState(
  fieldErrors: Record<string, string[] | undefined>,
): AuthFormState {
  return {
    status: "error",
    message: null,
    fieldErrors: Object.fromEntries(
      Object.entries(fieldErrors).map(([field, messages]) => [
        field,
        messages?.[0] ?? "",
      ]),
    ),
  };
}

function createBackendErrorState(message: string): AuthFormState {
  return {
    status: "error",
    message,
    fieldErrors: {},
  };
}
