// Verifies the static build output (React Router verification spike, re-run in CI).
// Run after `pnpm build`.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../build/client/", import.meta.url));
const failures = [];
const check = (ok, message) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${message}`);
  if (!ok) failures.push(message);
};
const read = (path) => readFileSync(join(OUT, path), "utf8");
const allFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? allFiles(path) : [path];
  });

const ar = JSON.parse(readFileSync(new URL("../app/i18n/ar.json", import.meta.url), "utf8"));
const en = JSON.parse(readFileSync(new URL("../app/i18n/en.json", import.meta.url), "utf8"));

// 1. Public pages are prerendered with real content, language and direction.
for (const [path, lang, dir, dict] of [
  ["ar/index.html", "ar", "rtl", ar],
  ["en/index.html", "en", "ltr", en],
]) {
  check(existsSync(join(OUT, path)), `${path} is prerendered`);
  if (!existsSync(join(OUT, path))) continue;
  const html = read(path);
  check(
    html.includes(`<html lang="${lang}" dir="${dir}">`),
    `${path}: <html lang="${lang}" dir="${dir}">`,
  );
  check(
    html.includes(dict.landing.underConstruction),
    `${path}: content present without JavaScript`,
  );
  check(html.includes(`<title>${dict.meta.title}</title>`), `${path}: <title>`);
  check(html.includes('property="og:title"'), `${path}: Open Graph tags`);
  check(html.includes('rel="canonical"'), `${path}: canonical link`);
  for (const hl of ["ar", "en", "x-default"]) {
    check(html.includes(`hrefLang="${hl}"`), `${path}: hreflang=${hl}`);
  }
  check(
    !/admin|supabase/i.test(html.match(/<link rel="modulepreload"[^>]*>/g)?.join("") ?? ""),
    `${path}: no admin/Supabase code preloaded`,
  );
  check(
    html.includes('http-equiv="Content-Security-Policy"') && !html.includes("unsafe-inline"),
    `${path}: strict CSP meta (hash-based, no unsafe-inline)`,
  );
}
check(existsSync(join(OUT, "index.html")), "/ (language chooser, x-default) is prerendered");

// 2. Admin is a client-only SPA: not prerendered, served through the SPA fallback.
check(!existsSync(join(OUT, "admin")), "admin routes are NOT prerendered");
check(existsSync(join(OUT, "__spa-fallback.html")), "__spa-fallback.html exists");
const vercel = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
check(
  vercel.rewrites.some(
    (r) => r.source === "/admin/:path*" && r.destination === "/__spa-fallback.html",
  ),
  "vercel.json rewrites /admin/* deep links to the SPA fallback",
);

// 3. No secrets in the shipped bundle: real secret-key material, or a JWT whose role is not anon.
// (Bare words like "sb_secret_" also appear in supabase-js and in our own key guard.)
const jwtRole = (token) => {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString()).role;
  } catch {
    return undefined;
  }
};
const hasSecret = (text) =>
  /sb_secret_[A-Za-z0-9_-]{16,}/.test(text) ||
  (text.match(/eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+/g) ?? []).some(
    (t) => (jwtRole(t) ?? "anon") !== "anon",
  );
const shipped = allFiles(OUT).filter((f) => /\.(html|js|json|data|css)$/.test(f));
const leaked = shipped.filter((f) => hasSecret(readFileSync(f, "utf8")));
check(
  leaked.length === 0,
  `no secret keys in build output${leaked.length ? `: ${leaked.join(", ")}` : ""}`,
);

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll build checks passed.");
