export type AppNavItem = {
  href: string;
  label: string;
  icon: "home" | "analytics";
};

export const primaryNavItems: AppNavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: "home",
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: "analytics",
  },
];

export const secondaryNavItems: AppNavItem[] = [];
