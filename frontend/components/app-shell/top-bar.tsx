import Link from "next/link";
import { AuthMenu } from "@/components/app-shell/auth-menu";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/lib/get-current-user";

export async function TopBar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-end gap-3 border-b border-border-soft bg-surface/95 px-5 backdrop-blur md:px-8">
      {user ? null : (
        <>
          <Button asChild variant="default">
            <Link href="/register">Register</Link>
          </Button>

          <Button asChild variant="secondary" className="hidden md:inline-flex">
            <Link href="/login">Log in</Link>
          </Button>
        </>
      )}

      {user ? <AuthMenu user={user} /> : null}
    </header>
  );
}
