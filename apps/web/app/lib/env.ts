/**
 * Public runtime configuration for the web app.
 *
 * Everything read here comes from VITE_* variables and is therefore PUBLIC
 * (bundled into the browser). Secrets must never be configured through VITE_*.
 */

export type AppEnv = "development" | "preview" | "production";

export class ConfigError extends Error {
  override name = "ConfigError";
}

type RawEnv = Record<string, string | boolean | undefined>;

const APP_ENVS: readonly AppEnv[] = ["development", "preview", "production"];

function str(raw: RawEnv, key: string): string | undefined {
  const value = raw[key];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

export function readAppEnv(raw: RawEnv): AppEnv {
  const value = str(raw, "VITE_APP_ENV") ?? "development";
  if (!APP_ENVS.includes(value as AppEnv)) {
    throw new ConfigError(`VITE_APP_ENV must be one of ${APP_ENVS.join(", ")}; got "${value}".`);
  }
  return value as AppEnv;
}

/** Public origin used for canonical and hreflang URLs. Required outside development. */
export function readSiteUrl(raw: RawEnv): string {
  const value = str(raw, "VITE_SITE_URL");
  if (!value) {
    if (readAppEnv(raw) === "development") return "http://localhost:5173";
    throw new ConfigError("VITE_SITE_URL is required for preview/production builds.");
  }
  const url = new URL(value);
  if (readAppEnv(raw) === "production" && url.protocol !== "https:") {
    throw new ConfigError("VITE_SITE_URL must use https in production.");
  }
  return url.origin;
}

/**
 * Rejects keys that must never reach a browser: the new `sb_secret_...` keys and
 * legacy JWT keys whose role is not `anon` (e.g. `service_role`).
 */
export function assertPublicSupabaseKey(key: string): void {
  if (key.startsWith("sb_secret_")) {
    throw new ConfigError(
      "A Supabase SECRET key was provided to the browser. Use the publishable key.",
    );
  }
  const parts = key.split(".");
  if (parts.length === 3 && parts[1]) {
    let role: unknown;
    try {
      role = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))).role;
    } catch {
      throw new ConfigError("Supabase key looks like a JWT but could not be decoded.");
    }
    if (role !== "anon") {
      throw new ConfigError(
        `Supabase key has role "${String(role)}"; only public keys are allowed.`,
      );
    }
  }
}

export interface SupabasePublicConfig {
  url: string;
  publishableKey: string;
}

export function readSupabaseConfig(raw: RawEnv): SupabasePublicConfig {
  const url = str(raw, "VITE_SUPABASE_URL");
  const publishableKey = str(raw, "VITE_SUPABASE_PUBLISHABLE_KEY");
  if (!url || !publishableKey) {
    throw new ConfigError("VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are required.");
  }
  const parsed = new URL(url);
  if (readAppEnv(raw) === "production" && parsed.protocol !== "https:") {
    throw new ConfigError("VITE_SUPABASE_URL must use https in production.");
  }
  assertPublicSupabaseKey(publishableKey);
  return { url: parsed.origin, publishableKey };
}
