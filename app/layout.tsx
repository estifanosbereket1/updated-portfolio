import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Estifanos Bereket — Full-Stack Engineer & Mobile Developer",
  description:
    "Full-Stack Engineer and Mobile Developer based in Addis Ababa, Ethiopia. Building reliable backend systems and cross-platform mobile apps with React Native, Flutter, NestJS, and Next.js.",
  keywords: [
    "Estifanos Bereket",
    "Full-Stack Engineer",
    "Mobile Developer",
    "React Native",
    "Flutter",
    "NestJS",
    "Next.js",
    "Addis Ababa",
    "Ethiopia",
  ],
  authors: [
    { name: "Estifanos Bereket", url: "https://github.com/estifanosbereket1" },
  ],
  openGraph: {
    title: "Estifanos Bereket — Full-Stack Engineer & Mobile Developer",
    description:
      "Building reliable backend systems and cross-platform mobile apps. 15,000+ download apps, ERP platforms with 15+ modules.",
    // url: "https://estifanos.dev",
    siteName: "Estifanos Bereket",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Estifanos Bereket — Full-Stack Engineer & Mobile Developer",
    description:
      "Building reliable backend systems and cross-platform mobile apps with React Native, React, FastApi, Go, Flutter, NestJS, and Next.js.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#090909]">{children}</body>
    </html>
  );
}
