import { redirect } from "next/navigation";
import { AuthPageShell } from "@/features/auth/components/auth-page-shell";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <AuthPageShell
      title="Create your RutGonLink account"
      description="Save every short link, organize campaigns, and keep analytics tied to your profile."
      switchLabel="Already have an account?"
      switchHref="/login"
      switchText="Sign in"
    >
      <RegisterForm />
    </AuthPageShell>
  );
}
