import type { Metadata } from "next";
import { Suspense } from "react";
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

export const metadata: Metadata = {
  title: "Agency Theme | UI/UX, Web Development, Digital Marketing",
  description:
    "We specialize in UI/UX, Web Development, and Digital Marketing. Clean, modern solutions for growing brands.",
};

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
