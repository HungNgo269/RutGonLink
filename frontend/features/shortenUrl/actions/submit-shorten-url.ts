"use server";

import type { ShortenUrlFormState } from "@/features/shortenUrl/interfaces/shorten-url.interface";
import {
  shortenedUrlResponseSchema,
  shortenUrlSchema,
} from "@/features/shortenUrl/schemas/shorten-url.schema";
import { apiFetch } from "@/lib/api";
import { applyResponseCookies } from "@/lib/response-cookies";

export async function submitShortenUrl(
  _previousState: ShortenUrlFormState,
  formData: FormData,
): Promise<ShortenUrlFormState> {
  const payload = shortenUrlSchema.safeParse({
    url: formData.get("url"),
  });

  if (!payload.success) {
    return {
      status: "error",
      message: "Enter a valid URL before submitting.",
      data: null,
    };
  }

  try {
    const response = await apiFetch("/shorten-url", {
      method: "POST",
      body: payload.data,
    });
    await applyResponseCookies(response);

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        status: "error",
        message: getErrorMessage(json),
        data: null,
      };
    }

    const result = shortenedUrlResponseSchema.safeParse(json);

    if (!result.success) {
      return {
        status: "error",
        message: "The backend response was not in the expected format.",
        data: null,
      };
    }

    return {
      status: "success",
      message: "Short link created successfully.",
      data: result.data,
    };
  } catch {
    return {
      status: "error",
      message:
        "Unable to reach the shorten URL API. Set SHORTEN_URL_API_BASE_URL if your backend runs on a different port.",
      data: null,
    };
  }
}

function getErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "The shorten URL request failed.";
  }

  const message = payload instanceof Object ? Reflect.get(payload, "message") : null;

  if (typeof message === "string") {
    return message;
  }

  if (Array.isArray(message)) {
    const firstMessage = message.find((item) => typeof item === "string");
    return firstMessage ?? "The shorten URL request failed.";
  }

  return "The shorten URL request failed.";
}
