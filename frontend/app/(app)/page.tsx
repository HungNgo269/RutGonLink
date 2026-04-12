import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, Link2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShortenUrlForm } from "@/features/shortenUrl/components/ShortenUrlForm";

const quickStats = [
  { label: "Links this month", value: "3 left" },
  { label: "Analytics", value: "Ready" },
  { label: "Domain", value: "rutgon.link" },
];

const linkSteps = [
  "Paste a destination URL",
  "Create a short link",
  "Open analytics after visits arrive",
];

export default function AppPage() {
  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
        <div className="rounded-lg border border-border-soft bg-surface p-6 shadow-app-soft md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-lg border border-border-soft bg-surface-muted px-3 py-2 text-ui-sm font-ui-semibold text-accent">
                Short link
              </div>
              <h1 className="text-heading-md font-ui-semibold tracking-tight text-content-heading md:text-heading-lg">
                Create a short link
              </h1>
              {/* <div className="flex items-center gap-2 text-ui-sm text-content-secondary">
                <span>Domain: rutgon.link</span>
                <Lock className="size-4 text-content-muted" />
              </div> */}
            </div>
          </div>

          <div className="mt-8">
            <ShortenUrlForm />
          </div>
        </div>

        <aside className="rounded-lg border border-border-soft bg-gradient-analytics p-6 shadow-app-soft">
          <div className="inline-flex rounded-lg bg-surface/90 p-2 text-accent">
            <BarChart3 className="size-5" />
          </div>
          <h2 className="mt-5 text-heading-sm font-ui-semibold tracking-tight text-content-heading">
            Analytics starts after your first visit
          </h2>
          <p className="mt-3 text-ui-sm leading-7 text-content-secondary">
            Each saved link can show click totals, recent activity, devices,
            referrers, and locations.
          </p>

          <div className="mt-6 grid gap-3">
            {quickStats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between rounded-lg border border-border-soft bg-surface/85 px-4 py-3"
              >
                <span className="text-ui-sm text-content-secondary">
                  {stat.label}
                </span>
                <span className="font-mono text-ui-sm font-ui-semibold text-content-heading">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          <Button asChild className="mt-6 w-full">
            <Link href="/analytics">
              View analytics
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </aside>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-lg border border-border-soft bg-surface p-6 shadow-app-soft md:p-8">
          <h2 className="text-heading-sm font-ui-semibold tracking-tight text-content-heading">
            Link steps
          </h2>
          <p className="mt-2 text-ui-sm text-content-secondary">
            The workspace stays focused on creating links and reading click
            data.
          </p>

          <div className="mt-6 grid gap-3">
            {linkSteps.map((item, index) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-lg border border-border-soft bg-surface-muted px-4 py-3"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent text-ui-xs font-ui-semibold text-content-inverted">
                  {index + 1}
                </span>
                <p className="text-ui-sm font-ui-semibold text-content-heading">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border-soft bg-surface p-6 shadow-app-soft md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-heading-sm font-ui-semibold tracking-tight text-content-heading">
                Workspace status
              </h2>
              <p className="mt-2 text-ui-sm text-content-secondary">
                Create a link first, then check analytics from the navigation.
              </p>
            </div>

            <div className="rounded-lg bg-accent-soft px-3 py-2 font-mono text-ui-sm font-ui-semibold text-accent">
              1/2
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 text-success" />
              <div>
                <p className="font-ui-semibold text-content-heading">
                  Short link form is ready
                </p>
                <p className="mt-1 text-ui-sm text-content-secondary">
                  Enter a destination URL to create a saved short link.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-surface-muted p-5">
              <div className="flex items-start gap-3">
                <BarChart3 className="mt-0.5 size-5 text-accent" />
                <div className="min-w-0 flex-1">
                  <p className="font-ui-semibold text-content-heading">
                    Analytics becomes useful after clicks
                  </p>
                  <div className="mt-5 h-3 overflow-hidden rounded-lg bg-surface">
                    <div className="h-full w-0 rounded-lg bg-accent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
