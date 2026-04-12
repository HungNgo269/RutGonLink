"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { startTransition, useActionState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
      <FieldGroup>
        <Field
          data-invalid={Boolean(errors.email || safeState.fieldErrors.email)}
        >
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email || safeState.fieldErrors.email)}
            className="h-11 bg-surface px-3 text-ui-base"
            placeholder="you@company.com"
            {...register("email")}
          />
          <FieldError>
            {errors.email?.message ?? safeState.fieldErrors.email}
          </FieldError>
        </Field>

        <Field
          data-invalid={Boolean(errors.password || safeState.fieldErrors.password)}
        >
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(
              errors.password || safeState.fieldErrors.password,
            )}
            className="h-11 bg-surface px-3 text-ui-base"
            placeholder="Enter your password"
            {...register("password")}
          />
          <FieldError>
            {errors.password?.message ?? safeState.fieldErrors.password}
          </FieldError>
        </Field>
      </FieldGroup>

      <FieldDescription className="min-h-5 text-danger" role="alert">
        {hasClientErrors ? "" : safeState.message}
      </FieldDescription>

      <Button type="submit" disabled={isPending} size="lg" className="w-full">
        <LogIn data-icon="inline-start" />
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
