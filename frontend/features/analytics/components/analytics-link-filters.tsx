"use client";

import { useEffect, useState, useTransition } from "react";
import { Filter, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { LinkExpiryFilter } from "@/features/analytics/lib/get-user-link-analytics";

const expiryFilters: Array<{
  label: string;
  value: LinkExpiryFilter;
}> = [
  { label: "All", value: "all" },
  { label: "Expired", value: "expired" },
  { label: "Expiring", value: "expiring" },
  { label: "No expiry", value: "no-expiry" },
];

type AnalyticsLinkFiltersProps = {
  search: string;
  expires: LinkExpiryFilter;
};

export function AnalyticsLinkFilters({
  search,
  expires,
}: AnalyticsLinkFiltersProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(search);
  const [, startTransition] = useTransition();
  const filtersActive = searchValue.trim() !== "" || expires !== "all";

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  useEffect(() => {
    if (searchValue === search) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      startTransition(() => {
        router.push(buildAnalyticsHref(searchValue, expires));
      });
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [expires, router, search, searchValue]);

  function updateExpiryFilter(nextExpires: LinkExpiryFilter) {
    startTransition(() => {
      router.push(buildAnalyticsHref(searchValue, nextExpires));
    });
  }

  function clearFilters() {
    setSearchValue("");

    startTransition(() => {
      router.push("/analytics");
    });
  }

  return (
    <div className="flex flex-col gap-4 border-b border-border-soft pb-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="flex h-11 min-w-0 items-center gap-3 rounded-lg border border-border-soft bg-surface px-4 text-ui-sm text-content-muted shadow-search-inset md:w-80">
          <Search className="size-4 shrink-0" />
          <input
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search links"
            className="w-full bg-transparent text-content-primary outline-none placeholder:text-content-subtle"
          />
        </label>

        <label className="flex h-11 items-center gap-3 rounded-lg border border-border-soft bg-surface px-4 text-ui-sm font-ui-semibold text-content-heading">
          <Filter className="size-4" />
          <span>Filter by expiry</span>
          <select
            value={expires}
            onChange={(event) =>
              updateExpiryFilter(event.target.value as LinkExpiryFilter)
            }
            className="bg-transparent text-content-primary outline-none"
          >
            {expiryFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtersActive ? (
        <Button
          type="button"
          variant="secondary"
          className="rounded-lg"
          onClick={clearFilters}
        >
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}

function buildAnalyticsHref(search: string, expires: LinkExpiryFilter): string {
  const params = new URLSearchParams();
  const trimmedSearch = search.trim();

  if (trimmedSearch) {
    params.set("search", trimmedSearch);
  }

  if (expires !== "all") {
    params.set("expires", expires);
  }

  const queryString = params.toString();

  return queryString ? `/analytics?${queryString}` : "/analytics";
}
