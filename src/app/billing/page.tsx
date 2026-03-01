'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

interface Invoice {
    id: string;
    invoiceNumber: string;
    amount: number;
    dueDate: string;
    status: string;
    contract: {
        id: string;
        personId: string;
        person: { name: string; email?: string };
        room: {
            number: string;
            buildingId: string;
            building: { id: string; name: string; propertyId: string }
        };
    };
    interactions?: { id: string; subject: string; content: string; createdAt: string }[];
}

interface BillingStats {
    totalRevenue: number;
    totalInvoices: number;
    pendingAmount: number;
    verifiedRevenue: number;
    statusCounts: Record<string, number>;
    monthlyRevenue: { month: string; amount: number }[];
}

interface Property {
    id: string;
    name: string;
    buildings: { id: string; name: string }[];
}

export default function BillingPage() {
    const { t } = useLanguage();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [stats, setStats] = useState<BillingStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [propertyFilter, setPropertyFilter] = useState('ALL');
    const [toastMsg, setToastMsg] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [logContent, setLogContent] = useState('');
    const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

    useEffect(() => {
        Promise.all([fetchInvoices(), fetchStats(), fetchProperties()]).then(() => setLoading(false));
    }, []);

    async function fetchInvoices() {
        const res = await fetch('/api/invoices');
        const data = await res.json();
        setInvoices(data);
    }

    async function fetchStats() {
        const res = await fetch('/api/reports/financial');
        const data = await res.json();
        setStats(data);
    }

    async function fetchProperties() {
        const res = await fetch('/api/properties');
        const data = await res.json();
        setProperties(data);
    }

    async function updateStatus(id: string, newStatus: string) {
        try {
            const res = await fetch(`/api/invoices/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setToastMsg(`Invoice marked as ${newStatus}`);
                fetchInvoices();
                fetchStats();
                if (selectedInvoice && selectedInvoice.id === id) {
                    setSelectedInvoice({ ...selectedInvoice, status: newStatus });
                }
                setTimeout(() => setToastMsg(''), 3000);
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function handleLogSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedInvoice || !logContent) return;

        try {
            const res = await fetch('/api/interactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    personId: selectedInvoice.contract.personId,
                    invoiceId: selectedInvoice.id,
                    subject: `Billing Note: ${selectedInvoice.invoiceNumber}`,
                    content: logContent,
                    channel: 'CHAT',
                    direction: 'INTERNAL'
                }),
            });
            if (res.ok) {
                const newLog = await res.json();
                setToastMsg('Interaction logged successfully');
                setLogContent('');
                if (selectedInvoice) {
                    setSelectedInvoice({
                        ...selectedInvoice,
                        interactions: [newLog, ...(selectedInvoice.interactions || [])]
                    });
                }
                fetchInvoices(); // Also refresh the main list if needed
                setTimeout(() => setToastMsg(''), 3000);
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function bulkVerify() {
        if (selectedInvoices.length === 0) return;
        setToastMsg(`Verifying ${selectedInvoices.length} invoices...`);
        for (const id of selectedInvoices) {
            const inv = invoices.find(i => i.id === id);
            if (inv && inv.status === 'PAID') {
                await fetch(`/api/invoices/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'VERIFIED' }),
                });
            }
        }
        setToastMsg(`Successfully verified ${selectedInvoices.length} payments!`);
        setSelectedInvoices([]);
        fetchInvoices();
        fetchStats();
        setTimeout(() => setToastMsg(''), 3000);
    }

    function exportLedger() {
        setToastMsg('Ledger exported to CSV successfully! (Simulated)');
        setTimeout(() => setToastMsg(''), 3000);
    }

    const filteredInvoices = invoices.filter(inv => {
        const statusMatch = filter === 'ALL' || inv.status === filter;
        const propertyMatch = propertyFilter === 'ALL' || inv.contract.room.building.propertyId === propertyFilter;
        return statusMatch && propertyMatch;
    });

    const maxMonthlyRev = Math.max(...(stats?.monthlyRevenue.map(m => m.amount) || [1]));

    if (loading) return <div className="loading-state">Syncing Ledger Balance...</div>;

    return (
        <div className="container">
            <div className="page-header" style={{ marginBottom: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1>{t('accountingLedger' as any)}</h1>
                    <p>{t('financialRecords' as any)}</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-secondary" onClick={exportLedger}>📤 {t('exportLedger' as any)}</button>
                    {selectedInvoices.length > 0 && (
                        <button className="btn btn-emerald" onClick={bulkVerify}>✅ {t('verifyPayment' as any)} ({selectedInvoices.length})</button>
                    )}
                </div>
            </div>

            {/* Stats & Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
                {[
                    { labelKey: 'billedRevenue', value: stats?.totalRevenue, color: 'blue', icon: '📈' },
                    { labelKey: 'verifiedRevenue', value: stats?.verifiedRevenue, color: 'emerald', icon: '🛡️' },
                    { labelKey: 'pendingCollection', value: stats?.pendingAmount, color: 'amber', icon: '⏳' },
                    { labelKey: 'monthlyGrowth', value: stats?.totalInvoices, color: 'purple', icon: '📊' }
                ].map((s, idx) => (
                    <div key={idx} className={`stat-card ${s.color}`} style={{ position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t(s.labelKey as any)}</div>
                            <div style={{ fontSize: '1.2rem' }}>{s.icon}</div>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                            {typeof s.value === 'number' && s.labelKey.includes('Revenue') ? `$${s.value.toLocaleString()}` : s.value}
                        </div>

                        {/* Mini Revenue Curve Simulation */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, display: 'flex', alignItems: 'flex-end', padding: '0 10px', gap: 4 }}>
                            {stats?.monthlyRevenue.map((m, i) => (
                                <div
                                    key={i}
                                    style={{
                                        flex: 1,
                                        height: `${(m.amount / maxMonthlyRev) * 30}px`,
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        borderRadius: '2px 2px 0 0'
                                    }}
                                    title={`${m.month}: $${m.amount.toLocaleString()}`}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Advanced Filters */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center' }}>
                <div className="filter-tabs">
                    {[
                        { id: 'ALL', key: 'statusAll' },
                        { id: 'PENDING', key: 'statusPending' },
                        { id: 'PAID', key: 'statusPaid' },
                        { id: 'VERIFIED', key: 'statusVerified' }
                    ].map(s => (
                        <button
                            key={s.id}
                            className={`filter-tab ${filter === s.id ? 'active' : ''}`}
                            onClick={() => setFilter(s.id)}
                        >
                            {t(s.key as any)} {stats?.statusCounts[s.id] ? <span style={{ marginLeft: 4, opacity: 0.6 }}>{stats.statusCounts[s.id]}</span> : ''}
                        </button>
                    ))}
                </div>

                <div style={{ flex: 1 }}></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('property' as any)}:</span>
                    <select
                        className="form-select"
                        value={propertyFilter}
                        onChange={(e) => setPropertyFilter(e.target.value)}
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    >
                        <option value="ALL">{t('allProperties' as any)}</option>
                        {properties.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="card-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: 40 }}>
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedInvoices(filteredInvoices.map(i => i.id));
                                        else setSelectedInvoices([]);
                                    }}
                                    checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                                />
                            </th>
                            <th>{t('invoiceNumber' as any)}</th>
                            <th>{t('tenant' as any)}</th>
                            <th>{t('property' as any)} / {t('room' as any)}</th>
                            <th>{t('amount' as any)}</th>
                            <th>{t('dueDate' as any)}</th>
                            <th>{t('status' as any)}</th>
                            <th>{t('actions' as any)}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map((inv) => (
                            <tr key={inv.id} className="row-hover" onClick={() => setSelectedInvoice(inv)} style={{ cursor: 'pointer' }}>
                                <td onClick={e => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={selectedInvoices.includes(inv.id)}
                                        onChange={() => {
                                            if (selectedInvoices.includes(inv.id)) setSelectedInvoices(selectedInvoices.filter(id => id !== inv.id));
                                            else setSelectedInvoices([...selectedInvoices, inv.id]);
                                        }}
                                    />
                                </td>
                                <td style={{ fontWeight: 'bold', color: 'var(--accent-blue)' }}>{inv.invoiceNumber}</td>
                                <td>{inv.contract.person.name}</td>
                                <td>
                                    <div style={{ fontSize: '0.85rem' }}>{inv.contract.room?.building?.name}</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{t('room' as any)} {inv.contract.room?.number}</div>
                                </td>
                                <td style={{ fontWeight: 'bold' }}>${inv.amount.toLocaleString()}</td>
                                <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                                <td>
                                    <span className={`badge ${inv.status === 'VERIFIED' ? 'emerald' :
                                        inv.status === 'PAID' ? 'blue' : 'amber'
                                        }`}>
                                        {t(`status${inv.status.charAt(0) + inv.status.slice(1).toLowerCase()}` as any)}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                                        {inv.status === 'PAID' && (
                                            <button className="btn btn-xs btn-emerald" onClick={() => updateStatus(inv.id, 'VERIFIED')}>{t('review' as any)}</button>
                                        )}
                                        <button className="btn btn-xs btn-secondary" onClick={() => setSelectedInvoice(inv)}>{t('view' as any)}</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {selectedInvoice && (
                <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
                    <div className="modal wide" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 style={{ margin: 0 }}>{t('invoiceDetail' as any)} {selectedInvoice.invoiceNumber}</h2>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {selectedInvoice.contract.person.name} — Building {selectedInvoice.contract.room.building.name}
                                </p>
                            </div>
                            <button className="modal-close" onClick={() => setSelectedInvoice(null)}>✕</button>
                        </div>
                        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 32 }}>
                            <div>
                                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{t('amount' as any)}</label>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>${selectedInvoice.amount.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{t('dueDate' as any)}</label>
                                            <div style={{ fontSize: '1.1rem' }}>{new Date(selectedInvoice.dueDate).toLocaleDateString()}</div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{t('status' as any)}</label>
                                            <div style={{ marginTop: 4 }}>
                                                <span className={`badge ${selectedInvoice.status === 'VERIFIED' ? 'emerald' : 'amber'}`}>
                                                    {selectedInvoice.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <h3>{t('auditLogs' as any)}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                                    {selectedInvoice.interactions && selectedInvoice.interactions.length > 0 ? (
                                        selectedInvoice.interactions.map(log => (
                                            <div key={log.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 12, background: 'rgba(255,255,255,0.05)' }}>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: 4 }}>
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </div>
                                                <div style={{ fontSize: '0.85rem' }}>{log.content}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 16, background: 'rgba(0,0,0,0.2)' }}>
                                            <p style={{ fontSize: '0.85rem', fontStyle: 'italic', opacity: 0.6 }}>{t('noLogsFound' as any)}</p>
                                        </div>
                                    )}
                                </div>

                                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 20 }}>
                                    <h4>{t('addNote' as any)}</h4>
                                    <form onSubmit={handleLogSubmit} style={{ display: 'flex', gap: 10 }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder={t('notePlaceholder' as any)}
                                            value={logContent}
                                            onChange={(e) => setLogContent(e.target.value)}
                                            style={{ flex: 1 }}
                                        />
                                        <button className="btn btn-secondary" type="submit">{t('save' as any)}</button>
                                    </form>
                                </div>
                            </div>

                            <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: 32 }}>
                                <h3 style={{ fontSize: '0.9rem', marginBottom: 16 }}>{t('ledgerActions' as any)}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {selectedInvoice.status === 'PAID' && (
                                        <button className="btn btn-emerald" onClick={() => updateStatus(selectedInvoice.id, 'VERIFIED')}>{t('verifyPayment' as any)}</button>
                                    )}
                                    {selectedInvoice.status === 'PENDING' && (
                                        <button className="btn btn-primary" onClick={() => updateStatus(selectedInvoice.id, 'PAID')}>{t('receivePayment' as any)}</button>
                                    )}
                                    <button className="btn btn-secondary" onClick={() => setToastMsg('Re-sending invoice to tenant...')}>{t('reSendEmail' as any)}</button>
                                    <button className="btn btn-secondary">{t('printVoucher' as any)}</button>
                                    <div style={{ marginTop: 20, borderTop: '1px solid var(--border-subtle)', paddingTop: 20 }}>
                                        <button className="btn btn-secondary" style={{ width: '100%', color: 'var(--accent-rose)' }}>{t('flagDispute' as any)}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toastMsg && <div className="toast success">✅ {toastMsg}</div>}
        </div>
    );
}
