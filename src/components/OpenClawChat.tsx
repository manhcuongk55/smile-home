'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

type AgentRole = 'accountant' | 'manager' | 'legal' | 'general';

const AGENTS: Record<AgentRole, { name: string; icon: string; color: string; greeting: string; quickActions: string[] }> = {
    accountant: {
        name: 'Kế toán AI',
        icon: '🧾',
        color: '#10b981',
        greeting: 'Xin chào! Tôi là trợ lý kế toán AI. Tôi có thể giúp bạn với hóa đơn, báo cáo tài chính, thu chi, và các vấn đề kế toán. Hãy hỏi tôi bất cứ điều gì!',
        quickActions: ['Báo cáo thu chi tháng', 'Hóa đơn quá hạn', 'Xuất bảng kê', 'Tính hoa hồng'],
    },
    manager: {
        name: 'Quản lý AI',
        icon: '📊',
        color: '#3b82f6',
        greeting: 'Xin chào! Tôi là trợ lý quản lý AI. Tôi hỗ trợ giám sát phòng, hợp đồng, bảo trì, và hiệu suất vận hành. Bạn cần hỗ trợ gì?',
        quickActions: ['Phòng trống hôm nay', 'Hợp đồng sắp hết hạn', 'Ticket bảo trì mở', 'Tỷ lệ lấp đầy'],
    },
    legal: {
        name: 'Luật sư AI',
        icon: '⚖️',
        color: '#ef4444',
        greeting: 'Xin chào! Tôi là trợ lý tư vấn pháp lý cho chủ nhà. Tôi có thể hỗ trợ về hợp đồng thuê, quyền & nghĩa vụ, xử lý tranh chấp, thuế BĐS, và Luật Nhà ở 2023. Hãy hỏi tôi!',
        quickActions: ['Mẫu hợp đồng thuê', 'Quyền đuổi khách', 'Cọc & hoàn cọc', 'Thuế cho thuê BĐS'],
    },
    general: {
        name: 'Trợ lý chung',
        icon: '🤖',
        color: '#8b5cf6',
        greeting: 'Xin chào! Tôi là trợ lý AI của Xgate. Bạn có thể hỏi tôi bất cứ điều gì về hệ thống quản lý bất động sản.',
        quickActions: ['Hướng dẫn sử dụng', 'Tìm kiếm thông tin', 'Hỗ trợ kỹ thuật', 'Gợi ý tính năng'],
    },
};

// Simulated AI responses for demo mode (no gateway connection yet)
function getDemoResponse(input: string, role: AgentRole): string {
    const lower = input.toLowerCase();
    if (role === 'accountant') {
        if (lower.includes('thu chi') || lower.includes('báo cáo')) return '📊 **Báo cáo Thu Chi tháng 3/2026:**\n\n• Tổng thu: 45,600,000đ (23 hợp đồng active)\n• Tổng chi: 12,300,000đ (bảo trì + lương + điện nước)\n• Lợi nhuận ròng: 33,300,000đ\n• So với tháng trước: +8.2% 📈\n\n_Dữ liệu demo — kết nối OpenClaw gateway để xem dữ liệu thực._';
        if (lower.includes('hóa đơn') || lower.includes('quá hạn')) return '⚠️ **Hóa đơn quá hạn:**\n\n1. HD-2026-0087 — Nguyễn Văn A — P.301 — 4,500,000đ (quá hạn 5 ngày)\n2. HD-2026-0091 — Trần Thị B — P.205 — 3,200,000đ (quá hạn 2 ngày)\n\nTổng nợ: 7,700,000đ\n\n_Dữ liệu demo — kết nối OpenClaw gateway để xem dữ liệu thực._';
        if (lower.includes('hoa hồng')) return '💸 **Hoa hồng tháng 3/2026:**\n\n• Đội SALE-A1: 2,280,000đ (3 HĐ mới)\n• Đội SALE-B2: 1,520,000đ (2 HĐ mới)\n\n_Dữ liệu demo — kết nối OpenClaw gateway để xem dữ liệu thực._';
    }
    if (role === 'manager') {
        if (lower.includes('phòng trống')) return '🏠 **Phòng trống hôm nay:**\n\n• Building A: 3 phòng (P.102, P.205, P.308)\n• Building B: 1 phòng (P.401)\n• Tỷ lệ lấp đầy: 87.5%\n\n_Dữ liệu demo — kết nối OpenClaw gateway để xem dữ liệu thực._';
        if (lower.includes('hợp đồng') || lower.includes('hết hạn')) return '📄 **HĐ sắp hết hạn (30 ngày tới):**\n\n1. HĐ-045 — Lê Văn C — P.201 — hết hạn 25/03\n2. HĐ-052 — Phạm Thị D — P.305 — hết hạn 01/04\n3. HĐ-058 — Hoàng E — P.102 — hết hạn 10/04\n\n_Dữ liệu demo — kết nối OpenClaw gateway để xem dữ liệu thực._';
        if (lower.includes('bảo trì') || lower.includes('ticket')) return '🔧 **Ticket bảo trì đang mở:**\n\n1. #MT-089 — Hỏng điều hòa P.301 — ưu tiên CAO\n2. #MT-091 — Rò nước P.205 — ưu tiên KHẨN\n3. #MT-093 — Thay bóng đèn P.401 — ưu tiên THẤP\n\n_Dữ liệu demo — kết nối OpenClaw gateway để xem dữ liệu thực._';
    }
    if (role === 'legal') {
        if (lower.includes('hợp đồng') || lower.includes('mẫu')) return '📄 **Hợp đồng thuê nhà — Điều khoản bắt buộc theo Luật Nhà ở 2023:**\n\n1. ✅ Thông tin các bên (CMND/CCCD, địa chỉ)\n2. ✅ Mô tả tài sản thuê (diện tích, địa chỉ, tình trạng)\n3. ✅ Giá thuê & phương thức thanh toán\n4. ✅ Thời hạn thuê\n5. ✅ Quyền và nghĩa vụ các bên\n6. ✅ Điều kiện chấm dứt HĐ\n7. ✅ Tiền đặt cọc & điều kiện hoàn trả\n\n⚠️ HĐ thuê >= 6 tháng phải **công chứng** theo Điều 122 Luật Nhà ở.\n\n_💡 Gợi ý: Dùng mẫu HĐ có sẵn trong hệ thống Xgate._';
        if (lower.includes('đuổi') || lower.includes('chấm dứt') || lower.includes('trục xuất')) return '⚖️ **Quyền chấm dứt HĐ & yêu cầu khách rời đi:**\n\n**Chủ nhà được quyền chấm dứt khi:**\n1. Khách không trả tiền >= 3 tháng liên tiếp\n2. Khách sử dụng nhà sai mục đích\n3. Khách tự ý sửa chữa, cải tạo khi chưa được đồng ý\n4. Khách gây mất trật tự, ảnh hưởng hàng xóm\n\n**Quy trình đúng luật:**\n• Gửi thông báo bằng văn bản trước **30 ngày**\n• Lập biên bản vi phạm (có chứng cứ)\n• Nếu khách không rời → Kiện tại Tòa án\n\n⚠️ **KHÔNG được** tự ý khóa cửa, cắt điện nước, vứt đồ khách!';
        if (lower.includes('cọc') || lower.includes('hoàn')) return '💰 **Quy định về Đặt cọc thuê nhà:**\n\n📌 **Theo Điều 328 Bộ luật Dân sự 2015:**\n• Cọc tối đa = không giới hạn (thường 1-2 tháng tiền thuê)\n• Phải ghi rõ trong HĐ: số tiền, mục đích, điều kiện hoàn trả\n\n**Chủ nhà PHẢI hoàn cọc khi:**\n✅ HĐ hết hạn bình thường\n✅ Khách trả nhà đúng tình trạng ban đầu\n\n**Chủ nhà KHÔNG hoàn cọc khi:**\n❌ Khách tự ý bỏ phòng trước hạn\n❌ Khách gây hư hỏng tài sản (trừ hao mòn tự nhiên)\n\n💡 _Nên chụp ảnh hiện trạng phòng khi giao & nhận lại._';
        if (lower.includes('thuế') || lower.includes('tax')) return '🏛️ **Thuế cho thuê BĐS cho chủ nhà cá nhân:**\n\n📌 **Ngưỡng chịu thuế:** Thu nhập > 100 triệu/năm\n\n| Loại thuế | Thuế suất |\n|---|---|\n| VAT | 5% doanh thu |\n| TNCN | 5% doanh thu |\n| **Tổng** | **10% doanh thu** |\n\n**Ví dụ:** Thuê 8.5 triệu/tháng = 102 triệu/năm\n→ Thuế = 10.2 triệu/năm (~850k/tháng)\n\n📋 **Kê khai:** Quý hoặc theo từng lần phát sinh\n📍 **Nộp tại:** Chi cục thuế quận/huyện nơi có BĐS\n\n⚠️ Nếu không kê khai → phạt 1-3 lần số thuế trốn!';
    }
    return `Cảm ơn bạn! 😊\n\nTôi có thể hỗ trợ bạn:\n\n• 🏠 Hỏi về **phòng trống** → gõ "phòng trống"\n• 📄 Hỏi về **hợp đồng** → gõ "hợp đồng"\n• 🔧 Hỏi về **bảo trì** → gõ "bảo trì"\n• 💰 Hỏi về **thu chi** → gõ "báo cáo"\n• ⚖️ Hỏi **luật cho thuê** → chọn Luật sư AI\n\nHãy thử hỏi tôi một trong các chủ đề trên!`;
}

export default function OpenClawChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeAgent, setActiveAgent] = useState<AgentRole>('general');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    function switchAgent(role: AgentRole) {
        setActiveAgent(role);
        setMessages([{
            id: 'greeting-' + role,
            role: 'assistant',
            content: AGENTS[role].greeting,
            timestamp: new Date(),
        }]);
    }

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            switchAgent(activeAgent);
        }
    }, [isOpen]);

    async function handleSend(text?: string) {
        const msg = text || input.trim();
        if (!msg) return;

        const userMsg: ChatMessage = {
            id: 'u-' + Date.now(),
            role: 'user',
            content: msg,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate typing delay
        await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));

        const response = getDemoResponse(msg, activeAgent);
        const assistantMsg: ChatMessage = {
            id: 'a-' + Date.now(),
            role: 'assistant',
            content: response,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMsg]);
        setIsTyping(false);
    }

    const agent = AGENTS[activeAgent];

    return (
        <>
            {/* Floating Bubble */}
            {!isOpen && (
                <button
                    id="openclaw-bubble"
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
                        width: 60, height: 60, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.5)',
                        transition: 'all 300ms ease',
                        animation: 'pulse-glow 2s infinite',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    title="OpenClaw AI Assistant"
                >
                    🦞
                </button>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
                    width: 400, height: 560, maxHeight: 'calc(100vh - 48px)',
                    background: 'var(--bg-primary, #0f172a)',
                    border: '1px solid var(--border-subtle, #1e293b)',
                    borderRadius: 16, display: 'flex', flexDirection: 'column',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                    overflow: 'hidden',
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        borderBottom: '1px solid var(--border-subtle, #1e293b)',
                        background: 'linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1))',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: '1.3rem' }}>{agent.icon}</span>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary, #fff)' }}>{agent.name}</div>
                                <div style={{ fontSize: '0.65rem', color: agent.color }}>● Demo Mode</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <Link
                                href="/ai-assistant"
                                title="Mở rộng full screen"
                                style={{
                                    width: 30, height: 30, borderRadius: 8, border: 'none',
                                    background: 'rgba(255,255,255,0.06)', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)',
                                    textDecoration: 'none',
                                }}
                            >⛶</Link>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    width: 30, height: 30, borderRadius: 8, border: 'none',
                                    background: 'rgba(255,255,255,0.06)', cursor: 'pointer',
                                    color: 'var(--text-secondary, #94a3b8)', fontSize: '0.9rem',
                                }}
                            >✕</button>
                        </div>
                    </div>

                    {/* Agent Tabs */}
                    <div style={{
                        display: 'flex', gap: 2, padding: '8px 10px',
                        borderBottom: '1px solid var(--border-subtle, #1e293b)',
                    }}>
                        {(Object.entries(AGENTS) as [AgentRole, typeof AGENTS[AgentRole]][]).map(([key, ag]) => (
                            <button
                                key={key}
                                onClick={() => switchAgent(key)}
                                style={{
                                    flex: 1, padding: '6px 4px', borderRadius: 8, border: 'none',
                                    background: activeAgent === key ? `${ag.color}22` : 'transparent',
                                    color: activeAgent === key ? ag.color : 'var(--text-muted, #64748b)',
                                    cursor: 'pointer', fontSize: '0.68rem', fontWeight: 600,
                                    transition: 'all 200ms ease',
                                }}
                            >
                                {ag.icon} {ag.name.split(' ')[0]}
                            </button>
                        ))}
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1, overflowY: 'auto', padding: '12px 14px',
                        display: 'flex', flexDirection: 'column', gap: 10,
                    }}>
                        {messages.map((msg) => (
                            <div key={msg.id} style={{
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            }}>
                                <div style={{
                                    maxWidth: '85%', padding: '10px 14px', borderRadius: 12,
                                    fontSize: '0.82rem', lineHeight: 1.5,
                                    background: msg.role === 'user'
                                        ? 'linear-gradient(135deg, #667eea, #764ba2)'
                                        : 'var(--bg-secondary, #1e293b)',
                                    color: 'var(--text-primary, #fff)',
                                    whiteSpace: 'pre-wrap',
                                }}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div style={{
                                    padding: '10px 14px', borderRadius: 12,
                                    background: 'var(--bg-secondary, #1e293b)',
                                    color: 'var(--text-muted, #64748b)', fontSize: '0.82rem',
                                }}>
                                    <span className="typing-dots">●●●</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    {messages.length <= 1 && (
                        <div style={{
                            padding: '0 14px 8px', display: 'flex', gap: 6, flexWrap: 'wrap',
                        }}>
                            {agent.quickActions.map((action) => (
                                <button
                                    key={action}
                                    onClick={() => handleSend(action)}
                                    style={{
                                        padding: '5px 12px', borderRadius: 99, border: '1px solid var(--border-subtle, #1e293b)',
                                        background: 'transparent', color: agent.color,
                                        fontSize: '0.68rem', cursor: 'pointer', transition: 'all 200ms ease',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = `${agent.color}15`; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div style={{
                        padding: '10px 14px', borderTop: '1px solid var(--border-subtle, #1e293b)',
                        display: 'flex', gap: 8,
                    }}>
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                            placeholder="Hỏi AI trợ lý..."
                            style={{
                                flex: 1, padding: '10px 14px', borderRadius: 10,
                                border: '1px solid var(--border-subtle, #1e293b)',
                                background: 'var(--bg-secondary, #1e293b)',
                                color: 'var(--text-primary, #fff)', fontSize: '0.82rem',
                                outline: 'none',
                            }}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isTyping}
                            style={{
                                width: 40, height: 40, borderRadius: 10, border: 'none',
                                background: input.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'var(--bg-secondary, #1e293b)',
                                color: 'white', cursor: input.trim() ? 'pointer' : 'default',
                                fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 200ms ease',
                            }}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4); }
                    50% { box-shadow: 0 4px 30px rgba(102, 126, 234, 0.7); }
                }
                .typing-dots {
                    animation: typing-blink 1.4s infinite;
                }
                @keyframes typing-blink {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                }
            `}</style>
        </>
    );
}
