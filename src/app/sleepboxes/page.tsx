'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

interface Sleepbox {
    id: string;
    name: string;
    type: 'SLEEPBOX' | 'BUNK_BED' | 'CAPSULE';
    location: string;
    pricePerHour: number;
    pricePerNight: number;
    status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
    amenities: string[];
    capacity: number;
    rating: number;
    imageEmoji: string;
}

const DEMO_SLEEPBOXES: Sleepbox[] = [
    {
        id: 'sb-001', name: 'Sleepbox Premium A1', type: 'SLEEPBOX',
        location: 'Tầng 1 - Khu A', pricePerHour: 50000, pricePerNight: 250000,
        status: 'AVAILABLE', amenities: ['WiFi', 'Điều hòa', 'Ổ cắm USB', 'Đèn đọc sách', 'Tủ khóa'],
        capacity: 1, rating: 4.8, imageEmoji: '🛏️',
    },
    {
        id: 'sb-002', name: 'Sleepbox Standard B2', type: 'SLEEPBOX',
        location: 'Tầng 1 - Khu B', pricePerHour: 35000, pricePerNight: 180000,
        status: 'OCCUPIED', amenities: ['WiFi', 'Quạt', 'Ổ cắm USB', 'Tủ khóa'],
        capacity: 1, rating: 4.5, imageEmoji: '🛌',
    },
    {
        id: 'sb-003', name: 'Giường Tầng Đôi C1', type: 'BUNK_BED',
        location: 'Tầng 2 - Khu C', pricePerHour: 25000, pricePerNight: 120000,
        status: 'AVAILABLE', amenities: ['WiFi', 'Quạt', 'Ổ cắm sạc', 'Rèm riêng tư'],
        capacity: 2, rating: 4.2, imageEmoji: '🛏️',
    },
    {
        id: 'sb-004', name: 'Capsule Deluxe D1', type: 'CAPSULE',
        location: 'Tầng 1 - Khu D', pricePerHour: 60000, pricePerNight: 300000,
        status: 'RESERVED', amenities: ['WiFi', 'Điều hòa', 'TV mini', 'Ổ cắm USB', 'Tủ khóa', 'Gương'],
        capacity: 1, rating: 4.9, imageEmoji: '💊',
    },
    {
        id: 'sb-005', name: 'Giường Tầng Ba E1', type: 'BUNK_BED',
        location: 'Tầng 2 - Khu E', pricePerHour: 20000, pricePerNight: 95000,
        status: 'AVAILABLE', amenities: ['WiFi', 'Quạt', 'Ổ cắm sạc'],
        capacity: 3, rating: 4.0, imageEmoji: '🏨',
    },
    {
        id: 'sb-006', name: 'Sleepbox VIP F1', type: 'SLEEPBOX',
        location: 'Tầng 1 - Khu F (VIP)', pricePerHour: 80000, pricePerNight: 400000,
        status: 'MAINTENANCE', amenities: ['WiFi 5G', 'Điều hòa', 'TV 24"', 'Minibar', 'Ổ cắm USB-C', 'Tủ khóa vân tay', 'Loa Bluetooth'],
        capacity: 1, rating: 5.0, imageEmoji: '👑',
    },
    {
        id: 'sb-007', name: 'Capsule Economy G1', type: 'CAPSULE',
        location: 'Tầng 3 - Khu G', pricePerHour: 30000, pricePerNight: 150000,
        status: 'AVAILABLE', amenities: ['WiFi', 'Điều hòa', 'Ổ cắm USB', 'Rèm riêng tư'],
        capacity: 1, rating: 4.3, imageEmoji: '🏠',
    },
    {
        id: 'sb-008', name: 'Giường Tầng Nữ H1', type: 'BUNK_BED',
        location: 'Tầng 2 - Khu H (Nữ)', pricePerHour: 25000, pricePerNight: 120000,
        status: 'OCCUPIED', amenities: ['WiFi', 'Điều hòa', 'Ổ cắm USB', 'Rèm riêng tư', 'Tủ khóa', 'Gương trang điểm'],
        capacity: 4, rating: 4.6, imageEmoji: '🌸',
    },
    {
        id: 'sb-009', name: 'Sleepbox Couple I1', type: 'SLEEPBOX',
        location: 'Tầng 1 - Khu I', pricePerHour: 70000, pricePerNight: 350000,
        status: 'AVAILABLE', amenities: ['WiFi', 'Điều hòa', 'TV', 'Ổ cắm USB', 'Tủ khóa', 'Đèn mood'],
        capacity: 2, rating: 4.7, imageEmoji: '💑',
    },
    {
        id: 'sb-010', name: 'Capsule Worker J1', type: 'CAPSULE',
        location: 'Tầng 3 - Khu J', pricePerHour: 20000, pricePerNight: 85000,
        status: 'AVAILABLE', amenities: ['WiFi', 'Quạt', 'Ổ cắm sạc', 'Bàn làm việc mini'],
        capacity: 1, rating: 4.1, imageEmoji: '💼',
    },
];

const TYPE_LABELS: Record<string, string> = {
    SLEEPBOX: 'Sleepbox',
    BUNK_BED: 'Giường tầng',
    CAPSULE: 'Capsule',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    AVAILABLE: { label: 'Còn trống', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
    OCCUPIED: { label: 'Đang sử dụng', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
    MAINTENANCE: { label: 'Bảo trì', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    RESERVED: { label: 'Đã đặt', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
};

function formatVND(n: number) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'tr';
    if (n >= 1000) return Math.round(n / 1000) + 'k';
    return n.toLocaleString('vi-VN') + 'đ';
}

export default function SleepboxesPage() {
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedBox, setSelectedBox] = useState<Sleepbox | null>(null);
    const { t } = useLanguage();

    const filtered = DEMO_SLEEPBOXES.filter((box) => {
        if (typeFilter !== 'ALL' && box.type !== typeFilter) return false;
        if (statusFilter !== 'ALL' && box.status !== statusFilter) return false;
        return true;
    });

    const stats = {
        total: DEMO_SLEEPBOXES.length,
        available: DEMO_SLEEPBOXES.filter(b => b.status === 'AVAILABLE').length,
        occupied: DEMO_SLEEPBOXES.filter(b => b.status === 'OCCUPIED').length,
        revenue: DEMO_SLEEPBOXES.filter(b => b.status === 'OCCUPIED').reduce((s, b) => s + b.pricePerNight, 0),
    };

    return (
        <>
            <div className="page-header">
                <h1>🛏️ Sleepbox & Giường Tầng</h1>
                <p>Quản lý hệ thống chỗ ở ngắn hạn — Sleepbox, Capsule, Giường tầng</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Tổng chỗ', value: stats.total, icon: '🏨', color: 'var(--accent-blue)' },
                    { label: 'Còn trống', value: stats.available, icon: '✅', color: 'var(--accent-emerald)' },
                    { label: 'Đang sử dụng', value: stats.occupied, icon: '🔑', color: 'var(--accent-purple)' },
                    { label: 'Doanh thu/đêm', value: formatVND(stats.revenue), icon: '💰', color: '#f59e0b' },
                ].map((stat) => (
                    <div key={stat.label} style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-lg)', padding: '20px 24px',
                        display: 'flex', alignItems: 'center', gap: 16,
                    }}>
                        <div style={{ fontSize: '2rem' }}>{stat.icon}</div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <div className="tabs">
                    {['ALL', 'SLEEPBOX', 'BUNK_BED', 'CAPSULE'].map((type) => (
                        <button
                            key={type}
                            className={`tab ${typeFilter === type ? 'active' : ''}`}
                            onClick={() => setTypeFilter(type)}
                        >
                            {type === 'ALL' ? 'Tất cả' : TYPE_LABELS[type]}
                        </button>
                    ))}
                </div>
                <div className="tabs">
                    {['ALL', 'AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'].map((status) => (
                        <button
                            key={status}
                            className={`tab ${statusFilter === status ? 'active' : ''}`}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status === 'ALL' ? 'Mọi trạng thái' : STATUS_CONFIG[status].label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {filtered.map((box) => {
                    const statusCfg = STATUS_CONFIG[box.status];
                    return (
                        <div
                            key={box.id}
                            id={`sleepbox-${box.id}`}
                            onClick={() => setSelectedBox(box)}
                            style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-lg)', padding: 24, cursor: 'pointer',
                                transition: 'all 300ms ease', position: 'relative', overflow: 'hidden',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            {/* Status indicator line */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: statusCfg.color }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: '2rem' }}>{box.imageEmoji}</span>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{box.name}</h3>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>📍 {box.location}</span>
                                    </div>
                                </div>
                                <span style={{
                                    padding: '4px 10px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 600,
                                    color: statusCfg.color, background: statusCfg.bg,
                                }}>{statusCfg.label}</span>
                            </div>

                            <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                                <div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Theo giờ</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>{formatVND(box.pricePerHour)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Theo đêm</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{formatVND(box.pricePerNight)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Sức chứa</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>👤 {box.capacity}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                                {box.amenities.slice(0, 4).map((a) => (
                                    <span key={a} style={{
                                        padding: '2px 8px', background: 'var(--bg-secondary)', borderRadius: 99,
                                        fontSize: '0.65rem', color: 'var(--text-secondary)',
                                    }}>✅ {a}</span>
                                ))}
                                {box.amenities.length > 4 && (
                                    <span style={{
                                        padding: '2px 8px', background: 'var(--bg-secondary)', borderRadius: 99,
                                        fontSize: '0.65rem', color: 'var(--text-muted)',
                                    }}>+{box.amenities.length - 4}</span>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{
                                    padding: '3px 10px', background: 'var(--bg-secondary)', borderRadius: 99,
                                    fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)',
                                }}>{TYPE_LABELS[box.type]}</span>
                                <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>
                                    {'★'.repeat(Math.floor(box.rating))} <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{box.rating}</span>
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">🛏️</div>
                    <h3>Không tìm thấy chỗ nào</h3>
                    <p>Thử thay đổi bộ lọc để xem thêm kết quả</p>
                </div>
            )}

            {/* Detail Modal */}
            {selectedBox && (
                <div className="modal-overlay" onClick={() => setSelectedBox(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
                        <div className="modal-header">
                            <h2>{selectedBox.imageEmoji} {selectedBox.name}</h2>
                            <button className="modal-close" onClick={() => setSelectedBox(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                <div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Loại</div>
                                    <div style={{ fontWeight: 600 }}>{TYPE_LABELS[selectedBox.type]}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Trạng thái</div>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600,
                                        color: STATUS_CONFIG[selectedBox.status].color,
                                        background: STATUS_CONFIG[selectedBox.status].bg,
                                    }}>{STATUS_CONFIG[selectedBox.status].label}</span>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Giá theo giờ</div>
                                    <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent-emerald)' }}>{formatVND(selectedBox.pricePerHour)}/h</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Giá theo đêm</div>
                                    <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent-blue)' }}>{formatVND(selectedBox.pricePerNight)}/đêm</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Vị trí</div>
                                    <div style={{ fontWeight: 600 }}>📍 {selectedBox.location}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Sức chứa</div>
                                    <div style={{ fontWeight: 600 }}>👤 {selectedBox.capacity} người</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Đánh giá</div>
                                    <div style={{ fontWeight: 600, color: '#fbbf24' }}>{'★'.repeat(Math.floor(selectedBox.rating))} {selectedBox.rating}/5</div>
                                </div>
                            </div>
                            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 10 }}>Tiện ích</div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {selectedBox.amenities.map((a) => (
                                        <span key={a} style={{
                                            padding: '4px 12px', background: 'var(--bg-secondary)', borderRadius: 99,
                                            fontSize: '0.72rem', color: 'var(--text-secondary)',
                                        }}>✅ {a}</span>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
                                {selectedBox.status === 'AVAILABLE' && (
                                    <button className="btn btn-primary" style={{ flex: 1 }}>🔑 Đặt chỗ ngay</button>
                                )}
                                <button className="btn btn-secondary" style={{ flex: 1 }}>📋 Xem lịch sử</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
