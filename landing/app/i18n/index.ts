import { en } from "./en";
import { zh } from "./zh";

export type Locale = "en" | "zh";
// Dict shape is inferred from the English source; zh.ts must satisfy it.
export type Dict = typeof en;

export const locales: Locale[] = ["en", "zh"];
export const defaultLocale: Locale = "en"; // overseas-first / all-English is the locked default

const DICTS: Record<Locale, Dict> = { en, zh };

export function resolveLocale(raw: string | string[] | undefined): Locale {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === "zh" ? "zh" : "en";
}

export function getDict(locale: Locale): Dict {
  return DICTS[locale];
}
