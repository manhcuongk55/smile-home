'use client';

import { useState, useEffect } from 'react';

interface Contract {
    id: string;
    roomId: string;
    room: {
        number: string;
        building: { name: string };
    };
    personId: string;
    person: { name: string; email?: string };
    type: string;
    status: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    deposit: number;
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

export default function ContractsPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [persons, setPersons] = useState<Person[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newContract, setNewContract] = useState({
        roomId: '',
        personId: '',
        type: 'RENTAL',
        startDate: '',
        endDate: '',
        monthlyRent: 0,
        deposit: 0,
    });
    const [toastMsg, setToastMsg] = useState('');

    useEffect(() => {
        fetchContracts();
        fetchRooms();
        fetchPersons();
    }, []);

    async function fetchContracts() {
        const res = await fetch('/api/contracts');
        const data = await res.json();
        setContracts(Array.isArray(data) ? data : []);
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
            const res = await fetch('/api/contracts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newContract),
            });
            if (res.ok) {
                setShowCreateModal(false);
                setNewContract({
                    roomId: '',
                    personId: '',
                    type: 'RENTAL',
                    startDate: '',
                    endDate: '',
                    monthlyRent: 0,
                    deposit: 0,
                });
                setToastMsg('Contract created successfully!');
                fetchContracts();
                setTimeout(() => setToastMsg(''), 3000);
            }
        } catch (err) {
            console.error(err);
        }
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(amount);
    }

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>Contract Management</h1>
                    <p>Legally binding agreements between property and tenants</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    ➕ New Contract
                </button>
            </div>

            <div className="card-container">
                {contracts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📄</div>
                        <h3>No contracts found</h3>
                        <p>Create your first contract to manage tenant stays.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Tenant</th>
                                    <th>Room</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Period</th>
                                    <th>Rent</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contracts.map((contract) => (
                                    <tr key={contract.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{contract.person.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{contract.person.email}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{contract.room.number}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{contract.room.building.name}</div>
                                        </td>
                                        <td><span className="badge blue">{contract.type}</span></td>
                                        <td>
                                            <span className={`badge ${contract.status === 'ACTIVE' ? 'emerald' : contract.status === 'DRAFT' ? 'amber' : 'rose'}`}>
                                                {contract.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.85rem' }}>{formatDate(contract.startDate)} - {formatDate(contract.endDate)}</div>
                                        </td>
                                        <td style={{ fontWeight: 700 }}>{formatCurrency(contract.monthlyRent)}</td>
                                        <td>
                                            <button className="btn btn-sm btn-secondary">View Details</button>
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
                            <h2>New Contract</h2>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Tenant *</label>
                                        <select
                                            className="form-select"
                                            value={newContract.personId}
                                            onChange={(e) => setNewContract({ ...newContract, personId: e.target.value })}
                                            required
                                        >
                                            <option value="">Select a person...</option>
                                            {persons.map((p) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Room *</label>
                                        <select
                                            className="form-select"
                                            value={newContract.roomId}
                                            onChange={(e) => setNewContract({ ...newContract, roomId: e.target.value })}
                                            required
                                        >
                                            <option value="">Select a room...</option>
                                            {rooms.map((r) => (
                                                <option key={r.id} value={r.id}>{r.building.name} - {r.number}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Start Date *</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={newContract.startDate}
                                            onChange={(e) => setNewContract({ ...newContract, startDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>End Date *</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={newContract.endDate}
                                            onChange={(e) => setNewContract({ ...newContract, endDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Monthly Rent (THB) *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={newContract.monthlyRent}
                                            onChange={(e) => setNewContract({ ...newContract, monthlyRent: parseFloat(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Security Deposit (THB)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={newContract.deposit}
                                            onChange={(e) => setNewContract({ ...newContract, deposit: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Contract Type</label>
                                    <select
                                        className="form-select"
                                        value={newContract.type}
                                        onChange={(e) => setNewContract({ ...newContract, type: e.target.value })}
                                    >
                                        <option value="RENTAL">Rental Agreement</option>
                                        <option value="SALE">Sale Agreement</option>
                                        <option value="MANAGEMENT">Management Agreement</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Contract</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toastMsg && <div className="toast success">✅ {toastMsg}</div>}
        </>
    );
}
