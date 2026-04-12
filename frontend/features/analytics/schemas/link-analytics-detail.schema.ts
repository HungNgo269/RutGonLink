import { z } from "zod";

export const linkAnalyticsClickSchema = z.object({
  clickedAt: z.string().datetime(),
  referrerUrl: z.string().url().nullable(),
  referrerDomain: z.string().nullable(),
  utmSource: z.string().nullable(),
  utmMedium: z.string().nullable(),
  utmCampaign: z.string().nullable(),
  utmTerm: z.string().nullable(),
  utmContent: z.string().nullable(),
  country: z.string().nullable(),
  city: z.string().nullable(),
  deviceType: z.string().nullable(),
  browser: z.string().nullable(),
  os: z.string().nullable(),
  ipAddress: z.string().nullable(),
});

export const linkAnalyticsDetailSchema = z.object({
  shortCode: z.string().min(1),
  destinationUrl: z.string().url(),
  shortenedUrlPath: z.string().min(1),
  createdAt: z.string().datetime(),
  totalClicks: z.number().int().nonnegative(),
  clicks: z.array(linkAnalyticsClickSchema),
});

export type LinkAnalyticsDetail = z.infer<typeof linkAnalyticsDetailSchema>;
