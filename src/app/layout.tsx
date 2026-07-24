import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SkipLink } from "@/components/layout/skip-link";
import { Header } from "@/components/layout/header";
import { themeInitScript } from "@/components/theme/theme-init-script";
import { ToastProvider } from "@/components/ui/toast-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Warm display serif for headings — the one deliberately "designed" choice
// that keeps this from reading as a generic sans-only AI template.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

const description =
  "A minimalistic study planner: track your syllabus, check off topics, and count down to exam day.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Prep Buddy",
    template: "%s · Prep Buddy",
  },
  description,
  applicationName: "Prep Buddy",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Prep Buddy",
    description,
    siteName: "Prep Buddy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prep Buddy",
    description,
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ede2c9" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1510" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ToastProvider>
          <SkipLink />
          <Header />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
