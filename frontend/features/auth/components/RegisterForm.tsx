"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
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
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
      <FieldGroup>
        <Field
          data-invalid={Boolean(
            errors.fullName || safeState.fieldErrors.fullName,
          )}
        >
          <FieldLabel htmlFor="fullName">Full name</FieldLabel>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(
              errors.fullName || safeState.fieldErrors.fullName,
            )}
            className="h-11 bg-surface px-3 text-ui-base"
            placeholder="Jane Cooper"
            {...register("fullName")}
          />
          <FieldError>
            {errors.fullName?.message ?? safeState.fieldErrors.fullName}
          </FieldError>
        </Field>

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
          data-invalid={Boolean(
            errors.password || safeState.fieldErrors.password,
          )}
        >
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(
              errors.password || safeState.fieldErrors.password,
            )}
            className="h-11 bg-surface px-3 text-ui-base"
            placeholder="Create a strong password"
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
        <UserPlus data-icon="inline-start" />
        {isPending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
