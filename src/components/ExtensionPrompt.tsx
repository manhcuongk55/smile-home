'use client';

import { useState, useEffect } from 'react';

export default function ExtensionPrompt() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Show after 3 seconds, only if not dismissed before
        const dismissed = localStorage.getItem('smilehome_ext_dismissed');
        if (!dismissed) {
            const timer = setTimeout(() => setShow(true), 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    function handleDismiss() {
        setShow(false);
        localStorage.setItem('smilehome_ext_dismissed', Date.now().toString());
    }

    function handleRemindLater() {
        setShow(false);
        // Will show again next session
    }

    if (!show) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 300ms ease',
            padding: 20,
        }}>
            <div style={{
                background: 'var(--bg-card, #1a2332)',
                border: '1px solid var(--border-subtle, #2a3a4a)',
                borderRadius: 20, maxWidth: 440, width: '100%',
                boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                overflow: 'hidden',
                animation: 'slideUp 400ms ease',
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px 24px 16px',
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(56,189,248,0.08))',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🧩</div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary, #e8f0f8)' }}>
                        Trải nghiệm tốt hơn với Smile AI
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #8ab4cc)', marginTop: 6, lineHeight: 1.5 }}>
                        Cài extension Chrome để tích hợp AI vào mọi trang web bạn dùng
                    </p>
                </div>

                {/* Features */}
                <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                        { icon: '🤖', title: 'AI trợ lý mọi nơi', desc: 'Chat AI ngay trên mọi trang web, không cần mở tab mới' },
                        { icon: '🏠', title: 'Kết nối Smile Home', desc: 'Tra cứu phòng, hợp đồng, khách hàng ngay từ browser' },
                        { icon: '⚡', title: 'Tự động hóa', desc: 'Gợi ý thông minh, tóm tắt nội dung, dịch đa ngôn ngữ' },
                    ].map((f, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                background: 'var(--bg-secondary, #0f1923)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.2rem',
                            }}>{f.icon}</div>
                            <div>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{f.title}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #5a8ba8)' }}>{f.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div style={{ padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <a
                        href="https://github.com/manhcuongk55/smile-ai-extension"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleDismiss}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            padding: '12px 20px', borderRadius: 12, border: 'none',
                            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                            color: '#fff', fontWeight: 700, fontSize: '0.88rem',
                            textDecoration: 'none', cursor: 'pointer',
                        }}
                    >
                        🧩 Cài Smile AI Extension
                    </a>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={handleRemindLater} style={{
                            flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--border-subtle, #2a3a4a)',
                            background: 'transparent', color: 'var(--text-secondary, #8ab4cc)',
                            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                        }}>
                            ⏰ Nhắc sau
                        </button>
                        <button onClick={handleDismiss} style={{
                            flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--border-subtle, #2a3a4a)',
                            background: 'transparent', color: 'var(--text-muted, #5a8ba8)',
                            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                        }}>
                            ✕ Không, cảm ơn
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
