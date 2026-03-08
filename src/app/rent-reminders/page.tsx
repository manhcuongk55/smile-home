'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

interface RentReminder {
    contractId: string;
    roomNumber: string;
    roomId: string;
    buildingName: string;
    tenantName: string;
    tenantPhone?: string;
    tenantEmail?: string;
    monthlyRent: number;
    paymentStatus: string;
    totalOwed: number;
    overdueCount: number;
    unpaidCount: number;
    daysSinceLastDue: number | null;
    latestInvoice: {
        id: string;
        invoiceNumber: string;
        amount: number;
        dueDate: string;
        status: string;
    } | null;
}

interface Stats {
    totalRooms: number;
    paidRooms: number;
    pendingRooms: number;
    overdueRooms: number;
    totalOwed: number;
}

const STATUS_CONFIG: Record<string, { icon: string; label: string; color: string; css: string }> = {
    OVERDUE: { icon: '🔴', label: 'Quá hạn', color: 'var(--accent-rose)', css: 'rose' },
    PENDING: { icon: '🟡', label: 'Chờ thanh toán', color: 'var(--accent-amber)', css: 'amber' },
    PAID: { icon: '🟢', label: 'Đã thanh toán', color: 'var(--accent-emerald)', css: 'emerald' },
};

function formatMoney(n: number) {
    return n.toLocaleString('vi-VN') + 'đ';
}

export default function RentRemindersPage() {
    const [reminders, setReminders] = useState<RentReminder[]>([]);
    const [stats, setStats] = useState<Stats>({ totalRooms: 0, paidRooms: 0, pendingRooms: 0, overdueRooms: 0, totalOwed: 0 });
    const [filterStatus, setFilterStatus] = useState('');
    const [toastMsg, setToastMsg] = useState('');
    const [copiedId, setCopiedId] = useState('');
    const { t } = useLanguage();

    const fetchData = useCallback(async () => {
        const params = new URLSearchParams();
        if (filterStatus) params.set('status', filterStatus);
        const res = await fetch(`/api/rent-reminders?${params.toString()}`);
        const data = await res.json();
        setReminders(data.reminders || []);
        setStats(data.stats || { totalRooms: 0, paidRooms: 0, pendingRooms: 0, overdueRooms: 0, totalOwed: 0 });
    }, [filterStatus]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    function generateReminderMessage(r: RentReminder) {
        const buildingInfo = r.buildingName ? ` - ${r.buildingName}` : '';
        if (r.paymentStatus === 'OVERDUE') {
            return `⚠️ Nhắc nhở: Phòng ${r.roomNumber}${buildingInfo}\nKính gửi ${r.tenantName},\nTiền phòng tháng này đã quá hạn ${Math.abs(r.daysSinceLastDue || 0)} ngày.\nSố tiền cần thanh toán: ${formatMoney(r.totalOwed)}\nVui lòng thanh toán sớm nhất có thể.\nTrân trọng! 🏠`;
        }
        return `🔔 Nhắc nhở: Phòng ${r.roomNumber}${buildingInfo}\nKính gửi ${r.tenantName},\nTiền phòng tháng này: ${formatMoney(r.monthlyRent)}\nVui lòng thanh toán trước ngày đến hạn.\nTrân trọng! 🏠`;
    }

    async function copyReminder(r: RentReminder) {
        const msg = generateReminderMessage(r);
        await navigator.clipboard.writeText(msg);
        setCopiedId(r.contractId);
        setToastMsg(`✅ Đã sao chép tin nhắn nhắc tiền phòng ${r.roomNumber}`);
        setTimeout(() => { setCopiedId(''); setToastMsg(''); }, 3000);
    }

    const paidPercent = stats.totalRooms > 0 ? Math.round((stats.paidRooms / stats.totalRooms) * 100) : 0;

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>🔔 {t('rentReminders')}</h1>
                    <p>{t('rentRemindersSubtitle')}</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-label">{t('totalRoomsActive')}</div>
                    <div className="stat-value">{stats.totalRooms}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">🟢 {t('paidRooms')}</div>
                    <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>{stats.paidRooms}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">🟡 {t('pendingPayment')}</div>
                    <div className="stat-value" style={{ color: 'var(--accent-amber)' }}>{stats.pendingRooms}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">🔴 {t('overduePayment')}</div>
                    <div className="stat-value" style={{ color: 'var(--accent-rose)' }}>{stats.overdueRooms}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">💰 {t('totalOwedAmount')}</div>
                    <div className="stat-value" style={{ color: 'var(--accent-rose)', fontSize: '1.2rem' }}>{formatMoney(stats.totalOwed)}</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: 24, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
                    <span>{t('collectionProgress')}</span>
                    <span style={{ fontWeight: 700, color: paidPercent >= 80 ? 'var(--accent-emerald)' : paidPercent >= 50 ? 'var(--accent-amber)' : 'var(--accent-rose)' }}>{paidPercent}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${paidPercent}%`, background: paidPercent >= 80 ? 'var(--accent-emerald)' : paidPercent >= 50 ? 'var(--accent-amber)' : 'var(--accent-rose)', borderRadius: 99, transition: 'width 0.6s ease' }} />
                </div>
            </div>

            {/* Filter */}
            <div className="commission-filter-bar" style={{ gap: 12 }}>
                <button className={`commission-tab ${filterStatus === '' ? 'active' : ''}`} onClick={() => setFilterStatus('')}>
                    📋 {t('allRooms')} ({stats.totalRooms})
                </button>
                <button className={`commission-tab ${filterStatus === 'OVERDUE' ? 'active' : ''}`} onClick={() => setFilterStatus('OVERDUE')} style={filterStatus === 'OVERDUE' ? { background: 'var(--accent-rose)', boxShadow: '0 4px 15px var(--accent-rose-glow)' } : {}}>
                    🔴 {t('overdueOnly')} ({stats.overdueRooms})
                </button>
                <button className={`commission-tab ${filterStatus === 'PENDING' ? 'active' : ''}`} onClick={() => setFilterStatus('PENDING')} style={filterStatus === 'PENDING' ? { background: 'var(--accent-amber)', color: '#000', boxShadow: '0 4px 15px var(--accent-amber-glow)' } : {}}>
                    🟡 {t('unpaidOnly')} ({stats.pendingRooms + stats.overdueRooms})
                </button>
            </div>

            {/* Room List */}
            {reminders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🎉</div>
                    <h3>{t('allPaid')}</h3>
                    <p>{t('allPaidDesc')}</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                    {reminders.map((r) => {
                        const cfg = STATUS_CONFIG[r.paymentStatus] || STATUS_CONFIG.PAID;
                        return (
                            <div
                                key={r.contractId}
                                className="activity-item"
                                style={{ cursor: 'default' }}
                            >
                                <div className="activity-icon-col">
                                    <div className={`activity-icon-dot ${cfg.css}`} style={{ fontSize: '1.1rem' }}>
                                        {cfg.icon}
                                    </div>
                                </div>
                                <div className="activity-content" style={{ borderLeft: `3px solid ${cfg.color}` }}>
                                    <div className="activity-header-row">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '1rem', fontWeight: 700 }}>🏠 {r.roomNumber}</span>
                                            {r.buildingName && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 99 }}>{r.buildingName}</span>}
                                            <span className={`badge ${cfg.css}`} style={{ fontSize: '0.65rem' }}>{cfg.label}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            {r.paymentStatus !== 'PAID' && (
                                                <button
                                                    className="btn btn-sm"
                                                    onClick={() => copyReminder(r)}
                                                    style={{
                                                        fontSize: '0.7rem',
                                                        padding: '4px 12px',
                                                        background: copiedId === r.contractId ? 'var(--accent-emerald)' : 'var(--accent-blue)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    {copiedId === r.contractId ? '✅ Đã copy' : '📋 Copy nhắc nhở'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 24, marginTop: 8, flexWrap: 'wrap', fontSize: '0.8rem' }}>
                                        <div>
                                            <span style={{ color: 'var(--text-muted)' }}>👤 </span>
                                            <span style={{ fontWeight: 600 }}>{r.tenantName}</span>
                                        </div>
                                        {r.tenantPhone && (
                                            <div>
                                                <span style={{ color: 'var(--text-muted)' }}>📱 </span>
                                                <a href={`tel:${r.tenantPhone}`} style={{ color: 'var(--accent-blue)' }}>{r.tenantPhone}</a>
                                            </div>
                                        )}
                                        <div>
                                            <span style={{ color: 'var(--text-muted)' }}>💰 Tiền phòng: </span>
                                            <span style={{ fontWeight: 600 }}>{formatMoney(r.monthlyRent)}</span>
                                        </div>
                                        {r.totalOwed > 0 && (
                                            <div>
                                                <span style={{ color: 'var(--accent-rose)' }}>⚠️ Còn nợ: </span>
                                                <span style={{ fontWeight: 700, color: 'var(--accent-rose)' }}>{formatMoney(r.totalOwed)}</span>
                                            </div>
                                        )}
                                        {r.daysSinceLastDue !== null && r.daysSinceLastDue > 0 && r.paymentStatus === 'OVERDUE' && (
                                            <div>
                                                <span style={{ color: 'var(--accent-rose)' }}>⏰ Quá hạn: </span>
                                                <span style={{ fontWeight: 700, color: 'var(--accent-rose)' }}>{r.daysSinceLastDue} ngày</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Toast */}
            {toastMsg && (
                <div className="toast-notification" style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--accent-emerald)', color: 'white', padding: '12px 24px', borderRadius: 12, zIndex: 9999, animation: 'fadeIn 300ms ease-out', fontWeight: 600, fontSize: '0.85rem' }}>
                    {toastMsg}
                </div>
            )}
        </>
    );
}
