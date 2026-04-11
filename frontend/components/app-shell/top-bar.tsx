"use client";

import { ChevronDown, HelpCircle, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/features/auth/actions/auth.actions";
import type { AuthenticatedUser } from "@/lib/auth";

function getInitials(fullName: string): string {
  const initials = fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "U";
}

function AuthMenu({ user }: { user: AuthenticatedUser }) {
  const initials = getInitials(user.fullName);
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-auto rounded-full border border-transparent bg-surface px-1 py-1 hover:border-border-soft hover:bg-surface"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-content-strong text-ui-sm font-ui-semibold text-content-inverted">
            {initials}
          </span>
          <span className="hidden text-left md:block">
            <span className="block text-ui-sm font-ui-semibold text-content-heading">
              {user.fullName}
            </span>
            <span className="block text-ui-xs text-content-muted">
              {user.tier === "admin" ? "Admin account" : "Personal account"}
            </span>
          </span>
          <ChevronDown className="mr-2 hidden size-4 text-content-muted md:block" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="border-b border-border-soft">
          <p className="text-ui-sm font-ui-semibold text-content-heading">
            {user.fullName}
          </p>
          <p className="mt-1 text-ui-xs text-content-muted">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuItem
          disabled={isPending}
          className="text-danger focus:text-danger-strong hover:!bg-danger-soft"
          onSelect={(event) => {
            event.preventDefault();
            startTransition(() => {
              void logout();
            });
          }}
        >
          {isPending ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TopBar({
  currentUser,
}: {
  currentUser: AuthenticatedUser | null;
}) {
  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between gap-4 border-b border-border-soft bg-surface/95 px-5 backdrop-blur md:px-8">
      <div className="hidden flex-1 md:block" />

      <div className="flex flex-1 items-center justify-end gap-3">
        <label className="hidden min-w-0 max-w-md flex-1 items-center gap-3 rounded-2xl border border-transparent bg-surface-muted px-4 py-3 text-ui-sm text-content-muted shadow-search-inset md:flex">
          <Search className="size-4 shrink-0 text-content-muted" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full bg-transparent text-content-primary outline-none placeholder:text-content-subtle"
          />
        </label>

        {currentUser ? null : (
          <>
            <Button asChild variant="teal">
              <Link href="/register">Register</Link>
            </Button>

            <Button
              asChild
              variant="secondary"
              className="hidden md:inline-flex"
            >
              <Link href="/login">Log in</Link>
            </Button>
          </>
        )}

        <Button type="button" variant="secondary" size="icon" aria-label="Help">
          <HelpCircle className="size-5" />
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label="Highlights"
        >
          <Sparkles className="size-5" />
        </Button>

        {currentUser ? <AuthMenu user={currentUser} /> : null}
      </div>
    </header>
  );
}
