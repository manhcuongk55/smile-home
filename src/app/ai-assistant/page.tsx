'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

type AgentRole = 'accountant' | 'manager' | 'legal' | 'general';

const AGENTS: Record<AgentRole, {
    name: string; icon: string; color: string; description: string;
    greeting: string; quickActions: { label: string; query: string }[];
}> = {
    accountant: {
        name: 'Kế toán AI', icon: '🧾', color: '#10b981',
        description: 'Trợ lý hóa đơn, thuế, báo cáo tài chính, thu chi',
        greeting: 'Xin chào! 🧾 Tôi là **Kế toán AI** — trợ lý kế toán thông minh của bạn.\n\nTôi có thể giúp bạn:\n• 📊 Tạo báo cáo thu chi\n• 🧾 Quản lý hóa đơn\n• 💸 Tính hoa hồng sales\n• 📋 Xuất bảng kê thanh toán\n\nHãy chọn một thao tác nhanh bên dưới hoặc hỏi tôi trực tiếp!',
        quickActions: [
            { label: '📊 Báo cáo thu chi tháng', query: 'Tạo báo cáo thu chi tháng này' },
            { label: '⚠️ Hóa đơn quá hạn', query: 'Liệt kê các hóa đơn quá hạn' },
            { label: '📋 Xuất bảng kê', query: 'Xuất bảng kê thanh toán tháng' },
            { label: '💸 Tính hoa hồng', query: 'Tính hoa hồng đội sale tháng này' },
            { label: '💰 Doanh thu theo tòa nhà', query: 'Phân tích doanh thu theo tòa nhà' },
            { label: '📈 So sánh với tháng trước', query: 'So sánh thu chi với tháng trước' },
        ],
    },
    manager: {
        name: 'Quản lý AI', icon: '📊', color: '#3b82f6',
        description: 'Giám sát phòng, hợp đồng, bảo trì, hiệu suất vận hành',
        greeting: 'Xin chào! 📊 Tôi là **Quản lý AI** — trợ lý vận hành bất động sản.\n\nTôi có thể giúp bạn:\n• 🏠 Kiểm tra trạng thái phòng\n• 📄 Theo dõi hợp đồng\n• 🔧 Giám sát bảo trì\n• 📈 Phân tích hiệu suất\n\nBạn cần hỗ trợ gì?',
        quickActions: [
            { label: '🏠 Phòng trống hôm nay', query: 'Kiểm tra phòng trống hôm nay' },
            { label: '📄 HĐ sắp hết hạn', query: 'Liệt kê hợp đồng sắp hết hạn' },
            { label: '🔧 Ticket bảo trì mở', query: 'Liệt kê ticket bảo trì đang mở' },
            { label: '📈 Tỷ lệ lấp đầy', query: 'Phân tích tỷ lệ lấp đầy các tòa nhà' },
            { label: '👥 Khách sắp checkin', query: 'Danh sách khách sắp check-in tuần này' },
            { label: '⚡ Cảnh báo vận hành', query: 'Hiển thị các cảnh báo vận hành' },
        ],
    },
    legal: {
        name: 'Luật sư AI', icon: '⚖️', color: '#ef4444',
        description: 'Tư vấn luật thuê nhà, hợp đồng, tranh chấp, thuế BĐS',
        greeting: 'Xin chào! ⚖️ Tôi là **Luật sư AI** — trợ lý pháp lý cho chủ nhà.\n\nTôi có thể giúp bạn:\n• 📄 Soạn & kiểm tra hợp đồng thuê\n• ⚖️ Xử lý tranh chấp với khách thuê\n• 💰 Quy định đặt cọc & hoàn cọc\n• 🏛️ Thuế cho thuê BĐS\n• 🚨 Quyền chấm dứt HĐ & đuổi khách đúng luật\n\nTôi tham chiếu Luật Nhà ở 2023, Bộ luật Dân sự 2015, và Luật Kinh doanh BĐS.',
        quickActions: [
            { label: '📄 Mẫu hợp đồng chuẩn', query: 'Cho tôi mẫu hợp đồng thuê nhà đúng luật' },
            { label: '⚖️ Quyền đuổi khách', query: 'Khi nào chủ nhà được quyền đuổi khách' },
            { label: '💰 Cọc & hoàn cọc', query: 'Quy định về đặt cọc thuê nhà' },
            { label: '🏛️ Thuế cho thuê BĐS', query: 'Thuế cho thuê bất động sản cá nhân' },
            { label: '🚨 Khách nợ tiền', query: 'Khách nợ tiền 3 tháng chưa trả thì làm sao' },
            { label: '📝 Đăng ký kinh doanh', query: 'Có cần đăng ký kinh doanh khi cho thuê phòng trọ' },
        ],
    },
    general: {
        name: 'Trợ lý chung', icon: '🤖', color: '#8b5cf6',
        description: 'Hỏi đáp tổng quát về hệ thống Xgate',
        greeting: 'Xin chào! 🤖 Tôi là **Trợ lý AI chung** của Xgate Property System.\n\nTôi có thể giúp bạn:\n• 📖 Hướng dẫn sử dụng hệ thống\n• 🔍 Tìm kiếm thông tin nhanh\n• 🛠️ Hỗ trợ kỹ thuật\n• 💡 Gợi ý tính năng mới\n\nBạn muốn tìm hiểu điều gì?',
        quickActions: [
            { label: '📖 Hướng dẫn sử dụng', query: 'Hướng dẫn sử dụng hệ thống Xgate' },
            { label: '🔍 Tìm kiếm thông tin', query: 'Tìm kiếm thông tin trong hệ thống' },
            { label: '🛠️ Hỗ trợ kỹ thuật', query: 'Hỗ trợ kỹ thuật về hệ thống' },
            { label: '💡 Tính năng mới', query: 'Gợi ý tính năng mới cho hệ thống' },
            { label: '🔗 API & Tích hợp', query: 'Hướng dẫn API và tích hợp' },
            { label: '📊 Tổng quan hệ thống', query: 'Tổng quan hệ thống Xgate' },
        ],
    },
};

function getDemoResponse(input: string, role: AgentRole): string {
    const lower = input.toLowerCase();
    if (role === 'accountant') {
        if (lower.includes('thu chi') || lower.includes('báo cáo'))
            return '📊 **Báo cáo Thu Chi tháng 3/2026:**\n\n| Hạng mục | Số tiền |\n|---|---|\n| 💰 Tổng thu | 45,600,000đ |\n| 📄 Số HĐ active | 23 |\n| 💸 Tổng chi | 12,300,000đ |\n| ✅ Lợi nhuận ròng | **33,300,000đ** |\n| 📈 So với tháng trước | **+8.2%** |\n\n**Chi tiết chi phí:**\n• Bảo trì: 4,200,000đ\n• Lương nhân viên: 5,600,000đ\n• Điện nước chung: 2,500,000đ\n\n_🦞 Dữ liệu demo — kết nối OpenClaw gateway để truy vấn dữ liệu thực._';
        if (lower.includes('hóa đơn') || lower.includes('quá hạn'))
            return '⚠️ **Hóa đơn quá hạn — cần theo dõi:**\n\n1. **HD-2026-0087** — Nguyễn Văn A\n   📍 P.301, Building A • 💰 4,500,000đ • ⏰ Quá hạn 5 ngày\n   \n2. **HD-2026-0091** — Trần Thị B\n   📍 P.205, Building B • 💰 3,200,000đ • ⏰ Quá hạn 2 ngày\n\n**Tổng nợ: 7,700,000đ**\n\n💡 _Gợi ý: Gửi nhắc phòng tự động qua Zalo/SMS?_\n\n_🦞 Dữ liệu demo._';
        if (lower.includes('hoa hồng'))
            return '💸 **Bảng tính Hoa Hồng tháng 3/2026:**\n\n| Đội Sale | Mã | HĐ mới | Doanh thu | HH (5%) | Thưởng KPI |\n|---|---|---|---|---|---|\n| Team Alpha | SALE-A1 | 3 | 45,600,000đ | 2,280,000đ | — |\n| Team Beta | SALE-B2 | 2 | 30,400,000đ | 1,520,000đ | — |\n\n**Tổng chi hoa hồng: 3,800,000đ**\n\n_🦞 Dữ liệu demo._';
        if (lower.includes('doanh thu') || lower.includes('tòa nhà'))
            return '🏢 **Phân tích Doanh thu theo Tòa nhà:**\n\n| Tòa nhà | Phòng | Lấp đầy | Doanh thu/tháng |\n|---|---|---|---|\n| Building A | 12 | 91.6% | 18,500,000đ |\n| Building B | 8 | 87.5% | 14,200,000đ |\n| Building C | 10 | 80.0% | 12,900,000đ |\n\n📈 **Tổng: 45,600,000đ/tháng**\n\n_🦞 Dữ liệu demo._';
    }
    if (role === 'manager') {
        if (lower.includes('phòng trống') || lower.includes('phòng'))
            return '🏠 **Phòng trống hôm nay:**\n\n| Tòa nhà | Phòng | Loại | Giá/tháng |\n|---|---|---|---|\n| Building A | P.102 | Studio | ฿8,500 |\n| Building A | P.205 | 1 PN | ฿12,000 |\n| Building A | P.308 | Studio | ฿8,500 |\n| Building B | P.401 | 2 PN | ฿18,000 |\n\n📊 **Tỷ lệ lấp đầy tổng: 87.5%** (28/32 phòng)\n\n💡 _Gợi ý: Đăng bài tìm khách cho P.102, P.308 (cùng loại Studio)?_\n\n_🦞 Dữ liệu demo._';
        if (lower.includes('hợp đồng') || lower.includes('hết hạn'))
            return '📄 **Hợp đồng sắp hết hạn (30 ngày tới):**\n\n1. **HĐ-045** — Lê Văn C\n   📍 P.201, Building A • 📅 Hết hạn: 25/03/2026\n   💰 Giá: ฿8,500/tháng • ⏳ Còn 15 ngày\n\n2. **HĐ-052** — Phạm Thị D\n   📍 P.305, Building B • 📅 Hết hạn: 01/04/2026\n   💰 Giá: ฿12,000/tháng • ⏳ Còn 22 ngày\n\n3. **HĐ-058** — Hoàng E\n   📍 P.102, Building A • 📅 Hết hạn: 10/04/2026\n   💰 Giá: ฿15,000/tháng • ⏳ Còn 31 ngày\n\n💡 _Gợi ý: Liên hệ gia hạn HĐ-045 trước (chỉ còn 15 ngày)?_\n\n_🦞 Dữ liệu demo._';
        if (lower.includes('bảo trì') || lower.includes('ticket'))
            return '🔧 **Ticket bảo trì đang mở:**\n\n| # | Vấn đề | Phòng | Ưu tiên | Ngày tạo |\n|---|---|---|---|---|\n| MT-091 | 🔴 Rò nước | P.205 | KHẨN | 08/03 |\n| MT-089 | 🟡 Hỏng điều hòa | P.301 | CAO | 06/03 |\n| MT-093 | 🟢 Thay bóng đèn | P.401 | THẤP | 09/03 |\n\n⚡ **1 ticket KHẨN cần xử lý ngay!**\n\n_🦞 Dữ liệu demo._';
        if (lower.includes('lấp đầy') || lower.includes('hiệu suất'))
            return '📈 **Phân tích Tỷ lệ Lấp đầy:**\n\n| Tòa nhà | Tổng phòng | Đang thuê | Tỷ lệ | Trend |\n|---|---|---|---|---|\n| Building A | 12 | 11 | 91.6% | 📈 +2.3% |\n| Building B | 8 | 7 | 87.5% | 📉 -1.5% |\n| Building C | 10 | 8 | 80.0% | ➡️ 0% |\n| **Tổng** | **30** | **26** | **86.7%** | |\n\n💡 _Building C có tỷ lệ thấp nhất. Xem xét giảm giá hoặc tăng quảng cáo?_\n\n_🦞 Dữ liệu demo._';
    }
    if (role === 'legal') {
        if (lower.includes('hợp đồng') || lower.includes('mẫu'))
            return '📄 **Hợp đồng thuê nhà — Điều khoản bắt buộc (Luật Nhà ở 2023):**\n\n1. ✅ Thông tin các bên (CMND/CCCD, địa chỉ)\n2. ✅ Mô tả tài sản thuê (diện tích, địa chỉ, tình trạng)\n3. ✅ Giá thuê & phương thức thanh toán\n4. ✅ Thời hạn thuê\n5. ✅ Quyền và nghĩa vụ các bên\n6. ✅ Điều kiện chấm dứt HĐ\n7. ✅ Tiền đặt cọc & điều kiện hoàn trả\n\n⚠️ HĐ thuê >= 6 tháng phải **công chứng** theo Điều 122 Luật Nhà ở.\n📌 Phải khai báo tạm trú cho người thuê trong **24h**.\n\n_💡 Dùng mẫu HĐ chuẩn trong hệ thống Xgate._';
        if (lower.includes('đuổi') || lower.includes('chấm dứt') || lower.includes('trục xuất'))
            return '⚖️ **Quyền chấm dứt HĐ & yêu cầu khách rời đi (Đ.132 Luật Nhà ở):**\n\n**Chủ nhà được quyền chấm dứt khi:**\n1. 🚨 Khách không trả tiền >= **3 tháng** liên tiếp\n2. Sử dụng nhà sai mục đích\n3. Tự ý sửa chữa khi chưa được đồng ý\n4. Cho người khác ở không được phép\n5. Gây mất trật tự\n\n**Quy trình đúng luật:**\n• Gửi thông báo văn bản trước **30 ngày**\n• Lập biên bản vi phạm (có chứng cứ)\n• Hòa giải tại UBND phường\n• Nếu không rời → Kiện tại TAND\n\n⚠️ **KHÔNG được**: khóa cửa, cắt điện nước, vứt đồ → bị xử lý hình sự!';
        if (lower.includes('cọc') || lower.includes('hoàn'))
            return '💰 **Đặt cọc thuê nhà (Đ.328-330 BLDS 2015):**\n\n📌 Thường 1-2 tháng tiền thuê\n\n**PHẢI hoàn cọc khi:** HĐ hết hạn bình thường, khách trả nhà đúng tình trạng\n**KHÔNG hoàn cọc khi:** Khách bỏ trước hạn, gây hư hỏng, vi phạm HĐ\n\n💡 Chụp ảnh + biên bản bàn giao có chữ ký khi giao & nhận phòng';
        if (lower.includes('thuế') || lower.includes('tax'))
            return '🏛️ **Thuế & Phân tích chi phí (150 phòng, DT 650tr/tháng):**\n\n| Hạng mục | Tháng |\n|---|---|\n| 💰 Doanh thu | 650,000,000đ |\n| 🏠 Thuê nhà chủ (70%) | 455,000,000đ |\n| 👥 Nhân sự (~3%) | 15-20,000,000đ |\n| 🔧 Bảo trì + khác | ~25,000,000đ |\n| ✅ **LN trước thuế** | **~150,000,000đ** |\n| 📍 LN/phòng | **~600-800k** |\n\n**Thuế cá nhân:** 10% DT = ~65tr/tháng\n**Thuế TNHH:** 20% LN = ~30tr/tháng\n⚡ **Tiết kiệm ~35tr/tháng nếu lập Cty TNHH!**';
        if (lower.includes('nợ') || lower.includes('không trả'))
            return '🚨 **Xử lý khách NỢ TIỀN — Từng bước:**\n\n**B1 (1-7 ngày):** Nhắc Zalo/SMS, lưu bằng chứng\n**B2 (Sau 1 tháng):** Thông báo văn bản có ký nhận\n**B3 (Sau 2 tháng):** Cảnh báo chấm dứt HĐ\n**B4 (Đủ 3 tháng):** Chấm dứt HĐ theo Đ.132 Luật Nhà ở\n**B5 (Không rời):** Kiện tại TAND quận/huyện\n\n💰 Được khấu trừ nợ từ tiền cọc';
        if (lower.includes('đăng ký') || lower.includes('kinh doanh') || lower.includes('tnhh'))
            return '📝 **So sánh hình thức ĐKKD (150 phòng, ~7.8 tỷ/năm):**\n\n| | Hộ KD | Cty TNHH |\n|---|---|---|\n| Thuế | 1.5-7% DT | 20% LN |\n| Với 650tr DT | ~45tr/th | ~30tr/th |\n| Kế toán | Đơn giản | Phải có |\n| Vay vốn | Khó | Dễ |\n| Mở rộng | Hạn chế | Linh hoạt |\n\n🟢 **Khuyến nghị: Công ty TNHH**\n• Tiết kiệm ~15-35tr thuế/tháng\n• Khấu trừ chi phí thuê nhà, NS, bảo trì\n• Dễ vay ngân hàng mở rộng\n• ĐK tại Sở KH&ĐT, ~3-5 ngày\n\n⚠️ 150 phòng chưa ĐK → phạt 10-20 triệu!';
        if (lower.includes('lợi nhuận') || lower.includes('biên') || lower.includes('chi phí'))
            return '📊 **Phân tích Lợi nhuận — 1 nhà 13 phòng (dài hạn):**\n\n| Hạng mục | % DT | Số tiền |\n|---|---|---|\n| 💰 DT | 100% | ~56,000,000đ |\n| 🏠 Thuê nhà | 70% | ~39,200,000đ |\n| 👥 Nhân sự | ~3% | ~1,700,000đ |\n| 🔧 Bảo trì | ~5% | ~2,800,000đ |\n| ✅ **LN ròng** | **~20%** | **~11,200,000đ** |\n| 📍 **LN/phòng** | | **~860k** |\n\n**Tổng DN (150 phòng):**\n• DT: 650tr/tháng (~7.8 tỷ/năm)\n• LN trước thuế: ~150tr/tháng (~1.8 tỷ/năm)\n• Chi phí NS/DT: ~3% (15-20tr/tháng)\n• Biên LN: ~20% (trung bình ngành dài hạn)';
    }
    if (role === 'general') {
        if (lower.includes('hướng dẫn') || lower.includes('sử dụng'))
            return '📖 **Hướng dẫn sử dụng Xgate Property System:**\n\n1. **Dashboard** — Tổng quan hoạt động\n2. **Phòng Trọ** — Quản lý trạng thái phòng (Trống/Đã thuê/Bảo trì)\n3. **Hợp đồng** — Tạo và quản lý hợp đồng thuê\n4. **Hóa đơn** — Phát hành và theo dõi thanh toán\n5. **Bảo trì** — Ghi nhận và theo dõi yêu cầu sửa chữa\n6. **Báo cáo** — Phân tích tài chính và vận hành\n7. **🦞 AI Assistant** — Hỏi đáp thông minh (bạn đang ở đây!)\n\n_Bạn muốn tìm hiểu chi tiết mục nào?_';
        if (lower.includes('tổng quan') || lower.includes('hệ thống'))
            return '🏢 **Tổng quan Xgate Property System:**\n\n• 🏠 **30 phòng** trên 3 tòa nhà\n• 📄 **23 hợp đồng** đang active\n• 💰 **45.6 triệu** doanh thu/tháng\n• 📈 **86.7%** tỷ lệ lấp đầy\n• 🔧 **3 ticket** bảo trì đang mở\n• 👥 **2 đội sale** đang hoạt động\n\n_🦞 Dữ liệu demo._';
    }
    return `Cảm ơn bạn đã hỏi! 🦞\n\nĐây là chế độ **Demo**. Khi kết nối với OpenClaw Gateway, tôi sẽ có thể:\n\n• ✅ Truy vấn dữ liệu thực từ Xgate\n• 📊 Tạo báo cáo real-time\n• 🔄 Tự động hóa tác vụ lặp lại\n• 📱 Tích hợp Zalo, WhatsApp, Telegram\n• 🔔 Cảnh báo thông minh\n\n_Cấu hình gateway: \`NEXT_PUBLIC_OPENCLAW_URL=ws://your-gateway:18789\`_`;
}

export default function AIAssistantPage() {
    const [activeAgent, setActiveAgent] = useState<AgentRole>('general');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
        switchAgent('general');
    }, []);

    async function handleSend(text?: string) {
        const msg = text || input.trim();
        if (!msg || isTyping) return;

        const userMsg: ChatMessage = { id: 'u-' + Date.now(), role: 'user', content: msg, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        await new Promise(r => setTimeout(r, 600 + Math.random() * 1000));

        const response = getDemoResponse(msg, activeAgent);
        const assistantMsg: ChatMessage = { id: 'a-' + Date.now(), role: 'assistant', content: response, timestamp: new Date() };
        setMessages(prev => [...prev, assistantMsg]);
        setIsTyping(false);
    }

    const agent = AGENTS[activeAgent];

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 80px)', gap: 0 }}>
            {/* Agent Sidebar */}
            <div style={{
                width: 280, borderRight: '1px solid var(--border-subtle)',
                background: 'var(--bg-card)', display: 'flex', flexDirection: 'column',
            }}>
                <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        🦞 OpenClaw AI
                    </h2>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                        Trợ lý AI cho Xgate Property
                    </p>
                    <div style={{
                        marginTop: 8, padding: '4px 10px', borderRadius: 6, fontSize: '0.65rem',
                        background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: 600,
                    }}>
                        ⚡ Demo Mode — Gateway chưa kết nối
                    </div>
                </div>

                <div style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 6px', marginBottom: 4 }}>
                        Chọn Agent
                    </div>
                    {(Object.entries(AGENTS) as [AgentRole, typeof AGENTS[AgentRole]][]).map(([key, ag]) => (
                        <button
                            key={key}
                            onClick={() => switchAgent(key)}
                            style={{
                                display: 'flex', alignItems: 'flex-start', gap: 10,
                                padding: '12px', borderRadius: 10, border: 'none',
                                background: activeAgent === key ? `${ag.color}15` : 'transparent',
                                cursor: 'pointer', textAlign: 'left',
                                transition: 'all 200ms ease',
                                borderLeft: activeAgent === key ? `3px solid ${ag.color}` : '3px solid transparent',
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>{ag.icon}</span>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: activeAgent === key ? ag.color : 'var(--text-primary)' }}>
                                    {ag.name}
                                </div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                    {ag.description}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                    Powered by <strong>OpenClaw</strong> 🦞
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Chat Header */}
                <div style={{
                    padding: '14px 24px', borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.5rem' }}>{agent.icon}</span>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{agent.name}</div>
                            <div style={{ fontSize: '0.7rem', color: agent.color }}>● Online — Demo Mode</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={() => switchAgent(activeAgent)}
                            style={{
                                padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)',
                                background: 'transparent', color: 'var(--text-secondary)',
                                cursor: 'pointer', fontSize: '0.75rem',
                            }}
                        >🗑️ Xóa chat</button>
                    </div>
                </div>

                {/* Messages Area */}
                <div style={{
                    flex: 1, overflowY: 'auto', padding: '20px 24px',
                    display: 'flex', flexDirection: 'column', gap: 16,
                }}>
                    {messages.map((msg) => (
                        <div key={msg.id} style={{
                            display: 'flex',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            gap: 10,
                        }}>
                            {msg.role === 'assistant' && (
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10, display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                                    background: `${agent.color}20`, flexShrink: 0,
                                }}>{agent.icon}</div>
                            )}
                            <div style={{
                                maxWidth: '70%', padding: '14px 18px', borderRadius: 14,
                                fontSize: '0.88rem', lineHeight: 1.7,
                                background: msg.role === 'user'
                                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                                    : 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                border: msg.role === 'assistant' ? '1px solid var(--border-subtle)' : 'none',
                                whiteSpace: 'pre-wrap',
                            }}>
                                {msg.content}
                            </div>
                            {msg.role === 'user' && (
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10, display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                                    background: 'rgba(102, 126, 234, 0.2)', flexShrink: 0,
                                }}>👤</div>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div style={{ display: 'flex', gap: 10 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 10, display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                                background: `${agent.color}20`, flexShrink: 0,
                            }}>{agent.icon}</div>
                            <div style={{
                                padding: '14px 18px', borderRadius: 14, background: 'var(--bg-card)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-muted)', fontSize: '0.88rem',
                            }}>
                                Đang suy nghĩ...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length <= 1 && (
                    <div style={{
                        padding: '0 24px 12px', display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8,
                    }}>
                        {agent.quickActions.map((action) => (
                            <button
                                key={action.label}
                                onClick={() => handleSend(action.query)}
                                style={{
                                    padding: '10px 14px', borderRadius: 10,
                                    border: '1px solid var(--border-subtle)',
                                    background: 'var(--bg-card)', color: 'var(--text-secondary)',
                                    cursor: 'pointer', fontSize: '0.78rem', textAlign: 'left',
                                    transition: 'all 200ms ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = agent.color;
                                    e.currentTarget.style.color = agent.color;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input Area */}
                <div style={{
                    padding: '14px 24px', borderTop: '1px solid var(--border-subtle)',
                    display: 'flex', gap: 10, alignItems: 'flex-end',
                }}>
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                        }}
                        placeholder={`Hỏi ${agent.name}...`}
                        rows={1}
                        style={{
                            flex: 1, padding: '12px 16px', borderRadius: 12,
                            border: '1px solid var(--border-subtle)',
                            background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                            fontSize: '0.88rem', outline: 'none', resize: 'none',
                            minHeight: 44, maxHeight: 120, fontFamily: 'inherit',
                        }}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isTyping}
                        style={{
                            width: 44, height: 44, borderRadius: 12, border: 'none',
                            background: input.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'var(--bg-secondary)',
                            color: 'white', cursor: input.trim() ? 'pointer' : 'default',
                            fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 200ms ease', flexShrink: 0,
                        }}
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
}
