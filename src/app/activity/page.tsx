'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

interface ActivityLogEntry {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    performedBy: string;
    oldValue?: string;
    newValue?: string;
    note?: string;
    timestamp: string;
}

const ACTION_ICONS: Record<string, string> = {
    CREATE: '🆕',
    UPDATE: '✏️',
    APPROVE: '✅',
    REJECT: '❌',
    OVERRIDE: '⚡',
    DELETE: '🗑️',
    CALCULATE: '🧮',
    PAID: '💰',
};

const ENTITY_ICONS: Record<string, string> = {
    Invoice: '🧾',
    Contract: '📄',
    SalesTeam: '👥',
    Commission: '💸',
    MaintenanceTicket: '🔧',
    MeterReading: '📊',
    Room: '🏠',
    Person: '👤',
    Building: '🏢',
};

const ACTION_COLORS: Record<string, string> = {
    CREATE: 'emerald',
    UPDATE: 'blue',
    APPROVE: 'emerald',
    REJECT: 'rose',
    OVERRIDE: 'amber',
    DELETE: 'rose',
    CALCULATE: 'purple',
    PAID: 'emerald',
};

export default function ActivityHistoryPage() {
    const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
    const [filterEntity, setFilterEntity] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const { t } = useLanguage();

    useEffect(() => {
        fetchLogs();
    }, [filterEntity, filterAction, filterFrom, filterTo]); // eslint-disable-line react-hooks/exhaustive-deps

    async function fetchLogs() {
        const params = new URLSearchParams();
        if (filterEntity) params.set('entityType', filterEntity);
        if (filterAction) params.set('action', filterAction);
        if (filterFrom) params.set('from', filterFrom);
        if (filterTo) params.set('to', filterTo);
        const res = await fetch(`/api/activity-logs?${params.toString()}`);
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
    }

    function formatTime(ts: string) {
        const d = new Date(ts);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return t('justNow');
        if (mins < 60) return `${mins} ${t('minutesAgo')}`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} ${t('hoursAgo')}`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} ${t('daysAgo')}`;
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function tryParseJSON(str?: string) {
        if (!str) return null;
        try { return JSON.parse(str); } catch { return str; }
    }

    function renderValue(val: unknown) {
        if (!val) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
        if (typeof val === 'object') {
            return (
                <pre style={{ fontSize: '0.7rem', background: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 6, overflow: 'auto', maxHeight: 200, margin: 0 }}>
                    {JSON.stringify(val, null, 2)}
                </pre>
            );
        }
        return <span>{String(val)}</span>;
    }

    // Stats
    const totalLogs = logs.length;
    const todayCount = logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length;
    const uniqueEntities = new Set(logs.map(l => l.entityType)).size;
    const uniqueUsers = new Set(logs.map(l => l.performedBy)).size;

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>📜 {t('activityHistory')}</h1>
                    <p>{t('activityHistorySubtitle')}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-label">{t('totalRecords')}</div>
                    <div className="stat-value">{totalLogs}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">{t('todayActions')}</div>
                    <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{todayCount}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">{t('entityTypes')}</div>
                    <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>{uniqueEntities}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">{t('activeUsers')}</div>
                    <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>{uniqueUsers}</div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="commission-filter-bar">
                <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 4 }}>{t('entityTypeFilter')}</label>
                    <select className="form-select" value={filterEntity} onChange={(e) => setFilterEntity(e.target.value)} style={{ width: 160 }}>
                        <option value="">{t('allEntities')}</option>
                        <option value="Invoice">🧾 Invoice</option>
                        <option value="Contract">📄 Contract</option>
                        <option value="Commission">💸 Commission</option>
                        <option value="SalesTeam">👥 SalesTeam</option>
                        <option value="MaintenanceTicket">🔧 Maintenance</option>
                        <option value="MeterReading">📊 MeterReading</option>
                        <option value="Room">🏠 Room</option>
                    </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 4 }}>{t('actionFilter')}</label>
                    <select className="form-select" value={filterAction} onChange={(e) => setFilterAction(e.target.value)} style={{ width: 140 }}>
                        <option value="">{t('allActions')}</option>
                        <option value="CREATE">{t('actionCreate')}</option>
                        <option value="UPDATE">{t('actionUpdate')}</option>
                        <option value="APPROVE">{t('actionApprove')}</option>
                        <option value="REJECT">{t('actionReject')}</option>
                        <option value="DELETE">{t('actionDelete')}</option>
                        <option value="PAID">{t('actionPaid')}</option>
                    </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 4 }}>{t('dateFrom')}</label>
                    <input type="date" className="form-input" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} style={{ width: 150 }} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 4 }}>{t('dateTo')}</label>
                    <input type="date" className="form-input" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} style={{ width: 150 }} />
                </div>
            </div>

            {/* Activity Timeline */}
            {logs.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📜</div>
                    <h3>{t('noActivityLogs')}</h3>
                    <p>{t('noActivityLogsDesc')}</p>
                </div>
            ) : (
                <div className="activity-timeline">
                    {logs.map((log) => {
                        const actionIcon = ACTION_ICONS[log.action] || '📝';
                        const entityIcon = ENTITY_ICONS[log.entityType] || '📋';
                        const actionColor = ACTION_COLORS[log.action] || 'blue';
                        const isExpanded = expandedId === log.id;
                        const oldVal = tryParseJSON(log.oldValue);
                        const newVal = tryParseJSON(log.newValue);

                        return (
                            <div
                                key={log.id}
                                className="activity-item"
                                onClick={() => setExpandedId(isExpanded ? null : log.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="activity-icon-col">
                                    <div className={`activity-icon-dot ${actionColor}`}>
                                        {actionIcon}
                                    </div>
                                    <div className="activity-line" />
                                </div>
                                <div className="activity-content">
                                    <div className="activity-header-row">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                            <span className={`badge ${actionColor}`} style={{ fontSize: '0.6rem' }}>
                                                {log.action}
                                            </span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                                {entityIcon} {log.entityType}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                #{log.entityId.slice(-8)}
                                            </span>
                                        </div>
                                        <span className="activity-time">{formatTime(log.timestamp)}</span>
                                    </div>
                                    <div className="activity-performer">
                                        👤 {log.performedBy}
                                        {log.note && <span style={{ marginLeft: 8, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>— {log.note}</span>}
                                    </div>
                                    {isExpanded && (oldVal || newVal) && (
                                        <div className="activity-details">
                                            {oldVal && (
                                                <div style={{ marginBottom: 8 }}>
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--accent-rose)', fontWeight: 700, marginBottom: 4 }}>⬅ {t('oldValue')}</div>
                                                    {renderValue(oldVal)}
                                                </div>
                                            )}
                                            {newVal && (
                                                <div>
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--accent-emerald)', fontWeight: 700, marginBottom: 4 }}>➡ {t('newValue')}</div>
                                                    {renderValue(newVal)}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
