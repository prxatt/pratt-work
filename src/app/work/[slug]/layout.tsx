import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project — Pratt Majmudar",
  description: "Creative Technology + Executive Production work by Pratt Majmudar.",
};

export default function WorkProjectLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Work project pages do NOT include the main PRXATT footer
  // They use WorkProjectFooter instead for project navigation
  return (
    <>
      {children}
    </>
  );
}
