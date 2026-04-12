"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Clock3,
  ExternalLink,
  Tag,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { deleteShortenedLink } from "@/features/analytics/actions/delete-shortened-link";
import { buildShortenedUrl } from "@/features/analytics/lib/build-shortened-url";
import type { LinkExpiryFilter } from "@/features/analytics/lib/get-user-link-analytics";
import type { UserLinkAnalyticsResponse } from "@/features/analytics/schemas/user-link-analytics.schema";

type AnalyticsLinksTableProps = {
  links: UserLinkAnalyticsResponse["links"];
  page: number;
  search: string;
  expires: LinkExpiryFilter;
  totalPages: number;
  totalLinks: number;
  shortenedUrlBaseUrl: string;
};

export function AnalyticsLinksTable({
  links,
  page,
  search,
  expires,
  totalPages,
  totalLinks,
  shortenedUrlBaseUrl,
}: AnalyticsLinksTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingShortCode, setDeletingShortCode] = useState<string | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openDetails(shortCode: string) {
    router.push(`/analytics/${encodeURIComponent(shortCode)}`);
  }

  function deleteLink(shortCode: string) {
    if (!window.confirm("Delete this short link? This cannot be undone.")) {
      return;
    }

    setDeletingShortCode(shortCode);
    setDeleteError(null);

    startTransition(async () => {
      const result = await deleteShortenedLink(shortCode);

      if (result.status === "error") {
        setDeleteError(result.message);
        setDeletingShortCode(null);
        return;
      }

      setDeletingShortCode(null);
      router.refresh();
    });
  }

  return (
    <>
      {deleteError ? (
        <div className="mt-5 rounded-lg bg-danger-soft p-4 text-ui-sm text-danger" role="alert">
          {deleteError}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-4">
        {links.map((link) => {
          const shortenedUrl = buildShortenedUrl(
            shortenedUrlBaseUrl,
            link.shortCode,
          );
          const expiry = getExpiryDisplay(link.expiresAt);
          const destinationLabel = getDestinationLabel(link.destinationUrl);

          return (
            <article
              key={link.shortCode}
              className="group rounded-lg border border-border-soft bg-surface p-5 shadow-app-panel transition-colors hover:border-accent/40 hover:bg-surface-cool"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => openDetails(link.shortCode)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                      <ExternalLink className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="break-all text-ui-lg font-ui-semibold text-content-heading group-hover:text-accent">
                        {destinationLabel}
                      </h3>
                      <p className="mt-1 break-all text-ui-sm font-ui-semibold text-accent">
                        {shortenedUrl}
                      </p>
                      <p className="mt-2 max-w-4xl truncate text-ui-sm text-content-secondary">
                        {link.destinationUrl}
                      </p>
                    </div>
                  </div>
                </button>

                <div className="flex shrink-0 flex-wrap items-center gap-3 xl:justify-end">
                  <div className="rounded-lg bg-surface-muted px-4 py-3 text-right">
                    <p className="text-ui-xs font-ui-semibold uppercase tracking-[0.16em] text-content-muted">
                      Clicks
                    </p>
                    <p className="mt-1 text-heading-sm font-ui-semibold text-content-heading">
                      {formatNumber(link.totalClicks)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isPending && deletingShortCode === link.shortCode}
                    onClick={() => deleteLink(link.shortCode)}
                  >
                    <Trash2 className="size-4" />
                    {deletingShortCode === link.shortCode
                      ? "Deleting"
                      : "Delete"}
                  </Button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border-soft pt-4 text-ui-sm text-content-secondary">
                <MetaItem
                  icon={<BarChart3 className="size-4" />}
                  label="Click data"
                  value={
                    link.lastClickedAt
                      ? `Last click ${formatDateTime(link.lastClickedAt)}`
                      : "No clicks yet"
                  }
                />
                <MetaItem
                  icon={<CalendarDays className="size-4" />}
                  label="Created"
                  value={formatDateTime(link.createdAt)}
                />
                <MetaItem
                  icon={<Clock3 className="size-4" />}
                  label="Expires"
                  value={expiry.label}
                />
                <MetaItem
                  icon={<Tag className="size-4" />}
                  label="Tags"
                  value="No tags"
                />
                <Badge variant={expiry.variant}>{expiry.badge}</Badge>
              </div>
            </article>
          );
        })}
      </div>

      <PaginationControls
        expires={expires}
        page={page}
        search={search}
        totalPages={totalPages}
        totalLinks={totalLinks}
      />
    </>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="inline-flex min-w-0 items-center gap-2">
      <span className="text-content-muted">{icon}</span>
      <span className="font-ui-semibold text-content-heading">{label}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}

function PaginationControls({
  expires,
  page,
  search,
  totalPages,
  totalLinks,
}: {
  expires: LinkExpiryFilter;
  page: number;
  search: string;
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
              href={buildAnalyticsPageHref(previousPage, search, expires)}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              aria-disabled={page <= 1}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href={buildAnalyticsPageHref(nextPage, search, expires)}
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

function buildAnalyticsPageHref(
  page: number,
  search: string,
  expires: LinkExpiryFilter,
): string {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (expires !== "all") {
    params.set("expires", expires);
  }

  const queryString = params.toString();

  return queryString ? `/analytics?${queryString}` : "/analytics";
}

function getExpiryDisplay(expiresAt: string | null): {
  label: string;
  badge: string;
  variant: "secondary" | "warning" | "outline";
} {
  if (!expiresAt) {
    return {
      label: "Never expires",
      badge: "No expiry",
      variant: "secondary",
    };
  }

  const expiryDate = new Date(expiresAt);

  if (expiryDate.getTime() <= Date.now()) {
    return {
      label: `Expired ${formatDateTime(expiresAt)}`,
      badge: "Expired",
      variant: "warning",
    };
  }

  return {
    label: `Expires ${formatDateTime(expiresAt)}`,
    badge: "Expiring",
    variant: "outline",
  };
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

function getDestinationLabel(destinationUrl: string): string {
  try {
    const url = new URL(destinationUrl);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return destinationUrl;
  }
}
