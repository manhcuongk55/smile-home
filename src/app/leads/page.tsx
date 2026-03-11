'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

interface Lead {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    leadStatus: string;
    notes?: string;
    source?: string;
    value: number;
    createdAt: string;
    updatedAt: string;
    interactions?: { id: string; subject: string; createdAt: string }[];
}

interface VacantRoom {
    id: string;
    number: string;
    type: string;
    price: number;
    building: { name: string; property: { name: string } };
}

const STAGES = [
    { key: 'NEW', label: 'Mới', color: 'blue', icon: '🆕' },
    { key: 'CONTACTED', label: 'Đã liên hệ', color: 'teal', icon: '📞' },
    { key: 'VIEWING_SCHEDULED', label: 'Xem phòng', color: 'amber', icon: '👁️' },
    { key: 'NEGOTIATING', label: 'Thương lượng', color: 'purple', icon: '🤝' },
    { key: 'CONVERTED', label: 'Chốt HĐ', color: 'emerald', icon: '✅' },
    { key: 'LOST', label: 'Mất', color: 'rose', icon: '❌' },
];

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [vacantRooms, setVacantRooms] = useState<VacantRoom[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [assigningLead, setAssigningLead] = useState<string | null>(null);
    const [newLead, setNewLead] = useState({
        name: '',
        email: '',
        phone: '',
        leadStatus: 'NEW',
        notes: '',
        source: '',
        value: '0',
        interestedRoom: '',
    });
    const [toastMsg, setToastMsg] = useState('');
    const { t } = useLanguage();

    useEffect(() => {
        fetchLeads();
        fetchVacantRooms();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    async function fetchLeads() {
        const res = await fetch('/api/persons?role=LEAD');
        const data = await res.json();
        setLeads(Array.isArray(data) ? data : []);
    }

    async function fetchVacantRooms() {
        try {
            const res = await fetch('/api/vacant-rooms');
            if (res.ok) setVacantRooms(await res.json());
        } catch { /* ignore */ }
    }

    async function assignRoom(leadId: string, roomInfo: string) {
        try {
            await fetch(`/api/persons/${leadId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: roomInfo }),
            });
            setToastMsg('✅ Đã gán phòng cho khách!');
            setAssigningLead(null);
            fetchLeads();
            setTimeout(() => setToastMsg(''), 3000);
        } catch { }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        try {
            await fetch('/api/persons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newLead, role: 'LEAD' }),
            });
            setShowCreateModal(false);
            setNewLead({ name: '', email: '', phone: '', leadStatus: 'NEW', notes: '', source: '', value: '0', interestedRoom: '' });
            setToastMsg(t('leadCreated'));
            fetchLeads();
            setTimeout(() => setToastMsg(''), 3000);
        } catch (err) {
            console.error(err);
        }
    }

    async function moveStatus(leadId: string, newStatus: string) {
        try {
            await fetch(`/api/persons/${leadId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadStatus: newStatus }),
            });
            fetchLeads();
        } catch (err) {
            console.error(err);
        }
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function getLeadsByStage(stageKey: string) {
        return leads.filter((l) => l.leadStatus === stageKey);
    }

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>{t('leadPipelineTitle')}</h1>
                    <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
                        <p style={{ margin: 0 }}>{t('leadPipelineSubtitle')}</p>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', padding: '2px 10px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 'bold' }}>
                            💰 {t('totalPipeline')}: ${leads.reduce((sum, l) => sum + (l.value || 0), 0).toLocaleString()}
                        </div>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    ➕ {t('newLeadBtn')}
                </button>
            </div>

            <div className="kanban-board">
                {STAGES.map((stage) => {
                    const stageLeads = getLeadsByStage(stage.key);
                    return (
                        <div key={stage.key} className="kanban-column">
                            <div className="kanban-column-header">
                                <h3>
                                    {stage.icon} {stage.label}
                                    <span className="count">{stageLeads.length}</span>
                                </h3>
                            </div>
                            <div className="kanban-cards">
                                {stageLeads.map((lead) => (
                                    <div key={lead.id} className="kanban-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div className="lead-name">{lead.name}</div>
                                            {new Date().getTime() - new Date(lead.updatedAt).getTime() > 3 * 24 * 60 * 60 * 1000 && (
                                                <span title="Stale: No activity for &gt;3 days" style={{ cursor: 'help', fontSize: '0.9rem' }}>⚠️</span>
                                            )}
                                        </div>
                                        <div className="lead-info">
                                            {lead.email && <span>📧 {lead.email}</span>}
                                            {lead.phone && <span>📱 {lead.phone}</span>}
                                        </div>
                                        {lead.notes && (
                                            <div style={{ fontSize: '0.7rem', marginTop: 6, padding: '4px 8px', borderRadius: 6, background: lead.notes.includes('🏠') ? 'rgba(56,189,248,0.1)' : 'transparent', color: lead.notes.includes('🏠') ? '#38bdf8' : 'var(--text-muted)', fontStyle: lead.notes.includes('🏠') ? 'normal' : 'italic', fontWeight: lead.notes.includes('🏠') ? 600 : 400 }}>
                                                {lead.notes.length > 80 ? lead.notes.slice(0, 80) + '...' : lead.notes}
                                            </div>
                                        )}
                                        {/* Assign Room Button */}
                                        {assigningLead === lead.id ? (
                                            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Chọn phòng:</div>
                                                {vacantRooms.length > 0 ? vacantRooms.slice(0, 5).map(room => (
                                                    <button key={room.id} onClick={() => assignRoom(lead.id, `🏠 ${room.building.property.name} — ${room.building.name} — P.${room.number} (${room.type}) — ${new Intl.NumberFormat('vi-VN').format(room.price)}đ`)}
                                                        style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.68rem', cursor: 'pointer', textAlign: 'left' }}
                                                    >
                                                        🏠 {room.building.name} — P.{room.number} ({new Intl.NumberFormat('vi-VN').format(room.price)}đ)
                                                    </button>
                                                )) : <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Không có phòng trống</div>}
                                                <button onClick={() => setAssigningLead(null)} style={{ padding: '2px 8px', borderRadius: 4, border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.65rem', cursor: 'pointer' }}>✕ Đóng</button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.75rem', fontWeight: 'bold', alignItems: 'center' }}>
                                                <span style={{ color: 'var(--accent-emerald)' }}>{(lead.value || 0).toLocaleString()}đ</span>
                                                <button onClick={() => setAssigningLead(lead.id)} style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(56,189,248,0.2)', background: 'transparent', color: '#38bdf8', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 600 }}>🏠 Gán phòng</button>
                                            </div>
                                        )}
                                        <div className="lead-meta">
                                            <span>{formatDate(lead.createdAt)}</span>
                                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                                <Link href={`/leads/${lead.id}`} className="btn btn-sm btn-secondary" title="View Details">👁️</Link>
                                                {stage.key !== 'CONVERTED' && stage.key !== 'LOST' && (
                                                    <>
                                                        {STAGES.indexOf(stage) < 4 && (
                                                            <button
                                                                className="btn btn-sm btn-secondary"
                                                                onClick={() => moveStatus(lead.id, STAGES[STAGES.indexOf(stage) + 1].key)}
                                                                title={`Move to ${STAGES[STAGES.indexOf(stage) + 1].label}`}
                                                            >
                                                                →
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            onClick={() => moveStatus(lead.id, 'LOST')}
                                                            title="Mark as Lost"
                                                            style={{ color: 'var(--accent-rose)' }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {stageLeads.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                        {t('noLeads')}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t('newLeadBtn')}</h2>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>{t('nameLabel')}</label>
                                    <input
                                        className="form-input"
                                        placeholder={t('fullNamePlaceholder') as string}
                                        value={newLead.name}
                                        onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t('emailLabel')}</label>
                                        <input
                                            className="form-input"
                                            type="email"
                                            placeholder="email@example.com"
                                            value={newLead.email}
                                            onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('phoneLabel')}</label>
                                        <input
                                            className="form-input"
                                            placeholder="+66..."
                                            value={newLead.phone}
                                            onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>{t('initialStatusLabel')}</label>
                                    <select
                                        className="form-select"
                                        value={newLead.leadStatus}
                                        onChange={(e) => setNewLead({ ...newLead, leadStatus: e.target.value })}
                                    >
                                        {STAGES.map((s) => (
                                            <option key={s.key} value={s.key}>{s.icon} {s.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t('sourceLabel')}</label>
                                        <input
                                            className="form-input"
                                            placeholder={t('sourcePlaceholder') as string}
                                            value={newLead.source}
                                            onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('dealValueLabel')}</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            value={newLead.value}
                                            onChange={(e) => setNewLead({ ...newLead, value: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>🏠 Phòng quan tâm</label>
                                    <select
                                        className="form-select"
                                        value={newLead.interestedRoom}
                                        onChange={(e) => setNewLead({ ...newLead, interestedRoom: e.target.value, notes: e.target.value ? `🏠 ${e.target.value}` : newLead.notes })}
                                    >
                                        <option value="">-- Chọn phòng (tùy chọn) --</option>
                                        {vacantRooms.map(r => (
                                            <option key={r.id} value={`${r.building.property.name} — ${r.building.name} — P.${r.number} (${r.type})`}>
                                                {r.building.property.name} — {r.building.name} — P.{r.number} ({new Intl.NumberFormat('vi-VN').format(r.price)}đ)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>{t('notesLabel')}</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder={t('notesPlaceholder') as string}
                                        value={newLead.notes}
                                        onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>{t('cancel')}</button>
                                <button type="submit" className="btn btn-primary">{t('createLeadBtn')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toastMsg && <div className="toast success">✅ {toastMsg}</div>}
        </>
    );
}
