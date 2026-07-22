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
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-muted-foreground text-sm">
          Start tracking your syllabus and exam countdowns.
        </p>
      </div>
      <SignupForm />
    </main>
  );
}
