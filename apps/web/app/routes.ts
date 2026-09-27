import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  // Public, prerendered at build time (see react-router.config.ts).
  index("routes/language-select.tsx"),
  route("ar", "routes/landing.tsx", { id: "landing-ar" }),
  route("en", "routes/landing.tsx", { id: "landing-en" }),

  // Admin dashboard: client-only SPA, never prerendered, Arabic only.
  ...prefix("admin", [
    layout("routes/admin/layout.tsx", [
      index("routes/admin/home.tsx"),
      route("*", "routes/admin/not-found.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
