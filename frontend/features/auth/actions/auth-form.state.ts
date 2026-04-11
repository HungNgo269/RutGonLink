import type { AuthFormState } from "@/features/auth/interfaces/auth-form-state.interface";

export const initialAuthFormState: AuthFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};
