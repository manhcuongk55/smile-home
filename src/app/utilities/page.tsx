'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

interface Meter {
    id: string;
    type: 'ELECTRICITY' | 'WATER';
    number: string;
    room: {
        number: string;
        building: { name: string };
    };
    readings: {
        value: number;
        readingDate: string;
    }[];
}

interface Room {
    id: string;
    number: string;
    building: { name: string };
}

export default function UtilitiesPage() {
    const [meters, setMeters] = useState<Meter[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [newReading, setNewReading] = useState({
        roomId: '',
        type: 'ELECTRICITY',
        value: 0,
        readingDate: new Date().toISOString().split('T')[0],
        meterNumber: '',
    });
    const [toastMsg, setToastMsg] = useState('');
    const { t } = useLanguage();

    useEffect(() => {
        fetchMeters();
        fetchRooms();
    }, []);

    async function fetchMeters() {
        const res = await fetch('/api/utilities');
        const data = await res.json();
        setMeters(Array.isArray(data) ? data : []);
    }

    async function fetchRooms() {
        const res = await fetch('/api/rooms');
        const data = await res.json();
        setRooms(Array.isArray(data) ? data : []);
    }

    async function handleRecord(e: React.FormEvent) {
        e.preventDefault();
        try {
            const res = await fetch('/api/utilities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newReading),
            });
            if (res.ok) {
                setShowRecordModal(false);
                setNewReading({ ...newReading, value: 0 });
                setToastMsg(t('readingRecorded'));
                fetchMeters();
                setTimeout(() => setToastMsg(''), 3000);
            }
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>{t('utilitiesTitle')}</h1>
                    <p>{t('utilitiesSubtitle')}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowRecordModal(true)}>
                    {t('recordReadingBtn')}
                </button>
            </div>

            <div className="stats-grid" style={{ marginBottom: 32 }}>
                <div className="stat-card blue">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-value">{meters.filter(m => m.type === 'ELECTRICITY').length}</div>
                    <div className="stat-label">{t('electricityMeters')}</div>
                </div>
                <div className="stat-card teal">
                    <div className="stat-icon">💧</div>
                    <div className="stat-value">{meters.filter(m => m.type === 'WATER').length}</div>
                    <div className="stat-label">{t('waterMeters')}</div>
                </div>
            </div>

            <div className="card-container">
                {meters.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📊</div>
                        <h3>{t('noMeters')}</h3>
                        <p>{t('startRecording')}</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{t('service')}</th>
                                    <th>{t('room')}</th>
                                    <th>{t('lastReading')}</th>
                                    <th>{t('readingDate')}</th>
                                    <th>{t('meterNumber')}</th>
                                    <th>{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {meters.map((meter) => (
                                    <tr key={meter.id}>
                                        <td>
                                            <span className={`badge ${meter.type === 'ELECTRICITY' ? 'amber' : 'blue'}`}>
                                                {meter.type === 'ELECTRICITY' ? `⚡ ${t('electricity')}` : `💧 ${t('water')}`}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{meter.room.number}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{meter.room.building.name}</div>
                                        </td>
                                        <td style={{ fontWeight: 700 }}>
                                            {meter.readings[0]?.value || 'N/A'} {meter.type === 'ELECTRICITY' ? 'kWh' : 'm³'}
                                        </td>
                                        <td style={{ fontSize: '0.85rem' }}>
                                            {meter.readings[0] ? new Date(meter.readings[0].readingDate).toLocaleDateString() : t('never')}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{meter.number}</td>
                                        <td>
                                            <button className="btn btn-sm btn-secondary">{t('history')}</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showRecordModal && (
                <div className="modal-overlay" onClick={() => setShowRecordModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t('recordUtilityModal')}</h2>
                            <button className="modal-close" onClick={() => setShowRecordModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleRecord}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>{t('serviceTypeLabel')}</label>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${newReading.type === 'ELECTRICITY' ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setNewReading({ ...newReading, type: 'ELECTRICITY' })}
                                        >⚡ {t('electricity')}</button>
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${newReading.type === 'WATER' ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setNewReading({ ...newReading, type: 'WATER' })}
                                        >💧 {t('water')}</button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>{t('roomLabelSelect')}</label>
                                    <select
                                        className="form-select"
                                        value={newReading.roomId}
                                        onChange={(e) => setNewReading({ ...newReading, roomId: e.target.value })}
                                        required
                                    >
                                        <option value="">{t('selectRoom')}</option>
                                        {rooms.map((r) => (
                                            <option key={r.id} value={r.id}>{r.building.name} - {r.number}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t('readingValueLabel')}</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder={t('currentMeterValue') as string}
                                            value={newReading.value}
                                            onChange={(e) => setNewReading({ ...newReading, value: parseFloat(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('readingDateLabel')}</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={newReading.readingDate}
                                            onChange={(e) => setNewReading({ ...newReading, readingDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>{t('meterSerialOptional')}</label>
                                    <input
                                        className="form-input"
                                        placeholder={t('meterSerialPlaceholder') as string}
                                        value={newReading.meterNumber}
                                        onChange={(e) => setNewReading({ ...newReading, meterNumber: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowRecordModal(false)}>{t('cancel')}</button>
                                <button type="submit" className="btn btn-primary">{t('saveReadingBtn')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toastMsg && <div className="toast success">✅ {toastMsg}</div>}
        </>
    );
}
