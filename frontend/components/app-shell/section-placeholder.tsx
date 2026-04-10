import { ArrowRightIcon } from "@/components/app-shell/app-icons";

type SectionPlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionPlaceholder({
  eyebrow,
  title,
  description,
}: SectionPlaceholderProps) {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">
          {description}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
        <div className="rounded-[28px] border border-[var(--border-soft)] bg-white p-7 shadow-[var(--shadow-soft)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Workspace preview
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                This route is using the shared `(app)` layout, so the left
                navigation and top bar stay mounted while the content swaps.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Open panel
              <ArrowRightIcon className="size-4" />
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {["Daily visits", "Top campaign", "Health score"].map((item, index) => (
              <div
                key={item}
                className="rounded-3xl bg-[var(--surface-muted)] p-5"
              >
                <p className="text-sm text-slate-500">{item}</p>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                  {index === 0 ? "18.2K" : index === 1 ? "Spring launch" : "94%"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[var(--border-soft)] bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] p-7 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold text-slate-950">Next step</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Use this route as the destination for the corresponding feature once
            you replace the placeholder content with real data.
          </p>
          <button
            type="button"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[var(--teal)] px-4 py-3 text-sm font-semibold text-white hover:bg-[#176b7b]"
          >
            Register now
            <ArrowRightIcon className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
