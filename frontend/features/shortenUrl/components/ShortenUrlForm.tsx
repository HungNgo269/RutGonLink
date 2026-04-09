"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect, startTransition } from "react";
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
    setError,
    clearErrors,
    reset,
  } = useForm<ShortenUrlFormValues>({
    resolver: zodResolver(shortenUrlSchema),
    defaultValues: {
      url: "",
    },
  });

  useEffect(() => {
    const fieldErrors = safeState.fieldErrors?.url;

    if (!fieldErrors?.length) {
      clearErrors("url");
      return;
    }

    if (fieldErrors[0]) {
      setError("url", {
        type: "server",
        message: fieldErrors[0],
      });
    }
  }, [clearErrors, safeState.fieldErrors, setError]);

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
    <div className="w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] sm:p-8">
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label
            className="text-sm font-semibold tracking-[0.16em] text-slate-500 uppercase"
            htmlFor="url"
          >
            Long URL
          </label>
          <input
            id="url"
            type="url"
            placeholder="https://example.com/article/your-very-long-link"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
            {...register("url")}
          />
          <p className="min-h-5 text-sm text-rose-600">
            {errors.url?.message ?? ""}
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isPending ? "Creating short link..." : "Shorten URL"}
        </button>
      </form>

      <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4">
        <p
          className={`text-sm ${
            safeState.status === "error" ? "text-rose-600" : "text-slate-600"
          }`}
        >
          {safeState.message ?? "Paste a long URL and submit the form."}
        </p>

        {safeState.data ? (
          <dl className="space-y-3 text-sm text-slate-700">
            <div>
              <dt className="font-semibold text-slate-900">Original URL</dt>
              <dd className="break-all">{safeState.data.originalUrl}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Short code</dt>
              <dd>{safeState.data.shortCode}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Shortened URL</dt>
              <dd className="break-all">
                <a
                  className="text-sky-700 underline underline-offset-4"
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
