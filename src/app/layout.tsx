import type { Metadata } from "next";
import { Inter, Bebas_Neue, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CursorProvider } from "@/context/CursorContext";
import { CustomCursor } from "@/components/cursor/CustomCursor";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ClientLayout } from "./ClientLayout";
import { MotionConfig } from "framer-motion";
import ScrollToTop from '@/components/ScrollToTop';
import { ScrollProgress } from '@/components/ui/ScrollProgress';

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
  title: "Pratt Majmudar | Creative Technologist & Executive Producer",
  description: "Executive Producer building large-scale experiential productions and AI-powered applications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#0D0D0D] selection:bg-primary selection:text-background">
      <body className={`${inter.variable} ${bebasNeue.variable} ${jetbrainsMono.variable} font-sans antialiased text-primary overflow-x-hidden`}>
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
      </body>
    </html>
  );
}
