import {
  linkAnalyticsDetailSchema,
  type LinkAnalyticsDetail,
} from "@/features/analytics/schemas/link-analytics-detail.schema";
import { apiFetch } from "@/lib/api";

export type LinkAnalyticsDetailResult =
  | {
      status: "success";
      data: LinkAnalyticsDetail;
    }
  | {
      status: "error";
      message: string;
    };

export async function getLinkAnalyticsDetail(
  shortCode: string,
): Promise<LinkAnalyticsDetailResult> {
  try {
    const response = await apiFetch(
      `/analytics/links/${encodeURIComponent(shortCode)}`,
    );

    if (response.status === 401) {
      return {
        status: "error",
        message: "Sign in to view analytics for this shortened link.",
      };
    }

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        status: "error",
        message: getErrorMessage(json),
      };
    }

    const result = linkAnalyticsDetailSchema.safeParse(json);

    if (!result.success) {
      return {
        status: "error",
        message: "The analytics detail response was not in the expected format.",
      };
    }

    return {
      status: "success",
      data: result.data,
    };
  } catch {
    return {
      status: "error",
      message:
        "Unable to reach the analytics API. Set SHORTEN_URL_API_BASE_URL if your backend runs on a different port.",
    };
  }
}

function getErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "The analytics detail request failed.";
  }

  const message =
    payload instanceof Object ? Reflect.get(payload, "message") : null;

  if (typeof message === "string") {
    return message;
  }

  if (Array.isArray(message)) {
    const firstMessage = message.find((item) => typeof item === "string");
    return firstMessage ?? "The analytics detail request failed.";
  }

  return "The analytics detail request failed.";
}
