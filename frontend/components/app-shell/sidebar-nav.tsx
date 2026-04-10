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
      className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ${
        isActive
          ? "bg-[var(--sidebar-active)] text-[var(--sidebar-active-foreground)] shadow-[inset_0_0_0_1px_rgba(39,80,216,0.08)]"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
      }`}
    >
      <Icon className="size-5 shrink-0" />
      <span>{item.label}</span>
      {item.badge ? (
        <span className="ml-auto rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--accent)]">
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
    <aside className="flex h-screen flex-col border-r border-[var(--border-soft)] bg-[var(--sidebar-surface)]">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex size-11 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-xl font-bold text-orange-500">
          b
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">RutGonLink</p>
          <p className="text-xs text-slate-500">Workspace</p>
        </div>
      </div>

      <div className="px-4 pb-5">
        <Button type="button" variant="default" size="lg" className="w-full">
          <Plus className="size-4" />
          Create new
        </Button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-6 app-scrollbar">
        <div className="border-t border-[var(--border-soft)] pt-5">
          <NavSection items={primaryNavItems} />
        </div>

        <div className="border-t border-[var(--border-soft)] pt-5">
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
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
              isActive
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--border-soft)] bg-white text-slate-600"
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
