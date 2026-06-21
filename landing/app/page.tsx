import { Hero } from "./components/Hero";
import { DemoVideo } from "./components/DemoVideo";
import { EvalContrast } from "./components/EvalContrast";
import { WhatItIs } from "./components/WhatItIs";
import { BookCta } from "./components/BookCta";

export default function Home() {
  return (
    <main>
      <Hero />
      <DemoVideo />
      <EvalContrast />
      <WhatItIs />
      <BookCta />

      <footer className="foot wrap">
        <span>Avery</span>
        <span>The senior at your ear.</span>
      </footer>
    </main>
  );
}
