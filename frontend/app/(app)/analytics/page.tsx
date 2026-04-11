import { BarChart3, ExternalLink, Link2, MousePointerClick } from "lucide-react";
import { getUserLinkAnalytics } from "@/features/analytics/lib/get-user-link-analytics";

export default async function AnalyticsPage() {
  const analyticsResult = await getUserLinkAnalytics();

  if (analyticsResult.status === "error") {
    return (
      <section className="rounded-[30px] border border-[var(--border-soft)] bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <div className="inline-flex rounded-full bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
          <BarChart3 className="size-5" />
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
          Analytics
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
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
      <div className="rounded-[32px] border border-[var(--border-soft)] bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_52%,#f7efe8_100%)] p-6 shadow-[var(--shadow-soft)] md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-3 py-2 text-sm font-semibold text-[var(--accent)]">
              <BarChart3 className="size-4" />
              Analytics
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Review every source URL you shortened and how it performs.
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
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

      <div className="rounded-[30px] border border-[var(--border-soft)] bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Your shortened URLs
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Each row shows the source URL, short code, creation date, and the
              latest click activity for the current user.
            </p>
          </div>
          <p className="text-sm font-medium text-slate-500">
            {links.length === 0
              ? "No shortened links yet."
              : `${formatNumber(links.length)} links tracked.`}
          </p>
        </div>

        {links.length === 0 ? (
          <div className="mt-8 rounded-[28px] border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] p-8 text-sm leading-7 text-slate-600">
            Create a short link first. Once your authenticated links receive
            visits, this page will show them here with click totals and recent
            activity.
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-[28px] border border-[var(--border-soft)]">
            <div className="app-scrollbar overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--border-soft)]">
                <thead className="bg-[var(--surface-muted)] text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Source URL</th>
                    <th className="px-5 py-4">Short code</th>
                    <th className="px-5 py-4">Created</th>
                    <th className="px-5 py-4">Clicks</th>
                    <th className="px-5 py-4">Last click</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-soft)] bg-white">
                  {links.map((link) => (
                    <tr key={link.shortCode} className="align-top">
                      <td className="px-5 py-5">
                        <div className="max-w-[32rem]">
                          <p className="truncate font-semibold text-slate-950">
                            {link.destinationUrl}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                            Path {link.shortenedUrlPath}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <span className="inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-2 text-sm font-semibold text-[var(--accent)]">
                          {link.shortCode}
                        </span>
                      </td>
                      <td className="px-5 py-5 text-sm text-slate-600">
                        {formatDateTime(link.createdAt)}
                      </td>
                      <td className="px-5 py-5">
                        <span className="text-lg font-semibold text-slate-950">
                          {formatNumber(link.totalClicks)}
                        </span>
                      </td>
                      <td className="px-5 py-5 text-sm text-slate-600">
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
    <div className="min-w-[172px] rounded-[24px] border border-white/80 bg-white/85 p-4 shadow-[var(--shadow-panel)]">
      <div className="inline-flex rounded-full bg-[var(--surface-muted)] p-2 text-[var(--accent)]">
        {icon}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
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
