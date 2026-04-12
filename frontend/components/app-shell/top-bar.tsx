import { HelpCircle, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { AuthMenu } from "@/components/app-shell/auth-menu";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/lib/get-current-user";

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
