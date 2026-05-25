import type { Metadata } from "next";
import { Poppins, Open_Sans } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Product Manager | Ship Products 10× Faster",
  description:
    "The AI-powered product management suite that automates PRDs, sprint planning, architecture design, and roadmaps. Built with state-of-the-art AI tooling.",
  keywords: [
    "AI product manager",
    "product management",
    "PRD generator",
    "sprint planning",
    "software architecture",
    "AI tools",
  ],
  openGraph: {
    title: "AI Product Manager | Ship Products 10× Faster",
    description:
      "Automate PRDs, sprint planning, and architecture with AI. Start free.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${openSans.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
