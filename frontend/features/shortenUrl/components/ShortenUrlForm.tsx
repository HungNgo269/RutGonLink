"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { initialShortenUrlFormState } from "@/features/shortenUrl/actions/submit-shorten-url.state";
import { submitShortenUrl } from "@/features/shortenUrl/actions/submit-shorten-url";
import type { ShortenUrlFormValues } from "@/features/shortenUrl/schemas/shorten-url.schema";
import { shortenUrlSchema } from "@/features/shortenUrl/schemas/shorten-url.schema";

export function ShortenUrlForm() {
  const [state, formAction, isPending] = useActionState(
    submitShortenUrl,
    initialShortenUrlFormState,
  );
  const safeState = state ?? initialShortenUrlFormState;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ShortenUrlFormValues>({
    resolver: zodResolver(shortenUrlSchema),
    defaultValues: {
      url: "",
    },
  });

  useEffect(() => {
    if (safeState.status === "success" && safeState.data) {
      reset({ url: safeState.data.originalUrl });
    }
  }, [reset, safeState.data, safeState.status]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("url", values.url);

    startTransition(() => {
      formAction(formData);
    });
  });

  return (
    <div className="space-y-5">
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end">
          <div className="min-w-0 flex-1 space-y-2">
            <label
              className="text-sm font-semibold text-slate-900"
              htmlFor="url"
            >
              Enter your destination URL
            </label>
            <input
              id="url"
              type="url"
              placeholder="https://example.com/my-long-url"
              className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3.5 text-base text-slate-900 outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--accent)_10%,white)]"
              {...register("url")}
            />
            <p className="min-h-5 text-sm text-rose-600">
              {errors.url?.message ?? ""}
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[var(--accent)] px-6 text-sm font-semibold text-white shadow-[var(--shadow-panel)] hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:bg-slate-400 xl:min-w-52"
          >
            {isPending ? "Creating short link..." : "Create your short link"}
          </button>
        </div>

        <label className="flex items-center gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            className="size-4 rounded border border-[var(--border-strong)] accent-[var(--accent)]"
          />
          Also create a QR code for this link
        </label>
      </form>

      <div className="rounded-2xl bg-[var(--teal-soft)] px-4 py-4 text-sm text-[var(--teal)]">
        <p
          className={
            safeState.status === "error" ? "text-rose-600" : "text-[var(--teal)]"
          }
        >
          {safeState.message ??
            "Get custom links, branded domains, and faster workflows. Register now."}
        </p>

        {safeState.data ? (
          <dl className="mt-4 grid gap-3 rounded-2xl bg-white/90 p-4 text-sm text-slate-700 sm:grid-cols-3">
            <div>
              <dt className="font-semibold text-slate-900">Original URL</dt>
              <dd className="mt-1 break-all">{safeState.data.originalUrl}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Short code</dt>
              <dd className="mt-1">{safeState.data.shortCode}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Short link</dt>
              <dd className="mt-1 break-all">
                <a
                  className="text-[var(--accent)] underline underline-offset-4"
                  href={safeState.data.shortenedUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {safeState.data.shortenedUrl}
                </a>
              </dd>
            </div>
          </dl>
        ) : null}
      </div>
    </div>
  );
}
