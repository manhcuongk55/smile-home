'use client';

import { useState, useEffect } from 'react';

interface Property {
    id: string;
    name: string;
    address: string;
    type: string;
    buildings: {
        id: string;
        name: string;
        floors: number;
        _count?: { rooms: number };
        rooms: { id: string; status: string; number: string; type: string; price: number }[];
    }[];
    createdAt: string;
}

interface EditBuilding {
    id?: string;
    propertyId: string;
    name: string;
    floors: number;
    area: string;
    roomsPerFloor: string;
    notes: string;
}

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [expandedBuilding, setExpandedBuilding] = useState<string | null>(null);
    const [editBuilding, setEditBuilding] = useState<EditBuilding | null>(null);
    const [newProperty, setNewProperty] = useState({
        name: '', address: '', type: 'RESIDENTIAL',
    });
    const [toastMsg, setToastMsg] = useState('');

    useEffect(() => { fetchProperties(); }, []);

    async function fetchProperties() {
        const res = await fetch('/api/properties');
        const data = await res.json();
        setProperties(Array.isArray(data) ? data : []);
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        try {
            await fetch('/api/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProperty),
            });
            setShowCreateModal(false);
            setNewProperty({ name: '', address: '', type: 'RESIDENTIAL' });
            setToastMsg('✅ Đã tạo bất động sản!');
            fetchProperties();
            setTimeout(() => setToastMsg(''), 3000);
        } catch (err) { console.error(err); }
    }

    async function handleSaveBuilding() {
        if (!editBuilding || !editBuilding.name) return;
        try {
            const method = editBuilding.id ? 'PATCH' : 'POST';
            const url = editBuilding.id ? `/api/buildings/${editBuilding.id}` : '/api/buildings';
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId: editBuilding.propertyId,
                    name: editBuilding.name,
                    floors: editBuilding.floors,
                }),
            });
            setToastMsg(editBuilding.id ? '✅ Đã cập nhật tòa nhà!' : '✅ Đã thêm tòa nhà!');
            setEditBuilding(null);
            fetchProperties();
            setTimeout(() => setToastMsg(''), 3000);
        } catch { setToastMsg('❌ Lỗi khi lưu'); setTimeout(() => setToastMsg(''), 3000); }
    }

    function getTotalRooms(prop: Property): number {
        return Array.from(new Map(prop.buildings.map(b => [b.id, b])).values()).reduce((sum, b) => sum + b.rooms.length, 0);
    }
    function getOccupiedRooms(prop: Property): number {
        return Array.from(new Map(prop.buildings.map(b => [b.id, b])).values()).reduce((sum, b) => sum + b.rooms.filter(r => r.status === 'OCCUPIED').length, 0);
    }

    const PROP_TYPES: Record<string, string> = { RESIDENTIAL: '🏠 Nhà ở', COMMERCIAL: '🏪 Thương mại', MIXED: '🏢 Hỗn hợp' };

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>🏢 Bất động sản</h1>
                    <p>Quản lý tài sản & tòa nhà</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    ➕ Thêm BĐS
                </button>
            </div>

            {properties.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🏢</div>
                    <h3>Chưa có bất động sản</h3>
                    <p>Tạo bất động sản đầu tiên hoặc seed dữ liệu mẫu từ Dashboard.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {properties.map((prop) => {
                        const totalRooms = getTotalRooms(prop);
                        const occupiedRooms = getOccupiedRooms(prop);
                        const rate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
                        const uniqueBuildings = Array.from(new Map(prop.buildings.map(b => [b.id, b])).values());
                        return (
                            <div key={prop.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                {/* Property Header */}
                                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>{prop.name}</h3>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>📍 {prop.address}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <span className={`badge ${prop.type === 'RESIDENTIAL' ? 'blue' : prop.type === 'COMMERCIAL' ? 'amber' : 'purple'}`}>
                                            {PROP_TYPES[prop.type] || prop.type}
                                        </span>
                                        <button onClick={() => setEditBuilding({ propertyId: prop.id, name: '', floors: 1, area: '', roomsPerFloor: '', notes: '' })}
                                            style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(56,189,248,0.2)', background: 'transparent', color: '#38bdf8', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
                                            + Thêm tòa nhà
                                        </button>
                                    </div>
                                </div>

                                {/* Stats Bar */}
                                <div style={{ padding: '0 20px 12px', display: 'flex', gap: 24 }}>
                                    <div><span style={{ fontSize: '1.3rem', fontWeight: 800 }}>{uniqueBuildings.length}</span><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 4 }}>Tòa nhà</span></div>
                                    <div><span style={{ fontSize: '1.3rem', fontWeight: 800 }}>{totalRooms}</span><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 4 }}>Phòng</span></div>
                                    <div><span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{rate}%</span><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 4 }}>Lấp đầy</span></div>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                        <div style={{ flex: 1, background: 'var(--bg-primary)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
                                            <div style={{ background: 'linear-gradient(90deg, var(--accent-emerald), var(--accent-teal))', height: '100%', width: `${rate}%`, borderRadius: 6 }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Buildings List */}
                                {uniqueBuildings.length > 0 && (
                                    <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                        {uniqueBuildings.map(bld => {
                                            const isExpanded = expandedBuilding === bld.id;
                                            const vacant = bld.rooms.filter(r => r.status === 'VACANT').length;
                                            const occupied = bld.rooms.filter(r => r.status === 'OCCUPIED').length;
                                            const maint = bld.rooms.filter(r => r.status === 'MAINTENANCE').length;
                                            return (
                                                <div key={bld.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                    <div
                                                        onClick={() => setExpandedBuilding(isExpanded ? null : bld.id)}
                                                        style={{
                                                            padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                            cursor: 'pointer', transition: 'background 150ms', gap: 12,
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(56,189,248,0.04)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                            <span style={{ fontSize: '0.75rem', transition: 'transform 200ms', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                                                            <div>
                                                                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>🏗️ {bld.name}</div>
                                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                                                    {bld.floors} tầng • {bld.rooms.length} phòng
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                            {vacant > 0 && <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: '0.65rem', fontWeight: 600, background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>🟢 {vacant} trống</span>}
                                                            {occupied > 0 && <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: '0.65rem', fontWeight: 600, background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>🔵 {occupied} thuê</span>}
                                                            {maint > 0 && <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: '0.65rem', fontWeight: 600, background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>🟡 {maint}</span>}
                                                            <button onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditBuilding({ id: bld.id, propertyId: prop.id, name: bld.name, floors: bld.floors, area: '', roomsPerFloor: '', notes: '' });
                                                            }} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.65rem', cursor: 'pointer' }}>
                                                                ✏️ Sửa
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {/* Expanded Room List */}
                                                    {isExpanded && (
                                                        <div style={{ padding: '0 20px 12px 44px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                            {bld.rooms.length > 0 ? bld.rooms.map(room => (
                                                                <div key={room.id} style={{
                                                                    padding: '6px 10px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600, minWidth: 70, textAlign: 'center',
                                                                    background: room.status === 'VACANT' ? 'rgba(52,211,153,0.1)' : room.status === 'OCCUPIED' ? 'rgba(56,189,248,0.1)' : 'rgba(251,191,36,0.1)',
                                                                    color: room.status === 'VACANT' ? '#34d399' : room.status === 'OCCUPIED' ? '#38bdf8' : '#fbbf24',
                                                                    border: `1px solid ${room.status === 'VACANT' ? 'rgba(52,211,153,0.2)' : room.status === 'OCCUPIED' ? 'rgba(56,189,248,0.2)' : 'rgba(251,191,36,0.2)'}`,
                                                                }}>
                                                                    P.{room.number}
                                                                </div>
                                                            )) : (
                                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '8px 0' }}>
                                                                    Chưa có phòng — <a href="/rooms" style={{ color: '#38bdf8' }}>Thêm phòng →</a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Property Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>➕ Thêm bất động sản</h2>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>📛 Tên BĐS *</label>
                                    <input className="form-input" placeholder="VD: Smile Home Quận 7" value={newProperty.name}
                                        onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>📍 Địa chỉ *</label>
                                    <input className="form-input" placeholder="Số nhà, đường, quận..." value={newProperty.address}
                                        onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>🏷️ Loại</label>
                                    <select className="form-select" value={newProperty.type}
                                        onChange={(e) => setNewProperty({ ...newProperty, type: e.target.value })}>
                                        <option value="RESIDENTIAL">🏠 Nhà ở</option>
                                        <option value="COMMERCIAL">🏪 Thương mại</option>
                                        <option value="MIXED">🏢 Hỗn hợp</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary">✅ Tạo BĐS</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Building Modal */}
            {editBuilding && (
                <div className="modal-overlay" onClick={() => setEditBuilding(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
                        <div className="modal-header">
                            <h2>{editBuilding.id ? '✏️ Sửa tòa nhà' : '➕ Thêm tòa nhà'}</h2>
                            <button className="modal-close" onClick={() => setEditBuilding(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div>
                                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>📛 Tên tòa nhà *</label>
                                    <input className="form-input" placeholder="VD: Tòa A, Block 1..." value={editBuilding.name}
                                        onChange={(e) => setEditBuilding({ ...editBuilding, name: e.target.value })} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>🏗️ Số tầng</label>
                                        <input type="number" className="form-input" value={editBuilding.floors}
                                            onChange={(e) => setEditBuilding({ ...editBuilding, floors: parseInt(e.target.value) || 1 })} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>📐 Diện tích (m²)</label>
                                        <input className="form-input" placeholder="500" value={editBuilding.area}
                                            onChange={(e) => setEditBuilding({ ...editBuilding, area: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>🚪 Số phòng/tầng (thiết kế)</label>
                                    <input className="form-input" placeholder="VD: 8 phòng/tầng" value={editBuilding.roomsPerFloor}
                                        onChange={(e) => setEditBuilding({ ...editBuilding, roomsPerFloor: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>📝 Ghi chú</label>
                                    <textarea className="form-textarea" placeholder="Thông tin thêm về tòa nhà..." value={editBuilding.notes}
                                        onChange={(e) => setEditBuilding({ ...editBuilding, notes: e.target.value })} />
                                </div>
                                <button onClick={handleSaveBuilding}
                                    style={{ padding: '12px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #38bdf8, #2dd4bf)', color: '#0c1929', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                                    {editBuilding.id ? '💾 Lưu thay đổi' : '✅ Tạo tòa nhà'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toastMsg && <div className="toast success">{toastMsg}</div>}
        </>
    );
}
