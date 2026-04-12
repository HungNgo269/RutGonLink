import { BarChart3, ExternalLink, Link2, MousePointerClick } from "lucide-react";
import { AnalyticsLinksTable } from "@/features/analytics/components/analytics-links-table";
import { getUserLinkAnalytics } from "@/features/analytics/lib/get-user-link-analytics";

type AnalyticsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const page = parsePage((await searchParams).page);
  const analyticsResult = await getUserLinkAnalytics(page);

  if (analyticsResult.status === "error") {
    return (
      <section className="rounded-[30px] border border-border-soft bg-surface p-6 shadow-app-soft md:p-8">
        <div className="inline-flex rounded-full bg-accent-soft p-3 text-accent">
          <BarChart3 className="size-5" />
        </div>
        <h1 className="mt-5 text-heading-md font-ui-semibold tracking-tight text-content-heading">
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
    totalClicks,
    totalLinks,
    totalPages,
  } = analyticsResult.data;
  const topLink = links.reduce<(typeof links)[number] | null>(
    (currentTopLink, link) =>
      currentTopLink === null || link.totalClicks > currentTopLink.totalClicks
        ? link
        : currentTopLink,
    null,
  );

  return (
    <section className="space-y-7">
      <div className="rounded-[32px] border border-border-soft bg-gradient-analytics p-6 shadow-app-soft md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-surface/80 bg-surface/85 px-3 py-2 text-ui-sm font-ui-semibold text-accent">
              <BarChart3 className="size-4" />
              Analytics
            </div>
            <h1 className="mt-5 text-heading-md font-ui-semibold tracking-tight text-content-heading md:text-heading-lg">
              Review every source URL you shortened and how it performs.
            </h1>
            <p className="mt-3 text-ui-sm leading-7 text-content-secondary md:text-ui-base">
              This page is backed by your own shortened links and click events.
              It lists the original URLs you created and the latest tracking
              summary for each one.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              icon={<Link2 className="size-4" />}
              label="Owned links"
              value={formatNumber(totalLinks)}
            />
            <MetricCard
              icon={<MousePointerClick className="size-4" />}
              label="Total clicks"
              value={formatNumber(totalClicks)}
            />
            <MetricCard
              icon={<ExternalLink className="size-4" />}
              label="Top on page"
              value={topLink?.shortCode ?? "None yet"}
            />
          </div>
        </div>
      </div>

      <div className="rounded-[30px] border border-border-soft bg-surface p-6 shadow-app-soft md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-heading-sm font-ui-semibold tracking-tight text-content-heading">
              Your shortened URLs
            </h2>
            <p className="mt-2 text-ui-sm text-content-secondary">
              Each row shows the source URL, short code, creation date, and the
              latest click activity for the current user.
            </p>
          </div>
          <p className="text-ui-sm font-ui-medium text-content-muted">
            {links.length === 0
              ? "No shortened links yet."
              : `${formatNumber(links.length)} links tracked.`}
          </p>
        </div>

        {links.length === 0 ? (
          <div className="mt-8 rounded-[28px] border border-dashed border-border-strong bg-surface-muted p-8 text-ui-sm leading-7 text-content-secondary">
            Create a short link first. Once your authenticated links receive
            visits, this page will show them here with click totals and recent
            activity.
          </div>
        ) : (
          <AnalyticsLinksTable
            links={links}
            page={currentPage}
            totalLinks={totalLinks}
            totalPages={totalPages}
          />
        )}
      </div>
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  value: string;
}>) {
  return (
    <div className="min-w-[172px] rounded-[24px] border border-surface/80 bg-surface/85 p-4 shadow-app-panel">
      <div className="inline-flex rounded-full bg-surface-muted p-2 text-accent">
        {icon}
      </div>
      <p className="mt-4 text-ui-xs font-ui-semibold uppercase tracking-[0.18em] text-content-muted">
        {label}
      </p>
      <p className="mt-2 text-heading-sm font-ui-semibold tracking-tight text-content-heading">
        {value}
      </p>
    </div>
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
