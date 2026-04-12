import { buildShortenedUrl } from "@/features/analytics/lib/build-shortened-url";

export function getShortenedUrlBaseUrl(): string {
  const baseUrl =
    process.env.SHORTEN_URL_PUBLIC_BASE_URL ??
    process.env.SHORTEN_URL_API_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      "Set SHORTEN_URL_PUBLIC_BASE_URL or SHORTEN_URL_API_BASE_URL to build short links.",
    );
  }

  return baseUrl.replace(/\/$/, "");
}

export { buildShortenedUrl };
