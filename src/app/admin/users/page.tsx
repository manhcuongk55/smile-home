'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function AdminUsers() {
    const { t } = useLanguage();

    const users = [
        { id: '1', name: 'Admin User', role: 'Admin', status: 'ACTIVE', date: '2024-01-15' },
        { id: '2', name: 'Finance Controller', role: 'Finance', status: 'ACTIVE', date: '2024-02-01' },
        { id: '3', name: 'Sales Agent', role: 'Sale', status: 'ACTIVE', date: '2024-02-10' },
        { id: '4', name: 'Locked Account', role: 'Sale', status: 'LOCKED', date: '2024-02-15' },
    ];

    return (
        <>
            <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>{t.admin.navUsers}</h1>
                <button className="btn-solid btn-solid-green" style={{ borderRadius: '4px' }}>
                    {t.admin.btnCreateUser}
                </button>
            </div>

            <div className="admin-card" style={{ padding: 0 }}>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>{t.contracts.labelName}</th>
                                <th>{t.admin.colRole}</th>
                                <th>{t.admin.colStatus}</th>
                                <th>{t.admin.colDate}</th>
                                <th style={{ textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                                    <td>
                                        <span className="badge-fixed badge-blue" style={{ fontSize: '0.65rem' }}>{u.role}</span>
                                    </td>
                                    <td>
                                        <span className={`badge-fixed ${u.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>
                                            {u.status === 'ACTIVE' ? t.admin.statusActive : t.admin.statusLocked}
                                        </span>
                                    </td>
                                    <td>{u.date}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button style={{ background: 'none', border: 'none', color: 'var(--admin-accent-blue)', fontWeight: 600, cursor: 'pointer', marginRight: '16px' }}>
                                            {t.admin.actionEdit}
                                        </button>
                                        <button style={{ background: 'none', border: 'none', color: 'var(--admin-accent-red)', fontWeight: 600, cursor: 'pointer' }}>
                                            {u.status === 'ACTIVE' ? t.admin.actionLock : 'Mở khóa'}
                                        </button>
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
