'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function AdminDashboard() {
    const { t } = useLanguage();

    const stats = [
        { label: t.admin.statPending, value: '12', type: 'pending' },
        { label: t.admin.statApproved, value: '5', type: 'approved' },
        { label: t.admin.statSales, value: '1,240,000,000 đ', type: 'total' },
        { label: t.admin.statOverdue, value: '3', type: 'overdue' },
    ];

    const recentContracts = [
        { id: '1', customer: 'Nguyễn Văn A', unit: 'A-101', value: '15,000,000 đ', date: '2024-03-20', status: 'PENDING' },
        { id: '2', customer: 'Trần Thị B', unit: 'B-205', value: '12,500,000 đ', date: '2024-03-19', status: 'APPROVED' },
        { id: '3', customer: 'Lê Văn C', unit: 'C-302', value: '20,000,000 đ', date: '2024-03-18', status: 'REJECTED' },
        { id: '4', customer: 'Phạm Minh D', unit: 'A-504', value: '18,500,000 đ', date: '2024-03-18', status: 'PENDING' },
        { id: '5', customer: 'Hoàng Anh E', unit: 'B-102', value: '10,000,000 đ', date: '2024-03-17', status: 'APPROVED' },
    ];

    return (
        <>
            <div className="admin-header">
                <h1>{t.admin.navDashboard}</h1>
            </div>

            <div className="stats-grid">
                {stats.map((s, idx) => (
                    <div key={idx} className={`stat-card ${s.type}`}>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value">{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="admin-card">
                <div style={{ marginBottom: '20px', fontWeight: 700, fontSize: '1.125rem' }}>
                    {t.admin.chartTitle}
                </div>
                {/* Simplified Line Chart Placeholder */}
                <div style={{ height: '200px', background: '#F9FAFB', border: '1px dashed #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.875rem' }}>
                    [ Simplified Line Chart Visualization ]
                </div>
            </div>

            <div className="admin-card" style={{ padding: 0 }}>
                <div style={{ padding: '20px', fontWeight: 700, fontSize: '1.125rem', borderBottom: '1px solid #E5E7EB' }}>
                    {t.admin.recentContracts}
                </div>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>{t.admin.colCustomer}</th>
                                <th>{t.admin.colUnit}</th>
                                <th>{t.admin.colAmount}</th>
                                <th>{t.admin.colDate}</th>
                                <th>{t.admin.colStatus}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentContracts.map(c => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: 600 }}>{c.customer}</td>
                                    <td>{c.unit}</td>
                                    <td>{c.value}</td>
                                    <td>{c.date}</td>
                                    <td>
                                        <span className={`badge-fixed ${c.status === 'PENDING' ? 'badge-yellow' : c.status === 'APPROVED' ? 'badge-green' : 'badge-red'}`}>
                                            {t.contracts.approvals[c.status as keyof typeof t.contracts.approvals]}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
