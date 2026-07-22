import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;

  return (
    <main
      id="main-content"
      className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16"
    >
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
        <p className="text-muted-foreground text-sm">
          Welcome back to Prep Buddy.
        </p>
      </div>
      {error ? (
        <p
          role="alert"
          className="max-w-sm text-center text-sm text-red-600 dark:text-red-400"
        >
          Please log in to continue.
        </p>
      ) : null}
      <LoginForm />
    </main>
  );
}
