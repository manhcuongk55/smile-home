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

const ROOM_TYPE_LABELS: Record<string, string> = {
    STUDIO: 'Phòng Studio',
    ONE_BED: 'Phòng 1 ngủ',
    TWO_BED: 'Phòng 2 ngủ',
    THREE_BED: 'Phòng 3 ngủ',
    PENTHOUSE: 'Penthouse',
    COMMERCIAL: 'Mặt bằng KD',
};

const PLATFORM_TEMPLATES: Record<string, { name: string; icon: string; color: string }> = {
    facebook: { name: 'Facebook', icon: '📘', color: '#1877F2' },
    zalo: { name: 'Zalo', icon: '💬', color: '#0068FF' },
    messenger: { name: 'Messenger', icon: '💜', color: '#A855F7' },
    sms: { name: 'SMS / Tin nhắn', icon: '📱', color: '#10B981' },
};

function formatMoney(n: number) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + ' triệu';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
    return n.toLocaleString('vi-VN') + 'đ';
}

function generatePost(room: VacantRoom, platform: string, contactName: string, contactPhone: string, extras: string) {
    const roomType = ROOM_TYPE_LABELS[room.type] || room.type;
    const price = formatMoney(room.price);
    const location = room.address || room.propertyName;

    if (platform === 'facebook') {
        return `🏠 CHO THUÊ ${roomType.toUpperCase()} GIÁ TỐT 🏠

📍 Vị trí: ${location}
🏢 Tòa nhà: ${room.buildingName} — Phòng ${room.number}
💰 Giá thuê: ${price}/tháng
📐 Diện tích: ${room.area}m²

✅ Ưu điểm:
${extras || '• An ninh 24/7\n• Wifi miễn phí\n• Giờ giấc tự do\n• Gần trường học, siêu thị'}

📞 Liên hệ ngay: ${contactName} — ${contactPhone}
🔥 Phòng đẹp, giá hời — ai nhanh thì được!

#chothue #phongchothue #nhatro #${location.replace(/[^a-zA-ZÀ-ỹ]/g, '').toLowerCase()}`;
    }

    if (platform === 'zalo') {
        return `🏠 Cho thuê ${roomType} — ${price}/tháng

📍 ${location}
🏢 ${room.buildingName} — P.${room.number}
📐 ${room.area}m²

${extras || '✅ An ninh, wifi free, giờ tự do'}

📞 LH: ${contactName} — ${contactPhone}
🔥 Ít phòng, ai nhanh thì được!`;
    }

    if (platform === 'messenger') {
        return `Xin chào! 👋

Mình có phòng cho thuê phù hợp nhé:
🏠 ${roomType} — P.${room.number}, ${room.buildingName}
📍 ${location}
💰 ${price}/tháng | 📐 ${room.area}m²

${extras || 'An ninh, wifi, giờ tự do.'}

Bạn muốn xem phòng không ạ? 😊`;
    }

    // SMS
    return `Cho thue ${roomType} ${room.buildingName} P.${room.number}, ${price}/th, ${room.area}m2. ${location}. LH: ${contactPhone}`;
}

export default function PostGeneratorPage() {
    const [rooms, setRooms] = useState<VacantRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<VacantRoom | null>(null);
    const [platform, setPlatform] = useState('facebook');
    const [contactName, setContactName] = useState('Anh Cường');
    const [contactPhone, setContactPhone] = useState('');
    const [extras, setExtras] = useState('');
    const [generatedPost, setGeneratedPost] = useState('');
    const [copied, setCopied] = useState(false);
    const [bulkMode, setBulkMode] = useState(false);

    const fetchRooms = useCallback(async () => {
        const res = await fetch('/api/vacant-rooms');
        const data = await res.json();
        setRooms(data || []);
        if (data.length > 0 && !selectedRoom) setSelectedRoom(data[0]);
    }, [selectedRoom]);

    useEffect(() => { fetchRooms(); }, [fetchRooms]);

    useEffect(() => {
        if (selectedRoom) {
            setGeneratedPost(generatePost(selectedRoom, platform, contactName, contactPhone, extras));
        }
    }, [selectedRoom, platform, contactName, contactPhone, extras]);

    async function copyPost() {
        await navigator.clipboard.writeText(generatedPost);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    }

    function generateBulkPosts() {
        return rooms.map((room) => generatePost(room, platform, contactName, contactPhone, extras)).join('\n\n' + '═'.repeat(50) + '\n\n');
    }

    async function copyBulk() {
        const text = generateBulkPosts();
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    }

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>🤖 Đăng Bài Tìm Khách</h1>
                    <p>Tạo bài đăng cho Facebook, Zalo, Messenger — tự động lấy dữ liệu phòng trống</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={() => setBulkMode(!bulkMode)}
                        className="btn"
                        style={{ fontSize: '0.8rem', padding: '8px 16px', background: bulkMode ? 'var(--accent-purple)' : 'var(--bg-secondary)', color: bulkMode ? 'white' : 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: 8, cursor: 'pointer' }}
                    >
                        {bulkMode ? '✅ Bulk Mode' : '📦 Bulk Mode'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-label">🏠 Phòng Trống</div>
                    <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>{rooms.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">📋 Nền Tảng</div>
                    <div className="stat-value">{PLATFORM_TEMPLATES[platform]?.icon} {PLATFORM_TEMPLATES[platform]?.name}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">📝 Bài Đăng</div>
                    <div className="stat-value">{bulkMode ? rooms.length : (selectedRoom ? 1 : 0)}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
                {/* Left Panel — Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Platform selector */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, display: 'block' }}>📱 NỀN TẢNG</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {Object.entries(PLATFORM_TEMPLATES).map(([key, val]) => (
                                <button
                                    key={key}
                                    onClick={() => setPlatform(key)}
                                    style={{
                                        padding: '10px 8px',
                                        background: platform === key ? val.color : 'var(--bg-secondary)',
                                        color: platform === key ? 'white' : 'var(--text-primary)',
                                        border: 'none',
                                        borderRadius: 8,
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: platform === key ? 700 : 400,
                                        transition: 'all 200ms ease',
                                    }}
                                >
                                    {val.icon} {val.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contact info */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, display: 'block' }}>📞 THÔNG TIN LIÊN HỆ</label>
                        <input
                            type="text"
                            placeholder="Tên liên hệ"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', marginBottom: 8, fontSize: '0.85rem' }}
                        />
                        <input
                            type="tel"
                            placeholder="Số điện thoại"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', fontSize: '0.85rem' }}
                        />
                    </div>

                    {/* Extras */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, display: 'block' }}>✍️ THÊM ƯU ĐIỂM</label>
                        <textarea
                            placeholder="• An ninh 24/7&#10;• Wifi miễn phí&#10;• Gần siêu thị"
                            value={extras}
                            onChange={(e) => setExtras(e.target.value)}
                            rows={4}
                            style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', fontSize: '0.85rem', resize: 'vertical' }}
                        />
                    </div>

                    {/* Room selector (single mode) */}
                    {!bulkMode && (
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, display: 'block' }}>🏠 CHỌN PHÒNG</label>
                            {rooms.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Không có phòng trống</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                                    {rooms.map((room) => (
                                        <button
                                            key={room.id}
                                            onClick={() => setSelectedRoom(room)}
                                            style={{
                                                padding: '8px 12px',
                                                background: selectedRoom?.id === room.id ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                                                color: selectedRoom?.id === room.id ? 'white' : 'var(--text-primary)',
                                                border: 'none',
                                                borderRadius: 6,
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                fontSize: '0.8rem',
                                            }}
                                        >
                                            <strong>P.{room.number}</strong> — {formatMoney(room.price)}/th — {room.area}m²
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Panel — Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 20, flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: '1.2rem' }}>{PLATFORM_TEMPLATES[platform]?.icon}</span>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Xem trước bài đăng — {PLATFORM_TEMPLATES[platform]?.name}</span>
                            </div>
                            <button
                                onClick={bulkMode ? copyBulk : copyPost}
                                style={{
                                    padding: '8px 20px',
                                    background: copied ? 'var(--accent-emerald)' : PLATFORM_TEMPLATES[platform]?.color || 'var(--accent-blue)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    transition: 'all 200ms ease',
                                }}
                            >
                                {copied ? '✅ Đã copy!' : `📋 Copy ${bulkMode ? `(${rooms.length} bài)` : 'bài đăng'}`}
                            </button>
                        </div>
                        <div style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: 12,
                            padding: 20,
                            whiteSpace: 'pre-wrap',
                            fontSize: '0.85rem',
                            lineHeight: 1.7,
                            color: 'var(--text-primary)',
                            maxHeight: 500,
                            overflowY: 'auto',
                            border: '1px solid var(--border-subtle)',
                        }}>
                            {bulkMode ? generateBulkPosts() : generatedPost}
                        </div>
                    </div>

                    {/* Quick tips */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', marginBottom: 8 }}>💡 Mẹo đăng bài hiệu quả</h4>
                        <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0, paddingLeft: 16 }}>
                            <li>Đăng vào <strong>7h-9h sáng</strong> hoặc <strong>20h-22h tối</strong> — nhiều người online nhất</li>
                            <li>Kèm <strong>3-5 ảnh thực tế</strong> phòng sẽ tăng tỷ lệ liên hệ ~3x</li>
                            <li>Đăng vào các group <strong>Tìm phòng trọ + tên quận/phường</strong> gần nhà</li>
                            <li>Trả lời comment <strong>trong 5 phút đầu</strong> để bài được đẩy lên top</li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}
