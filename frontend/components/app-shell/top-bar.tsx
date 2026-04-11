import {
  ChevronDown,
  HelpCircle,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/features/auth/actions/auth.actions";
import { getCurrentUser } from "@/features/auth/lib/get-current-user";
import type { AuthResponse } from "@/features/auth/schemas/auth.schema";

type CurrentUser = AuthResponse["user"];

function AuthMenu({ user }: { user: CurrentUser }) {
  const initial = user.fullName.trim().charAt(0).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-auto rounded-full border border-transparent bg-surface px-1 py-1 hover:border-border-soft hover:bg-surface"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-content-strong text-ui-sm font-ui-semibold text-content-inverted">
            {initial}
          </span>
          <span className="hidden text-left md:block">
            <span className="block text-ui-sm font-ui-semibold text-content-heading">
              {user.fullName}
            </span>
            <span className="block text-ui-xs text-content-muted">
              Personal account
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
        <DropdownMenuSeparator />
        <form action={logout}>
          <DropdownMenuItem
            asChild
            className="w-full text-danger focus:text-danger-strong hover:!bg-danger-soft"
          >
            <button type="submit">Log out</button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export async function TopBar() {
  const user = await getCurrentUser();

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

        {user ? null : (
          <>
            <Button asChild variant="teal">
              <Link href="/register">Register</Link>
            </Button>

            <Button asChild variant="secondary" className="hidden md:inline-flex">
              <Link href="/login">Log in</Link>
            </Button>
          </>
        )}

        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label="Help"
        >
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

        {user ? <AuthMenu user={user} /> : null}
      </div>
    </header>
  );
}
