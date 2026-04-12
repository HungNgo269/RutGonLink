"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Link2 } from "lucide-react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyShortLinkButton } from "@/components/copy-short-link-button";
import type { LinkAnalyticsDetail } from "@/features/analytics/schemas/link-analytics-detail.schema";
import { MetaItem } from "./analytics-links-table";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
);

const chartColors = ["#1f7a8c", "#2a56f4", "#f59e0b", "#1f9d55", "#e70044"];

type BreakdownItem = LinkAnalyticsDetail["locations"][number];

export function LinkDetailDashboard({
  detail,
  shortenedUrl,
}: {
  detail: LinkAnalyticsDetail;
  shortenedUrl: string;
}) {
  const hostName = getHostName(detail.destinationUrl);
  const topLocation = detail.locations[0]?.label ?? "Unknown";
  const topReferrer = detail.referrers[0]?.label ?? "Direct / Unknown";
  const topDevice = detail.devices[0]?.label ?? "Laptop / PC";

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <Card className="gap-4 p-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border-soft bg-surface-muted text-accent">
              <Link2 className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-heading-sm font-ui-semibold tracking-tight text-content-heading">
                  {hostName}
                </h3>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                <span className="break-all text-ui-sm font-ui-semibold text-accent">
                  {shortenedUrl}
                </span>
                <CopyShortLinkButton value={shortenedUrl} />
              </div>
              <div>
                <a
                  href={detail.destinationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex max-w-full items-center gap-2 text-ui-sm text-content-secondary hover:text-accent"
                >
                  <span className="truncate">{detail.destinationUrl}</span>
                </a>
              </div>

              <div className="flex flex-row items-center w-full justify-items-start">
                <MetaItem value={formatDateTime(detail.createdAt)} />
                {/* <MetaItem label="Total click:" value={detail.totalClicks} />
                <MetaItem label="Top source:" value={topReferrer} />
                <MetaItem label="Total device:" value={topDevice} /> */}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Engagements over time</CardTitle>
            <CardDescription>
              Clicks recorded over the last 14 days.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar
              data={{
                labels: detail.engagementsOverTime.map((point) =>
                  formatShortDate(point.date),
                ),
                datasets: [
                  {
                    data: detail.engagementsOverTime.map(
                      (point) => point.totalClicks,
                    ),
                    backgroundColor: "#1f7a8c",
                    borderRadius: 6,
                    maxBarThickness: 34,
                  },
                ],
              }}
              options={barOptions}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <LocationsCard
          title="Locations"
          description={`Top city or country: ${topLocation}`}
          items={detail.locations}
        />
        <BreakdownDonutCard
          title="Devices"
          description={`Most clicks came from ${topDevice}.`}
          items={detail.devices}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownDonutCard
          title="Referrers"
          description={`Top source: ${topReferrer}`}
          items={detail.referrers}
        />
      </div>
    </div>
  );
}

function LocationsCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: BreakdownItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="hidden rounded-lg bg-surface-muted p-1 text-ui-xs font-ui-semibold text-content-muted sm:flex">
          <span className="rounded-lg bg-content-strong px-3 py-1.5 text-content-inverted">
            Locations
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyMetric />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-[2rem_minmax(0,1fr)_5rem_4rem] gap-3 text-ui-xs font-ui-semibold uppercase tracking-[0.16em] text-content-muted">
              <span>#</span>
              <span>Location</span>
              <span className="text-right">Clicks</span>
              <span className="text-right">%</span>
            </div>
            {items.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                className="grid grid-cols-[2rem_minmax(0,1fr)_5rem_4rem] items-center gap-3"
              >
                <span className="text-ui-sm font-ui-semibold text-content-muted">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-ui-sm font-ui-semibold text-content-heading">
                      {item.label}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-progress-track">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${Math.max(4, Math.min(100, item.percentage))}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-right text-ui-sm font-ui-semibold text-content-heading">
                  {formatNumber(item.totalClicks)}
                </span>
                <span className="text-right text-ui-sm text-content-secondary">
                  {formatPercentage(item.percentage)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BreakdownDonutCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: BreakdownItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyMetric />
        ) : (
          <div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:items-center">
            <div className="h-44">
              <Doughnut
                data={{
                  labels: items.map((item) => item.label),
                  datasets: [
                    {
                      data: items.map((item) => item.totalClicks),
                      backgroundColor: chartColors,
                      borderWidth: 0,
                    },
                  ],
                }}
                options={doughnutOptions}
              />
            </div>
            <BreakdownList items={items} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BreakdownList({ items }: { items: BreakdownItem[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className="flex items-center justify-between gap-3 rounded-lg bg-surface-muted px-3 py-2"
        >
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{
                backgroundColor: chartColors[index % chartColors.length],
              }}
            />
            <span className="truncate text-ui-sm text-content-primary">
              {item.label}
            </span>
          </div>
          <span className="shrink-0 text-ui-sm font-ui-semibold text-content-heading">
            {formatNumber(item.totalClicks)}
          </span>
        </div>
      ))}
    </div>
  );
}

function EmptyMetric() {
  return (
    <div className="rounded-lg border border-dashed border-border-strong bg-surface-muted p-6 text-ui-sm text-content-secondary">
      No click data recorded yet.
    </div>
  );
}

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      displayColors: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#62748e",
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "#eef4ff",
      },
      ticks: {
        color: "#62748e",
        precision: 0,
      },
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "68%",
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      displayColors: false,
    },
  },
};

function getHostName(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Destination";
  }
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatPercentage(value: number): string {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value)}%`;
}
