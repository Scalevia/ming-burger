// Admin shell — client-only (never prerendered). Authentication, route guards and
// all admin features are implemented in later phases; this only proves that the
// SPA boots on any /admin deep link and that the Supabase client initialises.
import { Outlet } from "react-router";
import type { Route } from "./+types/layout";
import { ConfigError } from "../../lib/env";
import { getSupabase } from "../../lib/supabase.client";

export async function clientLoader() {
  try {
    const { data, error } = await getSupabase().auth.getSession();
    if (error) throw error;
    return { supabase: "ready" as const, signedIn: data.session !== null };
  } catch (e) {
    if (e instanceof ConfigError) return { supabase: "not-configured" as const, signedIn: false };
    throw e;
  }
}

export function HydrateFallback() {
  return <p className="status">جارٍ تحميل لوحة التحكم…</p>;
}

export function meta() {
  return [{ title: "لوحة التحكم — Ming Burger" }, { name: "robots", content: "noindex, nofollow" }];
}

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  return (
    <div className="page">
      <header>
        <h1>لوحة التحكم</h1>
        <p className="status" data-testid="supabase-status" data-state={loaderData.supabase}>
          {loaderData.supabase === "ready" ? "الاتصال بـ Supabase جاهز" : "Supabase غير مُعدّ"}
        </p>
      </header>
      <Outlet />
    </div>
  );
}
