import type { LoginFormValues, RegisterFormValues } from "@/features/auth/schemas/auth.schema";

export type AuthFieldErrors = Partial<
  Record<keyof (LoginFormValues & RegisterFormValues), string>
>;

export type AuthFormState = {
  status: "idle" | "error";
  message: string | null;
  fieldErrors: AuthFieldErrors;
};
