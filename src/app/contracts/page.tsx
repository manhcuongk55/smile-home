'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import CombinedSelect from '@/components/CombinedSelect';
import FilterArea from '@/components/FilterArea';
import FilterMoney, { MONEY_RANGES } from '@/components/FilterMoney';

// ── Interfaces ────────────────────────────────────────────────────────────────

interface ContractDocument {
    id: string;
    originalName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    documentType: string;
    approvalStatus: string;
    createdAt: string;
}

interface Contract {
    id: string;
    roomId: string;
    room: {
        number: string;
        building: { name: string };
    };
    personId: string;
    person: { name: string; email?: string };
    type: string;
    status: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    contractCode: string; // Added contractCode to the interface
    deposit: number;
    productName?: string;
    productArea?: string;
    reviewNote?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    createdAt: string;
    documents: ContractDocument[];
}

interface Room {
    id: string;
    number: string;
    building: { name: string };
}

interface Person {
    id: string;
    name: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

function statusBadge(status: string) {
    if (status === 'ACTIVE') return 'emerald';
    if (status === 'DRAFT' || status === 'PENDING') return 'amber';
    if (status === 'REJECTED') return 'rose';
    return 'slate';
}

function typeBadge(type: string) {
    if (type === 'SALE') return 'purple';
    if (type === 'MANAGEMENT') return 'teal';
    if (type === 'LEASE_EXTEND') return 'amber';
    if (type === 'SHORT_TERM') return 'rose';
    return 'blue'; // RENTAL default
}

function approvalBadge(status: string) {
    if (status === 'APPROVED') return 'emerald';
    if (status === 'PENDING') return 'amber';
    return 'rose';
}

// ── Component ─────────────────────────────────────────────────────────────────



const VIETNAM_PROVINCES = [
    'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cần Thơ', 'Cao Bằng', 'Đà Nẵng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Nội', 'Hà Tĩnh', 'Hải Dương', 'Hải Phòng', 'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'TP Hồ Chí Minh', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
];

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(res => res.json());

export default function ContractsPage() {
    const { t } = useLanguage();
    const { data, mutate } = useSWR<Contract[]>('/api/contracts', fetcher, {
        revalidateOnFocus: true,
        revalidateOnReconnect: true
    });
    
    useEffect(() => {
        if (data && data.length > 0) {
            console.log('[ContractsPage] Top contract:', {
                id: data[0].id,
                code: data[0].contractCode,
                allFields: Object.keys(data[0])
            });
        }
    }, [data]);
    
    const contracts = data || [];

    // Upload modal
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadTenantName, setUploadTenantName] = useState('');
    const [uploadTenantEmail, setUploadTenantEmail] = useState('');
    const [uploadRoomNumber, setUploadRoomNumber] = useState('');
    const [uploadBuildingName, setUploadBuildingName] = useState('');
    const [uploadMonthlyRent, setUploadMonthlyRent] = useState('');
    const [uploadType, setUploadType] = useState('RENTAL');
    const [uploadCustomType, setUploadCustomType] = useState('');
    const [uploadProductFile, setUploadProductFile] = useState<File | null>(null);
    const [uploadProductName, setUploadProductName] = useState('');
    const [uploadProductArea, setUploadProductArea] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const searchParams = useSearchParams();
    const contractIdParam = searchParams.get('contractId');

    // Detail modal
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [previewDocId, setPreviewDocId] = useState<string | null>(null);

    // Grouping & Expansion State
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

    // Jump to contract from URL (e.g. from notification)
    useEffect(() => {
        if (data && data.length > 0 && contractIdParam) {
            const found = data.find(c => c.id === contractIdParam);
            if (found) {
                setSelectedContract(found);
                setShowDetailModal(true);
                // Reset filters to make sure it's visible if the user navigates to the list
                setStatusFilter('ALL');
                setSearchTerm('');
                setSelectedAreas([]);
                if (found.productName) {
                    setExpandedProducts(prev => {
                        const next = new Set(prev);
                        next.add(found.productName!);
                        return next;
                    });
                }
            }
        }
    }, [data, contractIdParam]);

    // Pagination
    const PAGE_SIZE = 6;
    const [currentPage, setCurrentPage] = useState(1);

    // Toast
    const [toastMsg, setToastMsg] = useState('');
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
    const [moneyRangeKey, setMoneyRangeKey] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showCommissionAsPercentage, setShowCommissionAsPercentage] = useState(false);

    // Rejection details modal
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectDetails, setRejectDetails] = useState<{
        note?: string;
        by?: string;
        at?: string;
    } | null>(null);

    const filteredContracts = contracts.filter(c => {
        const matchesArea = selectedAreas.length === 0 || selectedAreas.includes(c.productArea || '');
        const query = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || 
            c.person.name.toLowerCase().includes(query) ||
            (c.person.email || '').toLowerCase().includes(query) ||
            c.room.number.toLowerCase().includes(query) ||
            (c.productName || '').toLowerCase().includes(query) ||
            (c.contractCode || '').toLowerCase().includes(query);
        // Money Range Filter
        const range = MONEY_RANGES.find(r => r.key === moneyRangeKey);
        let matchesMoney = true;
        if (range) {
            if (range.min !== null && c.monthlyRent < range.min) matchesMoney = false;
            if (range.max !== null && c.monthlyRent > range.max) matchesMoney = false;
        }

        const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

        return matchesArea && matchesSearch && matchesMoney && matchesStatus;
    });

    const groupedContracts = useMemo(() => {
        const groups: Record<string, {
            productName: string;
            agentName: string;
            totalValue: number;
            totalCommission: number;
            items: Contract[];
        }> = {};

        filteredContracts.forEach(c => {
            const key = c.productName || 'Unknown Product';
            if (!groups[key]) {
                groups[key] = {
                    productName: key,
                    agentName: c.person.name,
                    totalValue: 0,
                    totalCommission: 0,
                    items: []
                };
            }
            groups[key].totalValue += c.monthlyRent;
            groups[key].totalCommission += (c.monthlyRent * 0.1);
            groups[key].items.push(c);
        });

        return Object.values(groups);
    }, [filteredContracts]);

    const toggleExpand = (productName: string) => {
        const next = new Set(expandedProducts);
        if (next.has(productName)) next.delete(productName);
        else next.add(productName);
        setExpandedProducts(next);
    };

    // Styling
    const headerStyle: React.CSSProperties = {
        padding: '16px 20px',
        textAlign: 'left',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--text-muted)',
        fontWeight: 600
    };

    const cellStyle: React.CSSProperties = {
        padding: '20px',
        fontSize: '0.925rem'
    };

    const subHeaderStyle: React.CSSProperties = {
        padding: '12px 16px',
        textAlign: 'left',
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        borderBottom: '1px solid var(--border-subtle)'
    };

    const subCellStyle: React.CSSProperties = {
        padding: '12px 16px',
        fontSize: '0.85rem'
    };

    // ── Handlers ───────────────────────────────────────────────────────────────

    async function handleUpload(e: React.FormEvent) {
        e.preventDefault();
        if (!uploadFile || !uploadProductFile || !uploadTenantName.trim() || !uploadProductName.trim() || !uploadProductArea.trim() || !uploadMonthlyRent) {
            alert(t.contracts.alertRequired);
            return;
        }
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('tenantName', uploadTenantName.trim());
        formData.append('tenantEmail', uploadTenantEmail.trim());
        formData.append('roomNumber', uploadRoomNumber.trim());
        formData.append('buildingName', uploadBuildingName.trim());
        formData.append('monthlyRent', uploadMonthlyRent);
        formData.append('type', uploadType === 'OTHER' ? uploadCustomType.trim() : uploadType);
        formData.append('productName', uploadProductName.trim());
        formData.append('productArea', uploadProductArea.trim());
        if (uploadProductFile) {
            formData.append('productFile', uploadProductFile);
        }

        try {
            const res = await fetch('/api/contracts/upload', {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                const newContract = await res.json();
                
                // 1. Clear filters & pagination immediately so user sees the top of list
                setSearchTerm('');
                setSelectedAreas([]);
                setStatusFilter('ALL');
                setCurrentPage(1);
                
                // 2. Optimistic Update (put new contract at the top)
                mutate(currentData => {
                    if (!currentData) return [newContract];
                    // Skip if accidentally duplicated
                    if (currentData.some(c => c.id === newContract.id)) return currentData;
                    return [newContract, ...currentData];
                }, false);

                // 3. UI Resets
                setShowUploadModal(false);
                setUploadFile(null);
                setUploadTenantName('');
                setUploadTenantEmail('');
                setUploadRoomNumber('');
                setUploadBuildingName('');
                setUploadMonthlyRent('');
                setUploadType('RENTAL');
                setUploadCustomType('');
                setUploadProductName('');
                setUploadProductArea('');
                setUploadProductFile(null);
                setToastMsg(t.contracts.toastSuccess);
                
                // 4. Background re-fetch after 500ms to ensure server is synced
                setTimeout(() => {
                    mutate();
                    setToastMsg('');
                }, 1500);
            } else {
                const data = await res.json();
                alert(data.error || t.contracts.errorUpload);
            }
        } catch (err) {
            console.error(err);
            alert(t.contracts.errorUpload);
        } finally {
            setIsUploading(false);
        }
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <>
            {/* Page Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>{t.contracts.pageTitle}</h1>
                    <p>{t.contracts.pageSubtitle}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="search-input-wrapper" style={{ position: 'relative', width: '220px' }}>
                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                        <input 
                            type="text"
                            placeholder={t.contracts.searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            style={{
                                width: '100%',
                                padding: '8px 12px 8px 36px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-primary)',
                                fontSize: '0.875rem'
                            }}
                        />
                    </div>
                    <FilterArea 
                        options={VIETNAM_PROVINCES}
                        selectedValues={selectedAreas}
                        onApply={(vals) => {
                            setSelectedAreas(vals);
                            setCurrentPage(1);
                        }}
                    />
                    <FilterMoney 
                        selectedValue={moneyRangeKey}
                        onApply={(val) => {
                            setMoneyRangeKey(val);
                            setCurrentPage(1);
                        }}
                    />
                    
                    {/* Status Filter */}
                    <div className="filter-status-wrapper" style={{ position: 'relative' }}>
                        <select 
                            className="btn btn-secondary"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            style={{ 
                                padding: '8px 32px 8px 16px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-primary)',
                                fontSize: '0.875rem',
                                appearance: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="ALL">{t.admin.labelAllStatus}</option>
                            <option value="PENDING">{t.contracts.statuses.PENDING}</option>
                            <option value="ACTIVE">{t.contracts.statuses.ACTIVE}</option>
                            <option value="REJECTED">{t.contracts.statuses.REJECTED}</option>
                        </select>
                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.7rem', opacity: 0.6 }}>▼</span>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
                        {t.contracts.uploadBtn}
                    </button>
                </div>
            </div>

            {/* ── Unified Contracts Table ── */}
            <div className="card-container" style={{ padding: 0, background: 'transparent', boxShadow: 'none' }}>
                {contracts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📄</div>
                        <h3>{t.contracts.emptyTitle}</h3>
                        <p>{t.contracts.emptyDesc}</p>
                    </div>
                ) : (
                    <>
                        <div className="table-wrapper" style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-card)' }}>
                            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <th style={headerStyle}>{t.contracts.colTenant}</th>
                                        <th style={headerStyle}>{t.contracts.colProductName}</th>
                                        <th style={headerStyle}>{t.contracts.colRent}</th>
                                        <th style={headerStyle}>{t.contracts.colCommission}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedContracts.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                                {t.contracts.emptyTitle}
                                            </td>
                                        </tr>
                                    ) : (
                                        groupedContracts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((group) => {
                                            const isExpanded = expandedProducts.has(group.productName);
                                            return (
                                                <Fragment key={group.productName}>
                                                    <tr 
                                                        style={{ 
                                                            borderBottom: '1px solid var(--border-subtle)',
                                                            cursor: 'pointer',
                                                            background: isExpanded ? 'rgba(56, 189, 248, 0.03)' : 'transparent',
                                                            transition: 'background 0.2s'
                                                        }}
                                                        onClick={() => toggleExpand(group.productName)}
                                                    >
                                                        <td style={cellStyle}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <div style={{ 
                                                                    width: '32px', height: '32px', borderRadius: '8px', 
                                                                    background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                                                                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    fontSize: '0.75rem', fontWeight: 800
                                                                }}>
                                                                    {group.agentName.substring(0, 2).toUpperCase()}
                                                                </div>
                                                                <span style={{ fontWeight: 600 }}>{group.agentName}</span>
                                                            </div>
                                                        </td>
                                                        <td style={cellStyle}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{ 
                                                                    color: 'var(--accent-blue)', 
                                                                    fontWeight: 700,
                                                                    fontSize: '0.95rem',
                                                                    textDecoration: 'underline',
                                                                    textDecorationColor: 'rgba(56, 189, 248, 0.3)',
                                                                    textUnderlineOffset: '4px'
                                                                }}>
                                                                    {group.productName}
                                                                </span>
                                                                <span style={{ 
                                                                    fontSize: '0.7rem', 
                                                                    opacity: 0.5, 
                                                                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                                                                    transition: 'transform 0.2s'
                                                                }}>▶</span>
                                                            </div>
                                                        </td>
                                                        <td style={cellStyle}>
                                                            <div style={{ fontWeight: 700 }}>{formatCurrency(group.totalValue)}</div>
                                                        </td>
                                                        <td style={cellStyle}>
                                                            <span 
                                                                style={{ 
                                                                    background: 'rgba(16, 185, 129, 0.1)', 
                                                                    color: 'var(--accent-emerald)',
                                                                    padding: '4px 10px',
                                                                    borderRadius: '20px',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 700,
                                                                    cursor: 'pointer',
                                                                    userSelect: 'none',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setShowCommissionAsPercentage(!showCommissionAsPercentage);
                                                                }}
                                                                title={showCommissionAsPercentage ? "Click to see amount" : "Click to see percentage"}
                                                            >
                                                                {showCommissionAsPercentage 
                                                                    ? `${Math.round((group.totalCommission / group.totalValue) * 100)}%`
                                                                    : `+ ${formatCurrency(group.totalCommission)}`
                                                                }
                                                            </span>
                                                        </td>
                                                    </tr>

                                                    {isExpanded && (
                                                        <tr>
                                                            <td colSpan={4} style={{ padding: '0 20px 20px 20px', background: 'rgba(255,255,255,0.01)' }}>
                                                                <div style={{ 
                                                                    background: 'var(--bg-panel)', 
                                                                    borderRadius: '12px', 
                                                                    border: '1px solid var(--border-subtle)',
                                                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                                    overflow: 'hidden',
                                                                    animation: 'slideDown 0.3s ease-out'
                                                                }}>
                                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                                        <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
                                                                            <tr>
                                                                                <th style={subHeaderStyle}>{t.contracts.colContractCode}</th>
                                                                                <th style={subHeaderStyle}>{t.contracts.colType}</th>
                                                                                <th style={subHeaderStyle}>{t.contracts.colStatus}</th>
                                                                                <th style={subHeaderStyle}>{t.contracts.colDate}</th>
                                                                                <th style={subHeaderStyle}>{t.contracts.colActions}</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {group.items.map(item => (
                                                                                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                                                    <td style={subCellStyle}>
                                                                                        <code style={{ fontSize: '0.8125rem', color: 'var(--accent-blue)', fontWeight: 700 }}>
                                                                                            {item.contractCode || item.id.substring(0, 8).toUpperCase()}
                                                                                        </code>
                                                                                    </td>
                                                                                    <td style={subCellStyle}>
                                                                                        <span className={`badge ${typeBadge(item.type)}`}>
                                                                                            {t.contracts.types[item.type as keyof typeof t.contracts.types] || item.type}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td style={subCellStyle}>
                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                            <span className={`badge ${statusBadge(item.status)}`}>
                                                                                                {t.contracts.statuses[item.status as keyof typeof t.contracts.statuses] || item.status}
                                                                                            </span>
                                                                                            {item.status === 'REJECTED' && (
                                                                                                <button 
                                                                                                    className="info-icon" 
                                                                                                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '2px', fontSize: '0.9rem' }}
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        setRejectDetails({ note: item.reviewNote, by: item.reviewedBy, at: item.reviewedAt });
                                                                                                        setShowRejectModal(true);
                                                                                                    }}
                                                                                                >ⓘ</button>
                                                                                            )}
                                                                                        </div>
                                                                                    </td>
                                                                                    <td style={subCellStyle}>
                                                                                        {formatDate(item.createdAt)}
                                                                                    </td>
                                                                                    <td style={subCellStyle}>
                                                                                        <button
                                                                                            className="btn btn-sm btn-secondary"
                                                                                            style={{ fontSize: '0.7rem', height: '28px', padding: '0 12px' }}
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                setSelectedContract(item);
                                                                                                setShowDetailModal(true);
                                                                                            }}
                                                                                        >
                                                                                            {t.contracts.btnViewDetails}
                                                                                        </button>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Fragment>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Pagination ── */}
                        {Math.ceil(groupedContracts.length / PAGE_SIZE) > 1 && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '16px 20px',
                                borderTop: 'none',
                            }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {t.contracts.paginationShowing} {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, groupedContracts.length)} {t.contracts.paginationOf} {groupedContracts.length}
                                </span>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        {t.contracts.paginationPrev}
                                    </button>
                                    {Array.from({ length: Math.ceil(groupedContracts.length / PAGE_SIZE) }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            className="btn btn-sm"
                                            style={{
                                                background: page === currentPage ? 'var(--accent-blue)' : 'transparent',
                                                color: page === currentPage ? '#fff' : 'var(--text-secondary)',
                                                border: page === currentPage ? 'none' : '1px solid var(--border-subtle)',
                                                minWidth: '32px',
                                            }}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(groupedContracts.length / PAGE_SIZE), p + 1))}
                                        disabled={currentPage === Math.ceil(groupedContracts.length / PAGE_SIZE)}
                                    >
                                        {t.contracts.paginationNext}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── Upload Contract PDF Modal ── */}
            {showUploadModal && (
                <div className="modal-overlay" onClick={() => !isUploading && setShowUploadModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t.contracts.modalUploadTitle}</h2>
                            <button className="modal-close" onClick={() => !isUploading && setShowUploadModal(false)} disabled={isUploading}>✕</button>
                        </div>
                        <form onSubmit={handleUpload}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t.contracts.labelTenantName}</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder={t.contracts.placeholderName}
                                            value={uploadTenantName}
                                            onChange={(e) => setUploadTenantName(e.target.value)}
                                            required
                                            disabled={isUploading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t.contracts.labelTenantEmail}</label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            placeholder={t.contracts.placeholderEmail}
                                            value={uploadTenantEmail}
                                            onChange={(e) => setUploadTenantEmail(e.target.value)}
                                            disabled={isUploading}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t.contracts.labelProductName}</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder={t.contracts.placeholderProductName}
                                            value={uploadProductName}
                                            onChange={(e) => setUploadProductName(e.target.value)}
                                            required
                                            disabled={isUploading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t.contracts.labelProductArea}</label>
                                        <CombinedSelect 
                                            options={VIETNAM_PROVINCES}
                                            value={uploadProductArea}
                                            onChange={setUploadProductArea}
                                            placeholder={t.contracts.placeholderProductArea}
                                            disabled={isUploading}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t.contracts.labelRent}</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder={t.contracts.placeholderRent}
                                            min="0"
                                            value={uploadMonthlyRent}
                                            onChange={(e) => setUploadMonthlyRent(e.target.value)}
                                            required
                                            disabled={isUploading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t.contracts.labelContractType}</label>
                                        <select
                                            className="form-select"
                                            value={uploadType}
                                            onChange={(e) => setUploadType(e.target.value)}
                                            required
                                            disabled={isUploading}
                                        >
                                            <option value="SALE">{t.contracts.types.SALE}</option>
                                            <option value="RENTAL">{t.contracts.types.RENTAL}</option>
                                            <option value="OTHER">{t.contracts.types.OTHER}</option>
                                        </select>
                                    </div>
                                </div>

                                {uploadType === 'OTHER' && (
                                    <div className="form-group" style={{ marginBottom: '16px' }}>
                                        <label>{t.contracts.labelContractType} ({t.contracts.types.OTHER})</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder={t.contracts.placeholderCustomType}
                                            value={uploadCustomType}
                                            onChange={(e) => setUploadCustomType(e.target.value)}
                                            required={uploadType === 'OTHER'}
                                            disabled={isUploading}
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>{t.contracts.labelMainPDF}</label>
                                    <div className="file-upload-zone" style={{
                                        border: '2px dashed var(--border-subtle)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '20px',
                                        textAlign: 'center',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer',
                                        backgroundColor: uploadFile ? 'rgba(56, 189, 248, 0.05)' : 'transparent',
                                    }}
                                        onClick={() => document.getElementById('contract-file-input')?.click()}
                                    >
                                        <input
                                            id="contract-file-input"
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                                            style={{ display: 'none' }}
                                            disabled={isUploading}
                                        />
                                        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📄</div>
                                        {uploadFile ? (
                                            <div style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{uploadFile.name}</div>
                                        ) : (
                                            <div style={{ color: 'var(--text-muted)' }}>{t.contracts.dropMainPDF}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>{t.contracts.labelProductPDF}</label>
                                    <div className="file-upload-zone" style={{
                                        border: '2px dashed var(--border-subtle)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '16px',
                                        textAlign: 'center',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer',
                                        backgroundColor: uploadProductFile ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                                    }}
                                        onClick={() => document.getElementById('product-file-input')?.click()}
                                    >
                                        <input
                                            id="product-file-input"
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) => setUploadProductFile(e.target.files ? e.target.files[0] : null)}
                                            style={{ display: 'none' }}
                                            disabled={isUploading}
                                        />
                                        <div style={{ fontSize: '1.25rem', marginBottom: '6px' }}>📎</div>
                                        {uploadProductFile ? (
                                            <div style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{uploadProductFile.name}</div>
                                        ) : (
                                            <div style={{ color: 'var(--text-muted)' }}>{t.contracts.dropProductPDF}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)} disabled={isUploading}>{t.contracts.btnCancel}</button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={
                                        !uploadFile ||
                                        !uploadProductFile ||
                                        !uploadTenantName.trim() ||
                                        !uploadProductName.trim() ||
                                        !uploadProductArea.trim() ||
                                        !uploadMonthlyRent ||
                                        isUploading
                                    }
                                >
                                    {isUploading ? t.contracts.btnUploading : t.contracts.btnUpload}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Contract Detail Modal ── */}
            {showDetailModal && selectedContract && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📄 {t.contracts.modalDetailTitle}</h2>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">

                            {/* ── Info Grid (2x2) ── */}
                            <div className="detail-grid">
                                
                                {/* 1) CUSTOMER CARD */}
                                <div className="detail-section">
                                    <div className="detail-section-title">{t.contracts.sectionTenant}</div>
                                    <div className="detail-field">
                                        <div className="detail-field-label">{t.contracts.labelName}</div>
                                        <div className="detail-field-value">{selectedContract.person.name}</div>
                                    </div>
                                    <div className="detail-field">
                                        <div className="detail-field-label">{t.contracts.labelEmail}</div>
                                        <div className={`detail-field-value${!selectedContract.person.email ? ' muted' : ''}`}>
                                            {selectedContract.person.email || t.contracts.noEmail}
                                        </div>
                                    </div>
                                </div>

                                {/* 2) ASSET CARD */}
                                <div className="detail-section">
                                    <div className="detail-section-title">{t.contracts.sectionAsset}</div>
                                    <div className="detail-field">
                                        <div className="detail-field-label">{t.contracts.colContractCode}</div>
                                        <div className="detail-field-value" style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{selectedContract.contractCode}</div>
                                    </div>
                                    <div className="detail-field">
                                        <div className="detail-field-label">{t.contracts.colProductName}</div>
                                        <div className="detail-field-value">{selectedContract.productName || '—'}</div>
                                    </div>
                                    <div className="detail-field">
                                        <div className="detail-field-label">{t.contracts.colProductArea}</div>
                                        <div className="detail-field-value">{selectedContract.productArea || '—'}</div>
                                    </div>
                                </div>

                                {/* 3) CONTRACT CARD */}
                                <div className="detail-section">
                                    <div className="detail-section-title">{t.contracts.sectionContract}</div>
                                    <div className="detail-field">
                                        <div className="detail-field-label">{t.contracts.labelType}</div>
                                        <div className="detail-field-value">
                                            <span className={`badge ${typeBadge(selectedContract.type)}`}>
                                                {t.contracts.types[selectedContract.type as keyof typeof t.contracts.types] || selectedContract.type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="detail-field">
                                        <div className="detail-field-label">{t.contracts.labelStatus}</div>
                                        <div className="detail-field-value">
                                            <span className={`badge ${statusBadge(selectedContract.status)}`}>
                                                {t.contracts.statuses[selectedContract.status as keyof typeof t.contracts.statuses] || selectedContract.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="detail-field">
                                        <div className="detail-field-label">{t.contracts.labelUploadDate}</div>
                                        <div className="detail-field-value">
                                            {formatDate(selectedContract.createdAt)}
                                        </div>
                                    </div>
                                </div>

                                {/* 4) FINANCE CARD */}
                                    <div className="detail-section">
                                    <div className="detail-section-title">{t.contracts.sectionFinancials}</div>
                                    <div className="detail-field">
                                        <div className="detail-field-label">{t.contracts.labelRentAmount}</div>
                                        <div className="detail-field-value" style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff' }}>
                                            {formatCurrency(selectedContract.monthlyRent)}
                                        </div>
                                    </div>
                                    <div className="detail-field">
                                        <div className="detail-field-label">{t.admin.labelCommission}</div>
                                        <div className="detail-field-value" style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                                            {formatCurrency(selectedContract.monthlyRent * 0.1)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Attached Documents ── */}
                            <div>
                                <div className="detail-section-title" style={{ marginBottom: '12px' }}>
                                    📎 {t.contracts.labelMainDoc} ({selectedContract.documents.length})
                                </div>
                                {selectedContract.documents.length === 0 ? (
                                    <div style={{
                                        padding: '20px',
                                        textAlign: 'center',
                                        color: 'var(--text-muted)',
                                        background: 'var(--bg-card)',
                                        border: '1px dashed var(--border-subtle)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '0.875rem',
                                    }}>
                                        {t.contracts.labelNoDocs}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {/* Main Contract Group */}
                                        {selectedContract.documents.filter(d => d.documentType === 'CONTRACT').map((doc) => (
                                            <Fragment key={doc.id}>
                                                <div className="doc-row">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                                    <span style={{ fontSize: '1.25rem' }}>📄</span>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ fontWeight: 600, fontSize: '0.875rem', wordBreak: 'break-all' }}>{doc.originalName}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                            {(doc.fileSize / (1024 * 1024)).toFixed(2)} {t.contracts.labelMB} · {t.contracts.labelUploaded} {formatDate(doc.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="doc-actions">
                                                    <span className={`badge ${approvalBadge(doc.approvalStatus)}`}>
                                                        {t.contracts.approvals[doc.approvalStatus as keyof typeof t.contracts.approvals] || doc.approvalStatus}
                                                    </span>
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        onClick={() => {
                                                            setPreviewDocId(prev => prev === doc.id ? null : doc.id);
                                                        }}
                                                    >
                                                        {previewDocId === doc.id ? t.contracts.btnHidePreview : t.contracts.btnShowPreview}
                                                    </button>
                                                    <a
                                                        href={doc.fileUrl}
                                                        download={doc.originalName}
                                                        className="btn btn-sm btn-secondary"
                                                    >
                                                        {t.contracts.btnDownload}
                                                    </a>
                                                </div>
                                            </div>
                                            {previewDocId === doc.id && (
                                                <div className="pdf-preview-container" style={{ width: '100%', marginTop: '4px' }}>
                                                    <iframe
                                                        src={doc.fileUrl}
                                                        width="100%"
                                                        height="500"
                                                        style={{
                                                            border: "1px solid var(--border-subtle)",
                                                            borderRadius: "8px",
                                                            marginTop: "12px",
                                                            background: 'var(--bg-card)',
                                                        }}
                                                        title="PDF Preview"
                                                    />
                                                </div>
                                            )}
                                            </Fragment>
                                        ))}

                                        {/* Product Detail Group */}
                                        {selectedContract.documents.some(d => d.documentType === 'PRODUCT_DETAIL') && (
                                            <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '4px' }}>
                                                {t.contracts.labelProductDoc}
                                            </div>
                                        )}
                                        {selectedContract.documents.filter(d => d.documentType === 'PRODUCT_DETAIL').map((doc) => (
                                            <Fragment key={doc.id}>
                                                <div className="doc-row">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                                    <span style={{ fontSize: '1.25rem' }}>📎</span>
                                                    <div style={{ minWidth: 0 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                            <div style={{ fontWeight: 600, fontSize: '0.875rem', wordBreak: 'break-all' }}>{doc.originalName}</div>
                                                            <span className="badge amber" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                                                                {t.contracts.labelProductDoc}
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                            {(doc.fileSize / (1024 * 1024)).toFixed(2)} {t.contracts.labelMB} · {t.contracts.labelUploaded} {formatDate(doc.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="doc-actions">
                                                    <span className={`badge ${approvalBadge(doc.approvalStatus)}`}>
                                                        {t.contracts.approvals[doc.approvalStatus as keyof typeof t.contracts.approvals] || doc.approvalStatus}
                                                    </span>
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        onClick={() => {
                                                            setPreviewDocId(prev => prev === doc.id ? null : doc.id);
                                                        }}
                                                    >
                                                        {previewDocId === doc.id ? t.contracts.btnHidePreview : t.contracts.btnShowPreview}
                                                    </button>
                                                    <a
                                                        href={doc.fileUrl}
                                                        download={doc.originalName}
                                                        className="btn btn-sm btn-secondary"
                                                    >
                                                        {t.contracts.btnDownload}
                                                    </a>
                                                </div>
                                            </div>
                                            {previewDocId === doc.id && (
                                                <div className="pdf-preview-container" style={{ width: '100%', marginTop: '4px' }}>
                                                    <iframe
                                                        src={doc.fileUrl}
                                                        width="100%"
                                                        height="500"
                                                        style={{
                                                            border: "1px solid var(--border-subtle)",
                                                            borderRadius: "8px",
                                                            marginTop: "12px",
                                                            background: 'var(--bg-card)',
                                                        }}
                                                        title="PDF Preview"
                                                    />
                                                </div>
                                            )}
                                            </Fragment>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Footer ── */}
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => { setShowDetailModal(false); setPreviewDocId(null); }}>
                                {t.contracts.btnClose}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toastMsg && <div className="toast success">✅ {toastMsg}</div>}

            {/* ── Rejection Detail Modal ── */}
            {showRejectModal && rejectDetails && (
                <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <div className="modal-header">
                            <h2>⚠️ {t.contracts.rejectDetailTitle}</h2>
                            <button className="modal-close" onClick={() => setShowRejectModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                            {t.contracts.colStatus}
                                        </div>
                                        <span className="badge rose">
                                            {t.contracts.statuses.REJECTED}
                                        </span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                            {t.contracts.labelRejectBy}
                                        </div>
                                        <div style={{ fontWeight: 600 }}>{rejectDetails.by || 'Admin'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                            {t.contracts.labelRejectAt}
                                        </div>
                                        <div style={{ fontSize: '0.9rem' }}>
                                            {rejectDetails.at ? formatDate(rejectDetails.at) : '—'}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ 
                                    borderTop: '1px solid var(--border-subtle)', 
                                    paddingTop: '16px', 
                                    marginTop: '16px' 
                                }}>
                                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                        {t.contracts.labelRejectReason}
                                    </div>
                                    <div style={{ 
                                        background: 'rgba(244, 63, 94, 0.05)',
                                        borderLeft: '4px solid var(--accent-rose)',
                                        padding: '16px',
                                        borderRadius: '0 4px 4px 0',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.5',
                                        color: '#fff',
                                        maxHeight: '200px',
                                        overflowY: 'auto'
                                    }}>
                                        {rejectDetails.note || 'No reason provided.'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
                            <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)} style={{ width: '100%' }}>
                                {t.contracts.btnClose || 'Close'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
