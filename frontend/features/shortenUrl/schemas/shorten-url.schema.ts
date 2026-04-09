import { z } from "zod";

export const shortenUrlSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Enter a URL.")
    .url("Enter a valid URL.")
    .refine(
      (value) => value.startsWith("http://") || value.startsWith("https://"),
      "Enter a valid URL.",
    ),
});

export const shortenedUrlResponseSchema = z.object({
  originalUrl: z.string().url(),
  shortCode: z.string().min(7).max(7),
  shortenedUrl: z.string().url(),
});

export type ShortenUrlFormValues = z.infer<typeof shortenUrlSchema>;
