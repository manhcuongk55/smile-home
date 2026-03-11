'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

interface Room {
    id: string;
    number: string;
    type: string;
    status: string;
    price: number;
    area: number;
    building: {
        name: string;
        property: { name: string };
    };
}

interface Building {
    id: string;
    name: string;
    property: { id: string; name: string };
    _count: { rooms: number };
}

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [newRoom, setNewRoom] = useState({ buildingId: '', number: '', type: 'STUDIO', price: 0, area: 0 });
    const { t } = useLanguage();

    useEffect(() => { fetchRooms(); fetchBuildings(); }, []);

    async function fetchRooms() {
        const res = await fetch('/api/rooms');
        const data = await res.json();
        setRooms(Array.isArray(data) ? data : []);
    }

    async function fetchBuildings() {
        try {
            const res = await fetch('/api/buildings');
            const data = await res.json();
            setBuildings(Array.isArray(data) ? data : []);
        } catch { /* ignore */ }
    }

    async function addRoom() {
        if (!newRoom.buildingId || !newRoom.number) {
            setToastMsg('⚠️ Vui lòng chọn tòa nhà và nhập số phòng');
            setTimeout(() => setToastMsg(''), 3000);
            return;
        }
        try {
            const res = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRoom),
            });
            if (res.ok) {
                setToastMsg('✅ Đã thêm phòng thành công!');
                setShowAddForm(false);
                setNewRoom({ buildingId: '', number: '', type: 'STUDIO', price: 0, area: 0 });
                fetchRooms();
                setTimeout(() => setToastMsg(''), 3000);
            }
        } catch (err) {
            setToastMsg('❌ Lỗi khi thêm phòng');
            setTimeout(() => setToastMsg(''), 3000);
        }
    }

    async function updateStatus(roomId: string, status: string) {
        try {
            const res = await fetch(`/api/rooms/${roomId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                setToastMsg(`${t('statusUpdatedTo')} ${t(status.toLowerCase() as any) || status}`);
                fetchRooms();
                setSelectedRoom(prev => prev ? { ...prev, status } : null);
                setTimeout(() => setToastMsg(''), 3000);
            }
        } catch (err) {
            console.error(err);
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    };

    const grouped = rooms.reduce((acc, room) => {
        const propName = room.building.property.name;
        const bldName = room.building.name;
        if (!acc[propName]) acc[propName] = {};
        if (!acc[propName][bldName]) acc[propName][bldName] = [];
        acc[propName][bldName].push(room);
        return acc;
    }, {} as Record<string, Record<string, Room[]>>);

    const groupedArray = Object.entries(grouped).map(([prop, blds]) => ({
        propertyName: prop,
        buildings: Object.entries(blds).map(([bld, rooms]) => ({ buildingName: bld, rooms }))
    }));

    const ROOM_TYPES = [
        { value: 'STUDIO', label: 'Studio' },
        { value: 'ONE_BED', label: '1 Phòng ngủ' },
        { value: 'TWO_BED', label: '2 Phòng ngủ' },
        { value: 'THREE_BED', label: '3 Phòng ngủ' },
        { value: 'PENTHOUSE', label: 'Penthouse' },
        { value: 'COMMERCIAL', label: 'Mặt bằng' },
    ];

    return (
        <>
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1>{t('roomStatusTitle')}</h1>
                    <p>{t('roomStatusSubtitle')}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <a
                        href="https://smile-bed.vercel.app"
                        target="_blank"
                        style={{
                            padding: '10px 18px', borderRadius: 10, border: '1px solid rgba(56,189,248,0.2)',
                            background: 'rgba(56,189,248,0.1)', color: '#38bdf8',
                            fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
                        }}
                    >
                        🛏️ Tìm phòng (SmileBed)
                    </a>
                    <button
                        onClick={() => setShowAddForm(true)}
                        style={{
                            padding: '10px 18px', borderRadius: 10, border: 'none',
                            background: 'linear-gradient(135deg, #38bdf8, #2dd4bf)',
                            color: '#0c1929', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}
                    >
                        ➕ Thêm phòng
                    </button>
                </div>
            </div>

            <div className="card-container">
                {groupedArray.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🏠</div>
                        <h3>{t('noRooms')}</h3>
                        <p>{t('seedToAddRooms')}</p>
                        <button onClick={() => setShowAddForm(true)} style={{
                            marginTop: 16, padding: '12px 24px', borderRadius: 10, border: 'none',
                            background: 'linear-gradient(135deg, #38bdf8, #2dd4bf)',
                            color: '#0c1929', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                        }}>
                            ➕ Thêm phòng đầu tiên
                        </button>
                    </div>
                ) : (
                    groupedArray.map((prop) => (
                        <div key={prop.propertyName} className="property-section" style={{ marginBottom: 24 }}>
                            <div className="property-section-header">
                                <h2>🏢 {prop.propertyName}</h2>
                            </div>
                            {prop.buildings.map((bld) => (
                                <div key={bld.buildingName} style={{ marginTop: 16 }}>
                                    <div className="building-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span>🏗️ {bld.buildingName} ({bld.rooms.length} phòng)</span>
                                        <button onClick={() => {
                                            const bid = buildings.find(b => b.name === bld.buildingName)?.id;
                                            if (bid) { setNewRoom(prev => ({ ...prev, buildingId: bid })); setShowAddForm(true); }
                                        }} style={{
                                            padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(56,189,248,0.2)',
                                            background: 'transparent', color: '#38bdf8', fontSize: '0.7rem',
                                            fontWeight: 600, cursor: 'pointer',
                                        }}>+ Thêm phòng</button>
                                    </div>
                                    <div className="room-grid">
                                        {bld.rooms.map((room) => (
                                            <div
                                                key={room.id}
                                                className={`room-tile ${room.status.toLowerCase()}`}
                                                onClick={() => setSelectedRoom(room)}
                                            >
                                                <div className="room-number">{room.number}</div>
                                                <div className="room-type">{room.type.replace('_', ' ')}</div>
                                                <div className="room-price">{formatPrice(room.price)}/{t('month')}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>

            {/* Add Room Modal */}
            {showAddForm && (
                <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
                        <div className="modal-header">
                            <h2>➕ Thêm phòng mới</h2>
                            <button className="modal-close" onClick={() => setShowAddForm(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {/* Building Select */}
                                <div>
                                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                                        🏗️ Tòa nhà *
                                    </label>
                                    <select
                                        value={newRoom.buildingId}
                                        onChange={(e) => setNewRoom(prev => ({ ...prev, buildingId: e.target.value }))}
                                        style={{
                                            width: '100%', padding: '10px 12px', borderRadius: 8,
                                            border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)',
                                            color: 'var(--text-primary)', fontSize: '0.85rem',
                                        }}
                                    >
                                        <option value="">-- Chọn tòa nhà --</option>
                                        {buildings.map(b => (
                                            <option key={b.id} value={b.id}>
                                                {b.property.name} — {b.name} ({b._count.rooms} phòng)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {/* Room Number */}
                                <div>
                                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                                        🔢 Số phòng *
                                    </label>
                                    <input
                                        value={newRoom.number}
                                        onChange={(e) => setNewRoom(prev => ({ ...prev, number: e.target.value }))}
                                        placeholder="Ví dụ: 101, A-201..."
                                        style={{
                                            width: '100%', padding: '10px 12px', borderRadius: 8,
                                            border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)',
                                            color: 'var(--text-primary)', fontSize: '0.85rem',
                                        }}
                                    />
                                </div>
                                {/* Room Type */}
                                <div>
                                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                                        🏠 Loại phòng
                                    </label>
                                    <select
                                        value={newRoom.type}
                                        onChange={(e) => setNewRoom(prev => ({ ...prev, type: e.target.value }))}
                                        style={{
                                            width: '100%', padding: '10px 12px', borderRadius: 8,
                                            border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)',
                                            color: 'var(--text-primary)', fontSize: '0.85rem',
                                        }}
                                    >
                                        {ROOM_TYPES.map(rt => (
                                            <option key={rt.value} value={rt.value}>{rt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Price & Area */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                                            💰 Giá thuê (đ/tháng)
                                        </label>
                                        <input
                                            type="number"
                                            value={newRoom.price || ''}
                                            onChange={(e) => setNewRoom(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                                            placeholder="4500000"
                                            style={{
                                                width: '100%', padding: '10px 12px', borderRadius: 8,
                                                border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)',
                                                color: 'var(--text-primary)', fontSize: '0.85rem',
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                                            📐 Diện tích (m²)
                                        </label>
                                        <input
                                            type="number"
                                            value={newRoom.area || ''}
                                            onChange={(e) => setNewRoom(prev => ({ ...prev, area: parseInt(e.target.value) || 0 }))}
                                            placeholder="25"
                                            style={{
                                                width: '100%', padding: '10px 12px', borderRadius: 8,
                                                border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)',
                                                color: 'var(--text-primary)', fontSize: '0.85rem',
                                            }}
                                        />
                                    </div>
                                </div>
                                {/* Submit */}
                                <button
                                    onClick={addRoom}
                                    style={{
                                        padding: '12px 20px', borderRadius: 10, border: 'none',
                                        background: 'linear-gradient(135deg, #38bdf8, #2dd4bf)',
                                        color: '#0c1929', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                                        marginTop: 4,
                                    }}
                                >
                                    ✅ Tạo phòng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Room Detail Modal */}
            {selectedRoom && (
                <div className="modal-overlay" onClick={() => setSelectedRoom(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Phòng {selectedRoom.number}</h2>
                            <button className="modal-close" onClick={() => setSelectedRoom(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{t('roomType')}</div>
                                    <div style={{ fontWeight: 600 }}>{selectedRoom.type.replace('_', ' ')}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{t('status')}</div>
                                    <span className={`badge ${selectedRoom.status === 'VACANT' ? 'emerald' : selectedRoom.status === 'OCCUPIED' ? 'blue' : selectedRoom.status === 'MAINTENANCE' ? 'amber' : 'purple'}`}>
                                        {t(selectedRoom.status.toLowerCase() as any) || selectedRoom.status}
                                    </span>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{t('roomPrice')}</div>
                                    <div style={{ fontWeight: 600 }}>{formatPrice(selectedRoom.price)}/{t('month')}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{t('roomArea')}</div>
                                    <div style={{ fontWeight: 600 }}>{selectedRoom.area} m²</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{t('roomProperty')}</div>
                                    <div style={{ fontWeight: 600 }}>{selectedRoom.building.property.name}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{t('roomBuilding')}</div>
                                    <div style={{ fontWeight: 600 }}>{selectedRoom.building.name}</div>
                                </div>
                            </div>
                            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 10 }}>{t('changeStatus')}</div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {['VACANT', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'].map((s) => (
                                        <button
                                            key={s}
                                            className={`btn btn-sm ${selectedRoom.status === s ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => updateStatus(selectedRoom.id, s)}
                                        >
                                            {s === 'VACANT' ? '🟢 Trống' : s === 'OCCUPIED' ? '🔵 Đã thuê' : s === 'MAINTENANCE' ? '🟡 Bảo trì' : '🟣 Đã đặt'}
                                        </button>
                                    ))}
                                </div>
                                <div style={{ marginTop: 20 }}>
                                    <Link href={`/rooms/${selectedRoom.id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                        {t('viewFullDetails')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toastMsg && <div className="toast success">  {toastMsg}</div>}
        </>
    );
}

