'use client';

import { useState } from 'react';

const FEATURES = [
    { icon: '🏠', title: 'Quản Lý Phòng Trọ', desc: 'Theo dõi trạng thái phòng, hợp đồng, khách thuê — tất cả trong 1 dashboard' },
    { icon: '🧾', title: 'Hóa Đơn Tự Động', desc: 'Tạo hóa đơn hàng tháng, tính điện nước, nhắc tiền phòng tự động' },
    { icon: '💸', title: 'Hoa Hồng Sale', desc: 'Quản lý đội sale, tính hoa hồng tự động theo KPI, duyệt chi trả' },
    { icon: '🔔', title: 'Nhắc Tiền Phòng', desc: 'Dashboard theo dõi quá hạn, copy tin nhắn nhắc nhở qua Zalo/SMS' },
    { icon: '📜', title: 'Lịch Sử Hoạt Động', desc: 'Audit log toàn hệ thống — ai làm gì, lúc nào, thay đổi gì' },
    { icon: '🤖', title: 'Bot Đăng Bài', desc: 'Tạo bài đăng tìm khách cho Facebook, Zalo, Messenger — 1 click' },
    { icon: '📊', title: 'Báo Cáo Tài Chính', desc: 'Doanh thu, chi phí, lợi nhuận — tổng hợp theo tháng/quý/năm' },
    { icon: '🌐', title: 'Song Ngữ Anh-Việt', desc: 'Giao diện hỗ trợ chuyển đổi Tiếng Anh ↔ Tiếng Việt' },
];

const PRICING = [
    { name: 'Starter', price: '500K', period: '/tháng', rooms: '≤ 10 phòng', features: ['Quản lý phòng', 'Hóa đơn cơ bản', 'Nhắc tiền phòng', 'Email hỗ trợ'], color: 'var(--accent-blue)', popular: false },
    { name: 'Pro', price: '1.2TR', period: '/tháng', rooms: '≤ 50 phòng', features: ['Tất cả Starter', 'Hoa hồng sale', 'Bot đăng bài', 'Báo cáo tài chính', 'Hỗ trợ ưu tiên'], color: 'var(--accent-emerald)', popular: true },
    { name: 'Enterprise', price: 'Liên hệ', period: '', rooms: 'Không giới hạn', features: ['Tất cả Pro', 'API tích hợp', 'Customize theo yêu cầu', 'Đào tạo nhân viên', 'Hỗ trợ 24/7'], color: 'var(--accent-purple)', popular: false },
];

export default function SellPage() {
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', rooms: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // In a real app, this would send to an API
        setSubmitted(true);
    }

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
                <div style={{ fontSize: '3rem', marginBottom: 8 }}>🏢</div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 16 }}>
                    Xgate — Property Operation System
                </h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 24px', lineHeight: 1.6 }}>
                    Hệ thống quản lý nhà trọ, CCMN, homestay — <strong>tự động hóa hóa đơn, nhắc tiền, tìm khách</strong>. Dành cho chủ 5-500 phòng.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a href="#pricing" style={{ padding: '12px 32px', background: 'var(--accent-blue)', color: 'white', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}>
                        💰 Xem bảng giá
                    </a>
                    <a href="#contact" style={{ padding: '12px 32px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderRadius: 10, fontWeight: 700, textDecoration: 'none', border: '1px solid var(--border-subtle)', fontSize: '0.95rem' }}>
                        📞 Liên hệ ngay
                    </a>
                </div>
            </div>

            {/* Features Grid */}
            <div style={{ marginBottom: 60 }}>
                <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, marginBottom: 32 }}>✨ Tính Năng Nổi Bật</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                    {FEATURES.map((f, i) => (
                        <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 20, transition: 'all 200ms ease' }}>
                            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{f.icon}</div>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Social Proof */}
            <div style={{ textAlign: 'center', marginBottom: 60, padding: '32px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-blue)' }}>500+</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phòng đang quản lý</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>99%</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Uptime</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-purple)' }}>3 phút</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tạo hóa đơn</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-amber)' }}>24/7</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hỗ trợ</div>
                    </div>
                </div>
            </div>

            {/* Pricing */}
            <div id="pricing" style={{ marginBottom: 60 }}>
                <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, marginBottom: 32 }}>💰 Bảng Giá</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                    {PRICING.map((plan, i) => (
                        <div key={i} style={{
                            background: 'var(--bg-card)',
                            border: plan.popular ? `2px solid ${plan.color}` : '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 28,
                            position: 'relative',
                            transform: plan.popular ? 'scale(1.05)' : 'none',
                        }}>
                            {plan.popular && (
                                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: 'white', padding: '4px 16px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700 }}>
                                    🔥 PHỔ BIẾN NHẤT
                                </div>
                            )}
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>{plan.name}</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>{plan.rooms}</p>
                            <div style={{ marginBottom: 20 }}>
                                <span style={{ fontSize: '2rem', fontWeight: 800, color: plan.color }}>{plan.price}</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{plan.period}</span>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', fontSize: '0.8rem' }}>
                                {plan.features.map((f, j) => (
                                    <li key={j} style={{ padding: '6px 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                                        ✅ {f}
                                    </li>
                                ))}
                            </ul>
                            <a href="#contact" style={{
                                display: 'block',
                                textAlign: 'center',
                                padding: '10px 0',
                                background: plan.popular ? plan.color : 'var(--bg-secondary)',
                                color: plan.popular ? 'white' : 'var(--text-primary)',
                                borderRadius: 8,
                                fontWeight: 700,
                                textDecoration: 'none',
                                fontSize: '0.85rem',
                                border: plan.popular ? 'none' : '1px solid var(--border-subtle)',
                            }}>
                                {plan.price === 'Liên hệ' ? '📞 Liên hệ' : '🚀 Đăng ký ngay'}
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Form */}
            <div id="contact" style={{ maxWidth: 600, margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, marginBottom: 32 }}>📞 Liên Hệ Mua Phần Mềm</h2>
                {submitted ? (
                    <div style={{ textAlign: 'center', padding: 40, background: 'var(--bg-card)', border: '1px solid var(--accent-emerald)', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
                        <h3 style={{ color: 'var(--accent-emerald)', marginBottom: 8 }}>Cảm ơn bạn đã quan tâm!</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Chúng tôi sẽ liên hệ lại trong vòng 24h.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 28 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Họ tên *</label>
                                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-primary)', marginTop: 4 }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Số điện thoại *</label>
                                <input required type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-primary)', marginTop: 4 }} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Email</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-primary)', marginTop: 4 }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Số phòng đang quản lý</label>
                                <input type="text" placeholder="VD: 30 phòng" value={formData.rooms} onChange={(e) => setFormData({ ...formData, rooms: e.target.value })} style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-primary)', marginTop: 4 }} />
                            </div>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ghi chú</label>
                            <textarea rows={3} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Bạn cần gì? Có câu hỏi gì không?" style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-primary)', marginTop: 4, resize: 'vertical' }} />
                        </div>
                        <button type="submit" style={{ width: '100%', padding: '12px 0', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
                            🚀 Gửi Yêu Cầu
                        </button>
                    </form>
                )}
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: 60, padding: 24, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <p>© 2026 Xgate — Property Operation System. Made with ❤️</p>
                <p>Liên hệ: contact@xgate.vn | Hotline: 0xxx-xxx-xxx</p>
            </div>
        </div>
    );
}
