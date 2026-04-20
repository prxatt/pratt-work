import type { Metadata } from "next";
import { Inter, Bebas_Neue, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site.config";
import { CursorProvider } from "@/context/CursorContext";
import { CustomCursor } from "@/components/cursor/CustomCursor";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ClientLayout } from "./ClientLayout";
import { MotionConfig } from "framer-motion";
import ScrollToTop from '@/components/ScrollToTop';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Pratt Majmudar | Creative Technologist & Executive Producer",
    template: "%s | Pratt Majmudar",
  },
  description:
    "Executive Producer building large-scale experiential productions and AI-powered applications.",
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Pratt Majmudar | Creative Technologist & Executive Producer",
    description:
      "Executive Producer building large-scale experiential productions and AI-powered applications.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pratt Majmudar | Creative Technologist & Executive Producer",
    description:
      "Executive Producer building large-scale experiential productions and AI-powered applications.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
      description:
        "Executive Producer building large-scale experiential productions and AI-powered applications.",
      publisher: { "@id": `${siteConfig.url}/#person` },
      inLanguage: "en-US",
    },
    {
      "@type": "Person",
      "@id": `${siteConfig.url}/#person`,
      name: siteConfig.name,
      url: siteConfig.url,
      email: siteConfig.email,
      jobTitle: siteConfig.role,
      address: { "@type": "PostalAddress", addressLocality: siteConfig.location },
      sameAs: Object.values(siteConfig.socials),
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#0D0D0D] selection:bg-primary selection:text-background">
      <body className={`${inter.variable} ${bebasNeue.variable} ${jetbrainsMono.variable} font-sans antialiased text-primary overflow-x-hidden`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
        />
        <ScrollToTop />
        <CursorProvider>
          <MotionConfig reducedMotion="user">
            <ErrorBoundary fallback={null}>
              <CustomCursor />
              <ScrollProgress />
            </ErrorBoundary>
            <Navbar />
            <main className="relative flex flex-col min-h-screen">
              {children}
            </main>
            <ClientLayout>
              <Footer />
            </ClientLayout>
          </MotionConfig>
        </CursorProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
