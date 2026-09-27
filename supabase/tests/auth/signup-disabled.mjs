// Verifies that public signup is rejected by the running Supabase Auth service.
// Usage (after `supabase start`):
//   node supabase/tests/auth/signup-disabled.mjs
// Reads API_URL and ANON_KEY from `supabase status -o env`, or from the environment.
import { execFileSync } from "node:child_process";

function localStatus() {
  const out = execFileSync("pnpm", ["exec", "supabase", "status", "-o", "env"], {
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  return Object.fromEntries(
    out
      .split(/\r?\n/)
      .map((line) => line.match(/^([A-Z_]+)="?(.*?)"?$/))
      .filter(Boolean)
      .map((m) => [m[1], m[2]]),
  );
}

const env = process.env.API_URL && process.env.ANON_KEY ? process.env : localStatus();
const apiUrl = env.API_URL;
const anonKey = env.PUBLISHABLE_KEY || env.ANON_KEY;
if (!apiUrl || !anonKey) {
  console.error("Could not resolve API_URL / publishable key from supabase status.");
  process.exit(2);
}

const res = await fetch(`${apiUrl}/auth/v1/signup`, {
  method: "POST",
  headers: { apikey: anonKey, "Content-Type": "application/json" },
  body: JSON.stringify({
    email: `probe-${Date.now()}@example.com`,
    password: "Probe-password-123!",
  }),
});
const body = await res.text();

if (res.ok) {
  console.error(`FAIL: signup succeeded (HTTP ${res.status}). Public signup must be disabled.`);
  process.exit(1);
}
if (!/signups? not allowed/i.test(body)) {
  console.error(`FAIL: unexpected rejection (HTTP ${res.status}): ${body}`);
  process.exit(1);
}
console.log(`PASS: public signup rejected (HTTP ${res.status}).`);
