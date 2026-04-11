import { redirect } from "next/navigation";
import { AuthPageShell } from "@/features/auth/components/auth-page-shell";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <AuthPageShell
      title="Sign in to your workspace"
      description="Manage short links, QR codes, and click analytics from one account."
      switchLabel="Need an account?"
      switchHref="/register"
      switchText="Create one"
    >
      <LoginForm />
    </AuthPageShell>
  );
}
