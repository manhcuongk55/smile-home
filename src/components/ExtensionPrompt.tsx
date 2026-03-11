'use client';

import { useState, useEffect } from 'react';

export default function ExtensionPrompt() {
    const [show, setShow] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
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
    }

    if (!show) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 300ms ease', padding: 20,
        }}>
            <div style={{
                background: 'var(--bg-card, #1a2332)',
                border: '1px solid var(--border-subtle, #2a3a4a)',
                borderRadius: 20, maxWidth: 480, width: '100%',
                boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto',
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
                        Cài Smile AI Extension
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #8ab4cc)', marginTop: 6, lineHeight: 1.5 }}>
                        AI trợ lý tích hợp ngay trong trình duyệt của bạn
                    </p>
                </div>

                {!showGuide ? (
                    <>
                        {/* Features */}
                        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                { icon: '🤖', title: 'AI trợ lý mọi nơi', desc: 'Chat AI ngay trên mọi trang web, không cần mở tab mới' },
                                { icon: '🏠', title: 'Kết nối Smile Home', desc: 'Tra cứu phòng, hợp đồng, khách hàng từ browser' },
                                { icon: '⚡', title: 'Tự động hóa', desc: 'Gợi ý thông minh, tóm tắt nội dung, đa ngôn ngữ' },
                            ].map((f, i) => (
                                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: 'var(--bg-secondary, #0f1923)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{f.icon}</div>
                                    <div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{f.title}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #5a8ba8)' }}>{f.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div style={{ padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <button onClick={() => setShowGuide(true)} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                padding: '12px 20px', borderRadius: 12, border: 'none', width: '100%',
                                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                                color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                            }}>
                                🧩 Cài vào trình duyệt ngay
                            </button>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={handleRemindLater} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--border-subtle, #2a3a4a)', background: 'transparent', color: 'var(--text-secondary, #8ab4cc)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>⏰ Nhắc sau</button>
                                <button onClick={handleDismiss} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--border-subtle, #2a3a4a)', background: 'transparent', color: 'var(--text-muted, #5a8ba8)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>✕ Không, cảm ơn</button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Installation Guide */
                    <div style={{ padding: '16px 24px 20px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 14, color: 'var(--text-primary, #e8f0f8)' }}>
                            📋 Hướng dẫn cài đặt (3 bước, 1 phút):
                        </div>

                        {/* Step 1 */}
                        <StepBox num={1} title="Tải extension về máy" color="#8b5cf6">
                            <p>Bấm nút bên dưới để mở GitHub → bấm <strong style={{ color: '#34d399' }}>Code</strong> → <strong style={{ color: '#34d399' }}>Download ZIP</strong></p>
                            <a href="https://github.com/manhcuongk55/smile-ai-extension/archive/refs/heads/main.zip"
                                target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 8, background: '#8b5cf620', color: '#8b5cf6', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', border: '1px solid #8b5cf630', marginTop: 6 }}>
                                📥 Tải ZIP ngay
                            </a>
                        </StepBox>

                        {/* Step 2 */}
                        <StepBox num={2} title="Giải nén file ZIP" color="#3b82f6">
                            <p>Click phải file vừa tải → <strong>Giải nén / Extract All</strong></p>
                            <p>Nhớ vị trí thư mục đã giải nén (VD: Desktop)</p>
                        </StepBox>

                        {/* Step 3 */}
                        <StepBox num={3} title="Cài vào Chrome / Edge" color="#22c55e">
                            <p><strong>Chrome:</strong> Mở trình duyệt → gõ vào thanh địa chỉ:</p>
                            <div style={{ padding: '6px 12px', borderRadius: 6, background: 'var(--bg-primary, #0c1929)', fontFamily: 'monospace', fontSize: '0.78rem', color: '#38bdf8', marginBottom: 8, userSelect: 'all', cursor: 'text' }}>
                                chrome://extensions
                            </div>
                            <p>Hoặc <strong>Edge:</strong></p>
                            <div style={{ padding: '6px 12px', borderRadius: 6, background: 'var(--bg-primary, #0c1929)', fontFamily: 'monospace', fontSize: '0.78rem', color: '#38bdf8', marginBottom: 8, userSelect: 'all', cursor: 'text' }}>
                                edge://extensions
                            </div>
                            <p>→ Bật <strong style={{ color: '#fbbf24' }}>Developer mode</strong> (góc phải trên)</p>
                            <p>→ Bấm <strong style={{ color: '#34d399' }}>Load unpacked</strong></p>
                            <p>→ Chọn thư mục vừa giải nén → <strong>OK</strong></p>
                        </StepBox>

                        {/* Done */}
                        <div style={{ padding: 14, borderRadius: 12, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', textAlign: 'center', marginTop: 12 }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🎉</div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399' }}>Xong! Extension Smile AI đã có trên trình duyệt</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Biểu tượng 🧩 sẽ xuất hiện góc phải thanh toolbar</div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                            <button onClick={() => setShowGuide(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>← Quay lại</button>
                            <button onClick={handleDismiss} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>✅ Đã cài xong</button>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

function StepBox({ num, title, color, children }: { num: number; title: string; color: string; children: React.ReactNode }) {
    return (
        <div style={{ padding: 12, borderRadius: 10, background: `${color}06`, border: `1px solid ${color}15`, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: `${color}20`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>{num}</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color }}>{title}</div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #8ab4cc)', lineHeight: 1.6, paddingLeft: 34 }}>
                {children}
            </div>
        </div>
    );
}
