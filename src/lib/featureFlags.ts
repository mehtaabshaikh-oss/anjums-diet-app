// src/lib/featureFlags.ts
/**
 * Simple feature‑flag helper.
 * Add more flags here as you experiment with other concepts.
 */
export const featureFlags = {
    // Enable ISR caching when true.
    // Toggle via the environment variable NEXT_PUBLIC_ENABLE_CACHING
    caching: process.env.NEXT_PUBLIC_ENABLE_CACHING === "true",
};
