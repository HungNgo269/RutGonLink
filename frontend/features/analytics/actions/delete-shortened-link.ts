"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { applyResponseCookies } from "@/lib/response-cookies";

export type DeleteShortenedLinkResult =
  | {
      status: "success";
    }
  | {
      status: "error";
      message: string;
    };

export async function deleteShortenedLink(
  shortCode: string,
): Promise<DeleteShortenedLinkResult> {
  try {
    const response = await apiFetch(
      `/analytics/links/${encodeURIComponent(shortCode)}`,
      {
        method: "DELETE",
      },
    );
    await applyResponseCookies(response);
    const json = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        status: "error",
        message: getErrorMessage(json),
      };
    }

    revalidatePath("/analytics");

    return { status: "success" };
  } catch {
    return {
      status: "error",
      message: "Unable to delete this short link right now.",
    };
  }
}

function getErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "The delete request failed.";
  }

  const message =
    payload instanceof Object ? Reflect.get(payload, "message") : null;

  if (typeof message === "string") {
    return message;
  }

  if (Array.isArray(message)) {
    const firstMessage = message.find((item) => typeof item === "string");
    return firstMessage ?? "The delete request failed.";
  }

  return "The delete request failed.";
}
