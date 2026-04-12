"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3, ExternalLink, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

  function deleteLink(shortCode: string) {
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
        <div className="mt-5 rounded-2xl bg-danger-soft p-4 text-ui-sm text-danger">
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
          const detailHref = `/analytics/${encodeURIComponent(link.shortCode)}`;
          const isDeleting =
            isPending && deletingShortCode === link.shortCode;

          return (
            <article
              key={link.shortCode}
              className="group rounded-lg border border-border-soft bg-surface p-5 shadow-app-panel transition-colors hover:border-accent/40 hover:bg-surface-cool"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="relative z-10 min-w-0 flex-1">
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                      <ExternalLink className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={detailHref}
                        className="block break-all text-ui-lg font-ui-semibold text-content-heading hover:text-accent"
                      >
                        {destinationLabel}
                      </Link>
                      <a
                        href={shortenedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block break-all text-ui-sm font-ui-semibold text-accent hover:text-accent-strong"
                      >
                        {shortenedUrl}
                      </a>
                      <a
                        href={link.destinationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block max-w-4xl truncate text-ui-sm text-content-secondary hover:text-content-heading"
                      >
                        {link.destinationUrl}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="relative z-20 flex shrink-0 flex-wrap items-center gap-3 xl:justify-end">
                  <div className="rounded-2xl bg-surface-muted px-4 py-3 text-right">
                    <p className="text-ui-xs font-ui-semibold uppercase tracking-[0.16em] text-content-muted">
                      Clicks
                    </p>
                    <p className="mt-1 text-heading-sm font-ui-semibold text-content-heading">
                      {formatNumber(link.totalClicks)}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        className="rounded-lg"
                        disabled={isDeleting}
                      >
                        <Trash2 className="size-4" />
                        {isDeleting ? "Deleting" : "Delete"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this short link?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the short link and its tracking data.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => deleteLink(link.shortCode)}
                        >
                          Delete link
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border-soft pt-4 text-ui-sm text-content-secondary">
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

function getExpiryDisplay(expiresAt: string | null): { label: string } {
  if (!expiresAt) {
    return {
      label: "Never expires",
    };
  }

  const expiryDate = new Date(expiresAt);

  if (expiryDate.getTime() <= Date.now()) {
    return {
      label: `Expired ${formatDateTime(expiresAt)}`,
    };
  }

  return {
    label: `Expires ${formatDateTime(expiresAt)}`,
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
