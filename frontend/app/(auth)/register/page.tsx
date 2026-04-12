import { AuthPageShell } from "@/features/auth/components/auth-page-shell";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthPageShell
      title="Create your RutGonLink account"
      description="Save every short link and keep analytics tied to your profile."
      switchLabel="Already have an account?"
      switchHref="/login"
      switchText="Sign in"
    >
      <RegisterForm />
    </AuthPageShell>
  );
}
