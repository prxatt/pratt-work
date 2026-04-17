'use client';

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface ClientLayoutProps {
  children: ReactNode;
}

export const ClientLayout = ({ children }: ClientLayoutProps) => {
  const pathname = usePathname();
  const isContactPage = pathname === '/contact';

  if (isContactPage) return null;
  return <>{children}</>;
};
