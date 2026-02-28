'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

interface Invoice {
    id: string;
    invoiceNumber: string;
    amount: number;
    status: string;
    dueDate: string;
    issuedDate: string;
    contract: {
        person: { name: string };
        room: { number: string; building: { name: string } };
    };
}

interface Contract {
    id: string;
    person: { name: string };
    room: { number: string };
    monthlyRent: number;
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newInvoice, setNewInvoice] = useState({
        contractId: '',
        amount: 0,
        dueDate: '',
        status: 'DRAFT',
    });
    const [toastMsg, setToastMsg] = useState('');
    const { t } = useLanguage();

    useEffect(() => {
        fetchInvoices();
        fetchContracts();
    }, []);

    async function fetchInvoices() {
        const res = await fetch('/api/invoices');
        const data = await res.json();
        setInvoices(Array.isArray(data) ? data : []);
    }

    async function fetchContracts() {
        const res = await fetch('/api/contracts');
        const data = await res.json();
        setContracts(Array.isArray(data) ? data : []);
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        try {
            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newInvoice),
            });
            if (res.ok) {
                setShowCreateModal(false);
                setNewInvoice({ contractId: '', amount: 0, dueDate: '', status: 'DRAFT' });
                setToastMsg(t('invoiceCreated'));
                fetchInvoices();
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
                    <h1>{t('invoiceTitle')}</h1>
                    <p>{t('invoiceSubtitle')}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    ➕ {t('newInvoice')}
                </button>
            </div>

            <div className="card-container">
                {invoices.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💰</div>
                        <h3>{t('noInvoices')}</h3>
                        <p>{t('createInvoiceToStart')}</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{t('invoiceNumber')}</th>
                                    <th>{t('tenantRoom')}</th>
                                    <th>{t('amount')}</th>
                                    <th>{t('dueDate')}</th>
                                    <th>{t('status')}</th>
                                    <th>{t('issued')}</th>
                                    <th>{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv.id}>
                                        <td style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{inv.invoiceNumber}</td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{inv.contract.person.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('room')} {inv.contract.room.number}</div>
                                        </td>
                                        <td style={{ fontWeight: 700 }}>{formatCurrency(inv.amount)}</td>
                                        <td>{formatDate(inv.dueDate)}</td>
                                        <td>
                                            <span className={`badge ${inv.status === 'PAID' ? 'emerald' : inv.status === 'PENDING' ? 'blue' : 'amber'}`}>
                                                {t(inv.status.toLowerCase() as any) || inv.status}
                                            </span>
                                        </td>
                                        <td>{formatDate(inv.issuedDate)}</td>
                                        <td>
                                            <button className="btn btn-sm btn-secondary">{t('recordPayment')}</button>
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
                            <h2>{t('generateInvoiceModal')}</h2>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>{t('contractLabel')}</label>
                                    <select
                                        className="form-select"
                                        value={newInvoice.contractId}
                                        onChange={(e) => {
                                            const c = contracts.find(x => x.id === e.target.value);
                                            setNewInvoice({ ...newInvoice, contractId: e.target.value, amount: c?.monthlyRent || 0 });
                                        }}
                                        required
                                    >
                                        <option value="">{t('selectContract')}</option>
                                        {contracts.map((c) => (
                                            <option key={c.id} value={c.id}>{c.person.name} - {t('room')} {c.room.number}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t('amountThbLabel')}</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={newInvoice.amount}
                                            onChange={(e) => setNewInvoice({ ...newInvoice, amount: parseFloat(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('dueDateLabel')}</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={newInvoice.dueDate}
                                            onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>{t('initialStatusLabel')}</label>
                                    <select
                                        className="form-select"
                                        value={newInvoice.status}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, status: e.target.value })}
                                    >
                                        <option value="DRAFT">{t('draft')}</option>
                                        <option value="PENDING">{t('pendingSent')}</option>
                                        <option value="PAID">{t('alreadyPaid')}</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>{t('cancel')}</button>
                                <button type="submit" className="btn btn-primary">{t('generateInvoiceBtn')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toastMsg && <div className="toast success">✅ {toastMsg}</div>}
        </>
    );
}
