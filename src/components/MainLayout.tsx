'use client';

import { usePathname } from 'next/navigation';
import TopHeader from './TopHeader';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <main className="main-content">
      {!isAdminPage && <TopHeader />}
      {children}
    </main>
  );
}
