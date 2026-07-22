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
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Topics completed"
        className="bg-surface border-border h-2 overflow-hidden rounded-full border"
      >
        <div
          className="bg-primary h-full rounded-full transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
