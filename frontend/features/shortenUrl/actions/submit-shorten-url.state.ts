import type { ShortenUrlFormState } from "@/features/shortenUrl/interfaces/shorten-url.interface";

export const initialShortenUrlFormState: ShortenUrlFormState = {
  status: "idle",
  message: null,
  data: null,
  fieldErrors: {},
};
