'use client';

import { useState, useEffect, useRef } from 'react';

export default function InstallPrompt() {
    const [canInstall, setCanInstall] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [showBanner, setShowBanner] = useState(true);
    const deferredPrompt = useRef<any>(null);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            deferredPrompt.current = e;
            setCanInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // iOS detection
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) setCanInstall(true);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    async function handleInstall() {
        if (deferredPrompt.current) {
            deferredPrompt.current.prompt();
            const result = await deferredPrompt.current.userChoice;
            if (result.outcome === 'accepted') {
                setIsInstalled(true);
                setCanInstall(false);
            }
            deferredPrompt.current = null;
        }
    }

    if (isInstalled || !showBanner) return null;

    return (
        <div style={{
            position: 'fixed', bottom: 60, left: '50%', transform: 'translateX(-50%)',
            zIndex: 9990, display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 20px', borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(19,42,62,0.95), rgba(12,25,41,0.98))',
            border: '1px solid rgba(56,189,248,0.2)',
            backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,20,40,0.5)',
            animation: 'slideUpBanner 500ms cubic-bezier(0.16,1,0.3,1)',
        }}>
            <span style={{ fontSize: '1.5rem' }}>🏠</span>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e8f0f8' }}>
                    Cài Smile Home về máy
                </div>
                <div style={{ fontSize: '0.68rem', color: '#5a8ba8', marginTop: 2 }}>
                    Dùng như app — không cần App Store
                </div>
            </div>
            {canInstall && deferredPrompt.current ? (
                <button
                    onClick={handleInstall}
                    style={{
                        padding: '8px 18px', borderRadius: 10, border: 'none',
                        background: 'linear-gradient(135deg, #38bdf8, #2dd4bf)',
                        color: '#0c1929', fontWeight: 700, fontSize: '0.78rem',
                        cursor: 'pointer', whiteSpace: 'nowrap',
                        transition: 'all 200ms ease',
                    }}
                >
                    📥 Cài ngay
                </button>
            ) : (
                <div style={{ fontSize: '0.7rem', color: '#8fb8d4', maxWidth: 140, lineHeight: 1.4 }}>
                    {/iPad|iPhone|iPod/.test(typeof navigator !== 'undefined' ? navigator.userAgent : '')
                        ? '↑ Bấm Chia sẻ → "Thêm vào Màn hình chính"'
                        : '⋮ Menu → "Cài đặt ứng dụng"'}
                </div>
            )}
            <button
                onClick={() => setShowBanner(false)}
                style={{
                    width: 24, height: 24, borderRadius: '50%', border: 'none',
                    background: 'rgba(56,189,248,0.1)', color: '#5a8ba8',
                    cursor: 'pointer', fontSize: '0.7rem', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                }}
            >✕</button>

            <style jsx>{`
                @keyframes slideUpBanner {
                    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>
        </div>
    );
}
