import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Xgate — Property Operation System",
  description: "Core Property Operation System for modern property management. Interaction-centric, API-first, multi-tenant ready.",
};

import { LanguageProvider } from "@/context/LanguageContext";
import TopHeader from "@/components/TopHeader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LanguageProvider>
          <div className="app-layout">
            <Sidebar />
            <main className="main-content">
              <TopHeader />
              {children}
            </main>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
