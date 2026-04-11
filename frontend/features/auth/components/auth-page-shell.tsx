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
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-border-soft bg-surface shadow-app-soft lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1fr)]">
        <div className="bg-surface-muted px-6 py-8 md:px-10 md:py-12">
          <Link
            href="/"
            className="inline-flex text-ui-sm font-ui-semibold text-accent"
          >
            RutGonLink
          </Link>
          <h1 className="mt-10 text-heading-md font-ui-semibold tracking-tight text-content-heading md:text-heading-lg">
            {title}
          </h1>
          <p className="mt-4 max-w-sm text-ui-sm leading-7 text-content-secondary">
            {description}
          </p>
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
