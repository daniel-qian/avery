import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
