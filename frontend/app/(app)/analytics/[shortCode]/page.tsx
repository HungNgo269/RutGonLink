import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkDetailDashboard } from "@/features/analytics/components/link-detail-dashboard";
import { getLinkAnalyticsDetail } from "@/features/analytics/lib/get-link-analytics-detail";
import {
  buildShortenedUrl,
  getShortenedUrlBaseUrl,
} from "@/features/analytics/lib/shortened-url";

type AnalyticsLinkDetailPageProps = {
  params: Promise<{
    shortCode: string;
  }>;
};

export default async function AnalyticsLinkDetailPage({
  params,
}: AnalyticsLinkDetailPageProps) {
  const { shortCode } = await params;
  const analyticsResult = await getLinkAnalyticsDetail(shortCode);

  if (analyticsResult.status === "error") {
    return (
      <section className="space-y-5">
        <BackButton />
        <div className="rounded-lg border border-border-soft bg-surface p-6 shadow-app-soft md:p-8">
          <div className="inline-flex rounded-lg bg-accent-soft p-3 text-accent">
            <BarChart3 className="size-5" />
          </div>
          <h1 className="mt-5 text-heading-md font-ui-semibold tracking-tight text-content-heading">
            Link analytics
          </h1>
          <p className="mt-3 max-w-2xl text-ui-sm leading-7 text-content-secondary">
            {analyticsResult.message}
          </p>
        </div>
      </section>
    );
  }

  const shortenedUrl = buildShortenedUrl(
    getShortenedUrlBaseUrl(),
    analyticsResult.data.shortCode,
  );

  return (
    <section className="space-y-5">
      <BackButton />
      <LinkDetailDashboard
        detail={analyticsResult.data}
        shortenedUrl={shortenedUrl}
      />
    </section>
  );
}

function BackButton() {
  return (
    <Button asChild variant="ghost" className="px-0 text-content-heading">
      <Link href="/analytics">
        <ArrowLeft className="size-4" />
        Back to list
      </Link>
    </Button>
  );
}
