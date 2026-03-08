'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';

export default function Sidebar() {
    const pathname = usePathname();
    const { language, setLanguage, t } = useLanguage();

    const navItems = [
        {
            section: t('overview'),
            items: [
                { href: '/', label: t('dashboard'), icon: '📊' },
                { href: '/hierarchy', label: t('organization'), icon: '🌲' },
                { href: '/billing', label: t('billingAccounting'), icon: '💳' },
            ]
        },
        {
            section: t('operations'),
            items: [
                { href: '/interactions', label: t('interactions'), icon: '💬', badge: 'Hub' },
                { href: '/leads', label: t('leadPipeline'), icon: '🎯' },
                { href: '/rooms', label: t('roomStatus'), icon: '🏠' },
                { href: '/properties', label: t('properties'), icon: '🏢' },
                { href: '/contracts', label: t('contracts'), icon: '📄' },
                { href: '/invoices', label: t('invoices'), icon: '💰' },
                { href: '/rent-reminders', label: t('rentReminders'), icon: '🔔' },
                { href: '/commissions', label: t('commissions'), icon: '💸' },
                { href: '/maintenance', label: t('maintenance'), icon: '🔧' },
                { href: '/utilities', label: t('utilities'), icon: '⚡' },
            ]
        },
        {
            section: t('analytics'),
            items: [
                { href: '/reports', label: t('financialReports'), icon: '📈' },
                { href: '/activity', label: t('activityHistory'), icon: '📜' },
                { href: '/post-generator', label: '🚀 Tìm Khách MXH', icon: '🚀' },
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
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('apiFirst')}</span>
                    <div className="lang-switcher" style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '6px' }}>
                        <button
                            onClick={() => setLanguage('en')}
                            style={{
                                border: 'none',
                                background: language === 'en' ? '#3b82f6' : 'transparent',
                                color: 'white',
                                fontSize: '0.65rem',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            EN
                        </button>
                        <button
                            onClick={() => setLanguage('vi')}
                            style={{
                                border: 'none',
                                background: language === 'vi' ? '#3b82f6' : 'transparent',
                                color: 'white',
                                fontSize: '0.65rem',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            VN
                        </button>
                    </div>
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', opacity: 0.5 }}>
                    v1.1-i18n-ready
                </div>
            </div>
        </aside>
    );
}
