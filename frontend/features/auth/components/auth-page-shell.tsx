import Link from "next/link";
import { CheckCircle2, Link2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
    <main className="flex min-h-screen items-center justify-center bg-gradient-analytics px-4 py-8 text-foreground md:py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-border-soft bg-surface shadow-app-soft lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1fr)]">
        <div className="flex flex-col border-b border-border-soft bg-gradient-panel px-6 py-8 md:px-10 md:py-12 lg:border-b-0 lg:border-r">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-ui-sm font-ui-semibold text-content-heading"
          >
            <span className="flex size-10 items-center justify-center rounded-lg border border-brand-mark-border bg-brand-mark-surface font-mono text-ui-lg font-ui-bold text-brand-mark-foreground">
              R
            </span>
            <span>RutGonLink</span>
          </Link>
          <Badge variant="secondary" className="mt-10 w-fit">
            <ShieldCheck data-icon="inline-start" />
            Private workspace
          </Badge>
          <h1 className="mt-4 max-w-md text-heading-md font-ui-semibold tracking-tight text-content-heading md:text-heading-lg">
            {title}
          </h1>
          <p className="mt-4 max-w-sm text-ui-sm leading-7 text-content-secondary">
            {description}
          </p>
          <div className="mt-8 flex flex-col gap-4 text-ui-sm text-content-primary">
            <div className="flex items-start gap-3">
              <Link2 data-icon="inline-start" className="mt-0.5 text-accent" />
              <p>Shorten links and keep every saved URL tied to your profile.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2
                data-icon="inline-start"
                className="mt-0.5 text-teal"
              />
              <p>Review click totals, locations, devices, and referrers.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col px-6 py-8 md:px-10 md:py-12">
          {children}

          <Separator className="mt-8" />
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
