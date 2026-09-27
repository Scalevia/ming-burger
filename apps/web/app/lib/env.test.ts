import { describe, expect, it } from "vitest";
import {
  ConfigError,
  assertPublicSupabaseKey,
  readAppEnv,
  readSiteUrl,
  readSupabaseConfig,
} from "./env";

const jwt = (payload: object) =>
  ["eyJhbGciOiJIUzI1NiJ9", btoa(JSON.stringify(payload)).replace(/=+$/, ""), "sig"].join(".");

describe("readAppEnv", () => {
  it("defaults to development", () => expect(readAppEnv({})).toBe("development"));
  it("rejects unknown environments", () =>
    expect(() => readAppEnv({ VITE_APP_ENV: "staging" })).toThrow(ConfigError));
});

describe("readSiteUrl", () => {
  it("falls back to localhost in development", () =>
    expect(readSiteUrl({})).toBe("http://localhost:5173"));
  it("is required in production", () =>
    expect(() => readSiteUrl({ VITE_APP_ENV: "production" })).toThrow(ConfigError));
  it("requires https in production", () =>
    expect(() =>
      readSiteUrl({ VITE_APP_ENV: "production", VITE_SITE_URL: "http://example.com" }),
    ).toThrow(ConfigError));
  it("normalises to the origin", () =>
    expect(readSiteUrl({ VITE_SITE_URL: "https://example.com/path/" })).toBe(
      "https://example.com",
    ));
});

describe("assertPublicSupabaseKey", () => {
  it("accepts publishable keys", () =>
    expect(() => assertPublicSupabaseKey("sb_publishable_abc123")).not.toThrow());
  it("rejects secret keys", () =>
    expect(() => assertPublicSupabaseKey("sb_secret_abc123")).toThrow(ConfigError));
  it("accepts legacy anon JWTs", () =>
    expect(() => assertPublicSupabaseKey(jwt({ role: "anon" }))).not.toThrow());
  it("rejects legacy service_role JWTs", () =>
    expect(() => assertPublicSupabaseKey(jwt({ role: "service_role" }))).toThrow(ConfigError));
});

describe("readSupabaseConfig", () => {
  it("requires url and key", () => expect(() => readSupabaseConfig({})).toThrow(ConfigError));
  it("requires https in production", () =>
    expect(() =>
      readSupabaseConfig({
        VITE_APP_ENV: "production",
        VITE_SUPABASE_URL: "http://x.supabase.co",
        VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x",
      }),
    ).toThrow(ConfigError));
  it("returns a valid config", () =>
    expect(
      readSupabaseConfig({
        VITE_SUPABASE_URL: "http://127.0.0.1:54321",
        VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x",
      }),
    ).toEqual({ url: "http://127.0.0.1:54321", publishableKey: "sb_publishable_x" }));
});
