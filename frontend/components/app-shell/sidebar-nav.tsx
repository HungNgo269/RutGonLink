"use client";

import Link from "next/link";
import {
  BarChart3,
  FileText,
  Home,
  Link2,
  Plus,
  QrCode,
  Settings,
} from "lucide-react";
import { usePathname } from "next/navigation";
import {
  primaryNavItems,
  secondaryNavItems,
  type AppNavItem,
} from "@/components/app-shell/navigation";
import { Button } from "@/components/ui/button";

const iconMap = {
  analytics: BarChart3,
  home: Home,
  links: Link2,
  pages: FileText,
  qr: QrCode,
  settings: Settings,
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
      className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-ui-sm font-ui-semibold ${
        isActive
          ? "bg-sidebar-active text-sidebar-active-foreground shadow-accent-outline"
          : "text-content-secondary hover:bg-surface-hover hover:text-content-heading"
      }`}
    >
      <Icon className="size-5 shrink-0" />
      <span>{item.label}</span>
      {item.badge ? (
        <span className="ml-auto rounded-full bg-accent-soft px-2 py-0.5 text-ui-2xs font-ui-bold text-accent">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function NavSection({ items }: { items: AppNavItem[] }) {
  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <NavLink key={item.href} item={item} />
      ))}
    </nav>
  );
}

export function SidebarNav() {
  return (
    <aside className="flex h-screen flex-col border-r border-border-soft bg-sidebar-surface">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex size-11 items-center justify-center rounded-2xl border border-brand-mark-border bg-brand-mark-surface text-ui-xl font-ui-bold text-brand-mark-foreground">
          b
        </div>
        <div>
          <p className="text-ui-sm font-ui-semibold text-content-heading">RutGonLink</p>
          <p className="text-ui-xs text-content-muted">Workspace</p>
        </div>
      </div>

      <div className="px-4 pb-5">
        <Button type="button" variant="default" size="lg" className="w-full">
          <Plus className="size-4" />
          Create new
        </Button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-6 app-scrollbar">
        <div className="border-t border-border-soft pt-5">
          <NavSection items={primaryNavItems} />
        </div>

        <div className="border-t border-border-soft pt-5">
          <NavSection items={secondaryNavItems} />
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const items = [...primaryNavItems, ...secondaryNavItems];
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto px-4 py-3 app-scrollbar lg:hidden">
      {items.map((item) => {
        const isActive = isActivePath(pathname, item.href);
        const Icon = iconMap[item.icon];

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-ui-sm font-ui-semibold ${
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
