import type { Config } from "@react-router/dev/config";

/**
 * Static deployment: no server runtime.
 * - Public landing pages are prerendered to HTML at build time (SEO, link previews).
 * - Everything else (the admin dashboard) is a client-only SPA served from
 *   `__spa-fallback.html` (see vercel.json rewrites).
 */
export default {
  ssr: false,
  prerender: ["/", "/ar", "/en"],
} satisfies Config;
