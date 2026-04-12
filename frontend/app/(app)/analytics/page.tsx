import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyticsLinkFilters } from "@/features/analytics/components/analytics-link-filters";
import { AnalyticsLinksTable } from "@/features/analytics/components/analytics-links-table";
import {
  getUserLinkAnalytics,
  type LinkExpiryFilter,
} from "@/features/analytics/lib/get-user-link-analytics";
import { getShortenedUrlBaseUrl } from "@/features/analytics/lib/shortened-url";

type AnalyticsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = parsePage(resolvedSearchParams.page);
  const search = parseSearch(resolvedSearchParams.search);
  const expires = parseExpires(resolvedSearchParams.expires);
  const analyticsResult = await getUserLinkAnalytics({
    page,
    search,
    expires,
  });

  if (analyticsResult.status === "error") {
    return (
      <section className="rounded-lg border border-border-soft bg-surface p-6 shadow-app-soft md:p-8">
        <h1 className="text-heading-md font-ui-semibold tracking-tight text-content-heading">
          Analytics
        </h1>
        <p className="mt-3 max-w-2xl text-ui-sm leading-7 text-content-secondary">
          {analyticsResult.message}
        </p>
      </section>
    );
  }

  const {
    links,
    page: currentPage,
    totalLinks,
    totalPages,
  } = analyticsResult.data;
  const shortenedUrlBaseUrl = getShortenedUrlBaseUrl();

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 border-b border-border-soft pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-md font-ui-semibold tracking-tight text-content-heading md:text-heading-lg">
            Short Links
          </h1>
          <p className="mt-2 text-ui-sm text-content-secondary">
            {totalLinks === 0
              ? "No links created yet."
              : `${formatNumber(totalLinks)} links in your workspace.`}
          </p>
        </div>

        <Button asChild>
          <Link href="/">
            <Plus className="size-4" />
            Create link
          </Link>
        </Button>
      </div>

      <AnalyticsLinkFilters search={search} expires={expires} />

      {links.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-strong bg-surface p-8 text-ui-sm leading-7 text-content-secondary">
          Create a short link first. Once your authenticated links receive
          visits, this page will show them here with click totals and recent
          activity.
        </div>
      ) : (
        <AnalyticsLinksTable
          expires={expires}
          links={links}
          page={currentPage}
          search={search}
          shortenedUrlBaseUrl={shortenedUrlBaseUrl}
          totalLinks={totalLinks}
          totalPages={totalPages}
        />
      )}
    </section>
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function parsePage(value: string | string[] | undefined): number {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const page = Number(rawValue);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

function parseSearch(value: string | string[] | undefined): string {
  const rawValue = Array.isArray(value) ? value[0] : value;

  return rawValue?.trim().slice(0, 200) ?? "";
}

function parseExpires(value: string | string[] | undefined): LinkExpiryFilter {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (
    rawValue === "expired" ||
    rawValue === "expiring" ||
    rawValue === "no-expiry"
  ) {
    return rawValue;
  }

  return "all";
}
