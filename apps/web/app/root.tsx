import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLocation,
} from "react-router";
import type { Route } from "./+types/root";
import { dirFor, langFromPath } from "./i18n";
import "./app.css";

export function Layout({ children }: { children: React.ReactNode }) {
  const lang = langFromPath(useLocation().pathname);
  return (
    <html lang={lang} dir={dirFor(lang)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function HydrateFallback() {
  return <p className="status">جارٍ التحميل…</p>;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="page">
      <h1>{notFound ? "404" : "حدث خطأ"}</h1>
      <p>{notFound ? "الصفحة غير موجودة." : "حدث خطأ غير متوقع. حاول مرة أخرى."}</p>
    </main>
  );
}
