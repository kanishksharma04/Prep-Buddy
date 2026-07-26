"use client";

import { useEffect, useState } from "react";

// The header's own border is always visible, but a header sitting flush
// against page content (scrollTop 0) shouldn't cast a shadow over it — the
// shadow only earns its place once there's something to sit above.
export function StickyHeaderShell({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 4);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`border-primary/30 bg-background sticky top-0 z-20 border-b-2 transition-shadow duration-300 ${
        isScrolled ? "shadow-[0_6px_14px_-6px_var(--paper-shadow)]" : ""
      }`}
    >
      {children}
    </header>
  );
}
