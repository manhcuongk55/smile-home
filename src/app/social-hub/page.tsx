'use client';

import { useState, useEffect, useCallback } from 'react';

interface VacantRoom {
    id: string;
    number: string;
    type: string;
    price: number;
    area: number;
    buildingName: string;
    address: string;
    propertyName: string;
}

type Platform = 'facebook' | 'zalo' | 'tiktok' | 'twitter' | 'linkedin' | 'instagram';
type PostStatus = 'draft' | 'scheduled' | 'posting' | 'posted' | 'failed';

interface ScheduledPost {
    id: string;
    roomId: string;
    roomLabel: string;
    platform: Platform;
    content: string;
    scheduledTime: string;
    status: PostStatus;
}

const PLATFORMS: Record<Platform, { name: string; icon: string; color: string }> = {
    facebook: { name: 'Facebook', icon: '📘', color: '#1877F2' },
    zalo: { name: 'Zalo', icon: '💬', color: '#0068FF' },
    tiktok: { name: 'TikTok', icon: '🎵', color: '#000000' },
    twitter: { name: 'X/Twitter', icon: '𝕏', color: '#1DA1F2' },
    linkedin: { name: 'LinkedIn', icon: '💼', color: '#0A66C2' },
    instagram: { name: 'Instagram', icon: '📸', color: '#E4405F' },
};

const ROOM_TYPE_VI: Record<string, string> = {
    STUDIO: 'Studio', ONE_BED: '1PN', TWO_BED: '2PN',
    THREE_BED: '3PN', PENTHOUSE: 'Penthouse', COMMERCIAL: 'Mặt bằng',
};

function money(n: number) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + ' triệu';
    if (n >= 1000) return Math.round(n / 1000) + 'k';
    return n.toLocaleString('vi-VN') + 'đ';
}

// Demo scheduled posts
const DEMO_POSTS: ScheduledPost[] = [
    { id: 'sp-1', roomId: 'r1', roomLabel: 'P.102 - Building A (Studio)', platform: 'facebook', content: '🏠 CHO THUÊ PHÒNG STUDIO — GIÁ TỐT!\n📍 Hà Nội - Building A\n💰 8,500k/tháng | 📐 25m²\n✅ An ninh 24/7 ✅ Wifi free', scheduledTime: '2026-03-11T07:00', status: 'posted' },
    { id: 'sp-2', roomId: 'r1', roomLabel: 'P.102 - Building A (Studio)', platform: 'zalo', content: '🏠 CHO THUÊ PHÒNG STUDIO — GIÁ TỐT!\n📍 Hà Nội - Building A\n💰 8,500k/tháng', scheduledTime: '2026-03-11T07:30', status: 'posted' },
    { id: 'sp-3', roomId: 'r2', roomLabel: 'P.205 - Building B (1PN)', platform: 'facebook', content: '🏠 CHO THUÊ CĂN HỘ 1PN — VIEW ĐẸP!\n📍 Hà Nội - Building B\n💰 12,000k/tháng', scheduledTime: '2026-03-11T11:30', status: 'scheduled' },
    { id: 'sp-4', roomId: 'r3', roomLabel: 'P.308 - Building A (Studio)', platform: 'tiktok', content: '🔥 PHÒNG ĐẸP GIÁ RẺ! Studio 8.5tr/th tại Building A!', scheduledTime: '2026-03-11T20:00', status: 'scheduled' },
    { id: 'sp-5', roomId: 'r2', roomLabel: 'P.205 - Building B (1PN)', platform: 'twitter', content: '🏠 New listing: 1BR apartment at Building B, Hanoi. ฿12,000/mo. DM for details! #realestate #forrent', scheduledTime: '2026-03-11T14:00', status: 'draft' },
    { id: 'sp-6', roomId: 'r1', roomLabel: 'P.102 - Building A (Studio)', platform: 'linkedin', content: 'New property listing: Studio apartment...', scheduledTime: '2026-03-12T09:00', status: 'draft' },
];

const STATUS_CONFIG: Record<PostStatus, { label: string; color: string; bg: string }> = {
    draft: { label: 'Bản nháp', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
    scheduled: { label: 'Đã lên lịch', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
    posting: { label: 'Đang đăng...', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    posted: { label: 'Đã đăng ✅', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    failed: { label: 'Thất bại', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
};

export default function SocialHubPage() {
    const [rooms, setRooms] = useState<VacantRoom[]>([]);
    const [posts, setPosts] = useState<ScheduledPost[]>(DEMO_POSTS);
    const [activeTab, setActiveTab] = useState<'automation' | 'schedule' | 'browser'>('automation');
    const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['facebook', 'zalo']);
    const [browserUrl, setBrowserUrl] = useState('https://www.facebook.com');
    const [browserLogs, setBrowserLogs] = useState<string[]>([
        '🟢 mini-browser ready — Chrome CDP kết nối tại port 9222',
        '📍 Current URL: https://www.facebook.com',
        '✅ Page loaded (networkidle)',
    ]);
    const [isAutomating, setIsAutomating] = useState(false);
    const [automationLog, setAutomationLog] = useState<string[]>([]);

    const fetchRooms = useCallback(async () => {
        try {
            const res = await fetch('/api/vacant-rooms');
            if (res.ok) setRooms(await res.json());
        } catch { /* ignore */ }
    }, []);

    useEffect(() => { fetchRooms(); }, [fetchRooms]);

    // Simulate automation flow
    async function runAutomation() {
        if (rooms.length === 0 && selectedPlatforms.length === 0) return;
        setIsAutomating(true);
        setAutomationLog([]);

        const steps = [
            '🤖 [social-media-agent] Khởi tạo LangGraph pipeline...',
            '📊 [social-media-agent] Phân tích dữ liệu phòng trống...',
            `🏠 [social-media-agent] Tìm thấy ${rooms.length || 4} phòng cần đăng bài`,
            '✍️ [social-media-agent] Tạo nội dung bài viết cho Facebook...',
            '✍️ [social-media-agent] Tạo nội dung bài viết cho Zalo...',
            '🖼️ [social-media-agent] Chọn ảnh phù hợp từ gallery...',
            '🌐 [mini-browser] Khởi động Chrome CDP (port 9222)...',
            '🌐 [mini-browser] → mb go "https://www.facebook.com/groups/phongtro"',
            '🌐 [mini-browser] ✅ Page loaded (networkidle)',
            '🌐 [mini-browser] → mb snap (Accessibility Tree scan)',
            '🌐 [mini-browser] → mb click 450 320 (nút "Tạo bài viết")',
            '🌐 [mini-browser] → mb type "🏠 CHO THUÊ PHÒNG..."',
            '⏳ [HITL] Chờ duyệt bài viết... (Human-in-the-Loop)',
            '✅ [social-media-agent] Bài viết đã được duyệt!',
            '🌐 [mini-browser] → mb click 500 600 (nút "Đăng")',
            '✅ [mini-browser] Bài đã đăng thành công trên Facebook!',
            '📱 [social-media-agent] Chuyển sang Zalo...',
            '🌐 [mini-browser] → mb go "https://zalo.me/pc"',
            '✅ Pipeline hoàn tất! 2 bài đăng thành công.',
        ];

        for (const step of steps) {
            await new Promise(r => setTimeout(r, 400 + Math.random() * 600));
            setAutomationLog(prev => [...prev, `[${new Date().toLocaleTimeString('vi-VN')}] ${step}`]);
        }

        setIsAutomating(false);
    }

    function togglePlatform(p: Platform) {
        setSelectedPlatforms(prev =>
            prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
        );
    }

    const stats = {
        total: posts.length,
        posted: posts.filter(p => p.status === 'posted').length,
        scheduled: posts.filter(p => p.status === 'scheduled').length,
        drafts: posts.filter(p => p.status === 'draft').length,
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1>📲 Social Media Automation Hub</h1>
                    <p>Tự động hóa đăng bài MXH — mini-browser + social-media-agent + OpenClaw</p>
                </div>
            </div>

            {/* Architecture Diagram */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center',
            }}>
                {[
                    '🏠 Phòng trống', '→',
                    '🤖 AI soạn bài', '→',
                    '👀 HITL duyệt', '→',
                    '🌐 mini-browser', '→',
                    '📲 Auto đăng MXH', '→',
                    '📊 Tracking',
                ].map((step, i) => (
                    <span key={i} style={{
                        padding: step === '→' ? '0 4px' : '6px 14px',
                        background: step === '→' ? 'transparent' : 'var(--bg-card)',
                        border: step === '→' ? 'none' : '1px solid var(--border-subtle)',
                        borderRadius: 99, fontSize: '0.72rem', fontWeight: 600,
                        color: step === '→' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    }}>{step}</span>
                ))}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
                {[
                    { label: 'Tổng bài', value: stats.total, icon: '📝', color: 'var(--accent-blue)' },
                    { label: 'Đã đăng', value: stats.posted, icon: '✅', color: 'var(--accent-emerald)' },
                    { label: 'Đã lên lịch', value: stats.scheduled, icon: '📅', color: '#f59e0b' },
                    { label: 'Bản nháp', value: stats.drafts, icon: '📋', color: 'var(--text-muted)' },
                    { label: 'Phòng trống', value: rooms.length, icon: '🏠', color: 'var(--accent-purple)' },
                ].map((s) => (
                    <div key={s.label} style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-lg)', padding: '16px 20px',
                        display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
                        <div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.label}</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tab Navigation */}
            <div className="tabs" style={{ marginBottom: 20 }}>
                {[
                    { key: 'automation', label: '🤖 Auto Pipeline', badge: 'AI' },
                    { key: 'schedule', label: '📅 Lịch đăng bài' },
                    { key: 'browser', label: '🌐 mini-browser' },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        className={`tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    >
                        {tab.label}
                        {tab.badge && <span style={{ marginLeft: 6, padding: '2px 6px', background: 'var(--accent-purple)', color: 'white', borderRadius: 4, fontSize: '0.6rem', fontWeight: 700 }}>{tab.badge}</span>}
                    </button>
                ))}
            </div>

            {/* Tab: Automation Pipeline */}
            {activeTab === 'automation' && (
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
                    {/* Config Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>
                                📲 Chọn nền tảng MXH
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {(Object.entries(PLATFORMS) as [Platform, typeof PLATFORMS[Platform]][]).map(([key, p]) => (
                                    <button
                                        key={key}
                                        onClick={() => togglePlatform(key)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '10px 12px', borderRadius: 8, border: 'none',
                                            background: selectedPlatforms.includes(key) ? `${p.color}20` : 'var(--bg-secondary)',
                                            cursor: 'pointer', textAlign: 'left',
                                            transition: 'all 200ms ease',
                                        }}
                                    >
                                        <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
                                        <span style={{
                                            flex: 1, fontSize: '0.82rem', fontWeight: 600,
                                            color: selectedPlatforms.includes(key) ? p.color : 'var(--text-secondary)',
                                        }}>{p.name}</span>
                                        {selectedPlatforms.includes(key) && (
                                            <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>
                                ⚙️ Cấu hình
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Social Media Agent</span>
                                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>⚡ Demo</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>mini-browser</span>
                                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>⚡ Demo</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>OpenClaw Gateway</span>
                                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>⚡ Demo</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>HITL (Human-in-the-Loop)</span>
                                    <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>✅ On</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={runAutomation}
                            disabled={isAutomating || selectedPlatforms.length === 0}
                            style={{
                                padding: '14px 20px', borderRadius: 12, border: 'none',
                                background: isAutomating ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #667eea, #764ba2)',
                                color: 'white', cursor: isAutomating ? 'wait' : 'pointer',
                                fontWeight: 700, fontSize: '0.9rem',
                                transition: 'all 300ms ease',
                            }}
                        >
                            {isAutomating ? '⏳ Đang chạy pipeline...' : '🚀 Chạy Auto Pipeline'}
                        </button>
                    </div>

                    {/* Automation Log */}
                    <div style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    }}>
                        <div style={{
                            padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>📋 Automation Log</div>
                            <div style={{
                                padding: '3px 10px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 600,
                                background: isAutomating ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                                color: isAutomating ? '#f59e0b' : '#10b981',
                            }}>
                                {isAutomating ? '● Đang chạy' : '● Sẵn sàng'}
                            </div>
                        </div>
                        <div style={{
                            flex: 1, padding: '12px 16px', fontFamily: 'monospace',
                            fontSize: '0.75rem', lineHeight: 1.8, color: 'var(--text-secondary)',
                            overflowY: 'auto', minHeight: 300, maxHeight: 500,
                            background: 'var(--bg-primary)',
                        }}>
                            {automationLog.length === 0 ? (
                                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                    Bấm &quot;🚀 Chạy Auto Pipeline&quot; để bắt đầu...<br /><br />
                                    Pipeline sẽ:<br />
                                    1. 🤖 social-media-agent tạo nội dung bài viết từ dữ liệu phòng trống<br />
                                    2. 👀 Gửi duyệt qua HITL (Human-in-the-Loop)<br />
                                    3. 🌐 mini-browser tự động mở MXH và đăng bài<br />
                                    4. 📊 Theo dõi trạng thái đăng bài
                                </div>
                            ) : (
                                automationLog.map((log, i) => (
                                    <div key={i} style={{
                                        borderBottom: '1px solid var(--border-subtle)',
                                        padding: '4px 0',
                                    }}>
                                        {log}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Tab: Schedule */}
            {activeTab === 'schedule' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {posts.map((post) => {
                        const platform = PLATFORMS[post.platform];
                        const statusCfg = STATUS_CONFIG[post.status];
                        return (
                            <div key={post.id} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-lg)', padding: '16px 20px',
                                display: 'flex', alignItems: 'center', gap: 16,
                            }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 10, display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
                                    background: `${platform.color}20`,
                                }}>{platform.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{platform.name}</span>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 600,
                                            color: statusCfg.color, background: statusCfg.bg,
                                        }}>{statusCfg.label}</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                        🏠 {post.roomLabel}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 500 }}>
                                        {post.content}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        📅 {new Date(post.scheduledTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                    </div>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                        ⏰ {new Date(post.scheduledTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Tab: mini-browser */}
            {activeTab === 'browser' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
                    {/* Browser Panel */}
                    <div style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                    }}>
                        {/* URL Bar */}
                        <div style={{
                            padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex', gap: 8, alignItems: 'center',
                        }}>
                            <div style={{ display: 'flex', gap: 4 }}>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                            </div>
                            <input
                                value={browserUrl}
                                onChange={(e) => setBrowserUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setBrowserLogs(prev => [
                                            ...prev,
                                            `🌐 → mb go "${browserUrl}"`,
                                            `✅ Page loaded (networkidle)`,
                                            `📍 Current URL: ${browserUrl}`,
                                        ]);
                                    }
                                }}
                                style={{
                                    flex: 1, padding: '6px 12px', borderRadius: 6,
                                    border: '1px solid var(--border-subtle)',
                                    background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                                    fontSize: '0.78rem',
                                }}
                            />
                        </div>
                        {/* Browser Content Placeholder */}
                        <div style={{
                            minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexDirection: 'column', gap: 16, padding: 40, color: 'var(--text-muted)',
                        }}>
                            <span style={{ fontSize: '4rem' }}>🌐</span>
                            <h3 style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>mini-browser</h3>
                            <p style={{ fontSize: '0.82rem', textAlign: 'center', maxWidth: 400 }}>
                                Agent-first browser CLI. Kết nối với Chrome qua CDP protocol.
                                <br />Dùng cho tự động đăng bài MXH khi không có API chính thức.
                            </p>
                            <div style={{
                                padding: '10px 20px', background: 'rgba(245,158,11,0.15)',
                                borderRadius: 8, color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600,
                            }}>
                                ⚡ Demo Mode — Cần cài: npm i -g @runablehq/mini-browser
                            </div>
                        </div>
                    </div>

                    {/* Command Log */}
                    <div style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    }}>
                        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.82rem' }}>
                            🖥️ Console
                        </div>
                        <div style={{
                            flex: 1, padding: '10px 14px', fontFamily: 'monospace', fontSize: '0.7rem',
                            lineHeight: 1.8, overflowY: 'auto', minHeight: 300,
                            background: '#0a0a0a', color: '#10b981',
                        }}>
                            {browserLogs.map((log, i) => (
                                <div key={i}>$ {log}</div>
                            ))}
                        </div>
                        <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {[
                                { cmd: 'snap', label: '📸 Snap' },
                                { cmd: 'text', label: '📝 Text' },
                                { cmd: 'shot', label: '🖼️ Screenshot' },
                                { cmd: 'back', label: '◀ Back' },
                            ].map((c) => (
                                <button
                                    key={c.cmd}
                                    onClick={() => setBrowserLogs(prev => [...prev, `→ mb ${c.cmd}`, `✅ ${c.cmd} complete`])}
                                    style={{
                                        padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-subtle)',
                                        background: 'transparent', color: 'var(--text-secondary)',
                                        cursor: 'pointer', fontSize: '0.68rem',
                                    }}
                                >{c.label}</button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Integration Guide */}
            <div style={{
                marginTop: 24, background: 'var(--bg-card)', border: '1px solid var(--border-accent)',
                borderRadius: 'var(--radius-lg)', padding: 18,
            }}>
                <h4 style={{ fontSize: '0.82rem', color: 'var(--accent-amber)', marginBottom: 12 }}>
                    🔧 Hướng dẫn kết nối Backend Services
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, fontSize: '0.75rem' }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: 14, borderRadius: 8 }}>
                        <strong style={{ color: '#10b981' }}>🌐 mini-browser</strong>
                        <pre style={{ marginTop: 6, fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                            {`npm i -g @runablehq/mini-browser
mb-start-chrome
mb go "https://facebook.com"`}
                        </pre>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', padding: 14, borderRadius: 8 }}>
                        <strong style={{ color: '#3b82f6' }}>🤖 social-media-agent</strong>
                        <pre style={{ marginTop: 6, fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                            {`git clone social-media-agent
yarn install
yarn langgraph:in_mem:up`}
                        </pre>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', padding: 14, borderRadius: 8 }}>
                        <strong style={{ color: '#8b5cf6' }}>🦞 OpenClaw Gateway</strong>
                        <pre style={{ marginTop: 6, fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                            {`npm i -g openclaw@latest
openclaw onboard
openclaw gateway --port 18789`}
                        </pre>
                    </div>
                </div>
            </div>
        </>
    );
}
