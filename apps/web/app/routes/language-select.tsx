// "/" — prerendered language chooser and hreflang x-default target.
import { Link } from "react-router";
import type { Route } from "./+types/language-select";
import { getDictionary } from "../i18n";
import { readSiteUrl } from "../lib/env";
import { alternateLinks } from "./seo";

export function loader() {
  return { siteUrl: readSiteUrl(import.meta.env) };
}

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: getDictionary("ar").meta.title },
    { name: "description", content: getDictionary("en").meta.description },
    ...alternateLinks(loaderData.siteUrl, "/"),
  ];
}

export default function LanguageSelect() {
  const ar = getDictionary("ar");
  const en = getDictionary("en");
  return (
    <main className="page">
      <h1>{ar.landing.heading}</h1>
      <p>
        {ar.languageSelect.prompt} / <span lang="en">{en.languageSelect.prompt}</span>
      </p>
      <nav className="lang-links">
        <Link to="/ar" hrefLang="ar" lang="ar">
          العربية
        </Link>
        <Link to="/en" hrefLang="en" lang="en">
          English
        </Link>
      </nav>
    </main>
  );
}
