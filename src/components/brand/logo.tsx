import Link from "next/link";
import { LogoMark } from "./logo-mark";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <LogoMark className="h-8 w-8 shrink-0 dark:drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
      <span className="text-lg font-semibold tracking-tight whitespace-nowrap">
        <span className="text-foreground">Prep</span>{" "}
        <span className="text-primary">Buddy</span>
      </span>
    </Link>
  );
}
