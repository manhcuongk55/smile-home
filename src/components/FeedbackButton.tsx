'use client';

import { useState } from 'react';

export default function FeedbackButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [category, setCategory] = useState('bug');
    const [sent, setSent] = useState(false);

    function handleSend() {
        if (!feedback.trim()) return;
        // Save feedback via API or log
        fetch('/api/interactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: `[Phản hồi ${category === 'bug' ? '🐛 Lỗi' : category === 'feature' ? '💡 Ý tưởng' : '💬 Góp ý'}]`,
                notes: feedback,
                type: 'NOTE',
            }),
        }).catch(() => { });
        setSent(true);
        setTimeout(() => { setSent(false); setFeedback(''); setIsOpen(false); }, 2000);
    }

    return (
        <>
            {/* Floating Button - bottom LEFT to avoid overlap with chat */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed', bottom: 20, left: 20, zIndex: 9980,
                    height: 44, borderRadius: 22, border: 'none',
                    background: 'linear-gradient(135deg, #f472b6, #fb923c)',
                    color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(244,114,182,0.4)',
                    transition: 'all 200ms ease',
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '0 16px',
                }}
            >
                {isOpen ? '✕ Đóng' : '📝 Phản hồi'}
            </button>

            {/* Feedback Panel */}
            {isOpen && (
                <div style={{
                    position: 'fixed', bottom: 72, left: 20, zIndex: 9980,
                    width: 320, borderRadius: 16,
                    background: 'var(--bg-card, #1a2332)', border: '1px solid var(--border-subtle, #2a3a4a)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    overflow: 'hidden',
                    animation: 'fadeInUp 300ms ease',
                }}>
                    <div style={{
                        padding: '14px 16px',
                        background: 'linear-gradient(135deg, rgba(244,114,182,0.1), rgba(251,146,60,0.1))',
                        borderBottom: '1px solid var(--border-subtle, #2a3a4a)',
                    }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary, #e8f0f8)' }}>
                            📝 Gửi phản hồi
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #5a8ba8)', marginTop: 2 }}>
                            Giúp chúng tôi cải thiện Smile Home
                        </div>
                    </div>
                    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* Category */}
                        <div style={{ display: 'flex', gap: 6 }}>
                            {[
                                { key: 'bug', label: '🐛 Lỗi', color: '#fb7185' },
                                { key: 'feature', label: '💡 Ý tưởng', color: '#fbbf24' },
                                { key: 'other', label: '💬 Góp ý', color: '#38bdf8' },
                            ].map(c => (
                                <button key={c.key} onClick={() => setCategory(c.key)}
                                    style={{
                                        flex: 1, padding: '6px 8px', borderRadius: 8, border: 'none',
                                        background: category === c.key ? `${c.color}22` : 'transparent',
                                        color: category === c.key ? c.color : 'var(--text-muted, #5a8ba8)',
                                        fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                                        outline: category === c.key ? `1px solid ${c.color}44` : 'none',
                                    }}
                                >{c.label}</button>
                            ))}
                        </div>
                        {/* Message */}
                        <textarea
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                            placeholder="Mô tả vấn đề hoặc ý tưởng..."
                            style={{
                                width: '100%', minHeight: 80, padding: '10px 12px', borderRadius: 8,
                                border: '1px solid var(--border-subtle, #2a3a4a)',
                                background: 'var(--bg-secondary, #0f1923)', color: 'var(--text-primary, #e8f0f8)',
                                fontSize: '0.82rem', resize: 'vertical', outline: 'none',
                                fontFamily: 'inherit',
                            }}
                        />
                        {/* Send */}
                        <button
                            onClick={handleSend}
                            disabled={sent}
                            style={{
                                padding: '10px 16px', borderRadius: 10, border: 'none',
                                background: sent ? 'rgba(52,211,153,0.2)' : 'linear-gradient(135deg, #f472b6, #fb923c)',
                                color: sent ? '#34d399' : '#fff',
                                fontWeight: 700, fontSize: '0.85rem', cursor: sent ? 'default' : 'pointer',
                            }}
                        >
                            {sent ? '✅ Đã gửi! Cảm ơn bạn' : '📤 Gửi phản hồi'}
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
}
