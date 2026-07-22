import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

// `next-auth/jwt` just re-exports `@auth/core/jwt`'s types, and the
// `JWT` interface is declared there — augmenting the barrel alone doesn't
// merge into it, so this is the one that actually takes effect.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
  }
}
