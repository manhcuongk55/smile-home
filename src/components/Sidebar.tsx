'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        {
            section: 'Overview',
            items: [
                { href: '/', label: 'Dashboard', icon: '📊' },
                { href: '/hierarchy', label: 'Organization', icon: '🌲' },
            ]
        },
        {
            section: 'Operations',
            items: [
                { href: '/interactions', label: 'Interactions', icon: '💬', badge: 'Hub' },
                { href: '/leads', label: 'Lead Pipeline', icon: '🎯' },
                { href: '/rooms', label: 'Room Status', icon: '🏠' },
                { href: '/properties', label: 'Properties', icon: '🏢' },
                { href: '/contracts', label: 'Contracts', icon: '📄' },
                { href: '/invoices', label: 'Invoices', icon: '💰' },
                { href: '/maintenance', label: 'Maintenance', icon: '🔧' },
                { href: '/utilities', label: 'Utilities', icon: '⚡' },
            ]
        },
        {
            section: 'Analytics',
            items: [
                { href: '/reports', label: 'Financial Reports', icon: '📈' },
            ]
        },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2><span>Xgate</span></h2>
                <div className="subtitle">Property Operation System</div>
            </div>
            <nav className="sidebar-nav">
                {navItems.map((section) => (
                    <div key={section.section}>
                        <div className="nav-section-label">{section.section}</div>
                        {section.items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {item.label}
                                {item.badge && <span className="nav-badge">{item.badge}</span>}
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                API-First · Multi-Tenant Ready
            </div>
        </aside>
    );
}
