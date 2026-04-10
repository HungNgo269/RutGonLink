export interface ShortenedUrlResponse {
  originalUrl: string;
  shortCode: string;
  shortenedUrl: string;
}

export interface ShortenUrlFormState {
  status: "idle" | "success" | "error";
  message: string | null;
  data: ShortenedUrlResponse | null;
}
