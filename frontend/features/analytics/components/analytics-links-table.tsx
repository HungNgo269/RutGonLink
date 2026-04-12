"use client";

import { useState, useTransition } from "react";
import { Loader2, MousePointerClick } from "lucide-react";
import {
  getLinkAnalyticsDetail,
  type LinkAnalyticsDetailResult,
} from "@/features/analytics/actions/get-link-analytics-detail";
import type { LinkAnalyticsDetail } from "@/features/analytics/schemas/link-analytics-detail.schema";
import type { UserLinkAnalyticsResponse } from "@/features/analytics/schemas/user-link-analytics.schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AnalyticsLinksTableProps = {
  links: UserLinkAnalyticsResponse["links"];
  page: number;
  totalPages: number;
  totalLinks: number;
};

export function AnalyticsLinksTable({
  links,
  page,
  totalPages,
  totalLinks,
}: AnalyticsLinksTableProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedShortCode, setSelectedShortCode] = useState<string | null>(
    null,
  );
  const [detailResult, setDetailResult] =
    useState<LinkAnalyticsDetailResult | null>(null);

  function openDetails(shortCode: string) {
    setDialogOpen(true);
    setSelectedShortCode(shortCode);
    setDetailResult(null);

    startTransition(async () => {
      setDetailResult(await getLinkAnalyticsDetail(shortCode));
    });
  }

  return (
    <>
      <div className="mt-8 overflow-hidden rounded-[28px] border border-border-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source URL</TableHead>
              <TableHead>Short code</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Last click</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {links.map((link) => (
                <TableRow
                  key={link.shortCode}
                  className="cursor-pointer align-top transition-colors hover:bg-surface-hover focus-within:bg-surface-hover"
                  onClick={() => openDetails(link.shortCode)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openDetails(link.shortCode);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <TableCell>
                    <div className="max-w-[32rem]">
                      <p className="truncate font-ui-semibold text-content-heading">
                        {link.destinationUrl}
                      </p>
                      <p className="mt-2 text-ui-xs uppercase tracking-[0.16em] text-content-muted">
                        Path {link.shortenedUrlPath}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-accent-soft px-3 py-2 text-ui-sm font-ui-semibold text-accent">
                      {link.shortCode}
                    </span>
                  </TableCell>
                  <TableCell className="text-ui-sm text-content-secondary">
                    {formatDateTime(link.createdAt)}
                  </TableCell>
                  <TableCell>
                    <span className="text-ui-lg font-ui-semibold text-content-heading">
                      {formatNumber(link.totalClicks)}
                    </span>
                  </TableCell>
                  <TableCell className="text-ui-sm text-content-secondary">
                    {link.lastClickedAt
                      ? formatDateTime(link.lastClickedAt)
                      : "No clicks yet"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        totalLinks={totalLinks}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedShortCode
                ? `/${selectedShortCode} performance`
                : "Link performance"}
            </DialogTitle>
            <DialogDescription>
              Source, campaign, device, location, and referrer data for recent
              clicks.
            </DialogDescription>
          </DialogHeader>

          {isPending && !detailResult ? (
            <div className="flex items-center gap-3 rounded-2xl bg-surface-muted p-4 text-ui-sm text-content-secondary">
              <Loader2 className="size-4 animate-spin" />
              Loading link details...
            </div>
          ) : null}

          {detailResult?.status === "error" ? (
            <div className="rounded-2xl bg-danger-soft p-4 text-ui-sm text-danger">
              {detailResult.message}
            </div>
          ) : null}

          {detailResult?.status === "success" ? (
            <LinkDetailContent detail={detailResult.data} />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function PaginationControls({
  page,
  totalPages,
  totalLinks,
}: {
  page: number;
  totalPages: number;
  totalLinks: number;
}) {
  if (totalLinks === 0 || totalPages <= 1) {
    return null;
  }

  const previousPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <div className="mt-5 flex flex-col gap-3 text-ui-sm text-content-secondary sm:flex-row sm:items-center sm:justify-between">
      <p>
        Page {formatNumber(page)} of {formatNumber(totalPages)}
      </p>
      <Pagination className="justify-start sm:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={`/analytics?page=${previousPage}`}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              aria-disabled={page <= 1}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href={`/analytics?page=${nextPage}`}
              className={
                page >= totalPages ? "pointer-events-none opacity-50" : ""
              }
              aria-disabled={page >= totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

function LinkDetailContent({ detail }: { detail: LinkAnalyticsDetail }) {
  return (
    <div className="min-h-0 space-y-5 overflow-y-auto pr-1">
      <div className="grid gap-3 md:grid-cols-3">
        <DetailStat label="Short code" value={detail.shortCode} />
        <DetailStat label="Created" value={formatDateTime(detail.createdAt)} />
        <DetailStat
          label="Total clicks"
          value={formatNumber(detail.totalClicks)}
        />
      </div>

      <div className="rounded-2xl bg-surface-muted p-4">
        <p className="text-ui-xs font-ui-semibold uppercase tracking-[0.18em] text-content-muted">
          Destination
        </p>
        <p className="mt-2 break-all text-ui-sm text-content-heading">
          {detail.destinationUrl}
        </p>
      </div>

      {detail.clicks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-strong p-5 text-ui-sm text-content-secondary">
          No click events have been recorded for this link yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border-soft">
          <div className="border-b border-border-soft bg-surface-muted px-4 py-3 text-ui-sm font-ui-semibold text-content-heading">
            Recent click events
          </div>
          <div className="max-h-80 divide-y divide-border-soft overflow-y-auto">
            {detail.clicks.map((click) => (
              <div
                key={`${click.clickedAt}-${click.ipAddress ?? "unknown"}`}
                className="grid gap-3 p-4 text-ui-sm md:grid-cols-[1.1fr_1fr_1fr]"
              >
                <div>
                  <p className="font-ui-semibold text-content-heading">
                    {formatDateTime(click.clickedAt)}
                  </p>
                  <p className="mt-1 text-content-muted">
                    {click.referrerDomain ?? "Direct or unknown source"}
                  </p>
                </div>
                <div className="text-content-secondary">
                  <p>
                    {formatNullable(click.utmSource)} /{" "}
                    {formatNullable(click.utmMedium)}
                  </p>
                  <p className="mt-1">
                    {formatNullable(click.utmCampaign)}
                  </p>
                </div>
                <div className="text-content-secondary">
                  <p>
                    {formatNullable(click.browser)} on{" "}
                    {formatNullable(click.os)}
                  </p>
                  <p className="mt-1">
                    {formatNullable(click.city)},{" "}
                    {formatNullable(click.country)}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-content-muted">
                    <MousePointerClick className="size-3.5" />
                    {formatNullable(click.ipAddress)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-muted p-4">
      <p className="text-ui-xs font-ui-semibold uppercase tracking-[0.18em] text-content-muted">
        {label}
      </p>
      <p className="mt-2 text-ui-base font-ui-semibold text-content-heading">
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

function formatNullable(value: string | null): string {
  return value?.trim() || "Unknown";
}
