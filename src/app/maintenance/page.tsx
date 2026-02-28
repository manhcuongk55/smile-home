'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

interface MaintenanceTicket {
    id: string;
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: string;
    room: {
        number: string;
        building: { name: string };
    };
    reportedBy: {
        name: string;
    };
    createdAt: string;
}

interface Room {
    id: string;
    number: string;
    building: { name: string };
}

interface Person {
    id: string;
    name: string;
}

export default function MaintenancePage() {
    const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [persons, setPersons] = useState<Person[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTicket, setNewTicket] = useState({
        roomId: '',
        reportedById: '',
        title: '',
        description: '',
        priority: 'MEDIUM',
    });
    const [toastMsg, setToastMsg] = useState('');
    const { t } = useLanguage();


    useEffect(() => {
        fetchTickets();
        fetchRooms();
        fetchPersons();
    }, []);

    async function fetchTickets() {
        const res = await fetch('/api/maintenance');
        const data = await res.json();
        setTickets(Array.isArray(data) ? data : []);
    }

    async function fetchRooms() {
        const res = await fetch('/api/rooms');
        const data = await res.json();
        setRooms(Array.isArray(data) ? data : []);
    }

    async function fetchPersons() {
        const res = await fetch('/api/persons');
        const data = await res.json();
        setPersons(Array.isArray(data) ? data : []);
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        try {
            const res = await fetch('/api/maintenance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTicket),
            });
            if (res.ok) {
                setShowCreateModal(false);
                setNewTicket({ roomId: '', reportedById: '', title: '', description: '', priority: 'MEDIUM' });
                setToastMsg(t('ticketCreated'));
                fetchTickets();
                setTimeout(() => setToastMsg(''), 3000);
            }
        } catch (err) {
            console.error(err);
        }
    }

    function getPriorityColor(priority: string) {
        switch (priority) {
            case 'URGENT': return 'rose';
            case 'HIGH': return 'amber';
            case 'MEDIUM': return 'blue';
            case 'LOW': return 'teal';
            default: return 'blue';
        }
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>{t('maintenanceTitle')}</h1>
                    <p>{t('maintenanceSubtitle')}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    🔧 {t('newTicket')}
                </button>
            </div>

            <div className="card-container">
                {tickets.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔧</div>
                        <h3>{t('noTickets')}</h3>
                        <p>{t('createTicketToStart')}</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{t('ticketInfo')}</th>
                                    <th>{t('location')}</th>
                                    <th>{t('priority')}</th>
                                    <th>{t('status')}</th>
                                    <th>{t('reportedBy')}</th>
                                    <th>{t('created')}</th>
                                    <th>{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{ticket.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {ticket.description}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{ticket.room.number}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ticket.room.building.name}</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${getPriorityColor(ticket.priority)}`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge blue">{ticket.status}</span>
                                        </td>
                                        <td style={{ fontSize: '0.85rem' }}>{ticket.reportedBy.name}</td>
                                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(ticket.createdAt)}</td>
                                        <td>
                                            <button className="btn btn-sm btn-secondary">{t('manage')}</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t('submitTicketModal')}</h2>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>{t('titleLabel')}</label>
                                    <input
                                        className="form-input"
                                        placeholder={t('titlePlaceholder') as string}
                                        value={newTicket.title}
                                        onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t('roomLabel')}</label>
                                        <select
                                            className="form-select"
                                            value={newTicket.roomId}
                                            onChange={(e) => setNewTicket({ ...newTicket, roomId: e.target.value })}
                                            required
                                        >
                                            <option value="">{t('selectRoom')}</option>
                                            {rooms.map((r) => (
                                                <option key={r.id} value={r.id}>{r.building.name} - {r.number}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>{t('reportedBy')} *</label>
                                        <select
                                            className="form-select"
                                            value={newTicket.reportedById}
                                            onChange={(e) => setNewTicket({ ...newTicket, reportedById: e.target.value })}
                                            required
                                        >
                                            <option value="">{t('selectPerson')}</option>
                                            {persons.map((p) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>{t('priority')}</label>
                                    <select
                                        className="form-select"
                                        value={newTicket.priority}
                                        onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                                    >
                                        <option value="LOW">{t('low')}</option>
                                        <option value="MEDIUM">{t('medium')}</option>
                                        <option value="HIGH">{t('high')}</option>
                                        <option value="URGENT">{t('urgent')}</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>{t('descriptionLabel')}</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder={t('descriptionPlaceholder') as string}
                                        value={newTicket.description}
                                        onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>{t('cancel')}</button>
                                <button type="submit" className="btn btn-primary">{t('submitTicket')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toastMsg && <div className="toast success">✅ {toastMsg}</div>}
        </>
    );
}
