'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import '../admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { t } = useLanguage();

    const navItems = [
        { href: '/admin', label: t.admin.navDashboard },
        { href: '/admin/contracts', label: t.admin.navContractReview },
        { href: '/admin/review-history', label: t.admin.navReviewHistory },
        { href: '/admin/payments', label: t.admin.navPaymentControl },
        { href: '/admin/users', label: t.admin.navUsers },
    ];

    // Determine current page title
    const currentNavItem = navItems.find(item => item.href === pathname);
    const pageTitle = currentNavItem ? currentNavItem.label : 'Admin Portal';

    return (
        <div className="admin-portal">
            <div className="admin-portal-layout">
                {/* ── LEFT SIDEBAR (fixed width 240px) ── */}
                <aside className="admin-sidebar">
                    <div className="admin-logo">
                        XGATE ADMIN
                    </div>
                    <nav className="admin-nav">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`admin-nav-item ${pathname === item.href ? 'active' : ''}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="admin-nav-footer">
                        <Link href="/" className="admin-nav-item" style={{ color: 'var(--admin-accent-red)', paddingLeft: 0 }}>
                            {t.admin.navLogout}
                        </Link>
                    </div>
                </aside>

                {/* ── MAIN AREA ── */}
                <div className="admin-main-area">
                    {/* Top Header (fixed height 64px) */}
                    <header className="admin-top-header">
                        <h1>{pageTitle}</h1>
                    </header>

                    {/* Content Area (flex 1, padding 24px) */}
                    <main className="admin-content">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
