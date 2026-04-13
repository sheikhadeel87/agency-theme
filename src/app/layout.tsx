import type { Metadata } from "next";
import { Suspense } from "react";
import { buildPublicMetadata } from "@/lib/seo-metadata";
import { getSiteSettings } from "@/lib/admin-data";
import { Geist_Mono, Montserrat } from "next/font/google";
import { ThemeProvider } from "@/components/theme";
import { TrackPageVisit } from "@/components/analytics/TrackPageVisit";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const defaultSiteMetadata = buildPublicMetadata({
  title: "Agency Theme | UI/UX, Web Development, Digital Marketing",
  description:
    "We specialize in UI/UX, Web Development, and Digital Marketing. Clean, modern solutions for growing brands.",
  keywords:
    "web design, web development, digital marketing, UI UX, agency, branding, Next.js",
});

export async function generateMetadata(): Promise<Metadata> {
  let site: Awaited<ReturnType<typeof getSiteSettings>> = null;
  try {
    site = await getSiteSettings();
  } catch {
    return defaultSiteMetadata;
  }
  const href = site?.faviconUrl?.trim();
  if (!href) return defaultSiteMetadata;
  return {
    ...defaultSiteMetadata,
    icons: {
      icon: [{ url: href }],
      shortcut: href,
      apple: href,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.variable} suppressHydrationWarning>
      <body className={`${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <Suspense fallback={null}>
            <TrackPageVisit />
          </Suspense>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
