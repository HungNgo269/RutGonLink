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
import { applyResponseCookies } from "@/lib/response-cookies";

const loginBackendErrorMessage = "Wrong credential";
const registerBackendErrorMessage = "Unable to register";

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

  const authenticated = await authenticate("/auth/login", payload.data);

  if (!authenticated) {
    return createBackendErrorState(loginBackendErrorMessage);
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

  const authenticated = await authenticate("/auth/register", payload.data);

  if (!authenticated) {
    return createBackendErrorState(registerBackendErrorMessage);
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

async function authenticate(path: string, payload: object): Promise<boolean> {
  try {
    const response = await apiFetch(path, {
      method: "POST",
      body: payload,
      forwardCookies: false,
    });
    const json = await response.json().catch(() => null);

    if (!response.ok || !authResponseSchema.safeParse(json).success) {
      return false;
    }

    await applyResponseCookies(response);
    return true;
  } catch {
    return false;
  }
}

async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(process.env.JWT_ACCESS_COOKIE_NAME ?? "access_token");
  cookieStore.delete(process.env.JWT_REFRESH_COOKIE_NAME ?? "refresh_token");
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
