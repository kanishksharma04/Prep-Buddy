import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignupForm } from "@/components/auth/signup-form";

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main
      id="main-content"
      className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16"
    >
      <div className="space-y-1 text-center">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-muted-foreground text-sm">
          Start tracking your syllabus and exam countdowns.
        </p>
      </div>
      <div className="border-border bg-surface w-full max-w-sm rounded-lg border p-6 shadow-[5px_5px_0_0_var(--paper-shadow)]">
        <SignupForm />
      </div>
    </main>
  );
}
