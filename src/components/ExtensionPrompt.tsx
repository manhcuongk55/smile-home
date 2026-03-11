'use client';

import { useState, useEffect } from 'react';

export default function ExtensionPrompt() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem('smilehome_ext_dismissed');
        if (!dismissed) {
            const timer = setTimeout(() => setShow(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    function handleDismiss() {
        setShow(false);
        localStorage.setItem('smilehome_ext_dismissed', Date.now().toString());
    }

    if (!show) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9990,
            background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
            padding: '8px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 12, flexWrap: 'wrap',
            animation: 'slideDown 400ms ease',
            boxShadow: '0 2px 12px rgba(139,92,246,0.3)',
        }}>
            <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>
                🧩 Cài Smile AI Extension — AI trợ lý ngay trong trình duyệt
            </span>
            <a
                href="https://github.com/manhcuongk55/smile-ai-extension/archive/refs/heads/main.zip"
                onClick={handleDismiss}
                style={{
                    padding: '5px 14px', borderRadius: 8, border: '2px solid #fff',
                    background: 'rgba(255,255,255,0.15)', color: '#fff',
                    fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                }}
            >
                📥 Tải & Cài ngay
            </a>
            <button onClick={handleDismiss} style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
                fontSize: '1rem', cursor: 'pointer', padding: '0 4px',
            }}>✕</button>

            <style jsx>{`
                @keyframes slideDown {
                    from { transform: translateY(-100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
