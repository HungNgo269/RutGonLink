import { z } from "zod";

export const linkAnalyticsDetailSchema = z.object({
  shortCode: z.string().min(1),
  destinationUrl: z.string().url(),
  shortenedUrlPath: z.string().min(1),
  createdAt: z.string().datetime(),
  totalClicks: z.number().int().nonnegative(),
  engagementsOverTime: z.array(
    z.object({
      date: z.string().min(1),
      totalClicks: z.number().int().nonnegative(),
    }),
  ),
  locations: z.array(
    z.object({
      label: z.string().min(1),
      totalClicks: z.number().int().nonnegative(),
      percentage: z.number().nonnegative(),
    }),
  ),
  referrers: z.array(
    z.object({
      label: z.string().min(1),
      totalClicks: z.number().int().nonnegative(),
      percentage: z.number().nonnegative(),
    }),
  ),
  devices: z.array(
    z.object({
      label: z.string().min(1),
      totalClicks: z.number().int().nonnegative(),
      percentage: z.number().nonnegative(),
    }),
  ),
});

export type LinkAnalyticsDetail = z.infer<typeof linkAnalyticsDetailSchema>;
