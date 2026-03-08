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

const ROOM_TYPE_VI: Record<string, string> = {
    STUDIO: 'Phòng Studio', ONE_BED: '1PN', TWO_BED: '2PN',
    THREE_BED: '3PN', PENTHOUSE: 'Penthouse', COMMERCIAL: 'Mặt bằng',
};

function money(n: number) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + ' triệu';
    if (n >= 1000) return Math.round(n / 1000) + 'k';
    return n.toLocaleString('vi-VN') + 'đ';
}

function buildPostText(r: VacantRoom, contact: string, phone: string, extras: string) {
    return `🏠 CHO THUÊ ${(ROOM_TYPE_VI[r.type] || r.type).toUpperCase()} — GIÁ TỐT!\n\n📍 ${r.address || r.propertyName}\n🏢 ${r.buildingName} — P.${r.number}\n💰 ${money(r.price)}/tháng | 📐 ${r.area}m²\n\n${extras || '✅ An ninh 24/7 ✅ Wifi free ✅ Giờ tự do'}\n\n📞 LH: ${contact} — ${phone}\n🔥 Phòng đẹp — ai nhanh thì được!\n\n#chothue #phongtro #nhatro`;
}

// One-click share openers
function shareFacebook(text: string, url: string) {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    window.open(fbUrl, '_blank', 'width=600,height=500');
}

function shareZalo(text: string, url: string) {
    const zaloUrl = `https://zalo.me/share?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text.substring(0, 200))}`;
    window.open(zaloUrl, '_blank', 'width=600,height=500');
}

function shareMessenger(text: string, url: string) {
    const messengerUrl = `fb-messenger://share?link=${encodeURIComponent(url)}&app_id=0`;
    window.open(messengerUrl, '_blank');
    // Fallback for desktop
    setTimeout(() => {
        window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=0&redirect_uri=${encodeURIComponent(url)}`, '_blank', 'width=600,height=500');
    }, 1000);
}

function shareSMS(text: string) {
    window.open(`sms:?body=${encodeURIComponent(text)}`, '_blank');
}

function shareWhatsApp(text: string) {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'width=600,height=500');
}

function shareTwitter(text: string, url: string) {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text.substring(0, 240))}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=500');
}

const SHARE_PLATFORMS = [
    { key: 'facebook', name: 'Facebook', icon: '📘', color: '#1877F2', action: shareFacebook },
    { key: 'zalo', name: 'Zalo', icon: '💬', color: '#0068FF', action: shareZalo },
    { key: 'messenger', name: 'Messenger', icon: '💜', color: '#A855F7', action: shareMessenger },
    { key: 'whatsapp', name: 'WhatsApp', icon: '🟢', color: '#25D366', action: shareWhatsApp },
    { key: 'twitter', name: 'X/Twitter', icon: '🐦', color: '#1DA1F2', action: shareTwitter },
];

export default function AutoPostPage() {
    const [rooms, setRooms] = useState<VacantRoom[]>([]);
    const [contact, setContact] = useState('Anh Cường');
    const [phone, setPhone] = useState('');
    const [extras, setExtras] = useState('');
    const [postedMap, setPostedMap] = useState<Record<string, string[]>>({});
    const [autoPosting, setAutoPosting] = useState(false);
    const [autoProgress, setAutoProgress] = useState(0);
    const [district, setDistrict] = useState('Hà Nội');

    const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

    const fetchRooms = useCallback(async () => {
        const res = await fetch('/api/vacant-rooms');
        setRooms(await res.json());
    }, []);

    useEffect(() => { fetchRooms(); }, [fetchRooms]);

    function getListingUrl(roomId: string) {
        return `${BASE_URL}/listings#${roomId}`;
    }

    function shareRoom(room: VacantRoom, platformKey: string) {
        const text = buildPostText(room, contact, phone, extras);
        const url = getListingUrl(room.id);
        const platform = SHARE_PLATFORMS.find((p) => p.key === platformKey);

        if (platformKey === 'sms') {
            shareSMS(text);
        } else if (platform) {
            platform.action(text, url);
        }

        setPostedMap((prev) => ({
            ...prev,
            [room.id]: [...new Set([...(prev[room.id] || []), platformKey])],
        }));
    }

    async function autoPostAll(platformKey: string) {
        setAutoPosting(true);
        setAutoProgress(0);
        for (let i = 0; i < rooms.length; i++) {
            shareRoom(rooms[i], platformKey);
            setAutoProgress(i + 1);
            // Delay between opens to avoid browser blocking
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        setAutoPosting(false);
    }

    const totalPosted = Object.values(postedMap).filter((v) => v.length > 0).length;

    const GROUP_SUGGESTIONS = [
        `🏘️ Tìm phòng trọ ${district}`,
        `🏠 Cho thuê phòng ${district}`,
        `📣 Nhà trọ & CCMN ${district}`,
        `🎓 SV tìm phòng ${district}`,
        `💼 Nhân viên VP tìm phòng ${district}`,
    ];

    return (
        <>
            <div className="page-header">
                <div>
                    <h1>🚀 Tự Động Đăng Bài Tìm Khách</h1>
                    <p>Bấm 1 nút → Mở thẳng Facebook/Zalo → Bài viết soạn sẵn → Chỉ cần bấm &quot;Đăng&quot;</p>
                </div>
            </div>

            {/* Flow diagram */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
                {['🏠 Phòng trống', '→', '🤖 Auto soạn bài', '→', '📲 Mở MXH', '→', '✅ Bấm Đăng', '→', '📞 Khách gọi', '→', '🤝 Sale chốt'].map((step, i) => (
                    <span key={i} style={{
                        padding: step === '→' ? '0 4px' : '6px 14px',
                        background: step === '→' ? 'transparent' : 'var(--bg-card)',
                        border: step === '→' ? 'none' : '1px solid var(--border-subtle)',
                        borderRadius: 99, fontSize: '0.75rem', fontWeight: 600,
                        color: step === '→' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    }}>{step}</span>
                ))}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
                <div className="stat-card"><div className="stat-label">🏠 Phòng trống</div><div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{rooms.length}</div></div>
                <div className="stat-card"><div className="stat-label">✅ Đã đăng</div><div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>{totalPosted}</div></div>
                <div className="stat-card"><div className="stat-label">⏳ Chưa đăng</div><div className="stat-value" style={{ color: 'var(--accent-amber)' }}>{rooms.length - totalPosted}</div></div>
                <div className="stat-card"><div className="stat-label">📊 Tỷ lệ</div><div className="stat-value" style={{ color: totalPosted === rooms.length ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>{rooms.length > 0 ? Math.round((totalPosted / rooms.length) * 100) : 0}%</div></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
                {/* Left: Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8, display: 'block', textTransform: 'uppercase' }}>📞 Thông tin sale</label>
                        <input type="text" placeholder="Tên" value={contact} onChange={(e) => setContact(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', marginBottom: 6, fontSize: '0.82rem' }} />
                        <input type="tel" placeholder="SĐT" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', marginBottom: 6, fontSize: '0.82rem' }} />
                        <input type="text" placeholder="Khu vực" value={district} onChange={(e) => setDistrict(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', fontSize: '0.82rem' }} />
                    </div>

                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8, display: 'block', textTransform: 'uppercase' }}>✍️ Ưu điểm phòng</label>
                        <textarea placeholder="✅ An ninh 24/7&#10;✅ Wifi free" value={extras} onChange={(e) => setExtras(e.target.value)} rows={3} style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', fontSize: '0.82rem', resize: 'vertical' }} />
                    </div>

                    {/* Auto-post ALL buttons */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                        <label style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', fontWeight: 700, marginBottom: 10, display: 'block' }}>⚡ ĐĂNG TẤT CẢ — 1 NÚT</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {SHARE_PLATFORMS.filter((p) => ['facebook', 'zalo', 'whatsapp'].includes(p.key)).map((p) => (
                                <button key={p.key} onClick={() => autoPostAll(p.key)} disabled={autoPosting || rooms.length === 0}
                                    style={{ padding: '10px 12px', background: p.color, color: 'white', border: 'none', borderRadius: 8, cursor: autoPosting ? 'wait' : 'pointer', fontWeight: 700, fontSize: '0.82rem', opacity: autoPosting ? 0.6 : 1 }}>
                                    {autoPosting ? `⏳ Đang đăng ${autoProgress}/${rooms.length}...` : `${p.icon} Đăng TẤT CẢ lên ${p.name}`}
                                </button>
                            ))}
                        </div>
                        {autoPosting && (
                            <div style={{ marginTop: 8, height: 4, background: 'var(--bg-secondary)', borderRadius: 99, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${(autoProgress / rooms.length) * 100}%`, background: 'var(--accent-emerald)', transition: 'width 300ms ease' }} />
                            </div>
                        )}
                    </div>

                    {/* Group suggestions */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8, display: 'block' }}>💡 GROUP FB NÊN ĐĂNG</label>
                        {GROUP_SUGGESTIONS.map((g, i) => (
                            <a key={i} href={`https://www.facebook.com/search/groups/?q=${encodeURIComponent(g)}`} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '5px 0', fontSize: '0.73rem', color: 'var(--accent-blue)', textDecoration: 'underline', borderBottom: '1px solid var(--border-subtle)' }}>
                                {g}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Right: Room cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {rooms.length === 0 ? (
                        <div className="empty-state"><div className="empty-icon">🏠</div><h3>Không có phòng trống</h3><p>Tất cả phòng đã có khách!</p></div>
                    ) : rooms.map((room) => {
                        const posted = postedMap[room.id] || [];
                        const postText = buildPostText(room, contact, phone, extras);
                        return (
                            <div key={room.id} style={{ background: 'var(--bg-card)', border: `1px solid ${posted.length > 0 ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: '1rem' }}>🏠</span>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>P.{room.number} — {room.buildingName}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ROOM_TYPE_VI[room.type]} | {money(room.price)}/th | {room.area}m²</div>
                                        </div>
                                        {posted.length > 0 && (
                                            <span style={{ fontSize: '0.65rem', background: 'var(--accent-emerald)', color: 'white', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>✅ Đã đăng {posted.length} MXH</span>
                                        )}
                                    </div>
                                    {/* Share buttons */}
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        {SHARE_PLATFORMS.map((p) => (
                                            <button key={p.key} onClick={() => shareRoom(room, p.key)} title={`Đăng lên ${p.name}`}
                                                style={{
                                                    width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer',
                                                    background: posted.includes(p.key) ? 'var(--accent-emerald)' : p.color,
                                                    color: 'white', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms ease',
                                                }}>
                                                {posted.includes(p.key) ? '✅' : p.icon}
                                            </button>
                                        ))}
                                        <button onClick={() => shareSMS(postText)} title="Gửi SMS" style={{ width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer', background: '#10B981', color: 'white', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            📱
                                        </button>
                                    </div>
                                </div>
                                <div style={{ padding: '10px 14px', whiteSpace: 'pre-wrap', fontSize: '0.75rem', lineHeight: 1.6, color: 'var(--text-secondary)', maxHeight: 120, overflowY: 'auto' }}>
                                    {postText}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Posting strategy */}
            <div style={{ marginTop: 24, background: 'var(--bg-card)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-md)', padding: 18 }}>
                <h4 style={{ fontSize: '0.82rem', color: 'var(--accent-amber)', marginBottom: 10 }}>⏰ Lịch Đăng Bài Tự Động Hàng Ngày</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 8 }}>
                        <strong style={{ color: 'var(--accent-amber)' }}>🌅 Sáng 7h-9h</strong>
                        <p style={{ marginTop: 4, lineHeight: 1.5 }}>Facebook Groups + Zalo OA<br />Dân văn phòng lướt MXH trước giờ làm</p>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 8 }}>
                        <strong style={{ color: 'var(--accent-blue)' }}>🌞 Trưa 11h30-13h</strong>
                        <p style={{ marginTop: 4, lineHeight: 1.5 }}>Facebook Marketplace<br />Giờ nghỉ trưa = peak engagement</p>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 8 }}>
                        <strong style={{ color: 'var(--accent-purple)' }}>🌙 Tối 20h-22h</strong>
                        <p style={{ marginTop: 4, lineHeight: 1.5 }}>TikTok + WhatsApp + Messenger<br />Peak online = nhiều người xem nhất</p>
                    </div>
                </div>
            </div>
        </>
    );
}
