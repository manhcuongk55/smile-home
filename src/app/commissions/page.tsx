'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

interface SalesTeam {
    id: string;
    code: string;
    name: string;
    leader?: string;
    phone?: string;
    commissionRate: number;
    bonusTarget: number;
    bonusRate: number;
    status: string;
    totalContracts: number;
    totalCommissions: number;
    totalPaid: number;
    totalPending: number;
    createdAt: string;
}

interface CommissionRecord {
    id: string;
    salesTeamId: string;
    salesTeam: { code: string; name: string };
    contractId: string;
    contract: {
        room: { number: string; building: { name: string } };
        person: { name: string };
        monthlyRent: number;
    };
    month: string;
    contractValue: number;
    rate: number;
    amount: number;
    bonusAmount: number;
    totalPayout: number;
    status: string;
    note?: string;
    createdAt: string;
}

export default function CommissionsPage() {
    const [activeTab, setActiveTab] = useState<'teams' | 'ledger'>('teams');
    const [teams, setTeams] = useState<SalesTeam[]>([]);
    const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [filterTeamId, setFilterTeamId] = useState('');
    const [calculating, setCalculating] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [newTeam, setNewTeam] = useState({
        code: '',
        name: '',
        leader: '',
        phone: '',
        commissionRate: '5',
        bonusTarget: '0',
        bonusRate: '0',
    });
    const { t } = useLanguage();

    useEffect(() => {
        fetchTeams();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (activeTab === 'ledger') {
            fetchCommissions();
        }
    }, [activeTab, selectedMonth, filterTeamId]); // eslint-disable-line react-hooks/exhaustive-deps

    async function fetchTeams() {
        const res = await fetch('/api/sales-teams');
        const data = await res.json();
        setTeams(Array.isArray(data) ? data : []);
    }

    async function fetchCommissions() {
        const params = new URLSearchParams();
        if (selectedMonth) params.set('month', selectedMonth);
        if (filterTeamId) params.set('salesTeamId', filterTeamId);
        const res = await fetch(`/api/commissions?${params.toString()}`);
        const data = await res.json();
        setCommissions(Array.isArray(data) ? data : []);
    }

    async function handleCreateTeam(e: React.FormEvent) {
        e.preventDefault();
        try {
            const res = await fetch('/api/sales-teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newTeam,
                    commissionRate: parseFloat(newTeam.commissionRate),
                    bonusTarget: parseFloat(newTeam.bonusTarget),
                    bonusRate: parseFloat(newTeam.bonusRate),
                }),
            });
            if (res.status === 409) {
                showToast('❌ ' + t('teamCodeExists'));
                return;
            }
            if (res.ok) {
                setShowCreateModal(false);
                setNewTeam({ code: '', name: '', leader: '', phone: '', commissionRate: '5', bonusTarget: '0', bonusRate: '0' });
                showToast('✅ ' + t('teamCreated'));
                fetchTeams();
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function calculateCommissions() {
        setCalculating(true);
        try {
            const res = await fetch('/api/commissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ month: selectedMonth }),
            });
            const data = await res.json();
            showToast(`✅ ${t('calculated')} ${data.count} ${t('records')} (${t('skipped')}: ${data.skipped})`);
            fetchCommissions();
        } catch (err) {
            console.error(err);
            showToast('❌ ' + t('calculationFailed'));
        } finally {
            setCalculating(false);
        }
    }

    async function updateCommissionStatus(id: string, status: string) {
        try {
            await fetch(`/api/commissions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            showToast(`✅ ${t('statusUpdatedTo')} ${status}`);
            fetchCommissions();
        } catch (err) {
            console.error(err);
        }
    }

    async function toggleTeamStatus(teamId: string, currentStatus: string) {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await fetch(`/api/sales-teams/${teamId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            showToast(`✅ ${t('statusUpdatedTo')} ${newStatus}`);
            fetchTeams();
        } catch (err) {
            console.error(err);
        }
    }

    function showToast(msg: string) {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 3000);
    }

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
    }

    // Stats
    const totalTeams = teams.filter(t => t.status === 'ACTIVE').length;
    const totalPaidAll = teams.reduce((s, t) => s + t.totalPaid, 0);
    const totalPendingAll = teams.reduce((s, t) => s + t.totalPending, 0);
    const topTeam = teams.reduce((best, t) => (t.totalPaid > (best?.totalPaid || 0) ? t : best), teams[0]);

    // Commission ledger stats
    const ledgerTotal = commissions.reduce((s, c) => s + c.totalPayout, 0);
    const ledgerCommission = commissions.reduce((s, c) => s + c.amount, 0);
    const ledgerBonus = commissions.reduce((s, c) => s + c.bonusAmount, 0);

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>💸 {t('commissionDashboard')}</h1>
                    <p>{t('commissionSubtitle')}</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="commission-tabs">
                <button
                    className={`commission-tab ${activeTab === 'teams' ? 'active' : ''}`}
                    onClick={() => setActiveTab('teams')}
                >
                    👥 {t('salesTeams')}
                </button>
                <button
                    className={`commission-tab ${activeTab === 'ledger' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ledger')}
                >
                    📒 {t('commissionLedger')}
                </button>
            </div>

            {/* =================== TAB 1: SALES TEAMS =================== */}
            {activeTab === 'teams' && (
                <>
                    {/* Stats Cards */}
                    <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                        <div className="stat-card">
                            <div className="stat-label">{t('activeTeams')}</div>
                            <div className="stat-value">{totalTeams}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">{t('totalCommissionPaid')}</div>
                            <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>{formatCurrency(totalPaidAll)}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">{t('pendingPayout')}</div>
                            <div className="stat-value" style={{ color: 'var(--accent-amber)' }}>{formatCurrency(totalPendingAll)}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">{t('topTeam')}</div>
                            <div className="stat-value" style={{ fontSize: '1rem' }}>{topTeam ? `${topTeam.code} — ${topTeam.name}` : '—'}</div>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                            ➕ {t('newSalesTeam')}
                        </button>
                    </div>

                    {/* Teams Table */}
                    {teams.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">👥</div>
                            <h3>{t('noSalesTeams')}</h3>
                            <p>{t('createTeamToStart')}</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>{t('teamCode')}</th>
                                        <th>{t('teamName')}</th>
                                        <th>{t('teamLeader')}</th>
                                        <th>{t('commissionRateLabel')}</th>
                                        <th>KPI</th>
                                        <th>{t('contracts')}</th>
                                        <th>{t('totalPaidShort')}</th>
                                        <th>{t('status')}</th>
                                        <th>{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teams.map((team) => (
                                        <tr key={team.id} style={{ opacity: team.status === 'INACTIVE' ? 0.5 : 1 }}>
                                            <td>
                                                <span className="badge blue" style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700 }}>
                                                    {team.code}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{team.name}</td>
                                            <td>
                                                <div>{team.leader || '—'}</div>
                                                {team.phone && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>📱 {team.phone}</div>}
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{team.commissionRate}%</span>
                                            </td>
                                            <td>
                                                {team.bonusTarget > 0 ? (
                                                    <div>
                                                        <div style={{ fontSize: '0.8rem' }}>{formatCurrency(team.bonusTarget)}</div>
                                                        <div style={{ fontSize: '0.65rem', color: 'var(--accent-purple)' }}>+{team.bonusRate}% {t('bonus')}</div>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                                                )}
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{team.totalContracts}</td>
                                            <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{formatCurrency(team.totalPaid)}</td>
                                            <td>
                                                <span className={`badge ${team.status === 'ACTIVE' ? 'emerald' : 'rose'}`}>
                                                    {team.status === 'ACTIVE' ? t('active') : t('inactive')}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => toggleTeamStatus(team.id, team.status)}
                                                >
                                                    {team.status === 'ACTIVE' ? '⏸️' : '▶️'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* =================== TAB 2: COMMISSION LEDGER =================== */}
            {activeTab === 'ledger' && (
                <>
                    {/* Filter Bar */}
                    <div className="commission-filter-bar">
                        <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ fontSize: '0.75rem', marginBottom: 4 }}>{t('month')}</label>
                            <input
                                type="month"
                                className="form-input"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                style={{ width: 180 }}
                            />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ fontSize: '0.75rem', marginBottom: 4 }}>{t('filterByTeam')}</label>
                            <select
                                className="form-select"
                                value={filterTeamId}
                                onChange={(e) => setFilterTeamId(e.target.value)}
                                style={{ width: 200 }}
                            >
                                <option value="">{t('allTeams')}</option>
                                {teams.map((team) => (
                                    <option key={team.id} value={team.id}>{team.code} — {team.name}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            className="btn btn-primary commission-calc-btn"
                            onClick={calculateCommissions}
                            disabled={calculating}
                        >
                            {calculating ? '⏳ ...' : `🧮 ${t('calculateCommissions')}`}
                        </button>
                    </div>

                    {/* Ledger Stats */}
                    <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                        <div className="stat-card">
                            <div className="stat-label">{t('totalCommissionAmount')}</div>
                            <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{formatCurrency(ledgerCommission)}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">{t('totalBonusAmount')}</div>
                            <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>{formatCurrency(ledgerBonus)}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">{t('grandTotal')}</div>
                            <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>{formatCurrency(ledgerTotal)}</div>
                        </div>
                    </div>

                    {/* Commission Records Table */}
                    {commissions.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📒</div>
                            <h3>{t('noCommissions')}</h3>
                            <p>{t('calculateToStart')}</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>{t('teamCode')}</th>
                                        <th>{t('tenant')} / {t('room')}</th>
                                        <th>{t('contractValueLabel')}</th>
                                        <th>{t('ratePercent')}</th>
                                        <th>{t('commissionAmount')}</th>
                                        <th>{t('bonusLabel')}</th>
                                        <th>{t('totalPayoutLabel')}</th>
                                        <th>{t('status')}</th>
                                        <th>{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {commissions.map((c) => (
                                        <tr key={c.id}>
                                            <td>
                                                <span className="badge blue" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                                                    {c.salesTeam.code}
                                                </span>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{c.salesTeam.name}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{c.contract.person.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                    🏠 {c.contract.room.building.name} - {c.contract.room.number}
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{formatCurrency(c.contractValue)}</td>
                                            <td>
                                                <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{c.rate}%</span>
                                            </td>
                                            <td style={{ fontWeight: 700 }}>{formatCurrency(c.amount)}</td>
                                            <td>
                                                {c.bonusAmount > 0 ? (
                                                    <span style={{ fontWeight: 700, color: 'var(--accent-purple)' }}>+{formatCurrency(c.bonusAmount)}</span>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                                                )}
                                            </td>
                                            <td style={{ fontWeight: 800, color: 'var(--accent-emerald)', fontSize: '1rem' }}>
                                                {formatCurrency(c.totalPayout)}
                                            </td>
                                            <td>
                                                <span className={`badge ${c.status === 'PAID' ? 'emerald' : c.status === 'APPROVED' ? 'blue' : 'amber'}`}>
                                                    {c.status === 'PAID' ? t('paid') : c.status === 'APPROVED' ? t('approved') : t('pending')}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    {c.status === 'PENDING' && (
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => updateCommissionStatus(c.id, 'APPROVED')}
                                                            style={{ fontSize: '0.65rem' }}
                                                        >
                                                            ✅ {t('approve')}
                                                        </button>
                                                    )}
                                                    {c.status === 'APPROVED' && (
                                                        <button
                                                            className="btn btn-sm"
                                                            onClick={() => updateCommissionStatus(c.id, 'PAID')}
                                                            style={{ fontSize: '0.65rem', background: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)', color: 'white' }}
                                                        >
                                                            💰 {t('markPaid')}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{ fontWeight: 800, fontSize: '1rem', borderTop: '2px solid rgba(255,255,255,0.1)' }}>
                                        <td colSpan={4} style={{ textAlign: 'right' }}>{t('grandTotal')}:</td>
                                        <td style={{ color: 'var(--accent-blue)' }}>{formatCurrency(ledgerCommission)}</td>
                                        <td style={{ color: 'var(--accent-purple)' }}>{formatCurrency(ledgerBonus)}</td>
                                        <td style={{ color: 'var(--accent-emerald)', fontSize: '1.1rem' }}>{formatCurrency(ledgerTotal)}</td>
                                        <td colSpan={2}></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* =================== CREATE TEAM MODAL =================== */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>➕ {t('newSalesTeam')}</h2>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleCreateTeam}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t('teamCodeLabel')}</label>
                                        <input
                                            className="form-input"
                                            placeholder="SALE-A1"
                                            value={newTeam.code}
                                            onChange={(e) => setNewTeam({ ...newTeam, code: e.target.value.toUpperCase() })}
                                            required
                                            style={{ fontFamily: 'monospace', fontWeight: 700 }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('teamNameLabel')}</label>
                                        <input
                                            className="form-input"
                                            placeholder={t('teamNamePlaceholder') as string}
                                            value={newTeam.name}
                                            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t('teamLeaderLabel')}</label>
                                        <input
                                            className="form-input"
                                            placeholder={t('leaderPlaceholder') as string}
                                            value={newTeam.leader}
                                            onChange={(e) => setNewTeam({ ...newTeam, leader: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('phoneLabel')}</label>
                                        <input
                                            className="form-input"
                                            placeholder="0988..."
                                            value={newTeam.phone}
                                            onChange={(e) => setNewTeam({ ...newTeam, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t('commissionRateLabel')} (%)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            max="100"
                                            value={newTeam.commissionRate}
                                            onChange={(e) => setNewTeam({ ...newTeam, commissionRate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('bonusTargetLabel')} (VND)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            value={newTeam.bonusTarget}
                                            onChange={(e) => setNewTeam({ ...newTeam, bonusTarget: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('bonusRateLabel')} (%)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            max="100"
                                            value={newTeam.bonusRate}
                                            onChange={(e) => setNewTeam({ ...newTeam, bonusRate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>{t('cancel')}</button>
                                <button type="submit" className="btn btn-primary">{t('createTeam')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toastMsg && <div className="toast success">{toastMsg}</div>}
        </>
    );
}
