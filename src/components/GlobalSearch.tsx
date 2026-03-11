'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
    id: string;
    name: string;
    type: string;
    url: string;
    phone?: string;
    email?: string;
}

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [chatTarget, setChatTarget] = useState<SearchResult | null>(null);
    const [chatMsg, setChatMsg] = useState('');
    const [chatHistory, setChatHistory] = useState<{ from: string; text: string; time: string }[]>([]);
    const router = useRouter();

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsOpen(prev => !prev);
        }
        if (e.key === 'Escape') {
            if (chatTarget) { setChatTarget(null); }
            else { setIsOpen(false); }
        }
    }, [chatTarget]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        if (!query.trim()) { setResults([]); return; }
        const debounce = setTimeout(async () => {
            const res = await Promise.all([
                fetch(`/api/persons?q=${query}`).then(r => r.ok ? r.json() : []),
                fetch(`/api/rooms?q=${query}`).then(r => r.ok ? r.json() : []),
            ]).catch(() => [[], []]);
            const [persons, rooms] = res;
            const combined: SearchResult[] = [
                ...Array.isArray(persons) ? persons.map((p: any) => ({
                    id: p.id, name: p.name, type: p.role === 'TENANT' ? '🏠 Khách thuê' : p.role === 'OWNER' ? '👑 Chủ nhà' : '👤 Liên hệ',
                    url: `/leads/${p.id}`, phone: p.phone, email: p.email,
                })) : [],
                ...Array.isArray(rooms) ? rooms.map((r: any) => ({
                    id: r.id, name: `Phòng ${r.number}`, type: '🏠 Phòng', url: `/rooms/${r.id}`,
                })) : [],
            ].slice(0, 8);
            setResults(combined);
        }, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    function startChat(person: SearchResult) {
        setChatTarget(person);
        setChatHistory([
            { from: 'system', text: `Bắt đầu cuộc trò chuyện với ${person.name}`, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) },
        ]);
    }

    function sendChat() {
        if (!chatMsg.trim()) return;
        const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        setChatHistory(prev => [...prev, { from: 'me', text: chatMsg, time: now }]);
        const msg = chatMsg;
        setChatMsg('');
        // Simulate reply
        setTimeout(() => {
            setChatHistory(prev => [...prev, {
                from: chatTarget!.name,
                text: msg.includes('phòng') ? 'Dạ, phòng vẫn còn trống ạ. Anh/chị muốn xem phòng khi nào ạ?' :
                    msg.includes('giá') ? 'Giá phòng hiện tại là 4.5 triệu/tháng ạ, bao gồm wifi và dọn vệ sinh.' :
                        msg.includes('hợp đồng') ? 'Hợp đồng của em sẽ hết hạn ngày 15/04. Em có muốn gia hạn không ạ?' :
                            'Dạ em nhận được rồi ạ. Em sẽ phản hồi sớm nhất có thể! 😊',
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            }]);
        }, 800 + Math.random() * 600);
    }

    if (!isOpen) return null;

    return (
        <div className="search-overlay" onClick={() => { setIsOpen(false); setChatTarget(null); }}>
            <div className="search-modal" onClick={e => e.stopPropagation()}
                style={{ width: chatTarget ? 720 : 520, display: 'flex', overflow: 'hidden', maxHeight: '80vh' }}
            >
                {/* Search Panel */}
                <div style={{ flex: chatTarget ? '0 0 320px' : 1, display: 'flex', flexDirection: 'column', borderRight: chatTarget ? '1px solid var(--border-subtle)' : 'none' }}>
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            autoFocus
                            placeholder="Tìm người, phòng... (Ctrl+K)"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            style={{ fontSize: '0.85rem' }}
                        />
                        <span className="search-shortcut">ESC</span>
                    </div>
                    <div className="search-results" style={{ flex: 1, overflowY: 'auto' }}>
                        {results.map(res => (
                            <div key={res.id} className="search-result-item" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div
                                    style={{ flex: 1, cursor: 'pointer' }}
                                    onClick={() => { router.push(res.url); setIsOpen(false); setQuery(''); }}
                                >
                                    <div className="result-name" style={{ fontSize: '0.82rem', fontWeight: 600 }}>{res.name}</div>
                                    <div className="result-type" style={{ fontSize: '0.68rem' }}>
                                        {res.type}
                                        {res.phone && <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>📱 {res.phone}</span>}
                                    </div>
                                </div>
                                {(res.type.includes('Khách') || res.type.includes('Chủ') || res.type.includes('Liên hệ')) && (
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); startChat(res); }}
                                            title="Nhắn tin"
                                            style={{
                                                padding: '4px 10px', borderRadius: 6, border: 'none',
                                                background: 'rgba(56,189,248,0.15)', color: '#38bdf8',
                                                cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600,
                                            }}
                                        >💬</button>
                                        {res.phone && (
                                            <a href={`tel:${res.phone}`} title="Gọi điện"
                                                style={{
                                                    padding: '4px 10px', borderRadius: 6,
                                                    background: 'rgba(52,211,153,0.15)', color: '#34d399',
                                                    fontSize: '0.7rem', fontWeight: 600, textDecoration: 'none',
                                                    display: 'flex', alignItems: 'center',
                                                }}
                                            >📞</a>
                                        )}
                                    </div>
                                )}
                                {!res.type.includes('Khách') && !res.type.includes('Chủ') && !res.type.includes('Liên hệ') && (
                                    <span className="result-arrow" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>→</span>
                                )}
                            </div>
                        ))}
                        {query && results.length === 0 && (
                            <div className="search-empty" style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                Không tìm thấy &quot;{query}&quot;
                            </div>
                        )}
                        {!query && (
                            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.8 }}>
                                Gõ tên người hoặc số phòng để tìm<br />
                                Bấm 💬 để nhắn tin • 📞 để gọi
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Panel */}
                {chatTarget && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        {/* Chat Header */}
                        <div style={{
                            padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #38bdf8, #2dd4bf)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem', fontWeight: 700, color: '#0c1929',
                            }}>{chatTarget.name.charAt(0)}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{chatTarget.name}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{chatTarget.type} • {chatTarget.phone || 'Chưa có SĐT'}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {chatTarget.phone && (
                                    <>
                                        <a href={`tel:${chatTarget.phone}`} style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(52,211,153,0.15)', color: '#34d399', fontSize: '0.7rem', textDecoration: 'none' }}>📞</a>
                                        <a href={`https://zalo.me/${chatTarget.phone}`} target="_blank" style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontSize: '0.7rem', textDecoration: 'none' }}>Zalo</a>
                                    </>
                                )}
                                <button onClick={() => setChatTarget(null)} style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: 'rgba(251,113,133,0.15)', color: '#fb7185', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
                            </div>
                        </div>
                        {/* Chat Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 200 }}>
                            {chatHistory.map((msg, i) => (
                                <div key={i} style={{
                                    alignSelf: msg.from === 'me' ? 'flex-end' : msg.from === 'system' ? 'center' : 'flex-start',
                                    maxWidth: msg.from === 'system' ? '100%' : '80%',
                                }}>
                                    {msg.from === 'system' ? (
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>{msg.text}</div>
                                    ) : (
                                        <div style={{
                                            padding: '8px 12px', borderRadius: 12,
                                            background: msg.from === 'me' ? 'linear-gradient(135deg, #38bdf8, #2dd4bf)' : 'var(--bg-card)',
                                            color: msg.from === 'me' ? '#0c1929' : 'var(--text-primary)',
                                            fontSize: '0.78rem', lineHeight: 1.5,
                                        }}>
                                            {msg.from !== 'me' && <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#38bdf8', marginBottom: 2 }}>{msg.from}</div>}
                                            {msg.text}
                                            <div style={{ fontSize: '0.55rem', marginTop: 4, opacity: 0.6, textAlign: 'right' }}>{msg.time}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {/* Chat Input */}
                        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8 }}>
                            <input
                                value={chatMsg}
                                onChange={(e) => setChatMsg(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') sendChat(); }}
                                placeholder="Nhập tin nhắn..."
                                style={{
                                    flex: 1, padding: '8px 12px', borderRadius: 8,
                                    border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)', fontSize: '0.78rem', outline: 'none',
                                }}
                            />
                            <button onClick={sendChat} style={{
                                padding: '8px 14px', borderRadius: 8, border: 'none',
                                background: 'linear-gradient(135deg, #38bdf8, #2dd4bf)',
                                color: '#0c1929', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                            }}>Gửi</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

