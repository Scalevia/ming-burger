// Public landing page only (AR + EN). Admin, POS and Kitchen are Arabic-only in V1.
// Dynamic content (menu, restaurant info) uses *_ar / *_en database columns;
// these dictionaries hold static UI strings only.
import ar from "./ar.json";
import en from "./en.json";

export const LANGS = ["ar", "en"] as const;
export type Lang = (typeof LANGS)[number];
export type Dictionary = typeof ar;

const dictionaries: Record<Lang, Dictionary> = { ar, en };

export function getDictionary(lang: Lang): Dictionary {
  return dictionaries[lang];
}

export function dirFor(lang: Lang): "rtl" | "ltr" {
  return lang === "ar" ? "rtl" : "ltr";
}

/** `/en` and `/en/...` are English; everything else (landing `/ar`, admin) is Arabic. */
export function langFromPath(pathname: string): Lang {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ar";
}

export function otherLang(lang: Lang): Lang {
  return lang === "ar" ? "en" : "ar";
}
