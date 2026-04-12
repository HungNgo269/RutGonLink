import { z } from "zod";

export const userLinkAnalyticsItemSchema = z.object({
  shortCode: z.string().min(1),
  destinationUrl: z.string().url(),
  shortenedUrlPath: z.string().min(1),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime().nullable(),
  totalClicks: z.number().int().nonnegative(),
  lastClickedAt: z.string().datetime().nullable(),
});

export const userLinkAnalyticsResponseSchema = z.object({
  links: z.array(userLinkAnalyticsItemSchema),
  totalLinks: z.number().int().nonnegative(),
  totalClicks: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type UserLinkAnalyticsResponse = z.infer<
  typeof userLinkAnalyticsResponseSchema
>;
