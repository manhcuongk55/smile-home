'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

interface ReportData {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    portfolioYield: number;
    totalValuation: number;
    totalInvoices: number;
    statusCounts: Record<string, number>;
    statusAmounts: Record<string, number>;
    pendingAmount: number;
    overdueAmount: number;
    verifiedRevenue: number;
    monthlyRevenue: { month: string; amount: number }[];
    occupancyRate: number;
}

export default function ReportsPage() {
    const { t } = useLanguage();
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/reports/financial')
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="loading">Generating Financial Insights...</div>;

    const maxRev = Math.max(...(data?.monthlyRevenue.map(r => r.amount) || [1]));
    const totalAr = (data?.pendingAmount || 0) + (data?.overdueAmount || 0);

    return (
        <div className="container">
            <div className="page-header">
                <h1>{t('financialPerformance' as any)}</h1>
                <p>{t('financialAnalysis' as any)}</p>
            </div>

            <div className="stats-grid" style={{ marginBottom: 32 }}>
                <div className="stat-card blue">
                    <div className="stat-label">{t('verifiedRevenue' as any)}</div>
                    <div className="stat-value">${data?.verifiedRevenue.toLocaleString()}</div>
                </div>
                <div className="stat-card red">
                    <div className="stat-label">{t('totalExpenses' as any)}</div>
                    <div className="stat-value">${data?.totalExpenses.toLocaleString()}</div>
                </div>
                <div className="stat-card emerald" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.4) 100%)', border: '1px solid rgba(16,185,129,0.5)' }}>
                    <div className="stat-label">{t('netIncome' as any)}</div>
                    <div className="stat-value" style={{ color: '#fff' }}>${data?.netIncome.toLocaleString()}</div>
                </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: 32, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat-card amber">
                    <div className="stat-label">{t('accountsReceivable' as any)}</div>
                    <div className="stat-value">${totalAr.toLocaleString()}</div>
                </div>
                <div className="stat-card blue">
                    <div className="stat-label">{t('roomOccupancy' as any)}</div>
                    <div className="stat-value">{Math.round(data?.occupancyRate || 0)}%</div>
                </div>
                <div className="stat-card purple" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div className="stat-label">{t('portfolioYield' as any)}</div>
                    <div className="stat-value">{data?.portfolioYield.toFixed(2)}%</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: 8 }}>{t('valuation' as any)}: ${(data?.totalValuation || 0).toLocaleString()}</div>
                </div>
            </div>

            <div className="content-grid">
                <div className="card">
                    <div className="section-header">
                        <h2>{t('revenueTrends' as any)}</h2>
                    </div>
                    <div className="chart-container" style={{ height: 260, display: 'flex', alignItems: 'flex-end', gap: 16, padding: '20px 10px' }}>
                        {data?.monthlyRevenue.map(rev => (
                            <div key={rev.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: '100%',
                                    background: 'linear-gradient(to top, var(--accent-blue), #60a5fa)',
                                    height: `${(rev.amount / maxRev) * 180}px`,
                                    borderRadius: '6px 6px 0 0',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                }}></div>
                                <div style={{ fontSize: '0.7rem', marginTop: 10, color: 'var(--text-muted)' }}>{rev.month}</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>${Math.round(rev.amount / 1000)}k</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="section-header">
                        <h2>{t('arAgingBreakdown' as any)}</h2>
                    </div>
                    <div style={{ padding: '20px 0' }}>
                        <div style={{ display: 'flex', height: 40, borderRadius: 8, overflow: 'hidden', marginBottom: 24 }}>
                            <div style={{
                                width: `${(data?.overdueAmount || 0) / (totalAr || 1) * 100}%`,
                                background: 'var(--accent-rose)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                            }}>{t('overdue' as any)}</div>
                            <div style={{
                                width: `${(data?.pendingAmount || 0) / (totalAr || 1) * 100}%`,
                                background: 'var(--accent-amber)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'black',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                            }}>{t('current' as any)}</div>
                        </div>
                        <div className="data-grid-slim">
                            <div className="data-item">
                                <label>{t('overdueValue' as any)}</label>
                                <div className="value" style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>${data?.overdueAmount.toLocaleString()}</div>
                            </div>
                            <div className="data-item">
                                <label>{t('currentPending' as any)}</label>
                                <div className="value">${data?.pendingAmount.toLocaleString()}</div>
                            </div>
                            <div className="data-item">
                                <label>{t('collectionRate' as any)}</label>
                                <div className="value">{Math.round(((data?.verifiedRevenue || 0) / ((data?.totalRevenue || 1) + totalAr)) * 100)}%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
