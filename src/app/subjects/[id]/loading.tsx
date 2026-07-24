import { Skeleton } from "@/components/ui/skeleton";

export default function SubjectLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading subject"
      className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-16"
    >
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-56" />
      </div>

      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-32 w-full" />

      <div className="flex flex-col gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </main>
  );
}
