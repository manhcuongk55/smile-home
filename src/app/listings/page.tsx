'use client';

import { useState, useEffect, useCallback } from 'react';

interface Listing {
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

function money(n: number) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + ' triệu/tháng';
    if (n >= 1000) return Math.round(n / 1000) + 'k/tháng';
    return n.toLocaleString('vi-VN') + 'đ/tháng';
}

export default function ListingsPage() {
    const [listings, setListings] = useState<Listing[]>([]);

    const fetchListings = useCallback(async () => {
        const res = await fetch('/api/vacant-rooms');
        setListings(await res.json());
    }, []);

    useEffect(() => { fetchListings(); }, [fetchListings]);

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-emerald))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    🏠 Phòng Cho Thuê
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Xgate Property — Phòng đẹp, giá tốt, an ninh</p>
                <div style={{ marginTop: 16, display: 'flex', gap: 20, justifyContent: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>🏠 {listings.length} phòng trống</span>
                    <span>✅ An ninh 24/7</span>
                    <span>📶 Wifi miễn phí</span>
                </div>
            </div>

            {listings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60 }}>
                    <div style={{ fontSize: '3rem' }}>🎉</div>
                    <h3 style={{ marginTop: 12 }}>Hiện tại hết phòng trống</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Vui lòng quay lại sau!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 16 }}>
                    {listings.map((room) => (
                        <div key={room.id} id={room.id} style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-lg)', padding: 24, transition: 'all 300ms ease',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                                <div>
                                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 6 }}>
                                        🏠 {ROOM_TYPE_VI[room.type] || room.type} — P.{room.number}
                                    </h2>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        🏢 {room.buildingName} • 📍 {room.address || room.propertyName}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{money(room.price)}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📐 {room.area}m²</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                                {['An ninh 24/7', 'Wifi free', 'Giờ tự do', 'Gần chợ/trường'].map((tag) => (
                                    <span key={tag} style={{ padding: '4px 12px', background: 'var(--bg-secondary)', borderRadius: 99, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>✅ {tag}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ textAlign: 'center', marginTop: 40, padding: 20, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <p>Powered by <strong>Xgate</strong> — Property Operation System</p>
            </div>
        </div>
    );
}
