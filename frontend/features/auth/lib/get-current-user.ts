import {
  authResponseSchema,
  type AuthResponse,
} from "@/features/auth/schemas/auth.schema";
import { apiFetch } from "@/lib/api";

export async function getCurrentUser(): Promise<AuthResponse["user"] | null> {
  try {
    const response = await apiFetch("/auth/me");

    if (!response.ok) {
      return null;
    }

    const json = await response.json().catch(() => null);
    const result = authResponseSchema.safeParse(json);

    if (!result.success) {
      return null;
    }

    return result.data.user;
  } catch {
    return null;
  }
}
