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

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [toastMsg, setToastMsg] = useState('');
    const { t } = useLanguage();

    useEffect(() => {
        fetchRooms();
    }, []);

    async function fetchRooms() {
        const res = await fetch('/api/rooms');
        const data = await res.json();
        setRooms(Array.isArray(data) ? data : []);
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
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(price);
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

    return (
        <>
            <div className="page-header">
                <h1>{t('roomStatusTitle')}</h1>
                <p>{t('roomStatusSubtitle')}</p>
            </div>

            <div className="card-container">
                {groupedArray.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🏠</div>
                        <h3>{t('noRooms')}</h3>
                        <p>{t('seedToAddRooms')}</p>
                    </div>
                ) : (
                    groupedArray.map((prop) => (
                        <div key={prop.propertyName} className="property-section" style={{ marginBottom: 24 }}>
                            <div className="property-section-header">
                                <h2>🏢 {prop.propertyName}</h2>
                            </div>
                            {prop.buildings.map((bld) => (
                                <div key={bld.buildingName} style={{ marginTop: 16 }}>
                                    <div className="building-label">🏗️ {bld.buildingName}</div>
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

            {selectedRoom && (
                <div className="modal-overlay" onClick={() => setSelectedRoom(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Room {selectedRoom.number}</h2>
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
                                    <div style={{ fontWeight: 600 }}>{selectedRoom.area} sqm</div>
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
                                            {s.charAt(0) + s.slice(1).toLowerCase()}
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

            {toastMsg && <div className="toast success">✅ {toastMsg}</div>}
        </>
    );
}
