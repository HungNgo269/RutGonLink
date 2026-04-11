import { cache } from "react";
import {
  authResponseSchema,
  type AuthResponse,
} from "@/features/auth/schemas/auth.schema";
import { apiFetch } from "@/lib/api";

export type AuthenticatedUser = AuthResponse["user"];

export const getCurrentUser = cache(
  async (): Promise<AuthenticatedUser | null> => {
    try {
      const response = await apiFetch("/auth/me");

      if (response.status === 401 || response.status === 403) {
        return null;
      }

      if (!response.ok) {
        return null;
      }

      const json = await response.json().catch(() => null);
      const parsed = authResponseSchema.safeParse(json);

      return parsed.success ? parsed.data.user : null;
    } catch {
      return null;
    }
  },
);
