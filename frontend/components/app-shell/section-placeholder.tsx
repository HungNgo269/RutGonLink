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
        <p className="text-ui-xs font-ui-semibold uppercase tracking-[0.24em] text-accent">
          {eyebrow}
        </p>
        <h1 className="text-heading-md font-ui-semibold tracking-tight text-content-heading">
          {title}
        </h1>
        <p className="max-w-2xl text-ui-sm leading-7 text-content-secondary">
          {description}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
        <div className="rounded-[28px] border border-border-soft bg-surface p-7 shadow-app-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-ui-xl font-ui-semibold text-content-heading">
                Workspace preview
              </h2>
              <p className="mt-2 text-ui-sm leading-7 text-content-secondary">
                This route is using the shared `(app)` layout, so the left
                navigation and top bar stay mounted while the content swaps.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-border-soft px-4 py-2 text-ui-sm font-ui-semibold text-content-primary hover:border-accent hover:text-accent"
            >
              Open panel
              <ArrowRightIcon className="size-4" />
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {["Daily visits", "Top campaign", "Health score"].map((item, index) => (
              <div
                key={item}
                className="rounded-3xl bg-surface-muted p-5"
              >
                <p className="text-ui-sm text-content-muted">{item}</p>
                <p className="mt-4 text-heading-md font-ui-semibold tracking-tight text-content-heading">
                  {index === 0 ? "18.2K" : index === 1 ? "Spring launch" : "94%"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-border-soft bg-gradient-panel p-7 shadow-app-soft">
          <p className="text-ui-sm font-ui-semibold text-content-heading">Next step</p>
          <p className="mt-3 text-ui-sm leading-7 text-content-secondary">
            Use this route as the destination for the corresponding feature once
            you replace the placeholder content with real data.
          </p>
          <button
            type="button"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-teal px-4 py-3 text-ui-sm font-ui-semibold text-content-inverted hover:bg-teal-strong"
          >
            Register now
            <ArrowRightIcon className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
