import type { MetaDescriptor } from "react-router";
import { LANGS, type Lang } from "../i18n";

/** Canonical + hreflang alternates for the public, bilingual pages. */
export function alternateLinks(siteUrl: string, canonicalPath: string): MetaDescriptor[] {
  return [
    { tagName: "link", rel: "canonical", href: `${siteUrl}${canonicalPath}` },
    ...LANGS.map((lang: Lang) => ({
      tagName: "link",
      rel: "alternate",
      hrefLang: lang,
      href: `${siteUrl}/${lang}`,
    })),
    { tagName: "link", rel: "alternate", hrefLang: "x-default", href: `${siteUrl}/` },
  ];
}
