import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";

/* One Google font (display serif); body text uses the system stack. */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Regulus — Grant Gap Report",
  description:
    "A free report built from your nonprofit's own public IRS 990. See where grant funding may be missing from your revenue mix, and the kinds of programs similar organizations tap.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fraunces.variable}>
      <body className="min-h-screen bg-bg font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
