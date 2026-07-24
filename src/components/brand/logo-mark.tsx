type LogoMarkProps = {
  className?: string;
};

// Recreated from the provided reference image (clock + open book + check),
// not a pixel copy — hand the original file to `public/` to swap in the
// exact asset if you want a 1:1 match.
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M14 28a18 18 0 0 1 36 0"
        fill="none"
        className="stroke-primary"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="32" cy="9.4" r="1.8" className="fill-primary" />
      <circle cx="14" cy="28" r="1.8" className="fill-primary" />
      <circle cx="50" cy="28" r="1.8" className="fill-primary" />
      <path
        d="M32 16v10.5l6.5 5.5"
        fill="none"
        className="stroke-foreground"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 29c9 .3 20 2.6 26 10v19c-6-7.4-17-9.7-26-10V29Z" className="fill-foreground" />
      <path d="M58 29c-9 .3-20 2.6-26 10v19c6-7.4 17-9.7 26-10V29Z" className="fill-foreground" />
      <path
        d="M37.5 43.5l4 4 8-8.5"
        fill="none"
        className="stroke-background"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
