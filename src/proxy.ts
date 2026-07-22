export { auth as proxy } from "@/auth";

// Route protection itself lives in the `authorized` callback in src/auth.ts.
// Server Actions aren't covered by this matcher (see Next.js docs), so every
// mutation must also re-check the session itself.
export const config = {
  matcher: ["/dashboard/:path*", "/subjects/:path*"],
};
