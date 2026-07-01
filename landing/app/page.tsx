import { getDict, resolveLocale } from "./i18n";
import { LangSwitch } from "./components/LangSwitch";
import { Hero } from "./components/Hero";
import { WhatItIs } from "./components/WhatItIs";
import { Audience } from "./components/Audience";
import { WhyItMatters } from "./components/WhyItMatters";
import { WrongCut } from "./components/WrongCut";
import { MorningBriefing } from "./components/MorningBriefing";
import { DemoVideo } from "./components/DemoVideo";
import { EvalContrast } from "./components/EvalContrast";
import { TrustLayer } from "./components/TrustLayer";
import { MarketGap } from "./components/MarketGap";
import { Method } from "./components/Method";
import { Modules } from "./components/Modules";
import { OutputShape } from "./components/OutputShape";
import { Playbooks } from "./components/Playbooks";
import { Stack } from "./components/Stack";
import { Landscape } from "./components/Landscape";
import { Revenue } from "./components/Revenue";
import { BookCta } from "./components/BookCta";

// Locale via ?lang= (EN default). Reading searchParams makes this page dynamic.
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const t = getDict(locale);

  return (
    <main>
      <LangSwitch locale={locale} t={t.langSwitch} />
      <Hero t={t.hero} />
      <WhatItIs t={t.whatItIs} />
      <Audience t={t.audience} />
      <WhyItMatters t={t.whyItMatters} />
      <WrongCut t={t.wrongCut} />
      <MorningBriefing t={t.morningBriefing} />
      <DemoVideo t={t.demoVideo} />
      <EvalContrast t={t.evalSection} />
      <TrustLayer t={t.trustLayer} />
      <MarketGap t={t.marketGap} />
      <Method t={t.method} />
      <Modules t={t.modules} />
      <OutputShape t={t.output} />
      <Playbooks t={t.playbooks} />
      <Stack t={t.stack} />
      <Landscape t={t.landscape} />
      <Revenue t={t.revenue} />
      <BookCta t={t.bookCta} />

      <footer className="foot wrap">
        <span>{t.footer.left}</span>
        <span>{t.footer.right}</span>
      </footer>
    </main>
  );
}
