'use client';

import { useState, useEffect } from 'react';

interface Feedback {
    id: string;
    subject: string;
    content: string;
    notes?: string;
    createdAt: string;
}

export default function FeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => { fetchFeedbacks(); }, []);

    async function fetchFeedbacks() {
        try {
            const res = await fetch('/api/interactions');
            const data = await res.json();
            const items = Array.isArray(data) ? data : [];
            // Filter only feedback items (subject starts with [Phản hồi])
            setFeedbacks(items.filter((i: Feedback) => i.subject?.includes('Phản hồi')));
        } catch { /* ignore */ }
    }

    const filtered = filter === 'all' ? feedbacks :
        filter === 'bug' ? feedbacks.filter(f => f.subject?.includes('Lỗi')) :
            filter === 'feature' ? feedbacks.filter(f => f.subject?.includes('Ý tưởng')) :
                feedbacks.filter(f => f.subject?.includes('Góp ý'));

    const getCategoryInfo = (subject: string) => {
        if (subject?.includes('Lỗi')) return { label: '🐛 Lỗi', color: '#fb7185', bg: 'rgba(251,113,133,0.1)' };
        if (subject?.includes('Ý tưởng')) return { label: '💡 Ý tưởng', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' };
        return { label: '💬 Góp ý', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' };
    };

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>📬 Hộp phản hồi</h1>
                    <p>Phản hồi từ người dùng — {feedbacks.length} phản hồi</p>
                </div>
                <button className="btn btn-secondary" onClick={fetchFeedbacks}>🔄 Làm mới</button>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[
                    { key: 'all', label: `📬 Tất cả (${feedbacks.length})` },
                    { key: 'bug', label: `🐛 Lỗi (${feedbacks.filter(f => f.subject?.includes('Lỗi')).length})` },
                    { key: 'feature', label: `💡 Ý tưởng (${feedbacks.filter(f => f.subject?.includes('Ý tưởng')).length})` },
                    { key: 'other', label: `💬 Góp ý (${feedbacks.filter(f => f.subject?.includes('Góp ý')).length})` },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setFilter(tab.key)}
                        style={{
                            padding: '8px 16px', borderRadius: 8, border: 'none',
                            background: filter === tab.key ? 'rgba(56,189,248,0.15)' : 'var(--bg-secondary)',
                            color: filter === tab.key ? '#38bdf8' : 'var(--text-secondary)',
                            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                        }}
                    >{tab.label}</button>
                ))}
            </div>

            {/* Feedback List */}
            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📬</div>
                    <h3>Chưa có phản hồi</h3>
                    <p>Khi người dùng bấm nút "📝 Phản hồi" ở góc trái dưới, nội dung sẽ hiện ở đây.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(fb => {
                        const cat = getCategoryInfo(fb.subject);
                        return (
                            <div key={fb.id} className="card" style={{ padding: '14px 18px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{
                                        padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600,
                                        background: cat.bg, color: cat.color,
                                    }}>{cat.label}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        {new Date(fb.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                    {fb.content || fb.notes}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
