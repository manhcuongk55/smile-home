'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function AdminPaymentControl() {
    const { t } = useLanguage();

    const payments = [
        { id: '1', customer: 'Nguyễn Văn A', unit: 'A-101', total: '15,000,000 đ', paid: '15,000,000 đ', remaining: '0 đ', status: 'ON_TRACK' },
        { id: '2', customer: 'Trần Thị B', unit: 'B-205', total: '12,500,000 đ', paid: '5,000,000 đ', remaining: '7,500,000 đ', status: 'DUE_SOON' },
        { id: '3', customer: 'Lê Văn C', unit: 'C-302', total: '20,000,000 đ', paid: '0 đ', remaining: '20,000,000 đ', status: 'OVERDUE' },
        { id: '4', customer: 'Phạm Minh D', unit: 'A-504', total: '18,500,000 đ', paid: '18,500,000 đ', remaining: '0 đ', status: 'ON_TRACK' },
        { id: '5', customer: 'Hoàng Anh E', unit: 'B-102', total: '10,000,000 đ', paid: '2,000,000 đ', remaining: '8,000,000 đ', status: 'DUE_SOON' },
        { id: '6', customer: 'Vũ Thị F', unit: 'D-401', total: '25,000,000 đ', paid: '0 đ', remaining: '25,000,000 đ', status: 'OVERDUE' },
    ];

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'ON_TRACK': return 'badge-green';
            case 'DUE_SOON': return 'badge-yellow';
            case 'OVERDUE': return 'badge-red';
            default: return '';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ON_TRACK': return t.admin.statusOnTrack;
            case 'DUE_SOON': return t.admin.statusDueSoon;
            case 'OVERDUE': return t.admin.statusOverdue;
            default: return status;
        }
    };

    return (
        <>
            <div className="admin-header">
                <h1>{t.admin.navPaymentControl}</h1>
            </div>

            <div className="admin-card" style={{ padding: 0 }}>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>{t.admin.colCustomer}</th>
                                <th>{t.admin.colUnit}</th>
                                <th>{t.admin.colAmount}</th>
                                <th>{t.admin.colPaid}</th>
                                <th>{t.admin.colRemaining}</th>
                                <th>{t.admin.colStatus}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(p => (
                                <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => console.log('Open payment detail', p.id)}>
                                    <td style={{ fontWeight: 600 }}>{p.customer}</td>
                                    <td>{p.unit}</td>
                                    <td>{p.total}</td>
                                    <td style={{ color: 'var(--admin-accent-green)', fontWeight: 600 }}>{p.paid}</td>
                                    <td style={{ color: p.remaining !== '0 đ' ? 'var(--admin-accent-red)' : 'inherit', fontWeight: 600 }}>{p.remaining}</td>
                                    <td>
                                        <span className={`badge-fixed ${getStatusStyles(p.status)}`}>
                                            {getStatusLabel(p.status)}
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
