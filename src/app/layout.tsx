import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import GlobalSearch from "@/components/GlobalSearch";

export const metadata: Metadata = {
  title: "Xgate — Property Operation System",
  description: "Core Property Operation System for modern property management. Interaction-centric, API-first, multi-tenant ready.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <GlobalSearch />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
