export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`from-surface via-border/60 to-surface border-border rounded-lg border bg-linear-to-r bg-size-[200%_100%] ${className}`}
      style={{ animation: "shimmer 1.8s ease-in-out infinite" }}
    />
  );
}
