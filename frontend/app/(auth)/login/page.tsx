import { AuthPageShell } from "@/features/auth/components/auth-page-shell";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <AuthPageShell
      title="Sign in to your workspace"
      description="Manage short links and click analytics from one account."
      switchLabel="Need an account?"
      switchHref="/register"
      switchText="Create one"
    >
      <LoginForm />
    </AuthPageShell>
  );
}
