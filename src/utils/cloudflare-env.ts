/**
 * Cloudflare Secrets Store Utility
 *
 * All secrets are stored in Cloudflare Secrets Store (centralized, cross-worker).
 * Secrets Store bindings return Fetcher objects that require calling .get() to retrieve the value.
 */

/**
 * Resolves a Cloudflare Secrets Store binding to its string value
 *
 * @param value - The Secrets Store binding from env
 * @returns The resolved string value, or null if unavailable
 */
export async function resolveSecret(
  value: any
): Promise<string | null | undefined> {
  try {
    // Plain string (shouldn't happen with Secrets Store, but handle it)
    if (typeof value === "string") {
      return value;
    }

    if (!value) {
      return null;
    }

    // Secrets Store Fetcher object - call .get() to retrieve the secret
    if (typeof value === "object" && typeof value.get === "function") {
      const result = await value.get();
      return typeof result === "string" ? result : String(result);
    }

    console.error("Unexpected secret format:", typeof value);
    return null;
  } catch (error) {
    console.error("Error resolving secret:", error);
    return null;
  }
}
