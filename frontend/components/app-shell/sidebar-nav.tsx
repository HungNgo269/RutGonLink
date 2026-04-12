"use client";

import Link from "next/link";
import { BarChart3, Home } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  primaryNavItems,
  type AppNavItem,
} from "@/components/app-shell/navigation";

const iconMap = {
  analytics: BarChart3,
  home: Home,
} as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item }: { item: AppNavItem }) {
  const pathname = usePathname();
  const isActive = isActivePath(pathname, item.href);
  const Icon = iconMap[item.icon];

  return (
    <Link
      href={item.href}
      className={`group flex items-center gap-3 rounded-lg px-4 py-3 text-ui-sm font-ui-semibold ${
        isActive
          ? "bg-sidebar-active text-sidebar-active-foreground shadow-accent-outline"
          : "text-content-secondary hover:bg-surface-hover hover:text-content-heading"
      }`}
    >
      <Icon className="size-5 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

export function SidebarNav() {
  return (
    <aside className="flex h-screen flex-col border-r border-border-soft bg-sidebar-surface">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex size-11 items-center justify-center rounded-lg border border-brand-mark-border bg-brand-mark-surface font-mono text-ui-xl font-ui-bold text-brand-mark-foreground">
          R
        </div>
        <div>
          <p className="text-ui-sm font-ui-semibold text-content-heading">RutGonLink</p>
          <p className="text-ui-xs text-content-muted">Workspace</p>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-6 app-scrollbar">
        <div className="border-t border-border-soft pt-5">
          <nav className="space-y-1">
            {primaryNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto px-4 py-3 app-scrollbar lg:hidden">
      {primaryNavItems.map((item) => {
        const isActive = isActivePath(pathname, item.href);
        const Icon = iconMap[item.icon];

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2 text-ui-sm font-ui-semibold ${
              isActive
                ? "border-accent bg-accent-soft text-accent"
                : "border-border-soft bg-surface text-content-secondary"
            }`}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
