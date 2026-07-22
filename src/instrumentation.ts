export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Importing this validates required env vars and throws immediately if
    // any are missing, so a misconfigured deploy fails at boot with a clear
    // message instead of on the first request that happens to touch the DB.
    await import("@/lib/env");
  }
}
