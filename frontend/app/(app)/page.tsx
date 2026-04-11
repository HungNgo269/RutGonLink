import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Link2,
  Lock,
  QrCode,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { ShortenUrlForm } from "@/features/shortenUrl/components/ShortenUrlForm";
import { getCurrentUser } from "@/lib/auth";

export default async function AppPage() {
  const currentUser = await getCurrentUser();
  const displayName = currentUser?.fullName ?? "there";

  return (
    <section className="space-y-8">
      <div className="flex justify-center">
        <div className="inline-flex rounded-full border border-border-soft bg-surface p-1.5 shadow-app-soft">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-5 py-2.5 text-ui-sm font-ui-semibold text-content-heading"
          >
            <Link2 className="size-4" />
            Short link
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-ui-sm font-ui-semibold text-content-muted"
          >
            <QrCode className="size-4" />
            QR Code
          </button>
        </div>
      </div>

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1.75fr)_minmax(320px,0.8fr)]">
        <div className="rounded-[30px] border border-border-soft bg-surface p-6 shadow-app-soft md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <h1 className="text-heading-md font-ui-semibold tracking-tight text-content-heading md:text-heading-lg">
                Quick create: Short link
              </h1>
              <div className="flex items-center gap-2 text-ui-sm text-content-secondary">
                <span>Domain: rutgon.link</span>
                <Lock className="size-4 text-content-muted" />
              </div>
            </div>

            <p className="max-w-xs text-ui-sm leading-7 text-content-secondary">
              You can create 3 more links this month.
            </p>
          </div>

          <div className="mt-8">
            <ShortenUrlForm />
          </div>
        </div>

        <aside className="rounded-[30px] border border-border-soft bg-gradient-workflow p-6 shadow-app-soft">
          <div className="inline-flex rounded-full bg-surface/80 p-2 text-accent">
            <Sparkles className="size-5" />
          </div>
          <h2 className="mt-5 text-heading-md font-ui-semibold tracking-tight text-content-heading">
            Simplify your workflow
          </h2>
          <p className="mt-3 text-ui-sm leading-7 text-content-secondary">
            Create, share, and track shorter links from one workspace built for
            quick daily actions.
          </p>

          <div className="mt-6 space-y-3">
            {[
              "Personalize every short link",
              "Reuse one link across social posts",
              "Keep campaign links in one place",
            ].map((item) => (
              <div
                key={item}
                className="rounded-full border border-surface bg-surface/80 px-4 py-3 text-ui-sm font-ui-medium text-content-primary"
              >
                {item}
              </div>
            ))}
          </div>

          {currentUser ? (
            <Link
              href="/analytics"
              className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-teal px-4 py-3.5 text-ui-sm font-ui-semibold text-content-inverted hover:bg-teal-strong"
            >
              View analytics
            </Link>
          ) : (
            <Link
              href="/register"
              className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-teal px-4 py-3.5 text-ui-sm font-ui-semibold text-content-inverted hover:bg-teal-strong"
            >
              Create account
            </Link>
          )}
        </aside>
      </div>

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <section className="rounded-[30px] border border-border-soft bg-surface p-6 shadow-app-soft md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-heading-sm font-ui-semibold tracking-tight text-content-heading">
                {currentUser ? "Connect your tools" : "Connect your account"}
              </h2>
              <p className="mt-2 text-ui-sm text-content-secondary">
                {currentUser
                  ? "Recommended integrations to speed up link creation and sharing."
                  : "Create an account to keep integrations tied to your workspace."}
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 text-ui-sm font-ui-semibold text-accent"
            >
              Explore integrations
              <ArrowRight className="size-4" />
            </button>
          </div>

          <div className="mt-8 space-y-4">
            {[
              {
                color: "bg-integration-green",
                title: "Chrome Extension",
                description: "Instant links and QR codes from any tab.",
                mark: "C",
              },
              {
                color: "bg-integration-sky",
                title: "Canva",
                description: "Pair campaign graphics with trackable links.",
                mark: "Ca",
              },
              {
                color: "bg-integration-gold",
                title: "Shopify",
                description: "Generate short links for products and launches.",
                mark: "S",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="grid gap-4 rounded-[28px] border border-border-soft p-4 md:grid-cols-[84px_minmax(0,1fr)] md:p-5"
              >
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-3xl text-heading-sm font-ui-semibold text-content-heading ${item.color}`}
                >
                  {item.mark}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-ui-lg font-ui-semibold text-content-heading">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-ui-sm leading-7 text-content-secondary">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-border-soft bg-surface p-6 shadow-app-soft md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="max-w-md text-heading-sm font-ui-semibold tracking-tight text-content-heading">
                Hi {displayName}, get started with RutGonLink
              </h2>
              <p className="mt-2 text-ui-sm text-content-secondary">
                Complete a few small tasks to unlock the rest of the workspace.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-ui-lg font-ui-semibold text-content-primary">
                33%
              </span>
              <div className="relative size-11 rounded-full bg-progress-ring p-1">
                <div className="size-full rounded-full bg-surface" />
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 text-success" />
              <div>
                <p className="font-ui-semibold text-content-heading">
                  Link shortened
                </p>
                <p className="mt-1 text-ui-sm text-content-secondary">
                  You already created your first result.
                </p>
              </div>
            </div>

            <div className="rounded-[28px] bg-surface-muted p-5">
              <div className="flex items-start gap-3">
                <Circle className="mt-0.5 size-5 text-accent" />
                <div className="min-w-0 flex-1">
                  <p className="font-ui-semibold text-content-heading">
                    Collect 10 clicks or scans
                  </p>
                  <div className="mt-6 h-4 overflow-hidden rounded-full bg-surface">
                    <div className="h-full w-0 rounded-full bg-accent" />
                  </div>
                  <p className="mt-3 text-right text-ui-sm font-ui-semibold text-content-secondary">
                    0/10 clicks to goal
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="rounded-2xl border border-accent px-4 py-2.5 text-ui-sm font-ui-semibold text-accent hover:bg-accent-soft"
                    >
                      Share first link
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl border border-accent px-4 py-2.5 text-ui-sm font-ui-semibold text-accent hover:bg-accent-soft"
                    >
                      View links
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Circle className="mt-0.5 size-5 text-content-subtle" />
              <div>
                <p className="font-ui-semibold text-content-heading">
                  Preview the analytics you could unlock
                </p>
                <p className="mt-1 text-ui-sm text-content-secondary">
                  Visit the analytics section from the left navigation.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
