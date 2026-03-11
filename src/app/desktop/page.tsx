'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AppWindow {
    id: string;
    title: string;
    icon: string;
    url: string;
    x: number;
    y: number;
    width: number;
    height: number;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
}

interface DesktopApp {
    id: string;
    title: string;
    icon: string;
    url: string;
    color: string;
    category: string;
}

const APPS: DesktopApp[] = [
    // Quản lý
    { id: 'dashboard', title: 'Tổng quan', icon: '📊', url: '/', color: '#38bdf8', category: 'Quản lý' },
    { id: 'rooms', title: 'Phòng trọ', icon: '🏠', url: '/rooms', color: '#34d399', category: 'Quản lý' },
    { id: 'contracts', title: 'Hợp đồng', icon: '📄', url: '/contracts', color: '#a78bfa', category: 'Quản lý' },
    { id: 'invoices', title: 'Hóa đơn', icon: '🧾', url: '/invoices', color: '#fbbf24', category: 'Quản lý' },
    { id: 'maintenance', title: 'Bảo trì', icon: '🔧', url: '/maintenance', color: '#fb7185', category: 'Quản lý' },
    { id: 'utilities', title: 'Điện nước', icon: '⚡', url: '/utilities', color: '#f59e0b', category: 'Quản lý' },
    // Kinh doanh
    { id: 'leads', title: 'Khách hàng', icon: '👥', url: '/leads', color: '#38bdf8', category: 'Kinh doanh' },
    { id: 'interactions', title: 'Tương tác', icon: '💬', url: '/interactions', color: '#2dd4bf', category: 'Kinh doanh' },
    { id: 'commissions', title: 'Hoa hồng', icon: '💸', url: '/commissions', color: '#34d399', category: 'Kinh doanh' },
    { id: 'post-gen', title: 'Tìm khách MXH', icon: '🚀', url: '/post-generator', color: '#fb7185', category: 'Kinh doanh' },
    // AI & Tự động
    { id: 'ai-assistant', title: 'AI Assistant', icon: '🦞', url: '/ai-assistant', color: '#a78bfa', category: 'AI & Tự động' },
    { id: 'social-hub', title: 'Social Hub', icon: '📲', url: '/social-hub', color: '#38bdf8', category: 'AI & Tự động' },
    { id: 'sleepboxes', title: 'Sleepbox', icon: '🛏️', url: '/sleepboxes', color: '#2dd4bf', category: 'AI & Tự động' },
    // Báo cáo
    { id: 'reports', title: 'Báo cáo', icon: '📈', url: '/reports', color: '#fbbf24', category: 'Báo cáo' },
    { id: 'activity', title: 'Lịch sử', icon: '📜', url: '/activity', color: '#94a3b8', category: 'Báo cáo' },
    { id: 'billing', title: 'Thanh toán', icon: '💳', url: '/billing', color: '#34d399', category: 'Báo cáo' },
    // BrowserOS
    { id: 'browser', title: 'BrowserOS', icon: '🌐', url: 'https://browseros.com', color: '#667eea', category: 'Hệ thống' },
    { id: 'settings', title: 'Cài đặt', icon: '⚙️', url: '#settings', color: '#64748b', category: 'Hệ thống' },
];

let nextZ = 10;

export default function DesktopPage() {
    const router = useRouter();
    const [windows, setWindows] = useState<AppWindow[]>([]);
    const [showLauncher, setShowLauncher] = useState(false);
    const [clock, setClock] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

    useEffect(() => {
        const tick = () => setClock(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
        tick();
        const interval = setInterval(tick, 30000);
        return () => clearInterval(interval);
    }, []);

    function openApp(app: DesktopApp) {
        const existing = windows.find(w => w.id === app.id);
        if (existing) {
            setWindows(prev => prev.map(w =>
                w.id === app.id ? { ...w, isMinimized: false, zIndex: ++nextZ } : w
            ));
            setShowLauncher(false);
            return;
        }
        const newWin: AppWindow = {
            id: app.id, title: app.title, icon: app.icon, url: app.url,
            x: 80 + Math.random() * 200, y: 40 + Math.random() * 100,
            width: 900, height: 550, isMinimized: false, isMaximized: false,
            zIndex: ++nextZ,
        };
        setWindows(prev => [...prev, newWin]);
        setShowLauncher(false);
    }

    function closeWindow(id: string) {
        setWindows(prev => prev.filter(w => w.id !== id));
    }

    function toggleMinimize(id: string) {
        setWindows(prev => prev.map(w =>
            w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
        ));
    }

    function toggleMaximize(id: string) {
        setWindows(prev => prev.map(w =>
            w.id === id ? { ...w, isMaximized: !w.isMaximized, zIndex: ++nextZ } : w
        ));
    }

    function focusWindow(id: string) {
        setWindows(prev => prev.map(w =>
            w.id === id ? { ...w, zIndex: ++nextZ } : w
        ));
    }

    const handleMouseDown = useCallback((e: React.MouseEvent, id: string) => {
        const win = windows.find(w => w.id === id);
        if (!win || win.isMaximized) return;
        dragRef.current = { id, offsetX: e.clientX - win.x, offsetY: e.clientY - win.y };
        focusWindow(id);
    }, [windows]);

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            if (!dragRef.current) return;
            setWindows(prev => prev.map(w =>
                w.id === dragRef.current!.id
                    ? { ...w, x: e.clientX - dragRef.current!.offsetX, y: Math.max(0, e.clientY - dragRef.current!.offsetY) }
                    : w
            ));
        };
        const handleUp = () => { dragRef.current = null; };
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
    }, []);

    function navigateToApp(url: string) {
        if (url.startsWith('http')) {
            window.open(url, '_blank');
        } else if (url === '#settings') {
            // settings placeholder
        } else {
            router.push(url);
        }
    }

    const filteredApps = searchQuery
        ? APPS.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
        : APPS;

    const categories = [...new Set(filteredApps.map(a => a.category))];

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'linear-gradient(135deg, #0c1929 0%, #0f2a3e 30%, #132d42 60%, #0c1929 100%)',
            overflow: 'hidden', fontFamily: "'Inter', sans-serif",
        }}>
            {/* Ocean Background Effects */}
            <div style={{
                position: 'absolute', inset: 0, opacity: 0.06,
                backgroundImage: 'radial-gradient(ellipse 600px 300px at 70% 80%, #38bdf8 0%, transparent 70%), radial-gradient(ellipse 400px 200px at 20% 30%, #2dd4bf 0%, transparent 70%)',
            }} />

            {/* Desktop Icons Grid */}
            <div style={{
                position: 'absolute', top: 16, left: 16, right: 16, bottom: 56,
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 90px)',
                gridTemplateRows: 'repeat(auto-fill, 90px)',
                gap: 4, alignContent: 'start', padding: 8,
            }}>
                {APPS.slice(0, 12).map((app) => (
                    <button
                        key={app.id}
                        onDoubleClick={() => openApp(app)}
                        onClick={() => openApp(app)}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            gap: 4, padding: 8, borderRadius: 10, border: 'none',
                            background: 'transparent', cursor: 'pointer',
                            transition: 'all 200ms ease', color: '#e8f0f8',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(56,189,248,0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                        <span style={{ fontSize: '2rem', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}>{app.icon}</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 500, textAlign: 'center', textShadow: '0 1px 4px rgba(0,0,0,0.5)', lineHeight: 1.2 }}>{app.title}</span>
                    </button>
                ))}
            </div>

            {/* App Windows */}
            {windows.filter(w => !w.isMinimized).map((win) => {
                const isMax = win.isMaximized;
                return (
                    <div
                        key={win.id}
                        onClick={() => focusWindow(win.id)}
                        style={{
                            position: 'absolute',
                            left: isMax ? 0 : win.x,
                            top: isMax ? 0 : win.y,
                            width: isMax ? '100%' : win.width,
                            height: isMax ? 'calc(100% - 48px)' : win.height,
                            zIndex: win.zIndex,
                            borderRadius: isMax ? 0 : 12,
                            overflow: 'hidden',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                            border: isMax ? 'none' : '1px solid rgba(56,189,248,0.15)',
                            display: 'flex', flexDirection: 'column',
                            transition: isMax ? 'all 200ms ease' : 'none',
                        }}
                    >
                        {/* Title Bar */}
                        <div
                            onMouseDown={(e) => handleMouseDown(e, win.id)}
                            style={{
                                height: 36, padding: '0 12px',
                                background: 'linear-gradient(180deg, #1a3a54, #132a3e)',
                                borderBottom: '1px solid rgba(56,189,248,0.1)',
                                display: 'flex', alignItems: 'center', gap: 10,
                                cursor: isMax ? 'default' : 'grab', userSelect: 'none',
                            }}
                        >
                            <span style={{ fontSize: '0.9rem' }}>{win.icon}</span>
                            <span style={{ flex: 1, fontSize: '0.75rem', fontWeight: 600, color: '#8fb8d4' }}>{win.title}</span>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {[
                                    { action: () => toggleMinimize(win.id), color: '#fbbf24', label: '−' },
                                    { action: () => toggleMaximize(win.id), color: '#34d399', label: isMax ? '❐' : '□' },
                                    { action: () => closeWindow(win.id), color: '#fb7185', label: '✕' },
                                ].map((btn, i) => (
                                    <button key={i} onClick={(e) => { e.stopPropagation(); btn.action(); }}
                                        style={{
                                            width: 14, height: 14, borderRadius: '50%', border: 'none',
                                            background: btn.color, cursor: 'pointer', fontSize: '0.5rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'transparent', lineHeight: 1,
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = '#000'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = 'transparent'; }}
                                    >{btn.label}</button>
                                ))}
                            </div>
                        </div>
                        {/* Content */}
                        <div style={{ flex: 1, background: '#0c1929', position: 'relative' }}>
                            {win.url.startsWith('http') ? (
                                <iframe src={win.url} style={{ width: '100%', height: '100%', border: 'none' }} />
                            ) : (
                                <iframe src={win.url} style={{ width: '100%', height: '100%', border: 'none' }} />
                            )}
                        </div>
                    </div>
                );
            })}

            {/* App Launcher Modal */}
            {showLauncher && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 99999,
                    background: 'rgba(12,25,41,0.92)', backdropFilter: 'blur(20px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                    onClick={() => setShowLauncher(false)}
                >
                    <div onClick={(e) => e.stopPropagation()} style={{
                        width: 680, maxHeight: '80vh', overflowY: 'auto',
                        padding: 32, borderRadius: 20,
                    }}>
                        {/* Search */}
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="🔍 Tìm ứng dụng..."
                            autoFocus
                            style={{
                                width: '100%', padding: '14px 20px', borderRadius: 14,
                                border: '1px solid rgba(56,189,248,0.2)',
                                background: 'rgba(19,42,62,0.8)', color: '#e8f0f8',
                                fontSize: '1rem', outline: 'none', marginBottom: 28,
                            }}
                        />
                        {categories.map((cat) => (
                            <div key={cat} style={{ marginBottom: 24 }}>
                                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#5a8ba8', marginBottom: 12, fontWeight: 600 }}>{cat}</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                                    {filteredApps.filter(a => a.category === cat).map((app) => (
                                        <button
                                            key={app.id}
                                            onClick={() => openApp(app)}
                                            style={{
                                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                gap: 8, padding: 16, borderRadius: 14, border: 'none',
                                                background: 'rgba(19,42,62,0.6)', cursor: 'pointer',
                                                transition: 'all 200ms ease', color: '#e8f0f8',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = `${app.color}20`; e.currentTarget.style.transform = 'scale(1.05)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(19,42,62,0.6)'; e.currentTarget.style.transform = 'scale(1)'; }}
                                        >
                                            <span style={{ fontSize: '2rem' }}>{app.icon}</span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{app.title}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Taskbar */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 48,
                background: 'linear-gradient(180deg, rgba(19,42,62,0.95), rgba(12,25,41,0.98))',
                borderTop: '1px solid rgba(56,189,248,0.1)',
                backdropFilter: 'blur(16px)',
                display: 'flex', alignItems: 'center', padding: '0 12px', gap: 4, zIndex: 99998,
            }}>
                {/* Start Button */}
                <button
                    onClick={() => setShowLauncher(!showLauncher)}
                    style={{
                        height: 36, padding: '0 14px', borderRadius: 8, border: 'none',
                        background: showLauncher ? 'rgba(56,189,248,0.2)' : 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                        color: '#e8f0f8', fontSize: '0.82rem', fontWeight: 700,
                        transition: 'all 200ms ease',
                    }}
                    onMouseEnter={(e) => { if (!showLauncher) e.currentTarget.style.background = 'rgba(56,189,248,0.1)'; }}
                    onMouseLeave={(e) => { if (!showLauncher) e.currentTarget.style.background = 'transparent'; }}
                >
                    🏠 Smile Home
                </button>

                <div style={{ width: 1, height: 24, background: 'rgba(56,189,248,0.1)', margin: '0 4px' }} />

                {/* Running Apps */}
                <div style={{ flex: 1, display: 'flex', gap: 2, overflow: 'hidden' }}>
                    {windows.map((win) => (
                        <button
                            key={win.id}
                            onClick={() => win.isMinimized ? toggleMinimize(win.id) : focusWindow(win.id)}
                            style={{
                                height: 34, padding: '0 12px', borderRadius: 6, border: 'none',
                                background: win.isMinimized ? 'transparent' : 'rgba(56,189,248,0.12)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                color: win.isMinimized ? '#5a8ba8' : '#e8f0f8',
                                fontSize: '0.75rem', fontWeight: 500, transition: 'all 150ms ease',
                                borderBottom: win.isMinimized ? 'none' : '2px solid #38bdf8',
                                maxWidth: 160, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                            }}
                        >
                            <span style={{ fontSize: '0.9rem' }}>{win.icon}</span>
                            {win.title}
                        </button>
                    ))}
                </div>

                {/* System Tray */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#8fb8d4', fontSize: '0.75rem' }}>
                    <span title="BrowserOS" style={{ cursor: 'pointer' }}
                        onClick={() => window.open('https://browseros.com', '_blank')}
                    >🌐</span>
                    <span title="AI Assistant" style={{ cursor: 'pointer' }}
                        onClick={() => openApp(APPS.find(a => a.id === 'ai-assistant')!)}
                    >🦞</span>
                    <span>{clock}</span>
                </div>
            </div>

            <style jsx>{`
                iframe {
                    background: #0c1929;
                }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.2); border-radius: 3px; }
            `}</style>
        </div>
    );
}
