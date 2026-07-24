export function ProgressBar({ total, done }: { total: number; done: number }) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {done} / {total} topics done
        </span>
        <span className="font-medium">{percent}%</span>
      </div>
      {/* Styled like a highlighter stroke over a ruled line rather than a
          glossy SaaS progress pill: mix-blend-multiply in light mode gives
          the fill real marker-over-paper translucency; dark mode swaps to a
          plain glow since multiply against a dark track would just vanish. */}
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Topics completed"
        className="bg-background border-border h-2 overflow-hidden rounded-sm border"
      >
        <div
          className="bg-accent mix-blend-multiply h-full rounded-sm transition-[width] duration-300 ease-out dark:mix-blend-normal dark:shadow-[0_0_6px_var(--accent)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
