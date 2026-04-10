import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Link2,
  Lock,
  QrCode,
  Sparkles,
} from "lucide-react";
import { ShortenUrlForm } from "@/features/shortenUrl/components/ShortenUrlForm";

export default function AppPage() {
  return (
    <section className="space-y-8">
      <div className="flex justify-center">
        <div className="inline-flex rounded-full border border-[var(--border-soft)] bg-white p-1.5 shadow-[var(--shadow-soft)]">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-muted)] px-5 py-2.5 text-sm font-semibold text-slate-950"
          >
            <Link2 className="size-4" />
            Short link
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-slate-500"
          >
            <QrCode className="size-4" />
            QR Code
          </button>
        </div>
      </div>

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1.75fr)_minmax(320px,0.8fr)]">
        <div className="rounded-[30px] border border-[var(--border-soft)] bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                Quick create: Short link
              </h1>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Domain: rutgon.link</span>
                <Lock className="size-4 text-slate-500" />
              </div>
            </div>

            <p className="max-w-xs text-sm leading-7 text-slate-600">
              You can create 3 more links this month.
            </p>
          </div>

          <div className="mt-8">
            <ShortenUrlForm />
          </div>
        </div>

        <aside className="rounded-[30px] border border-[var(--border-soft)] bg-[linear-gradient(180deg,#f7fbff_0%,var(--hero-glow)_100%)] p-6 shadow-[var(--shadow-soft)]">
          <div className="inline-flex rounded-full bg-white/80 p-2 text-[var(--accent)]">
            <Sparkles className="size-5" />
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
            Simplify your workflow
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
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
                className="rounded-full border border-white bg-white/80 px-4 py-3 text-sm font-medium text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-[var(--teal)] px-4 py-3.5 text-sm font-semibold text-white hover:bg-[#176b7b]"
          >
            Register now
          </button>
        </aside>
      </div>

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <section className="rounded-[30px] border border-[var(--border-soft)] bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Connect your account
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Recommended integrations to speed up link creation and sharing.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]"
            >
              Explore integrations
              <ArrowRight className="size-4" />
            </button>
          </div>

          <div className="mt-8 space-y-4">
            {[
              {
                color: "bg-[#dff4ca]",
                title: "Chrome Extension",
                description: "Instant links and QR codes from any tab.",
                mark: "C",
              },
              {
                color: "bg-[#d9efff]",
                title: "Canva",
                description: "Pair campaign graphics with trackable links.",
                mark: "Ca",
              },
              {
                color: "bg-[#f6efcf]",
                title: "Shopify",
                description: "Generate short links for products and launches.",
                mark: "S",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="grid gap-4 rounded-[28px] border border-[var(--border-soft)] p-4 md:grid-cols-[84px_minmax(0,1fr)] md:p-5"
              >
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-3xl text-2xl font-semibold text-slate-950 ${item.color}`}
                >
                  {item.mark}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-950">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-[var(--border-soft)] bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="max-w-md text-2xl font-semibold tracking-tight text-slate-950">
                Hi Hung Ngo, get started with RutGonLink
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Complete a few small tasks to unlock the rest of the workspace.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-slate-700">33%</span>
              <div className="relative size-11 rounded-full bg-[conic-gradient(var(--success)_33%,#e7edf7_0)] p-1">
                <div className="size-full rounded-full bg-white" />
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 text-[var(--success)]" />
              <div>
                <p className="font-semibold text-slate-950">Link shortened</p>
                <p className="mt-1 text-sm text-slate-600">
                  You already created your first result.
                </p>
              </div>
            </div>

            <div className="rounded-[28px] bg-[var(--surface-muted)] p-5">
              <div className="flex items-start gap-3">
                <Circle className="mt-0.5 size-5 text-[var(--accent)]" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-950">
                    Collect 10 clicks or scans
                  </p>
                  <div className="mt-6 h-4 overflow-hidden rounded-full bg-white">
                    <div className="h-full w-0 rounded-full bg-[var(--accent)]" />
                  </div>
                  <p className="mt-3 text-right text-sm font-semibold text-slate-600">
                    0/10 clicks to goal
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="rounded-2xl border border-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                    >
                      Share first link
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl border border-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                    >
                      View links
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Circle className="mt-0.5 size-5 text-slate-400" />
              <div>
                <p className="font-semibold text-slate-950">
                  Preview the analytics you could unlock
                </p>
                <p className="mt-1 text-sm text-slate-600">
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
