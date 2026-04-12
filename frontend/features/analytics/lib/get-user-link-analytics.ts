import {
  userLinkAnalyticsResponseSchema,
  type UserLinkAnalyticsResponse,
} from "@/features/analytics/schemas/user-link-analytics.schema";
import { apiFetch } from "@/lib/api";

export async function getUserLinkAnalytics(
  query: UserLinkAnalyticsQuery = { page: 1, search: "", expires: "all" },
): Promise<AnalyticsResult> {
  try {
    const response = await apiFetch(
      `/analytics/links?${buildAnalyticsQuery(query)}`,
    );

    if (response.status === 401) {
      return {
        status: "error",
        message: "Sign in to view analytics for your shortened links.",
      };
    }

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        status: "error",
        message: getErrorMessage(json),
      };
    }

    const result = userLinkAnalyticsResponseSchema.safeParse(json);

    if (!result.success) {
      return {
        status: "error",
        message: "The analytics response was not in the expected format.",
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

export type LinkExpiryFilter = "all" | "expired" | "expiring" | "no-expiry";

export type UserLinkAnalyticsQuery = {
  page: number;
  search: string;
  expires: LinkExpiryFilter;
};

type AnalyticsResult =
  | {
      status: "success";
      data: UserLinkAnalyticsResponse;
    }
  | {
      status: "error";
      message: string;
    };

function getErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "The analytics request failed.";
  }

  const message = payload instanceof Object ? Reflect.get(payload, "message") : null;

  if (typeof message === "string") {
    return message;
  }

  if (Array.isArray(message)) {
    const firstMessage = message.find((item) => typeof item === "string");
    return firstMessage ?? "The analytics request failed.";
  }

  return "The analytics request failed.";
}

function buildAnalyticsQuery(query: UserLinkAnalyticsQuery): string {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: "10",
  });
  const search = query.search.trim();

  if (search) {
    params.set("search", search);
  }

  if (query.expires !== "all") {
    params.set("expires", query.expires);
  }

  return params.toString();
}
