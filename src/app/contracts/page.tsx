'use client';

import { useState, useEffect, Fragment } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';

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
    deposit: number;
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

// ── Component ─────────────────────────────────────────────────────────────────

export default function ContractsPage() {
    const { language } = useLanguage();
    const t = translations[language].contracts;

    const [contracts, setContracts] = useState<Contract[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [persons, setPersons] = useState<Person[]>([]);

    // Upload modal
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadTenantName, setUploadTenantName] = useState('');
    const [uploadTenantEmail, setUploadTenantEmail] = useState('');
    const [uploadRoomNumber, setUploadRoomNumber] = useState('');
    const [uploadBuildingName, setUploadBuildingName] = useState('');
    const [uploadMonthlyRent, setUploadMonthlyRent] = useState('');
    const [uploadType, setUploadType] = useState('RENTAL');
    const [uploadProductFile, setUploadProductFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Detail modal
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [previewDocId, setPreviewDocId] = useState<string | null>(null);

    // Pagination
    const PAGE_SIZE = 6;
    const [currentPage, setCurrentPage] = useState(1);

    // Toast
    const [toastMsg, setToastMsg] = useState('');

    useEffect(() => {
        fetchContracts();
        fetchRooms();
        fetchPersons();
    }, []);

    // ── Fetchers ───────────────────────────────────────────────────────────────

    async function fetchContracts() {
        try {
            const res = await fetch('/api/contracts');
            const data = await res.json();
            setContracts(Array.isArray(data) ? data : []);
            setCurrentPage(1);
        } catch (err) {
            console.error('Fetch error:', err);
        }
    }

    async function fetchRooms() {
        try {
            const res = await fetch('/api/rooms');
            const data = await res.json();
            setRooms(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Fetch rooms error:', err);
        }
    }

    async function fetchPersons() {
        try {
            const res = await fetch('/api/persons');
            const data = await res.json();
            setPersons(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Fetch persons error:', err);
        }
    }

    // ── Handlers ───────────────────────────────────────────────────────────────

    async function handleUpload(e: React.FormEvent) {
        e.preventDefault();
        if (!uploadFile || !uploadProductFile || !uploadTenantName.trim() || !uploadRoomNumber.trim() || !uploadBuildingName.trim() || !uploadMonthlyRent) {
            alert('Please fill in all required fields and select both PDF files.');
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
        formData.append('type', uploadType);
        if (uploadProductFile) {
            formData.append('productFile', uploadProductFile);
        }

        try {
            const res = await fetch('/api/contracts/upload', {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                setShowUploadModal(false);
                setUploadFile(null);
                setUploadTenantName('');
                setUploadTenantEmail('');
                setUploadRoomNumber('');
                setUploadBuildingName('');
                setUploadMonthlyRent('');
                setUploadType('RENTAL');
                setUploadProductFile(null);
                setToastMsg('Contract uploaded successfully!');
                fetchContracts();
                setTimeout(() => setToastMsg(''), 3000);
            } else {
                const data = await res.json();
                alert(data.error || 'Upload failed');
            }
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        } finally {
            setIsUploading(false);
        }
    }

    async function moveStatus(contractId: string, newStatus: string) {
        try {
            const res = await fetch(`/api/contracts/${contractId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setToastMsg(`Contract status updated to ${newStatus}`);
                fetchContracts();
                setTimeout(() => setToastMsg(''), 3000);
            }
        } catch (err) {
            console.error(err);
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
            style: 'currency',
            currency: language === 'vi' ? 'VND' : 'USD',
            maximumFractionDigits: 0,
        }).format(amount);
    }

    function statusBadge(status: string) {
        if (status === 'ACTIVE') return 'emerald';
        if (status === 'DRAFT') return 'amber';
        return 'rose';
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

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <>
            {/* Page Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>{t?.title || 'Contract Management'}</h1>
                    <p>{t?.subtitle || 'Legally binding agreements between property and tenants'}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary" onClick={() => setShowUploadModal(true)}>
                        📄 {t?.uploadBtn || 'Upload Contract PDF'}
                    </button>
                </div>
            </div>

            {/* ── Unified Contracts Table ── */}
            <div className="card-container">
                {contracts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📄</div>
                        <h3>No contracts found</h3>
                        <p>Create your first contract or upload a PDF to get started.</p>
                    </div>
                ) : (
                    <>
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Tenant</th>
                                        <th>Room</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Period</th>
                                        <th>Rent</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contracts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((contract) => (
                                        <tr key={contract.id}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{contract.person.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {contract.person.email || '—'}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{contract.room.number}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {contract.room.building.name}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${typeBadge(contract.type)}`}>{contract.type}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${statusBadge(contract.status)}`}>
                                                    {contract.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem' }}>
                                                    {formatDate(contract.startDate)} – {formatDate(contract.endDate)}
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 700 }}>
                                                {formatCurrency(contract.monthlyRent)}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        onClick={() => {
                                                            setSelectedContract(contract);
                                                            setShowDetailModal(true);
                                                        }}
                                                    >
                                                        {t?.viewDetails || 'View Details'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Pagination ── */}
                        {Math.ceil(contracts.length / PAGE_SIZE) > 1 && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '16px 20px',
                                borderTop: '1px solid var(--border-subtle)',
                            }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, contracts.length)} of {contracts.length}
                                </span>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        ‹ Prev
                                    </button>
                                    {Array.from({ length: Math.ceil(contracts.length / PAGE_SIZE) }, (_, i) => i + 1).map(page => (
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
                                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(contracts.length / PAGE_SIZE), p + 1))}
                                        disabled={currentPage === Math.ceil(contracts.length / PAGE_SIZE)}
                                    >
                                        Next ›
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
                            <h2>Upload Contract PDF</h2>
                            <button className="modal-close" onClick={() => !isUploading && setShowUploadModal(false)} disabled={isUploading}>✕</button>
                        </div>
                        <form onSubmit={handleUpload}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Tenant Name *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g. John Smith"
                                            value={uploadTenantName}
                                            onChange={(e) => setUploadTenantName(e.target.value)}
                                            required
                                            disabled={isUploading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tenant Email</label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            placeholder="e.g. john@example.com"
                                            value={uploadTenantEmail}
                                            onChange={(e) => setUploadTenantEmail(e.target.value)}
                                            disabled={isUploading}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Room Number *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g. 101"
                                            value={uploadRoomNumber}
                                            onChange={(e) => setUploadRoomNumber(e.target.value)}
                                            required
                                            disabled={isUploading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Building Name *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g. Block A"
                                            value={uploadBuildingName}
                                            onChange={(e) => setUploadBuildingName(e.target.value)}
                                            required
                                            disabled={isUploading}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Contract Type *</label>
                                    <select
                                        className="form-select"
                                        value={uploadType}
                                        onChange={(e) => setUploadType(e.target.value)}
                                        required
                                        disabled={isUploading}
                                    >
                                        <option value="RENTAL">Rental Agreement</option>
                                        <option value="SALE">Sale Agreement</option>
                                        <option value="MANAGEMENT">Management Agreement</option>
                                        <option value="LEASE_EXTEND">Lease Extension</option>
                                        <option value="SHORT_TERM">Short Term Rental</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Rent (VNĐ) *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="e.g. 8000"
                                        min="0"
                                        value={uploadMonthlyRent}
                                        onChange={(e) => setUploadMonthlyRent(e.target.value)}
                                        required
                                        disabled={isUploading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Main Contract PDF *</label>
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
                                            <div style={{ color: 'var(--text-muted)' }}>Click to select Main PDF File</div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Product Detail File *</label>
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
                                            <div style={{ color: 'var(--text-muted)' }}>Click to select Product Detail PDF *</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)} disabled={isUploading}>Cancel</button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={
                                        !uploadFile ||
                                        !uploadProductFile ||
                                        !uploadTenantName.trim() ||
                                        !uploadRoomNumber.trim() ||
                                        !uploadBuildingName.trim() ||
                                        !uploadMonthlyRent ||
                                        isUploading
                                    }
                                >
                                    {isUploading ? 'Uploading...' : 'Upload Contract'}
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
                            <h2>📄 Contract Details</h2>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">

                            {/* ── Info Grid ── */}
                            <div className="detail-grid">

                                {/* Tenant Info */}
                                <div className="detail-section">
                                    <div className="detail-section-title">👤 Tenant</div>
                                    <div className="detail-field">
                                        <div className="detail-field-label">Name</div>
                                        <div className="detail-field-value">{selectedContract.person.name}</div>
                                    </div>
                                    <div className="detail-field">
                                        <div className="detail-field-label">Email</div>
                                        <div className={`detail-field-value${!selectedContract.person.email ? ' muted' : ''}`}>
                                            {selectedContract.person.email || 'No email provided'}
                                        </div>
                                    </div>
                                </div>

                                {/* Room Info */}
                                <div className="detail-section">
                                    <div className="detail-section-title">🏠 Room</div>
                                    <div className="detail-field">
                                        <div className="detail-field-label">Room Number</div>
                                        <div className="detail-field-value">{selectedContract.room.number}</div>
                                    </div>
                                    <div className="detail-field">
                                        <div className="detail-field-label">Building</div>
                                        <div className="detail-field-value">{selectedContract.room.building.name}</div>
                                    </div>
                                </div>

                                {/* Contract Info */}
                                <div className="detail-section">
                                    <div className="detail-section-title">📋 Contract</div>
                                    <div className="detail-field">
                                        <div className="detail-field-label">Type</div>
                                        <div className="detail-field-value">
                                            <span className={`badge ${typeBadge(selectedContract.type)}`}>{selectedContract.type}</span>
                                        </div>
                                    </div>
                                    <div className="detail-field">
                                        <div className="detail-field-label">Status</div>
                                        <div className="detail-field-value">
                                            <span className={`badge ${statusBadge(selectedContract.status)}`}>
                                                {selectedContract.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="detail-field">
                                        <div className="detail-field-label">Period</div>
                                        <div className="detail-field-value">
                                            {formatDate(selectedContract.startDate)} – {formatDate(selectedContract.endDate)}
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Info */}
                                <div className="detail-section">
                                    <div className="detail-section-title">💰 Financials</div>
                                    <div className="detail-field">
                                        <div className="detail-field-label">Rent</div>
                                        <div className="detail-field-value" style={{ fontWeight: 700, fontSize: '1rem' }}>
                                            {formatCurrency(selectedContract.monthlyRent)}
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* ── Attached Documents ── */}
                            <div>
                                <div className="detail-section-title" style={{ marginBottom: '12px' }}>
                                    📎 Main Contract ({selectedContract.documents.length})
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
                                        No documents attached to this contract.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {/* Main Contract Group */}
                                        {selectedContract.documents.filter(d => d.documentType === 'CONTRACT').map((doc) => (
                                            <Fragment key={doc.id}>
                                                <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '14px 16px',
                                                background: 'var(--bg-card)',
                                                border: '1px solid var(--border-subtle)',
                                                borderRadius: 'var(--radius-md)',
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span style={{ fontSize: '1.25rem' }}>📄</span>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{doc.originalName}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                            {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB · Uploaded {formatDate(doc.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span className={`badge ${approvalBadge(doc.approvalStatus)}`}>
                                                        {doc.approvalStatus}
                                                    </span>
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        onClick={() => {
                                                            setPreviewDocId(prev => prev === doc.id ? null : doc.id);
                                                        }}
                                                    >
                                                        {previewDocId === doc.id ? '▲ Hide Preview' : '👁 Preview'}
                                                    </button>
                                                    <a
                                                        href={doc.fileUrl}
                                                        download={doc.originalName}
                                                        className="btn btn-sm btn-secondary"
                                                    >
                                                        ⬇ Download
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
                                                Product Detail Documents
                                            </div>
                                        )}
                                        {selectedContract.documents.filter(d => d.documentType === 'PRODUCT_DETAIL').map((doc) => (
                                            <Fragment key={doc.id}>
                                                <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '14px 16px',
                                                background: 'var(--bg-card)',
                                                border: '1px solid var(--border-subtle)',
                                                borderRadius: 'var(--radius-md)',
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span style={{ fontSize: '1.25rem' }}>📎</span>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{doc.originalName}</div>
                                                            <span className="badge amber" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                                                                Product Detail
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                            {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB · Uploaded {formatDate(doc.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span className={`badge ${approvalBadge(doc.approvalStatus)}`}>
                                                        {doc.approvalStatus}
                                                    </span>
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        onClick={() => {
                                                            setPreviewDocId(prev => prev === doc.id ? null : doc.id);
                                                        }}
                                                    >
                                                        {previewDocId === doc.id ? '▲ Hide Preview' : '👁 Preview'}
                                                    </button>
                                                    <a
                                                        href={doc.fileUrl}
                                                        download={doc.originalName}
                                                        className="btn btn-sm btn-secondary"
                                                    >
                                                        ⬇ Download
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
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toastMsg && <div className="toast success">✅ {toastMsg}</div>}
        </>
    );
}
