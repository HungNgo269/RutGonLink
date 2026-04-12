import Link from "next/link";

type AuthPageShellProps = {
  title: string;
  description: string;
  switchLabel: string;
  switchHref: string;
  switchText: string;
  children: React.ReactNode;
};

export function AuthPageShell({
  title,
  description,
  switchLabel,
  switchHref,
  switchText,
  children,
}: AuthPageShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-analytics px-4 py-10 text-foreground">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-border-soft bg-surface shadow-app-soft lg:grid-cols-[minmax(0,0.85fr)_minmax(360px,1fr)]">
        <div className="border-b border-border-soft bg-surface-muted px-6 py-8 md:px-10 md:py-12 lg:border-b-0 lg:border-r">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-ui-sm font-ui-semibold text-content-heading"
          >
            <span className="flex size-10 items-center justify-center rounded-lg border border-brand-mark-border bg-brand-mark-surface font-mono text-ui-lg font-ui-bold text-brand-mark-foreground">
              R
            </span>
            <span>RutGonLink</span>
          </Link>
          <h1 className="mt-10 text-heading-md font-ui-semibold tracking-tight text-content-heading md:text-heading-lg">
            {title}
          </h1>
          <p className="mt-4 max-w-sm text-ui-sm leading-7 text-content-secondary">
            {description}
          </p>
          <div className="mt-8 grid gap-3 text-ui-sm text-content-primary">
            <p className="rounded-lg border border-border-soft bg-surface px-4 py-3">
              Shorten links and track visits in one workspace.
            </p>
            <p className="rounded-lg border border-border-soft bg-surface px-4 py-3">
              Built for link history, click totals, and reporting.
            </p>
          </div>
        </div>

        <div className="px-6 py-8 md:px-10 md:py-12">
          {children}

          <p className="mt-8 text-center text-ui-sm text-content-secondary">
            {switchLabel}{" "}
            <Link
              href={switchHref}
              className="font-ui-semibold text-accent underline underline-offset-4"
            >
              {switchText}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
