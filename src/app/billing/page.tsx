'use client';

import { useState, useEffect } from 'react';

interface Invoice {
    id: string;
    invoiceNumber: string;
    amount: number;
    dueDate: string;
    status: string;
    contract: {
        person: { name: string; email?: string };
        room: { number: string; building: { name: string } };
    };
}

export default function BillingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMsg, setToastMsg] = useState('');
    const [showLogModal, setShowLogModal] = useState<string | null>(null);
    const [logContent, setLogContent] = useState('');

    useEffect(() => {
        fetchInvoices();
    }, []);

    async function fetchInvoices() {
        const res = await fetch('/api/invoices');
        const data = await res.json();
        setInvoices(data);
        setLoading(false);
    }

    async function updateStatus(id: string, newStatus: string) {
        try {
            const res = await fetch(`/api/invoices/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setToastMsg(`Invoice ${newStatus} successfully!`);
                fetchInvoices();
                setTimeout(() => setToastMsg(''), 3000);
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function handleLogSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!showLogModal || !logContent) return;

        try {
            const invoice = invoices.find(inv => inv.id === showLogModal);
            const res = await fetch('/api/interactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    personId: invoice?.contract.personId || '', // In a real app, this would be the current user
                    invoiceId: showLogModal,
                    subject: `Billing Note: ${invoice?.invoiceNumber}`,
                    content: logContent,
                    channel: 'CHAT',
                    direction: 'INTERNAL'
                }),
            });
            if (res.ok) {
                setToastMsg('Note added successfully!');
                setShowLogModal(null);
                setLogContent('');
                setTimeout(() => setToastMsg(''), 3000);
            }
        } catch (err) {
            console.error(err);
        }
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    if (loading) return <div>Loading Billing Dashboard...</div>;

    return (
        <div className="container">
            <div className="page-header">
                <h1>Accounting & Billing</h1>
                <p>Verify tenant payments and manage financial records</p>
            </div>

            <div className="card-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Invoice #</th>
                            <th>Tenant</th>
                            <th>Room</th>
                            <th>Amount</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((inv) => (
                            <tr key={inv.id}>
                                <td style={{ fontWeight: 'bold' }}>{inv.invoiceNumber}</td>
                                <td>{inv.contract.person.name}</td>
                                <td>{inv.contract.room.number} ({inv.contract.room.building.name})</td>
                                <td style={{ fontWeight: 'bold' }}>${inv.amount.toLocaleString()}</td>
                                <td>{formatDate(inv.dueDate)}</td>
                                <td>
                                    <span className={`badge ${inv.status === 'VERIFIED' ? 'emerald' :
                                        inv.status === 'PAID' ? 'blue' :
                                            inv.status === 'OVERDUE' ? 'rose' :
                                                inv.status === 'PENDING' ? 'amber' :
                                                    'secondary'
                                        }`}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {inv.status === 'PENDING' && (
                                            <button className="btn btn-sm btn-primary" onClick={() => updateStatus(inv.id, 'PAID')}>
                                                Paid
                                            </button>
                                        )}
                                        {inv.status === 'PAID' && (
                                            <button className="btn btn-sm btn-emerald" onClick={() => updateStatus(inv.id, 'VERIFIED')} style={{ background: 'var(--accent-emerald)', color: 'white' }}>
                                                Verify
                                            </button>
                                        )}
                                        <button className="btn btn-sm btn-secondary" onClick={() => setShowLogModal(inv.id)}>Log Log</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showLogModal && (
                <div className="modal-overlay" onClick={() => setShowLogModal(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add Communication Log</h2>
                            <button className="modal-close" onClick={() => setShowLogModal(null)}>✕</button>
                        </div>
                        <form onSubmit={handleLogSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Note / Interaction Content</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Record payment verification details, tenant communication, etc."
                                        value={logContent}
                                        onChange={(e) => setLogContent(e.target.value)}
                                        required
                                        style={{ minHeight: 120 }}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowLogModal(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Note</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toastMsg && <div className="toast success">✅ {toastMsg}</div>}
        </div>
    );
}
