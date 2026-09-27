// Post-build: injects a strict, per-page Content-Security-Policy <meta> into every
// generated HTML file. React Router emits page-specific inline scripts (hydration
// data), so each page gets the SHA-256 hashes of exactly its own inline scripts —
// no 'unsafe-inline'. Directives that cannot live in a <meta> (frame-ancestors)
// are sent as HTTP headers from vercel.json.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = fileURLToPath(new URL("../build/client/", import.meta.url));

function supabaseOrigins() {
  const url = process.env.VITE_SUPABASE_URL;
  if (!url) return [];
  const { origin, host, protocol } = new URL(url);
  return [origin, `${protocol === "https:" ? "wss" : "ws"}://${host}`];
}

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "assets" ? [] : htmlFiles(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

function policyFor(html) {
  const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(
    (m) => `'sha256-${createHash("sha256").update(m[1], "utf8").digest("base64")}'`,
  );
  const supabase = supabaseOrigins();
  return [
    "default-src 'self'",
    `script-src 'self' ${[...new Set(hashes)].join(" ")}`,
    "style-src 'self'",
    `img-src 'self' data: blob: ${supabase[0] ?? ""}`.trim(),
    "font-src 'self'",
    `connect-src 'self' ${supabase.join(" ")}`.trim(),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

let count = 0;
for (const file of htmlFiles(OUT_DIR)) {
  const html = readFileSync(file, "utf8");
  if (html.includes('http-equiv="Content-Security-Policy"')) continue;
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policyFor(html)}"/>`;
  const out = html.replace(/<meta charSet="utf-8"\/>/, (m) => `${m}${meta}`);
  if (out === html) throw new Error(`Could not inject CSP into ${file}`);
  writeFileSync(file, out);
  count++;
}
console.log(`CSP injected into ${count} HTML file(s).`);
