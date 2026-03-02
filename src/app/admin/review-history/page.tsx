'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface ReviewHistoryItem {
    id: string;
    contractId: string;
    fromStatus: string;
    toStatus: string;
    reviewedBy: string;
    reviewedAt: string;
    note: string | null;
    contract: {
        productName: string | null;
        productArea: string | null;
        monthlyRent: number;
        person: {
            name: string;
        };
    };
}

interface HistoryResponse {
    history: ReviewHistoryItem[];
    total: number;
    page: number;
    totalPages: number;
    reviewers: string[];
}

const MONEY_RANGES = [
    { key: 'ALL', min: null, max: null },
    { key: 'LT5M', min: 0, max: 5000000 },
    { key: 'M5_20', min: 5000000, max: 20000000 },
    { key: 'M20_1B', min: 20000000, max: 1000000000 },
    { key: 'B1_3', min: 1000000000, max: 3000000000 },
    { key: 'B3_10', min: 3000000000, max: 10000000000 },
    { key: 'GT10B', min: 10000000000, max: null },
];

export default function AdminReviewHistory() {
    const { t } = useLanguage();
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [reviewerFilter, setReviewerFilter] = useState('ALL');
    const [moneyRangeKey, setMoneyRangeKey] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState('reviewedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); 
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Construct query URL
    const selectedRange = MONEY_RANGES.find(r => r.key === moneyRangeKey);
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: statusFilter,
        reviewedBy: reviewerFilter,
        startDate,
        endDate,
        search: debouncedSearch,
        sortBy,
        sortOrder
    });
    if (selectedRange?.min !== null) queryParams.append('minAmount', selectedRange!.min.toString());
    if (selectedRange?.max !== null) queryParams.append('maxAmount', selectedRange!.max.toString());

    const { data, error, isLoading } = useSWR<HistoryResponse>(
        `/api/admin/review-history?${queryParams.toString()}`,
        fetcher
    );

    const history = data?.history || [];
    const reviewers = data?.reviewers || [];
    const totalPages = data?.totalPages || 1;

    // Reset page when filters change
    const handleFilterChange = (setter: any, value: any) => {
        setter(value);
        setPage(1);
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
        setPage(1);
    };

    // Status mapping for display
    const statusMap: Record<string, string> = {
        'PENDING': t.contracts.approvals.PENDING,
        'APPROVED': t.contracts.approvals.APPROVED,
        'REJECTED': t.contracts.approvals.REJECTED,
        'DRAFT': t.contracts.statuses.DRAFT,
        'ACTIVE': t.contracts.approvals.APPROVED, 
    };

    const formatDateTime = (dateStr: string) => {
        const d = new Date(dateStr);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="admin-fill-container" style={{ padding: '0 0 24px 0' }}>
            {/* ── FILTER BAR ── */}
            <div style={{ 
                background: '#fff', 
                padding: '16px 20px', 
                border: '1px solid var(--admin-border)', 
                borderRadius: '8px', 
                marginBottom: '20px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'flex-end'
            }}>
                {/* Search */}
                <div style={{ flex: '2 2 300px' }}>
                    <div className="data-label">{t.admin.labelSearchHistory}</div>
                    <input 
                        type="search"
                        className="admin-input"
                        placeholder={t.admin.labelSearchHistory}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Status & Reviewer */}
                <div style={{ flex: '1 1 250px', display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                        <div className="data-label">{t.admin.labelFilter}</div>
                        <select 
                            className="admin-input" 
                            value={statusFilter}
                            onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
                        >
                            <option value="ALL">{t.admin.labelAllStatus}</option>
                            <option value="APPROVED">{t.contracts.approvals.APPROVED}</option>
                            <option value="REJECTED">{t.contracts.approvals.REJECTED}</option>
                        </select>
                    </div>

                    <div style={{ flex: 1 }}>
                        <div className="data-label">{t.admin.colReviewer}</div>
                        <select 
                            className="admin-input" 
                            value={reviewerFilter}
                            onChange={(e) => handleFilterChange(setReviewerFilter, e.target.value)}
                        >
                            <option value="ALL">{t.admin.labelAllReviewers}</option>
                            {reviewers.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Money */}
                <div style={{ width: '140px' }}>
                    <div className="data-label">{t.admin.labelMoneyRange}</div>
                    <select 
                        className="admin-input"
                        value={moneyRangeKey}
                        onChange={(e) => handleFilterChange(setMoneyRangeKey, e.target.value)}
                        style={{ background: '#F9FAFB' }}
                    >
                        {MONEY_RANGES.map(range => (
                            <option key={range.key} value={range.key}>
                                {t.admin.moneyRanges[range.key as keyof typeof t.admin.moneyRanges]}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date Fields Group */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ width: '120px' }}>
                        <div className="data-label">{t.admin.labelStartDate}</div>
                        <input 
                            type="date"
                            className="admin-input"
                            value={startDate}
                            onChange={(e) => handleFilterChange(setStartDate, e.target.value)}
                        />
                    </div>
                    <div style={{ width: '120px' }}>
                        <div className="data-label">{t.admin.labelEndDate}</div>
                        <input 
                            type="date"
                            className="admin-input"
                            value={endDate}
                            onChange={(e) => handleFilterChange(setEndDate, e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* ── TABLE ── */}
            <div style={{ 
                background: '#fff', 
                border: '1px solid var(--admin-border)', 
                borderRadius: '8px',
                overflow: 'hidden',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
                <div style={{ overflowX: 'auto', flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem', tableLayout: 'auto' }}>
                        <thead>
                            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--admin-border)' }}>
                                <th 
                                    style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--admin-text-muted)', cursor: 'pointer', transition: 'color 0.2s', whiteSpace: 'nowrap' }}
                                    onClick={() => handleSort('reviewedAt')}
                                    className="th-sortable"
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {t.admin.colTime}
                                        <span style={{ 
                                            fontSize: '0.75rem', 
                                            color: 'var(--admin-accent-blue)',
                                            width: '14px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            transition: 'opacity 0.15s ease',
                                            opacity: sortBy === 'reviewedAt' ? 1 : 0
                                        }}>
                                            {sortOrder === 'desc' ? '↓' : '↑'}
                                        </span>
                                    </div>
                                </th>
                                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--admin-text-muted)' }}>{t.contracts.colProductName}</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--admin-text-muted)' }}>{t.contracts.colProductArea}</th>
                                <th 
                                    style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--admin-text-muted)', textAlign: 'right', cursor: 'pointer', transition: 'color 0.2s', whiteSpace: 'nowrap' }} 
                                    onClick={() => handleSort('monthlyRent')}
                                    className="th-sortable"
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                        <span style={{ 
                                            fontSize: '0.75rem', 
                                            color: 'var(--admin-accent-blue)',
                                            width: '14px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            transition: 'opacity 0.15s ease',
                                            opacity: sortBy === 'monthlyRent' ? 1 : 0
                                        }}>
                                            {sortOrder === 'desc' ? '↓' : '↑'}
                                        </span>
                                        {t.contracts.colRent}
                                    </div>
                                </th>
                                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--admin-text-muted)' }}>{t.admin.colCustomer}</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--admin-text-muted)' }}>{t.admin.colAction}</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--admin-text-muted)' }}>{t.admin.colReviewer}</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--admin-text-muted)' }}>{t.admin.colNote}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                        <td colSpan={8} style={{ padding: '20px', textAlign: 'center' }}>
                                            <div className="skeleton" style={{ height: '20px', width: '100%' }}></div>
                                        </td>
                                    </tr>
                                ))
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ padding: '80px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.3 }}>🏛️</div>
                                        {t.admin.emptyReviewHistory}
                                    </td>
                                </tr>
                            ) : (
                                history.map((item) => (
                                    <tr 
                                        key={item.id} 
                                        style={{ borderBottom: '1px solid var(--admin-border)', transition: 'background 0.2s', cursor: 'pointer' }} 
                                        className="table-row-hover"
                                        onClick={() => router.push(`/admin/contracts?contractId=${item.contractId}`)}
                                    >
                                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                                            {formatDateTime(item.reviewedAt)}
                                        </td>
                                        <td style={{ padding: '14px 16px', fontWeight: 500, maxWidth: '200px' }}>
                                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.contract.productName || '—'}>
                                                {item.contract.productName || '—'}
                                            </div>
                                            <div style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)', fontWeight: 400 }}>ID: {item.contractId.substring(0,8)}...</div>
                                        </td>
                                        <td style={{ padding: '14px 16px', color: 'var(--admin-text-muted)', fontSize: '0.75rem' }}>
                                            {item.contract.productArea || '—'}
                                        </td>
                                        <td style={{ padding: '14px 16px', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                            {formatCurrency(item.contract.monthlyRent)}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            {item.contract.person.name}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ opacity: 0.5, fontSize: '0.65rem', fontWeight: 400, color: 'var(--admin-text-muted)' }}>
                                                    {statusMap[item.fromStatus] || item.fromStatus}
                                                </span>
                                                <span style={{ opacity: 0.3 }}>→</span>
                                                <span className={`badge-fixed ${item.toStatus === 'APPROVED' ? 'badge-green' : item.toStatus === 'REJECTED' ? 'badge-red' : 'badge-yellow'}`}>
                                                    {statusMap[item.toStatus] || item.toStatus}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 600 }}>
                                                    {item.reviewedBy[0].toUpperCase()}
                                                </div>
                                                {item.reviewedBy}
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 16px', maxWidth: '150px' }}>
                                            <div 
                                                style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} 
                                                title={item.note || ''}
                                            >
                                                {item.note || '—'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── PAGINATION ── */}
                <div style={{ 
                    padding: '12px 20px', 
                    borderTop: '1px solid var(--admin-border)', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    background: '#F9FAFB'
                }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                        Hiển thị <strong>{(page-1)*20 + 1}</strong> – <strong>{Math.min(page*20, data?.total || 0)}</strong> trên <strong>{data?.total || 0}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            className="btn-solid" 
                            style={{ padding: '5px 10px', background: '#fff', border: '1px solid var(--admin-border)', color: 'var(--admin-text-main)', fontSize: '0.75rem' }}
                            disabled={page === 1 || isLoading}
                            onClick={(e) => { e.stopPropagation(); setPage(p => p - 1); }}
                        >
                            {t.contracts.paginationPrev}
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {page} / {totalPages}
                        </div>
                        <button 
                            className="btn-solid" 
                            style={{ padding: '5px 10px', background: '#fff', border: '1px solid var(--admin-border)', color: 'var(--admin-text-main)', fontSize: '0.75rem' }}
                            disabled={page >= totalPages || isLoading}
                            onClick={(e) => { e.stopPropagation(); setPage(p => p + 1); }}
                        >
                            {t.contracts.paginationNext}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .table-row-hover:hover {
                    background: #F8FAFC !important;
                }
                .th-sortable:hover {
                    color: var(--admin-text-main) !important;
                    background: #F3F4F6;
                }
                .skeleton {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 4px;
                }
                @keyframes loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}
