import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import "./globals.css";

// Editorial display + body, matching the partner deck's type system.
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
  variable: "--font-bodoni",
  display: "swap",
});
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  // ⚠ external strings await Danny 审字 before launch (kept out of the rendered page).
  title: "Avery — the senior at your ear",
  description:
    "Avery is a senior advisor in your ear for the conversation you keep putting off. It helps you notice sooner and handle the hard conversation well — and never puts a score on a person.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bodoni.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
