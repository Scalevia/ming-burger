// Local static preview of build/client that applies the rewrites and headers from
// vercel.json — used to test deep-link refresh behaviour before deploying.
// Usage: node scripts/preview-static.mjs [port]
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../build/client/", import.meta.url));
const vercel = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
const port = Number(process.argv[2] ?? 4173);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain",
  ".data": "text/x-script",
};

// Vercel-style patterns: "/admin/:path*" -> regex.
const toRegex = (source) =>
  new RegExp(`^${source.replace(/\/:path\*/g, "(?:/.*)?").replace(/\(\.\*\)/g, ".*")}$`);

function resolveFile(pathname) {
  for (const rule of vercel.rewrites) {
    if (toRegex(rule.source).test(pathname)) return join(ROOT, rule.destination);
  }
  const safe = normalize(pathname).replace(/^([/\\])+/, "");
  const candidates = [join(ROOT, safe), join(ROOT, safe, "index.html"), join(ROOT, `${safe}.html`)];
  return candidates.find((p) => p.startsWith(ROOT) && existsSync(p) && statSync(p).isFile());
}

createServer((req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  const file = resolveFile(pathname);
  for (const rule of vercel.headers) {
    if (toRegex(rule.source).test(pathname)) {
      for (const { key, value } of rule.headers) res.setHeader(key, value);
    }
  }
  if (!file || !existsSync(file)) {
    res.writeHead(404).end("Not found");
    return;
  }
  res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
}).listen(port, () => console.log(`Preview: http://localhost:${port}`));
