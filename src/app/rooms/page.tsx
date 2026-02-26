'use client';

import { useState, useEffect } from 'react';

interface Room {
    id: string;
    number: string;
    type: string;
    status: string;
    price: number;
    area: number;
    buildingId: string;
    building: {
        id: string;
        name: string;
        property: {
            id: string;
            name: string;
        };
    };
}

interface GroupedData {
    propertyName: string;
    buildings: {
        buildingName: string;
        rooms: Room[];
    }[];
}

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    useEffect(() => {
        fetchRooms();
    }, []);

    async function fetchRooms() {
        const res = await fetch('/api/rooms');
        const data = await res.json();
        setRooms(Array.isArray(data) ? data : []);
    }

    async function updateStatus(roomId: string, newStatus: string) {
        try {
            await fetch(`/api/rooms/${roomId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            fetchRooms();
            setSelectedRoom(null);
        } catch (err) {
            console.error(err);
        }
    }

    const statuses = ['ALL', 'VACANT', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'];

    function getGrouped(): GroupedData[] {
        const filtered = statusFilter === 'ALL' ? rooms : rooms.filter((r) => r.status === statusFilter);
        const grouped: Record<string, Record<string, Room[]>> = {};

        filtered.forEach((room) => {
            const propName = room.building?.property?.name || 'Unknown Property';
            const buildName = room.building?.name || 'Unknown Building';
            if (!grouped[propName]) grouped[propName] = {};
            if (!grouped[propName][buildName]) grouped[propName][buildName] = [];
            grouped[propName][buildName].push(room);
        });

        return Object.entries(grouped).map(([propertyName, buildings]) => ({
            propertyName,
            buildings: Object.entries(buildings).map(([buildingName, rooms]) => ({
                buildingName,
                rooms: rooms.sort((a, b) => a.number.localeCompare(b.number)),
            })),
        }));
    }

    function formatPrice(price: number) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(price);
    }

    const vacantCount = rooms.filter((r) => r.status === 'VACANT').length;
    const occupiedCount = rooms.filter((r) => r.status === 'OCCUPIED').length;
    const maintenanceCount = rooms.filter((r) => r.status === 'MAINTENANCE').length;
    const reservedCount = rooms.filter((r) => r.status === 'RESERVED').length;

    const grouped = getGrouped();

    return (
        <>
            <div className="page-header">
                <h1>Room Status Engine</h1>
                <p>Real-time view of all rooms across your property portfolio</p>
            </div>

            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card emerald" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('VACANT')}>
                    <div className="stat-icon">🟢</div>
                    <div className="stat-value">{vacantCount}</div>
                    <div className="stat-label">Vacant</div>
                </div>
                <div className="stat-card blue" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('OCCUPIED')}>
                    <div className="stat-icon">🔵</div>
                    <div className="stat-value">{occupiedCount}</div>
                    <div className="stat-label">Occupied</div>
                </div>
                <div className="stat-card amber" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('MAINTENANCE')}>
                    <div className="stat-icon">🟡</div>
                    <div className="stat-value">{maintenanceCount}</div>
                    <div className="stat-label">Maintenance</div>
                </div>
                <div className="stat-card purple" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('RESERVED')}>
                    <div className="stat-icon">🟣</div>
                    <div className="stat-value">{reservedCount}</div>
                    <div className="stat-label">Reserved</div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div className="tabs">
                    {statuses.map((s) => (
                        <button
                            key={s}
                            className={`tab ${statusFilter === s ? 'active' : ''}`}
                            onClick={() => setStatusFilter(s)}
                        >
                            {s === 'ALL' ? `All (${rooms.length})` : s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
                <div className="status-legend">
                    <div className="legend-item"><div className="legend-dot vacant" /> Vacant</div>
                    <div className="legend-item"><div className="legend-dot occupied" /> Occupied</div>
                    <div className="legend-item"><div className="legend-dot maintenance" /> Maintenance</div>
                    <div className="legend-item"><div className="legend-dot reserved" /> Reserved</div>
                </div>
            </div>

            <div className="room-grid-container">
                {grouped.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🏠</div>
                        <h3>No rooms found</h3>
                        <p>Seed demo data from the Dashboard or add properties first.</p>
                    </div>
                ) : (
                    grouped.map((prop) => (
                        <div key={prop.propertyName} className="property-section">
                            <div className="property-section-header">
                                <h2>🏢 {prop.propertyName}</h2>
                            </div>
                            {prop.buildings.map((bld) => (
                                <div key={bld.buildingName}>
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
                                                <div className="room-price">{formatPrice(room.price)}/mo</div>
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
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Type</div>
                                    <div style={{ fontWeight: 600 }}>{selectedRoom.type.replace('_', ' ')}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Status</div>
                                    <span className={`badge ${selectedRoom.status === 'VACANT' ? 'emerald' : selectedRoom.status === 'OCCUPIED' ? 'blue' : selectedRoom.status === 'MAINTENANCE' ? 'amber' : 'purple'}`}>
                                        {selectedRoom.status}
                                    </span>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Price</div>
                                    <div style={{ fontWeight: 600 }}>{formatPrice(selectedRoom.price)}/month</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Area</div>
                                    <div style={{ fontWeight: 600 }}>{selectedRoom.area} sqm</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Property</div>
                                    <div style={{ fontWeight: 600 }}>{selectedRoom.building.property.name}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Building</div>
                                    <div style={{ fontWeight: 600 }}>{selectedRoom.building.name}</div>
                                </div>
                            </div>
                            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 10 }}>Change Status</div>
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
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
