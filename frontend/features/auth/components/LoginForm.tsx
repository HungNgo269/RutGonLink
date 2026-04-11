"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState } from "react";
import { useForm } from "react-hook-form";
import { login } from "@/features/auth/actions/auth.actions";
import { initialAuthFormState } from "@/features/auth/actions/auth-form.state";
import type { LoginFormValues } from "@/features/auth/schemas/auth.schema";
import { loginSchema } from "@/features/auth/schemas/auth.schema";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    login,
    initialAuthFormState,
  );
  const safeState = state ?? initialAuthFormState;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const hasClientErrors = Object.keys(errors).length > 0;
  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);

    startTransition(() => {
      formAction(formData);
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-ui-sm font-ui-semibold text-content-strong" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-lg border border-border-strong bg-surface px-4 py-3 text-ui-base text-content-strong outline-none focus:border-accent focus:ring-4 focus:ring-accent-ring"
          {...register("email")}
        />
        <p className="min-h-5 text-ui-sm text-danger">
          {errors.email?.message ?? safeState.fieldErrors.email ?? ""}
        </p>
      </div>

      <div className="space-y-2">
        <label
          className="text-ui-sm font-ui-semibold text-content-strong"
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-lg border border-border-strong bg-surface px-4 py-3 text-ui-base text-content-strong outline-none focus:border-accent focus:ring-4 focus:ring-accent-ring"
          {...register("password")}
        />
        <p className="min-h-5 text-ui-sm text-danger">
          {errors.password?.message ?? safeState.fieldErrors.password ?? ""}
        </p>
      </div>

      <p className="min-h-5 text-ui-sm text-danger">
        {hasClientErrors ? "" : safeState.message}
      </p>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-accent px-5 text-ui-sm font-ui-semibold text-content-inverted hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-disabled"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
