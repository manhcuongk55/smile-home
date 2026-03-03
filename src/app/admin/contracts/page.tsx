'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { approveContract, rejectContract } from './actions';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(res => res.json());

interface ContractDocument {
    id: string;
    originalName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    documentType: string;
    approvalStatus: string;
}

interface Contract {
    id: string;
    room: {
        number: string;
        building: { name: string };
    };
    person: { name: string; email?: string };
    productName?: string;
    productArea?: string;
    type: string;
    status: string;
    monthlyRent: number;
    createdAt: string;
    documents: ContractDocument[];
}

interface AdminContractsResponse {
    contracts: Contract[];
    total: number;
    pendingCount: number;
    page: number;
    totalPages: number;
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

export default function AdminContractReview() {
    const { t } = useLanguage();
    
    // States for filtering
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [moneyRangeKey, setMoneyRangeKey] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);

    // Page state for UI
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
    const [reviewNote, setReviewNote] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewDocType, setPreviewDocType] = useState<'CONTRACT' | 'PRODUCT_DETAIL'>('CONTRACT');

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Construct API URL
    const selectedRange = MONEY_RANGES.find(r => r.key === moneyRangeKey);
    const queryParams = new URLSearchParams({
        status: filterStatus,
        search: debouncedSearch,
        page: page.toString(),
        limit: '50'
    });
    if (selectedRange?.min !== null) queryParams.append('minAmount', selectedRange!.min.toString());
    if (selectedRange?.max !== null) queryParams.append('maxAmount', selectedRange!.max.toString());

    const { data, mutate, isLoading } = useSWR<AdminContractsResponse>(
        `/api/admin/contracts?${queryParams.toString()}`, 
        fetcher, 
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true
        }
    );

    const contracts = data?.contracts || [];
    const pendingCount = data?.pendingCount || 0;

    // Real-time update listener
    useEffect(() => {
        const eventSource = new EventSource('/api/admin/contracts/pending-count/stream');
        
        eventSource.onmessage = () => {
            mutate();
        };

        eventSource.onerror = (err) => {
            console.error('SSE connection error in AdminContracts:', err);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [mutate]);

    // Auto-select logic
    useEffect(() => {
        if (!isLoading && contracts.length > 0 && (!selectedContractId || !contracts.some(c => c.id === selectedContractId))) {
            setSelectedContractId(contracts[0].id);
        }
    }, [contracts, selectedContractId, isLoading]);

    const selectedContract = contracts.find(c => c.id === selectedContractId) || null;

    const handleReview = async (status: 'APPROVED' | 'REJECTED') => {
        if (!selectedContract) return;

        if (status === 'REJECTED' && !reviewNote.trim()) {
            alert(t.admin.labelReviewNote);
            return;
        }

        setIsProcessing(true);
        try {
            const action = status === 'APPROVED' ? approveContract : rejectContract;
            const result = await action(selectedContract.id, reviewNote);

            if (result.success) {
                const currentIndex = contracts.findIndex(c => c.id === selectedContract.id);
                setReviewNote('');
                
                // Optimistic data update or simple mutate
                await mutate();
                
                // Focus next contract
                let nextId = null;
                if (contracts.length > 1) {
                    if (currentIndex < contracts.length - 1) {
                        nextId = contracts[currentIndex + 1].id;
                    } else if (currentIndex > 0) {
                        nextId = contracts[currentIndex - 1].id;
                    }
                }
                setSelectedContractId(nextId);
                alert(status === 'APPROVED' ? t.admin.msgApproved : t.admin.msgRejected);
            } else {
                alert('Error: ' + (result.error || 'Failed to update contract'));
            }
        } catch (error) {
            console.error('Action failed:', error);
            alert('An unexpected error occurred.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Smooth scroll selected item into view
    useEffect(() => {
        if (selectedContractId) {
            const el = document.querySelector(`.contract-item.selected`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [selectedContractId]);

    const previewDoc = selectedContract?.documents.find(d => d.documentType === previewDocType);
    const mainDocUrl = previewDoc?.fileUrl;

    return (
        <div className="admin-fill-container">
            <div className="contract-review-grid">
                {/* ── LEFT PANEL ── */}
                <div className="panel-container panel-left">
                    <div className="list-search-box">
                        <input 
                            type="text" 
                            className="admin-input" 
                            placeholder={t.admin.labelSearch}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ marginBottom: '12px' }}
                        />
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                            {/* Status Filters */}
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => { setFilterStatus(s); setPage(1); }}
                                        style={{
                                            flex: 1, padding: '6px 2px', fontSize: '0.625rem', fontWeight: 700,
                                            background: filterStatus === s ? '#F3F4F6' : '#fff',
                                            border: '1px solid #E5E7EB', borderRadius: '4px', cursor: 'pointer',
                                            color: filterStatus === s ? '#111827' : '#6B7280'
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            {/* Money Range Dropdown */}
                            <div style={{ position: 'relative' }}>
                                <select 
                                    className="admin-input"
                                    value={moneyRangeKey}
                                    onChange={(e) => { setMoneyRangeKey(e.target.value); setPage(1); }}
                                    style={{ fontSize: '0.75rem', padding: '6px 12px', height: 'auto', background: '#F9FAFB' }}
                                >
                                    {MONEY_RANGES.map(range => (
                                        <option key={range.key} value={range.key}>
                                            {t.admin.moneyRanges[range.key as keyof typeof t.admin.moneyRanges]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ fontSize: '0.6875rem', color: '#6B7280', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                            <span>{pendingCount} {t.admin.statPending}</span>
                            {data && <span>{data.total} {t.admin.colAction}</span>}
                        </div>
                    </div>

                    <div className="list-scroll-area">
                        {isLoading ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center', opacity: 0.5 }}>
                                {t.btnSeeding}
                            </div>
                        ) : contracts.length === 0 ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.8125rem' }}>
                                {t.admin.msgNoContractsLeft}
                            </div>
                        ) : (
                            contracts.map(c => {
                                const status = c.documents.find(d => d.documentType === 'CONTRACT')?.approvalStatus || 'PENDING';
                                return (
                                    <div 
                                        key={c.id}
                                        className={`contract-item ${selectedContract?.id === c.id ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedContractId(c.id);
                                            setPreviewDocType('CONTRACT');
                                        }}
                                        style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span className={`badge-fixed ${status === 'PENDING' ? 'badge-yellow' : status === 'APPROVED' ? 'badge-green' : status === 'REJECTED' ? 'badge-red' : 'badge-yellow'}`} style={{ margin: 0 }}>
                                                {t.contracts.approvals[status as keyof typeof t.contracts.approvals] || status}
                                            </span>
                                            <span style={{ fontSize: '0.65rem', color: 'var(--admin-text-muted)' }}>
                                                {new Date(c.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--admin-text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {c.productName || '—'}
                                        </div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--admin-text-muted)' }}>
                                            {c.productArea || '—'}
                                        </div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--admin-text-muted)' }}>
                                            {t.contracts.types[c.type as keyof typeof t.contracts.types] || c.type}
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--admin-text-main)', marginTop: '4px' }}>
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.monthlyRent)}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="panel-container panel-right">
                    {selectedContract ? (
                        <>
                            <div className="detail-section-info">
                                <div className="grid-3">
                                    <div>
                                        <div className="data-label">{t.contracts.labelTenantName}</div>
                                        <div className="data-value">{selectedContract.person.name}</div>
                                    </div>
                                    <div>
                                        <div className="data-label">{t.contracts.labelTenantEmail}</div>
                                        <div className="data-value">{selectedContract.person.email || '—'}</div>
                                    </div>
                                    <div>
                                        <div className="data-label">{t.contracts.labelProductName}</div>
                                        <div className="data-value">{selectedContract.productName || '—'}</div>
                                    </div>

                                    <div>
                                        <div className="data-label">{t.contracts.labelRoomNumber}</div>
                                        <div className="data-value">{selectedContract.room.number}</div>
                                    </div>
                                    <div>
                                        <div className="data-label">{t.contracts.labelRent}</div>
                                        <div className="data-value" style={{ fontWeight: 600 }}>
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedContract.monthlyRent)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="data-label">{t.contracts.labelProductArea}</div>
                                        <div className="data-value">{selectedContract.productArea || '—'}</div>
                                    </div>

                                    <div>
                                        <div className="data-label">{t.contracts.labelBuilding}</div>
                                        <div className="data-value">{selectedContract.room.building.name}</div>
                                    </div>
                                    <div>
                                        <div className="data-label">{t.contracts.labelUploadDate}</div>
                                        <div className="data-value">{new Date(selectedContract.createdAt).toLocaleString()}</div>
                                    </div>
                                    <div />
                                </div>
                            </div>

                            <div className="detail-section-pdf" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ 
                                    padding: '8px 24px', 
                                    background: '#fff', 
                                    borderBottom: '1px solid #E5E7EB',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        {[
                                            { type: 'CONTRACT', label: t.contracts.labelMainDoc },
                                            { type: 'PRODUCT_DETAIL', label: t.contracts.labelProductDoc }
                                        ].map(tab => (
                                            <button
                                                key={tab.type}
                                                onClick={() => setPreviewDocType(tab.type as any)}
                                                style={{
                                                    padding: '6px 0',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    background: 'none',
                                                    border: 'none',
                                                    borderBottom: previewDocType === tab.type ? '2px solid var(--admin-accent-blue)' : '2px solid transparent',
                                                    color: previewDocType === tab.type ? 'var(--admin-text-main)' : 'var(--admin-text-muted)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {mainDocUrl && (
                                        <a href={mainDocUrl} download={true} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-accent-blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {t.contracts.btnDownload}
                                        </a>
                                    )}
                                </div>
                                <div style={{ flex: 1, minHeight: 0 }}>
                                    {mainDocUrl ? (
                                        <iframe src={mainDocUrl} width="100%" height="100%" style={{ border: 'none' }} />
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.8125rem' }}>
                                            {previewDocType === 'CONTRACT' ? t.admin.msgNoContract : t.admin.msgNoProductDetail}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="detail-section-action">
                                <textarea 
                                    className="admin-textarea"
                                    placeholder={t.admin.labelReviewNote}
                                    value={reviewNote}
                                    onChange={(e) => setReviewNote(e.target.value)}
                                />
                                <div className="flex-between">
                                    <div />
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button className="btn-solid btn-red" disabled={isProcessing} onClick={() => handleReview('REJECTED')}>
                                            {t.admin.btnReject}
                                        </button>
                                        <button className="btn-solid btn-green" disabled={isProcessing} onClick={() => handleReview('APPROVED')}>
                                            {t.admin.btnApprove}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.8125rem', gap: '12px' }}>
                            <div style={{ fontSize: '2rem', opacity: 0.5 }}>📄</div>
                            <div>{isLoading ? t.btnSeeding : t.admin.msgNoContractsLeft}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
