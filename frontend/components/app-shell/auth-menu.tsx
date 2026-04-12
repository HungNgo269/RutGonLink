"use client";

import { ChevronDown } from "lucide-react";
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
import type { AuthResponse } from "@/features/auth/schemas/auth.schema";

type CurrentUser = AuthResponse["user"];

export function AuthMenu({ user }: { user: CurrentUser }) {
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
