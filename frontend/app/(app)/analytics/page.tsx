import { BarChart3, ExternalLink, Link2, MousePointerClick } from "lucide-react";
import { getUserLinkAnalytics } from "@/features/analytics/lib/get-user-link-analytics";

export default async function AnalyticsPage() {
  const analyticsResult = await getUserLinkAnalytics();

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

  const { links, totalClicks, totalLinks } = analyticsResult.data;
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
              label="Top short code"
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
          <div className="mt-8 overflow-hidden rounded-[28px] border border-border-soft">
            <div className="app-scrollbar overflow-x-auto">
              <table className="min-w-full divide-y divide-border-soft">
                <thead className="bg-surface-muted text-left text-ui-xs font-ui-semibold uppercase tracking-[0.18em] text-content-muted">
                  <tr>
                    <th className="px-5 py-4">Source URL</th>
                    <th className="px-5 py-4">Short code</th>
                    <th className="px-5 py-4">Created</th>
                    <th className="px-5 py-4">Clicks</th>
                    <th className="px-5 py-4">Last click</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft bg-surface">
                  {links.map((link) => (
                    <tr key={link.shortCode} className="align-top">
                      <td className="px-5 py-5">
                        <div className="max-w-[32rem]">
                          <p className="truncate font-ui-semibold text-content-heading">
                            {link.destinationUrl}
                          </p>
                          <p className="mt-2 text-ui-xs uppercase tracking-[0.16em] text-content-muted">
                            Path {link.shortenedUrlPath}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <span className="inline-flex rounded-full bg-accent-soft px-3 py-2 text-ui-sm font-ui-semibold text-accent">
                          {link.shortCode}
                        </span>
                      </td>
                      <td className="px-5 py-5 text-ui-sm text-content-secondary">
                        {formatDateTime(link.createdAt)}
                      </td>
                      <td className="px-5 py-5">
                        <span className="text-ui-lg font-ui-semibold text-content-heading">
                          {formatNumber(link.totalClicks)}
                        </span>
                      </td>
                      <td className="px-5 py-5 text-ui-sm text-content-secondary">
                        {link.lastClickedAt
                          ? formatDateTime(link.lastClickedAt)
                          : "No clicks yet"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
