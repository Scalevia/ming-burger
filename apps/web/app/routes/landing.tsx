// Public landing page, prerendered at build time for /ar and /en.
// Phase 1 placeholder: real content (menu, hours, branches) arrives in the Landing phase.
import { Link } from "react-router";
import type { Route } from "./+types/landing";
import { getDictionary, langFromPath, otherLang } from "../i18n";
import { readSiteUrl } from "../lib/env";
import { alternateLinks } from "./seo";

// Runs at build time only (ssr: false + prerender). Later phases fetch public menu data here.
// Use the normalized `url`: `request.url` is the raw request (e.g. `/en.data` while prerendering).
export function loader({ url }: Route.LoaderArgs) {
  const lang = langFromPath(url.pathname);
  return { lang, siteUrl: readSiteUrl(import.meta.env) };
}

export function meta({ loaderData }: Route.MetaArgs) {
  const { lang, siteUrl } = loaderData;
  const t = getDictionary(lang).meta;
  return [
    { title: t.title },
    { name: "description", content: t.description },
    { property: "og:type", content: "website" },
    { property: "og:title", content: t.title },
    { property: "og:description", content: t.description },
    { property: "og:url", content: `${siteUrl}/${lang}` },
    { property: "og:locale", content: lang === "ar" ? "ar_EG" : "en_US" },
    ...alternateLinks(siteUrl, `/${lang}`),
  ];
}

export default function Landing({ loaderData }: Route.ComponentProps) {
  const t = getDictionary(loaderData.lang).landing;
  const other = otherLang(loaderData.lang);
  return (
    <main className="page">
      <h1>{t.heading}</h1>
      <p>{t.underConstruction}</p>
      <Link to={`/${other}`} hrefLang={other} lang={other}>
        {t.otherLanguage}
      </Link>
    </main>
  );
}
