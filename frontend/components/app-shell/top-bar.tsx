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

function AuthMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-auto rounded-full border border-transparent bg-white px-1 py-1 hover:border-[var(--border-soft)] hover:bg-white"
        >
        <span className="flex size-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          H
        </span>
        <span className="hidden text-left md:block">
          <span className="block text-sm font-semibold text-slate-950">
            Hung Ngo
          </span>
          <span className="block text-xs text-slate-500">Personal account</span>
        </span>
        <ChevronDown className="mr-2 hidden size-4 text-slate-500 md:block" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="border-b border-[var(--border-soft)]">
          <p className="text-sm font-semibold text-slate-950">Hung Ngo</p>
          <p className="mt-1 text-xs text-slate-500">hung@example.com</p>
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/">Log in</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/">Register</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-rose-600 focus:text-rose-700 hover:!bg-rose-50">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TopBar() {
  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between gap-4 border-b border-[var(--border-soft)] bg-white/95 px-5 backdrop-blur md:px-8">
      <div className="hidden flex-1 md:block" />

      <div className="flex flex-1 items-center justify-end gap-3">
        <label className="hidden min-w-0 max-w-md flex-1 items-center gap-3 rounded-2xl border border-transparent bg-[var(--surface-muted)] px-4 py-3 text-sm text-slate-500 shadow-[inset_0_0_0_1px_rgba(216,227,242,0.65)] md:flex">
          <Search className="size-4 shrink-0 text-slate-500" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
          />
        </label>

        <Button asChild variant="teal">
          <Link href="/">
          Register
          </Link>
        </Button>

        <Button asChild variant="secondary" className="hidden md:inline-flex">
          <Link href="/">Log in</Link>
        </Button>

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

        <AuthMenu />
      </div>
    </header>
  );
}
