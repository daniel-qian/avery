import type { Locale, Dict } from "../i18n";

// Locale toggle via ?lang= query param (EN is the default at "/").
export function LangSwitch({ locale, t }: { locale: Locale; t: Dict["langSwitch"] }) {
  return (
    <nav className="lang-switch" aria-label="Language">
      <a href="/" hrefLang="en" className={locale === "en" ? "is-active" : ""}>{t.en}</a>
      <span aria-hidden="true">·</span>
      <a href="/?lang=zh" hrefLang="zh" className={locale === "zh" ? "is-active" : ""}>{t.zh}</a>
    </nav>
  );
}
