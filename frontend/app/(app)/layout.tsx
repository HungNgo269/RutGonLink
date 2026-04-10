import { MobileNav, SidebarNav } from "@/components/app-shell/sidebar-nav";
import { TopBar } from "@/components/app-shell/top-bar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="grid min-h-screen lg:grid-cols-[232px_minmax(0,1fr)]">
        <div className="sticky top-0 hidden h-screen lg:block">
          <SidebarNav />
        </div>

        <div className="flex min-h-screen min-w-0 flex-col">
          <TopBar />
          <div className="border-b border-[var(--border-soft)] bg-white lg:hidden">
            <MobileNav />
          </div>

          <main className="flex-1 overflow-x-hidden px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
