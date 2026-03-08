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
    STUDIO: 'Phòng Studio', ONE_BED: '1 Phòng ngủ', TWO_BED: '2 Phòng ngủ',
    THREE_BED: '3 Phòng ngủ', PENTHOUSE: 'Penthouse', COMMERCIAL: 'Mặt bằng KD',
};

const PLATFORMS = [
    { key: 'facebook', name: 'Facebook', icon: '📘', color: '#1877F2' },
    { key: 'zalo', name: 'Zalo OA', icon: '💬', color: '#0068FF' },
    { key: 'tiktok', name: 'TikTok', icon: '🎵', color: '#EE1D52' },
    { key: 'groups', name: 'FB Groups', icon: '👥', color: '#42B72A' },
];

const GROUP_TARGETS = [
    '🏘️ Tìm phòng trọ {district}',
    '🏠 Cho thuê phòng {district}',
    '📣 Nhà trọ & phòng cho thuê HN/SG',
    '🎓 Sinh viên tìm phòng {district}',
    '💼 Nhân viên VP tìm phòng {district}',
];

function money(n: number) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + ' triệu';
    if (n >= 1000) return Math.round(n / 1000) + 'k';
    return n.toLocaleString('vi-VN') + 'đ';
}

function genFB(r: VacantRoom, contact: string, phone: string, extras: string) {
    return `🏠 CHO THUÊ ${(ROOM_TYPE_VI[r.type] || r.type).toUpperCase()} — GIÁ CỰC TỐT! 🔥

📍 ${r.address || r.propertyName}
🏢 ${r.buildingName} — Phòng ${r.number}
💰 ${money(r.price)}/tháng
📐 ${r.area}m²

${extras || `✅ An ninh 24/7
✅ Wifi tốc độ cao miễn phí
✅ Giờ giấc tự do
✅ Gần trường học, siêu thị, bệnh viện`}

📞 Liên hệ NGAY: ${contact} — ${phone}
🔥 SỐ LƯỢNG CÓ HẠN — Ai nhanh thì được!

#chothue #phongtro #nhatro #${(r.address || '').replace(/[^a-zA-ZÀ-ỹ0-9]/g, '').toLowerCase()} #timphong`;
}

function genZalo(r: VacantRoom, contact: string, phone: string, extras: string) {
    return `🏠 Cho thuê ${ROOM_TYPE_VI[r.type] || r.type} giá tốt!

📍 ${r.address || r.propertyName}
🏢 ${r.buildingName} — P.${r.number}
💰 ${money(r.price)}/th | 📐 ${r.area}m²

${extras || '✅ An ninh, wifi free, giờ tự do, gần trường & chợ'}

📞 ${contact}: ${phone}
💬 Nhắn tin Zalo để xem phòng ngay!`;
}

function genTikTok(r: VacantRoom, contact: string, phone: string) {
    return `🏠 Phòng đẹp giá rẻ ${money(r.price)}/tháng!
📍 ${r.address || r.propertyName}
📐 ${r.area}m² | ${ROOM_TYPE_VI[r.type] || r.type}
📞 LH: ${contact} ${phone}

#phongchothue #nhatro #timphongtro #phongtrogiare #${(r.address || 'hanoi').replace(/[^a-zA-ZÀ-ỹ]/g, '').toLowerCase()}`;
}

function genGroups(r: VacantRoom, contact: string, phone: string, extras: string) {
    return `📢 PHÒNG TRỐNG — CẦN CHO THUÊ GẤP!

🏠 ${ROOM_TYPE_VI[r.type] || r.type} — ${r.buildingName}, P.${r.number}
📍 ${r.address || r.propertyName}
💰 Giá: ${money(r.price)}/tháng (thương lượng)
📐 DT: ${r.area}m²

${extras || `👉 An ninh camera 24/7
👉 Wifi miễn phí
👉 Tự do giờ giấc
👉 Đầy đủ nội thất cơ bản`}

☎️ Liên hệ: ${contact} — ${phone}
💬 Comment SĐT hoặc inbox để nhận thêm ảnh phòng!`;
}

function generateForPlatform(r: VacantRoom, platform: string, contact: string, phone: string, extras: string) {
    switch (platform) {
        case 'facebook': return genFB(r, contact, phone, extras);
        case 'zalo': return genZalo(r, contact, phone, extras);
        case 'tiktok': return genTikTok(r, contact, phone);
        case 'groups': return genGroups(r, contact, phone, extras);
        default: return genFB(r, contact, phone, extras);
    }
}

export default function SaleCampaignPage() {
    const [rooms, setRooms] = useState<VacantRoom[]>([]);
    const [contact, setContact] = useState('Anh Cường');
    const [phone, setPhone] = useState('');
    const [extras, setExtras] = useState('');
    const [activePlatform, setActivePlatform] = useState('facebook');
    const [postedMap, setPostedMap] = useState<Record<string, string[]>>({});
    const [copiedId, setCopiedId] = useState('');
    const [district, setDistrict] = useState('Hà Nội');

    const fetchRooms = useCallback(async () => {
        const res = await fetch('/api/vacant-rooms');
        const data = await res.json();
        setRooms(data || []);
    }, []);

    useEffect(() => { fetchRooms(); }, [fetchRooms]);

    async function copyPost(roomId: string, text: string) {
        await navigator.clipboard.writeText(text);
        setCopiedId(roomId);
        setPostedMap((prev) => ({
            ...prev,
            [roomId]: [...(prev[roomId] || []), activePlatform],
        }));
        setTimeout(() => setCopiedId(''), 2000);
    }

    async function copyAll() {
        const allPosts = rooms.map((r) => generateForPlatform(r, activePlatform, contact, phone, extras)).join('\n\n' + '━'.repeat(40) + '\n\n');
        await navigator.clipboard.writeText(allPosts);
        setCopiedId('ALL');
        rooms.forEach((r) => {
            setPostedMap((prev) => ({
                ...prev,
                [r.id]: [...new Set([...(prev[r.id] || []), activePlatform])],
            }));
        });
        setTimeout(() => setCopiedId(''), 3000);
    }

    const totalPosted = Object.values(postedMap).filter((v) => v.length > 0).length;
    const notPosted = rooms.length - totalPosted;
    const platformInfo = PLATFORMS.find((p) => p.key === activePlatform) || PLATFORMS[0];

    return (
        <>
            <div className="page-header">
                <div>
                    <h1>🚀 Chiến Dịch Tìm Khách Tự Động</h1>
                    <p>Lấy dữ liệu phòng trống → tạo bài đăng → đăng lên MXH → thu lead cho sales</p>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-label">🏠 Phòng Trống</div>
                    <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{rooms.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">✅ Đã Đăng</div>
                    <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>{totalPosted}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">⏳ Chưa Đăng</div>
                    <div className="stat-value" style={{ color: 'var(--accent-amber)' }}>{notPosted}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">📱 Nền Tảng</div>
                    <div className="stat-value">{platformInfo.icon} {platformInfo.name}</div>
                </div>
            </div>

            {/* Workflow Steps */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {['1️⃣ Chọn nền tảng', '2️⃣ Điền liên hệ', '3️⃣ Copy bài → Paste vào group', '4️⃣ Khách inbox/gọi → Sale chốt'].map((step, i) => (
                    <div key={i} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {step}
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
                {/* Left — Config */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Platform */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8, display: 'block', textTransform: 'uppercase' }}>📱 Nền tảng MXH</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                            {PLATFORMS.map((p) => (
                                <button key={p.key} onClick={() => setActivePlatform(p.key)} style={{
                                    padding: '10px 6px', background: activePlatform === p.key ? p.color : 'var(--bg-secondary)',
                                    color: activePlatform === p.key ? 'white' : 'var(--text-primary)',
                                    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem',
                                    fontWeight: activePlatform === p.key ? 700 : 400, transition: 'all 150ms ease',
                                }}>
                                    {p.icon} {p.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8, display: 'block', textTransform: 'uppercase' }}>📞 Thông tin sale</label>
                        <input type="text" placeholder="Tên sale" value={contact} onChange={(e) => setContact(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', marginBottom: 6, fontSize: '0.82rem' }} />
                        <input type="tel" placeholder="SĐT" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', marginBottom: 6, fontSize: '0.82rem' }} />
                        <input type="text" placeholder="Quận / Khu vực" value={district} onChange={(e) => setDistrict(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', fontSize: '0.82rem' }} />
                    </div>

                    {/* Extras */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8, display: 'block', textTransform: 'uppercase' }}>✍️ Ưu điểm chung</label>
                        <textarea placeholder="✅ An ninh 24/7&#10;✅ Wifi miễn phí&#10;✅ Gần Metro / siêu thị" value={extras} onChange={(e) => setExtras(e.target.value)} rows={4} style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', fontSize: '0.82rem', resize: 'vertical' }} />
                    </div>

                    {/* Suggested groups */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                        <label style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', fontWeight: 700, marginBottom: 8, display: 'block' }}>💡 GROUP NÊN ĐĂNG</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {GROUP_TARGETS.map((g, i) => (
                                <div key={i} style={{ fontSize: '0.75rem', padding: '4px 0', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                                    {g.replace('{district}', district)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Copy All button */}
                    <button onClick={copyAll} style={{
                        padding: '12px 0', background: copiedId === 'ALL' ? 'var(--accent-emerald)' : platformInfo.color,
                        color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem',
                        cursor: 'pointer', transition: 'all 200ms ease',
                    }}>
                        {copiedId === 'ALL' ? '✅ Đã copy tất cả!' : `📋 Copy ALL (${rooms.length} bài)`}
                    </button>
                </div>

                {/* Right — Room Posts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {rooms.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🏠</div>
                            <h3>Không có phòng trống</h3>
                            <p>Tất cả phòng đã có khách thuê!</p>
                        </div>
                    ) : rooms.map((room) => {
                        const posted = postedMap[room.id] || [];
                        const postText = generateForPlatform(room, activePlatform, contact, phone, extras);
                        const isCopied = copiedId === room.id;

                        return (
                            <div key={room.id} style={{
                                background: 'var(--bg-card)',
                                border: `1px solid ${posted.includes(activePlatform) ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                transition: 'all 200ms ease',
                            }}>
                                {/* Room header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: '1rem' }}>🏠</span>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>P.{room.number} — {room.buildingName}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ROOM_TYPE_VI[room.type] || room.type} | {money(room.price)}/th | {room.area}m²</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        {posted.length > 0 && (
                                            <div style={{ display: 'flex', gap: 2 }}>
                                                {posted.map((p) => {
                                                    const pl = PLATFORMS.find((x) => x.key === p);
                                                    return <span key={p} title={`Đã đăng ${pl?.name}`} style={{ fontSize: '0.8rem' }}>{pl?.icon}</span>;
                                                })}
                                            </div>
                                        )}
                                        <button onClick={() => copyPost(room.id, postText)} style={{
                                            padding: '6px 14px',
                                            background: isCopied ? 'var(--accent-emerald)' : platformInfo.color,
                                            color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer',
                                            fontSize: '0.72rem', fontWeight: 700, transition: 'all 150ms ease',
                                        }}>
                                            {isCopied ? '✅ Copied!' : `📋 Copy ${platformInfo.name}`}
                                        </button>
                                    </div>
                                </div>
                                {/* Post preview */}
                                <div style={{ padding: '12px 16px', whiteSpace: 'pre-wrap', fontSize: '0.78rem', lineHeight: 1.65, color: 'var(--text-secondary)', maxHeight: 180, overflowY: 'auto' }}>
                                    {postText}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Posting tips */}
            <div style={{ marginTop: 24, background: 'var(--bg-card)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-md)', padding: 20 }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', marginBottom: 12 }}>🎯 Chiến Lược Đăng Bài Hiệu Quả Cho Sales</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <div>
                        <strong>⏰ Thời gian vàng:</strong>
                        <ul style={{ margin: '4px 0', paddingLeft: 16, lineHeight: 1.7 }}>
                            <li>Sáng: <strong>7h-9h</strong> (dân văn phòng lướt)</li>
                            <li>Trưa: <strong>11h30-13h</strong> (giờ nghỉ)</li>
                            <li>Tối: <strong>20h-22h</strong> (peak online)</li>
                        </ul>
                    </div>
                    <div>
                        <strong>📸 Content mạnh:</strong>
                        <ul style={{ margin: '4px 0', paddingLeft: 16, lineHeight: 1.7 }}>
                            <li>Kèm <strong>5+ ảnh thật</strong> phòng</li>
                            <li>Video 15s Reels/TikTok tour phòng</li>
                            <li>Caption có <strong>giá + địa chỉ</strong> ngay dòng đầu</li>
                        </ul>
                    </div>
                    <div>
                        <strong>🎯 Đăng ở đâu:</strong>
                        <ul style={{ margin: '4px 0', paddingLeft: 16, lineHeight: 1.7 }}>
                            <li>5-10 group FB quận/huyện gần nhà</li>
                            <li>Marketplace Facebook</li>
                            <li>TikTok + hashtag địa phương</li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}
