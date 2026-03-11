'use client';

export default function GuidePage() {
    return (
        <>
            <div className="page-header">
                <h1>📖 Hướng dẫn sử dụng Smile Home</h1>
                <p>Hướng dẫn từng bước cho chủ nhà và nhân viên vận hành</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800 }}>

                {/* Quick Start */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(56,189,248,0.1), rgba(45,212,191,0.1))', borderBottom: '1px solid var(--border-subtle)' }}>
                        <h2 style={{ fontSize: '1.1rem', margin: 0 }}>🚀 Bắt đầu nhanh (5 phút)</h2>
                    </div>
                    <div style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <StepItem num={1} title="Tạo Bất động sản" path="/properties" icon="🏢"
                                desc="Bấm '➕ Thêm BĐS' → nhập tên & địa chỉ → hệ thống tự tạo tòa nhà mặc định cho bạn."
                            />
                            <StepItem num={2} title="Thêm phòng" path="/rooms" icon="🚪"
                                desc="Bấm '➕ Thêm phòng' → chọn tòa nhà → nhập số phòng, loại, giá thuê, diện tích → bấm 'Tạo phòng'."
                            />
                            <StepItem num={3} title="Thêm khách hàng" path="/leads" icon="👤"
                                desc="Bấm '➕ Khách mới' → nhập tên, SĐT, email → bấm '🏠 Gán phòng' để chọn phòng cho khách."
                            />
                            <StepItem num={4} title="Tạo hợp đồng" path="/contracts" icon="📄"
                                desc="Bấm '➕ Tạo hợp đồng' → chọn phòng & khách → nhập giá, thời hạn → hệ thống tự cập nhật trạng thái phòng."
                            />
                        </div>
                    </div>
                </div>

                {/* Full Flow */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(244,114,182,0.1), rgba(251,146,60,0.1))', borderBottom: '1px solid var(--border-subtle)' }}>
                        <h2 style={{ fontSize: '1.1rem', margin: 0 }}>🔄 Luồng vận hành đầy đủ</h2>
                    </div>
                    <div style={{ padding: '16px 20px' }}>
                        <FlowDiagram />
                    </div>
                </div>

                {/* Module Guide */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))', borderBottom: '1px solid var(--border-subtle)' }}>
                        <h2 style={{ fontSize: '1.1rem', margin: 0 }}>📋 Hướng dẫn từng mục</h2>
                    </div>
                    <div style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <ModuleGuide icon="🏢" title="Bất động sản" path="/properties" items={[
                                'Tạo BĐS mới → tự tạo tòa nhà mặc định',
                                'Bấm ▶ mở danh sách phòng theo tòa',
                                'Bấm ✏️ Sửa để thay đổi tên, số tầng',
                                'Bấm "+ Thêm tòa nhà" nếu BĐS có nhiều tòa',
                            ]} />
                            <ModuleGuide icon="🚪" title="Trạng thái phòng" path="/rooms" items={[
                                'Bấm "➕ Thêm phòng" ở header hoặc mỗi tòa nhà',
                                'Bấm vào phòng → xem chi tiết & đổi trạng thái',
                                'Trạng thái: 🟢 Trống | 🔵 Đã thuê | 🟡 Bảo trì | 🟣 Đã đặt',
                                'Bấm "🛏️ Tìm phòng (SmileBed)" → mở trang tìm phòng cho khách',
                            ]} />
                            <ModuleGuide icon="👤" title="Phễu khách hàng" path="/leads" items={[
                                'Bấm "➕ Khách mới" → nhập thông tin',
                                'Kéo khách qua các giai đoạn: Mới → Đã liên hệ → Xem phòng → Thương lượng → Chốt HĐ',
                                'Bấm "🏠 Gán phòng" trên thẻ khách → chọn phòng trống',
                                'Phòng đã gán sẽ hiện trên thẻ khách (nền xanh)',
                            ]} />
                            <ModuleGuide icon="📄" title="Hợp đồng" path="/contracts" items={[
                                'Tạo hợp đồng → chọn phòng & khách thuê',
                                'Nhập giá thuê, tiền cọc, ngày bắt đầu & kết thúc',
                                'Hợp đồng tự liên kết với phòng & khách',
                                'Xem danh sách hợp đồng sắp hết hạn',
                            ]} />
                            <ModuleGuide icon="💰" title="Hóa đơn & Thu chi" path="/invoices" items={[
                                'Tạo hóa đơn cho khách thuê theo tháng',
                                'Nhập chỉ số điện, nước → hệ thống tự tính',
                                'Xem báo cáo tài chính tổng quan',
                            ]} />
                            <ModuleGuide icon="🔧" title="Bảo trì" path="/maintenance" items={[
                                'Tạo yêu cầu bảo trì khi phòng cần sửa chữa',
                                'Gán thợ → theo dõi tiến độ',
                                'Đổi trạng thái phòng sang 🟡 Bảo trì khi cần',
                            ]} />
                            <ModuleGuide icon="🤖" title="Trợ lý AI (Chat)" items={[
                                'Bấm nút 🦞 chat ở góc phải dưới',
                                'Chọn AI: Kế toán / Quản lý / Luật sư / Chung',
                                'Hỏi: "phòng trống", "hợp đồng hết hạn", "thuế cho thuê"...',
                            ]} />
                            <ModuleGuide icon="📝" title="Gửi phản hồi" items={[
                                'Bấm nút "📝 Phản hồi" ở góc trái dưới',
                                'Chọn loại: 🐛 Lỗi | 💡 Ý tưởng | 💬 Góp ý',
                                'Nhập nội dung → bấm "📤 Gửi phản hồi"',
                            ]} />
                        </div>
                    </div>
                </div>

                {/* FAQ */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(52,211,153,0.1), rgba(56,189,248,0.1))', borderBottom: '1px solid var(--border-subtle)' }}>
                        <h2 style={{ fontSize: '1.1rem', margin: 0 }}>❓ Câu hỏi thường gặp</h2>
                    </div>
                    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <FaqItem q="Tòa nhà tôi vừa tạo không hiện khi thêm phòng?"
                            a="Từ bản cập nhật mới, khi tạo BĐS hệ thống tự tạo tòa nhà. Nếu BĐS cũ chưa có tòa nhà → vào Bất động sản → bấm '+ Thêm tòa nhà'."
                        />
                        <FaqItem q="Làm sao cài Smile Home về máy tính/điện thoại?"
                            a="Mở smile-home.vercel.app → bấm banner '📥 Cài ngay' ở cuối trang. Trên iOS: bấm nút Chia sẻ → 'Thêm vào Màn hình chính'."
                        />
                        <FaqItem q="Làm sao tìm kiếm nhanh?"
                            a="Bấm vào thanh tìm kiếm ở đầu trang HOẶC nhấn Ctrl+K. Tìm theo tên người, số phòng, hợp đồng."
                        />
                        <FaqItem q="Bất động sản và Tòa nhà khác nhau thế nào?"
                            a="Bất động sản = dự án/khu vực (VD: '138 Kim Hoa'). Tòa nhà = tòa bên trong dự án (VD: 'Tòa A'). Với chủ trọ nhỏ chỉ có 1 tòa → hệ thống tự tạo 'Tòa chính' khi tạo BĐS."
                        />
                        <FaqItem q="Gán phòng cho khách ở đâu?"
                            a="Vào Phễu khách hàng → bấm '🏠 Gán phòng' trên thẻ khách → chọn phòng trống."
                        />
                    </div>
                </div>

                {/* Contact */}
                <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Cần hỗ trợ thêm? Liên hệ đội phát triển qua nhóm Zalo hoặc bấm <strong>📝 Phản hồi</strong> góc trái dưới.
                    </div>
                </div>
            </div>
        </>
    );
}

function StepItem({ num, title, path, icon, desc }: { num: number; title: string; path?: string; icon: string; desc: string }) {
    return (
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #38bdf8, #2dd4bf)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#0c1929', fontWeight: 800, fontSize: '0.9rem',
            }}>{num}</div>
            <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>
                    {icon} {title} {path && <a href={path} style={{ color: '#38bdf8', fontSize: '0.72rem', fontWeight: 500 }}>→ Mở</a>}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</div>
            </div>
        </div>
    );
}

function ModuleGuide({ icon, title, path, items }: { icon: string; title: string; path?: string; items: string[] }) {
    return (
        <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 8 }}>
                {icon} {title} {path && <a href={path} style={{ color: '#38bdf8', fontSize: '0.7rem', fontWeight: 500 }}>→ Mở trang</a>}
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {items.map((item, i) => (
                    <li key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

function FaqItem({ q, a }: { q: string; a: string }) {
    return (
        <div>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 4, color: '#38bdf8' }}>❓ {q}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, paddingLeft: 22 }}>→ {a}</div>
        </div>
    );
}

function FlowDiagram() {
    const steps = [
        { icon: '🏢', label: 'Tạo BĐS', sub: '/properties' },
        { icon: '🏗️', label: 'Tòa nhà\n(tự tạo)', sub: 'auto' },
        { icon: '🚪', label: 'Thêm phòng', sub: '/rooms' },
        { icon: '👤', label: 'Thêm khách', sub: '/leads' },
        { icon: '🏠', label: 'Gán phòng', sub: 'trên thẻ khách' },
        { icon: '📄', label: 'Tạo HĐ', sub: '/contracts' },
        { icon: '💰', label: 'Xuất hóa đơn', sub: '/invoices' },
    ];
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
            {steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                        padding: '10px 14px', borderRadius: 10, textAlign: 'center',
                        background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
                        minWidth: 75,
                    }}>
                        <div style={{ fontSize: '1.2rem' }}>{step.icon}</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, marginTop: 4, whiteSpace: 'pre-line' }}>{step.label}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2 }}>{step.sub}</div>
                    </div>
                    {i < steps.length - 1 && <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>→</span>}
                </div>
            ))}
        </div>
    );
}
