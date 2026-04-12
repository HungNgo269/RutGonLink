"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState } from "react";
import { useForm } from "react-hook-form";
import { register as registerUser } from "@/features/auth/actions/auth.actions";
import { initialAuthFormState } from "@/features/auth/actions/auth-form.state";
import type { RegisterFormValues } from "@/features/auth/schemas/auth.schema";
import { registerSchema } from "@/features/auth/schemas/auth.schema";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerUser,
    initialAuthFormState,
  );
  const safeState = state ?? initialAuthFormState;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const hasClientErrors = Object.keys(errors).length > 0;
  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("fullName", values.fullName);
    formData.set("email", values.email);
    formData.set("password", values.password);

    startTransition(() => {
      formAction(formData);
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label
          className="text-ui-sm font-ui-semibold text-content-strong"
          htmlFor="fullName"
        >
          Full name
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          className="w-full rounded-lg border border-border-strong bg-surface px-4 py-3 text-ui-base text-content-strong outline-none focus:border-accent focus:ring-4 focus:ring-accent-ring"
          {...register("fullName")}
        />
        <p className="min-h-5 text-ui-sm text-danger" role="alert">
          {errors.fullName?.message ?? safeState.fieldErrors.fullName ?? ""}
        </p>
      </div>

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
        <p className="min-h-5 text-ui-sm text-danger" role="alert">
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
          autoComplete="new-password"
          className="w-full rounded-lg border border-border-strong bg-surface px-4 py-3 text-ui-base text-content-strong outline-none focus:border-accent focus:ring-4 focus:ring-accent-ring"
          {...register("password")}
        />
        <p className="min-h-5 text-ui-sm text-danger" role="alert">
          {errors.password?.message ?? safeState.fieldErrors.password ?? ""}
        </p>
      </div>

      <p className="min-h-5 text-ui-sm text-danger" role="alert">
        {hasClientErrors ? "" : safeState.message}
      </p>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-accent px-5 text-ui-sm font-ui-semibold text-content-inverted hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-disabled"
      >
        {isPending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
