'use client';

import { useState, useEffect } from 'react';

interface Invoice {
    id: string;
    invoiceNumber: string;
    amount: number;
    dueDate: string;
    status: string;
    contract: {
        room: { number: string; building: { name: string } };
    };
}

export default function TenantBillingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, we'd filter by the current user's personId
        // For this demo, we'll just show all and label it as "My Invoices"
        fetch('/api/invoices')
            .then(res => res.json())
            .then(data => {
                setInvoices(data);
                setLoading(false);
            });
    }, []);

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    if (loading) return <div>Loading My Billing...</div>;

    return (
        <div className="container">
            <div className="page-header">
                <h1>My Invoices</h1>
                <p>Track your rental payments and upcoming bills</p>
            </div>

            <div className="card-container">
                {invoices.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💸</div>
                        <h3>No invoices yet</h3>
                        <p>Your billing history will appear here once generated.</p>
                    </div>
                ) : (
                    <div className="invoice-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                        {invoices.map((inv) => (
                            <div key={inv.id} className="card" style={{ borderLeft: `5px solid ${inv.status === 'VERIFIED' ? 'var(--accent-emerald)' : 'var(--accent-amber)'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{inv.invoiceNumber}</span>
                                    <span className={`badge ${inv.status === 'VERIFIED' ? 'emerald' :
                                            inv.status === 'PAID' ? 'blue' :
                                                inv.status === 'PENDING' ? 'amber' :
                                                    'secondary'
                                        }`}>
                                        {inv.status}
                                    </span>
                                </div>
                                <div style={{ marginBottom: 10 }}>
                                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>Amount Due</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>${inv.amount.toLocaleString()}</div>
                                </div>
                                <div style={{ fontSize: '0.9rem', marginBottom: 20 }}>
                                    <div>📅 Due: {formatDate(inv.dueDate)}</div>
                                    <div>🏠 Room: {inv.contract.room.number}</div>
                                </div>
                                {inv.status === 'PENDING' && (
                                    <button className="btn btn-primary w-full">Pay Now</button>
                                )}
                                {inv.status === 'PAID' && (
                                    <div className="text-center text-muted" style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                                        Verification by accounting in progress...
                                    </div>
                                )}
                                {inv.status === 'VERIFIED' && (
                                    <button className="btn btn-secondary w-full">Download Receipt</button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
