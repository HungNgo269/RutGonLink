export type AppNavItem = {
  href: string;
  label: string;
  icon: "home" | "links" | "qr" | "pages" | "analytics" | "settings";
  badge?: string;
};

export const primaryNavItems: AppNavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: "home",
  },
  {
    href: "/links",
    label: "Links",
    icon: "links",
  },
  {
    href: "/qr-codes",
    label: "QR Codes",
    icon: "qr",
  },
  {
    href: "/pages",
    label: "Pages",
    icon: "pages",
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: "analytics",
  },
];

export const secondaryNavItems: AppNavItem[] = [
  {
    href: "/settings",
    label: "Settings",
    icon: "settings",
  },
];
