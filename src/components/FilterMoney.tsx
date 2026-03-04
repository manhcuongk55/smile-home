'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface MoneyRange {
    key: string;
    min: number | null;
    max: number | null;
}

const MONEY_RANGES: MoneyRange[] = [
    { key: 'ALL', min: null, max: null },
    { key: 'LT5M', min: 0, max: 5000000 },
    { key: 'M5_20', min: 5000000, max: 20000000 },
    { key: 'M20_1B', min: 20000000, max: 1000000000 },
    { key: 'B1_3', min: 1000000000, max: 3000000000 },
    { key: 'B3_10', min: 3000000000, max: 10000000000 },
    { key: 'GT10B', min: 10000000000, max: null },
];

interface FilterMoneyProps {
    selectedValue: string;
    onApply: (value: string) => void;
}

export default function FilterMoney({
    selectedValue,
    onApply,
}: FilterMoneyProps) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (key: string) => {
        onApply(key);
        setIsOpen(false);
    };

    const currentRangeLabel = t.admin.moneyRanges[selectedValue as keyof typeof t.admin.moneyRanges] || selectedValue;

    return (
        <div className="filter-money-container" ref={containerRef}>
            <div className="filter-button-group" style={{ display: 'flex', alignItems: 'center' }}>
                <button 
                    className={`filter-btn ${selectedValue !== 'ALL' ? 'active' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="icon">💰</span>
                    <span className="label">
                        {selectedValue === 'ALL' ? t.admin.labelMoneyRange : currentRangeLabel}
                    </span>
                    <span className="chevron">{isOpen ? '▲' : '▼'}</span>
                </button>
                {selectedValue !== 'ALL' && (
                    <button 
                        className="quick-clear-btn" 
                        onClick={() => onApply('ALL')}
                        title={t.contracts.filterClear}
                    >
                        ✕
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="filter-dropdown">
                    <div className="filter-list">
                        {MONEY_RANGES.map((range) => (
                            <div 
                                key={range.key} 
                                className={`filter-item ${selectedValue === range.key ? 'selected' : ''}`}
                                onClick={() => handleSelect(range.key)}
                            >
                                <span className="opt-label">
                                    {t.admin.moneyRanges[range.key as keyof typeof t.admin.moneyRanges]}
                                </span>
                                {selectedValue === range.key && <span className="check">✓</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style jsx>{`
                .filter-money-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .filter-button-group {
                    display: flex;
                    align-items: center;
                    background: var(--bg-card);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-sm);
                    transition: var(--transition-fast);
                }
                .filter-button-group:hover {
                    border-color: var(--accent-blue);
                }
                .filter-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px 8px 16px;
                    background: transparent;
                    border: none;
                    color: var(--text-primary);
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    white-space: nowrap;
                }
                .filter-btn.active {
                    color: var(--accent-blue);
                }
                .quick-clear-btn {
                    background: transparent;
                    border: none;
                    border-left: 1px solid var(--border-subtle);
                    color: var(--text-muted);
                    padding: 8px 10px;
                    cursor: pointer;
                    font-size: 0.75rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .quick-clear-btn:hover {
                    color: var(--accent-rose);
                    background: rgba(244, 63, 94, 0.1);
                }
                .filter-btn .chevron {
                    font-size: 0.7rem;
                    opacity: 0.6;
                    margin-left: 4px;
                }
                .filter-dropdown {
                    position: absolute;
                    top: calc(100% + 8px);
                    right: 0;
                    width: 200px;
                    background: var(--bg-card);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-md);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    animation: fadeIn 150ms ease-out;
                    padding: 8px 0;
                }

                .filter-list {
                    max-height: 300px;
                    overflow-y: auto;
                }
                .filter-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 16px;
                    cursor: pointer;
                    transition: background 0.1s;
                }
                .filter-item:hover {
                    background: var(--bg-card-hover);
                }
                .filter-item.selected {
                    background: var(--accent-blue-glow);
                }
                .filter-item.selected .opt-label {
                    color: var(--accent-blue);
                    font-weight: 600;
                }
                .opt-label {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }
                .check {
                    color: var(--accent-blue);
                    font-size: 0.8rem;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

export { MONEY_RANGES };
