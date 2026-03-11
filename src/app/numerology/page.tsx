'use client';

import { useState } from 'react';
import { WESTERN_ZODIAC, CHI_ZODIAC, getWesternZodiac } from './zodiac-data';
import { IKIGAI_QUESTIONS, IKIGAI_TYPES, calculateIkigai, IkigaiResult } from './ikigai-data';
import { ELEMENTS, getElementFromYear, getElementRelation } from './elements-data';

/* ═══════════════ NUMEROLOGY DATA (kept inline for self-containment) ═══════════════ */
interface NumInfo {
    title: string; emoji: string; color: string;
    personality: string[]; strengths: string[]; weaknesses: string[];
    roomDetail: { type: string; why: string; direction: string; avoid: string };
    floorDetail: { best: string; why: string };
    fengshui: { element: string; colors: string[]; material: string };
    compatibility: { best: number[]; ok: number[]; avoid: number[] };
    career: string[]; relationship: string; luckyDay: string; warning: string;
}

const DATA: Record<number, NumInfo> = {
    1: { title: 'Người tiên phong', emoji: '🔥', color: '#ef4444', personality: ['Lãnh đạo bẩm sinh, luôn muốn đi đầu', 'Độc lập cao, không thích ràng buộc', 'Tư duy sáng tạo, dám nghĩ dám làm', 'Cố chấp, khó chấp nhận ý kiến trái chiều'], strengths: ['Quyết đoán, hành động nhanh', 'Tự tin trong mọi tình huống', 'Khởi nghiệp và dẫn dắt xuất sắc'], weaknesses: ['Dễ kiêu ngạo', 'Khó làm việc nhóm', 'Thiếu kiên nhẫn'], roomDetail: { type: 'Studio riêng biệt hoặc căn góc', why: 'Cần không gian 100% riêng tư, layout mở thoáng', direction: 'Đông hoặc Đông Nam', avoid: 'Phòng giữa dãy, không cửa sổ' }, floorDetail: { best: 'Tầng cao nhất / thượng', why: 'Cần vị trí "trên đỉnh", tầm nhìn rộng' }, fengshui: { element: 'Hỏa 🔥', colors: ['Đỏ', 'Cam', 'Vàng gold'], material: 'Gỗ sáng, kim loại mạ vàng' }, compatibility: { best: [3, 5, 9], ok: [2, 6], avoid: [4, 8] }, career: ['CEO', 'Kiến trúc sư', 'Đạo diễn', 'Nhà đầu tư BĐS'], relationship: 'Cần đối tác tôn trọng sự độc lập', luckyDay: 'CN, T3', warning: 'Chọn phòng cho bạn cảm giác "lãnh thổ của mình"' },
    2: { title: 'Người hòa hợp', emoji: '🌙', color: '#f97316', personality: ['Nhạy cảm, thấu hiểu cảm xúc', 'Tìm kiếm sự hài hòa', 'Lắng nghe tuyệt vời', 'Phụ thuộc cảm xúc người khác'], strengths: ['Hợp tác tốt nhất', 'Trực giác mạnh', 'Kiên nhẫn'], weaknesses: ['Khó quyết định', 'Dễ bị tổn thương', 'Hy sinh bản thân'], roomDetail: { type: 'Căn hộ đôi / 2 không gian', why: 'Cần cảm giác chia sẻ, 2 không gian cân bằng', direction: 'Bắc hoặc Tây Bắc', avoid: 'Phòng sát đường lớn' }, floorDetail: { best: 'Tầng 2, 4 hoặc giữa', why: 'Vị trí giữa = an toàn nhất' }, fengshui: { element: 'Thủy 💧', colors: ['Xanh dương nhạt', 'Trắng', 'Bạc'], material: 'Gương, kính' }, compatibility: { best: [4, 6, 8], ok: [1, 9], avoid: [5, 7] }, career: ['Tư vấn viên', 'Nhà trung gian BĐS'], relationship: 'Cần người ổn định, đáng tin cậy', luckyDay: 'T2, T6', warning: 'Hãy hỏi "MÌNH có bình yên ở đây không?"' },
    3: { title: 'Người biểu đạt', emoji: '🎨', color: '#eab308', personality: ['Sáng tạo, lạc quan', 'Giao tiếp giỏi', 'Mơ mộng, trí tưởng tượng phong phú', 'Dễ chán, hay thay đổi'], strengths: ['Truyền cảm hứng', 'Nghệ thuật', 'Biến khó khăn thành vui'], weaknesses: ['Khó tập trung lâu', 'Tiêu tiền bừa', 'Hay hứa suông'], roomDetail: { type: 'Phòng rộng, trần cao, ban công', why: 'Sáng tạo khi không gian mở, nhiều ánh sáng', direction: 'Nam hoặc Đông Nam', avoid: 'Tầng hầm, phòng tối' }, floorDetail: { best: 'Tầng 3, 6 hoặc có view', why: 'View đẹp = cảm hứng' }, fengshui: { element: 'Mộc 🌳', colors: ['Vàng', 'Cam', 'Xanh lá nhạt'], material: 'Gỗ tự nhiên, cây xanh' }, compatibility: { best: [1, 5, 9], ok: [3, 6], avoid: [4, 7] }, career: ['Designer', 'Content Creator', 'MC'], relationship: 'Cần người hiểu sự sáng tạo', luckyDay: 'T4, T7', warning: 'Không gian xấu giết chết sáng tạo' },
    4: { title: 'Người xây dựng', emoji: '🏗️', color: '#22c55e', personality: ['Thực tế, có tổ chức', 'Đáng tin cậy', 'Tiết kiệm, quản lý tài chính tốt', 'Cứng nhắc'], strengths: ['Kỷ luật bậc nhất', 'Nền tảng vững', 'Quản lý tài chính xuất sắc'], weaknesses: ['Quá cầu toàn', 'Khó chấp nhận thay đổi', 'Thiếu linh hoạt'], roomDetail: { type: 'Phòng vuông, bố cục rõ, bếp riêng', why: 'Ghét lộn xộn. Phòng vuông = ổn định', direction: 'Tây hoặc Tây Nam', avoid: 'Phòng hình bất thường, loft mở' }, floorDetail: { best: 'Tầng 1-4', why: 'Gần mặt đất, nền tảng vững' }, fengshui: { element: 'Thổ 🌍', colors: ['Nâu đất', 'Be', 'Xanh rêu'], material: 'Đá, gạch, gốm' }, compatibility: { best: [2, 6, 8], ok: [4, 7], avoid: [1, 3, 5] }, career: ['Kỹ sư', 'Kế toán', 'Quản lý dự án BĐS'], relationship: 'Cần người chu đáo, ổn định', luckyDay: 'T5, T7', warning: 'Đầu tư đúng ngay từ đầu' },
    5: { title: 'Người tự do', emoji: '🌊', color: '#3b82f6', personality: ['Yêu tự do, ghét trói buộc', 'Tò mò, phiêu lưu', 'Sức hút tự nhiên', 'Thiếu cam kết'], strengths: ['Thích nghi nhanh', 'Đa tài', 'Năng lượng tích cực'], weaknesses: ['Không thích ràng buộc', 'Dễ bị cám dỗ', 'Thiếu kiên nhẫn'], roomDetail: { type: 'Sleepbox, phòng ngắn hạn, minimalist', why: 'Gọn nhẹ = tự do. Thuê ngắn hạn', direction: 'BẤT KỲ — miễn gần trung tâm', avoid: 'HĐ 12 tháng, xa trung tâm' }, floorDetail: { best: 'Tầng 5 hoặc bất kỳ', why: 'Cần sự mới mẻ' }, fengshui: { element: 'Kim ⚡', colors: ['Xanh biển', 'Trắng', 'Xám bạc'], material: 'Kim loại, kính, inox' }, compatibility: { best: [1, 3, 7], ok: [5, 9], avoid: [2, 4, 6] }, career: ['Travel blogger', 'Sale BĐS', 'Freelancer'], relationship: 'Khó gắn bó lâu', luckyDay: 'T4, T6', warning: 'Cần "quỹ tự do" dự phòng' },
    6: { title: 'Người chăm sóc', emoji: '💝', color: '#ec4899', personality: ['Yêu thương, đặt gia đình lên đầu', 'Bản năng bảo vệ mạnh', 'Tạo không gian ấm cúng', 'Hay lo lắng quá mức'], strengths: ['Tạo "nhà" từ bất kỳ đâu', 'Giữ hòa khí', 'Chăm sóc tốt'], weaknesses: ['Hy sinh bản thân', 'Khó nói không', 'Kiểm soát'], roomDetail: { type: 'Căn hộ có bếp, phòng khách chung', why: 'Nấu ăn = tình yêu. Phòng khách = sum họp', direction: 'Tây Nam hoặc Nam', avoid: 'Studio tối giản, không bếp' }, floorDetail: { best: 'Tầng 1-3', why: 'Gần gũi, an toàn' }, fengshui: { element: 'Thổ 🌍', colors: ['Hồng pastel', 'Be kem', 'Xanh mint'], material: 'Vải mềm, gỗ ấm' }, compatibility: { best: [2, 4, 9], ok: [6, 8], avoid: [1, 5, 7] }, career: ['Quản lý KTX', 'Đầu bếp', 'Giáo viên'], relationship: 'Đối tác lý tưởng', luckyDay: 'T6, CN', warning: 'Hãy hỏi "nơi này có muốn nấu bữa tối không?"' },
    7: { title: 'Người tìm kiếm', emoji: '🔮', color: '#8b5cf6', personality: ['Nội tâm, tìm kiếm ý nghĩa sâu xa', 'Trí tuệ sắc bén, tâm linh', 'Cần thời gian một mình', 'Lạnh lùng, khép kín'], strengths: ['Chiều sâu tư duy', 'Nghiên cứu, tìm sự thật', 'Trực giác mạnh'], weaknesses: ['Khó tin người', 'Cô đơn', 'Quá suy nghĩ'], roomDetail: { type: 'Phòng yên tĩnh, có giá sách', why: 'Im lặng = năng lượng. Giá sách = thế giới nội tâm', direction: 'Bắc', avoid: 'Gần thang máy, tường mỏng' }, floorDetail: { best: 'Tầng 7 hoặc cao yên tĩnh', why: 'Tầng 7 cộng hưởng trực giác' }, fengshui: { element: 'Thủy 💧', colors: ['Tím', 'Xanh đậm', 'Trắng đục'], material: 'Đá, pha lê, gỗ tối' }, compatibility: { best: [5, 7, 3], ok: [1, 9], avoid: [2, 6, 8] }, career: ['Nhà nghiên cứu', 'Lập trình viên', 'Nhà tâm lý'], relationship: 'Khó mở lòng', luckyDay: 'T2, T7', warning: 'Tiết kiệm sai chỗ = mất sức khỏe tinh thần' },
    8: { title: 'Người quyền lực', emoji: '👑', color: '#0ea5e9', personality: ['Tham vọng, hướng thành công', 'Bản năng kinh doanh mạnh', 'Kỷ luật, chịu áp lực', 'Tham công tiếc việc'], strengths: ['Kiếm tiền top 1', 'Tầm nhìn chiến lược', 'Tạo ảnh hưởng lớn'], weaknesses: ['Work-life kém', 'Đo mọi thứ bằng tiền', 'Khó thể hiện cảm xúc'], roomDetail: { type: 'Penthouse, VIP, phòng làm việc riêng', why: 'Cần nơi "xứng tầm"', direction: 'Đông Nam', avoid: 'Phòng cũ/xuống cấp, chung' }, floorDetail: { best: 'Tầng 8 hoặc cao nhất', why: 'Số 8 = thịnh vượng phong thủy' }, fengshui: { element: 'Thổ + Kim 💰', colors: ['Vàng gold', 'Đen', 'Xanh navy'], material: 'Da, mạ vàng, gỗ sẫm' }, compatibility: { best: [2, 4, 6], ok: [8], avoid: [1, 3, 5, 7] }, career: ['Giám đốc', 'Nhà đầu tư BĐS', 'Ngân hàng'], relationship: 'Cần người hiểu bạn bận', luckyDay: 'T3, T5', warning: 'Chọn tốt nhất TRONG ngân sách' },
    9: { title: 'Người nhân ái', emoji: '🌍', color: '#14b8a6', personality: ['Sống vì lý tưởng, giúp cộng đồng', 'Bao dung, rộng lượng', 'Sáng tạo, yêu cái đẹp', 'Dễ thất vọng'], strengths: ['Kết nối cộng đồng', 'Tầm nhìn rộng', 'Truyền cảm hứng'], weaknesses: ['Quá lý tưởng', 'Cho đi quá nhiều', 'Khó buông quá khứ'], roomDetail: { type: 'Phòng view công viên/cây xanh', why: 'Cần kết nối tự nhiên và con người', direction: 'Đông hoặc Bắc', avoid: 'Biệt lập, không cộng đồng' }, floorDetail: { best: 'Tầng cao view rộng', why: 'Tầm nhìn rộng = trái tim rộng' }, fengshui: { element: 'Hỏa + Mộc 🌿🔥', colors: ['Đỏ hồng', 'Xanh lá', 'Tím nhẹ'], material: 'Gỗ tự nhiên, cây xanh sống' }, compatibility: { best: [1, 3, 6], ok: [2, 9], avoid: [4, 5, 8] }, career: ['Hoạt động xã hội', 'Kiến trúc sư xanh', 'Giáo viên yoga'], relationship: 'Hay quên người bên cạnh', luckyDay: 'T3, T6', warning: 'Hàng xóm thân thiện > phòng đẹp' },
    11: { title: 'Bậc thầy trực giác', emoji: '✨', color: '#a855f7', personality: ['Master Number 11 — trực giác siêu phàm', 'Truyền cảm hứng bẩm sinh', 'Nhạy cảm gấp đôi số 2', 'Anxiety cao khi năng lượng xấu'], strengths: ['Trực giác mạnh nhất', 'Lãnh đạo tinh thần', 'Thấy tiềm năng ẩn'], weaknesses: ['Lo lắng thường xuyên', 'Quá nhạy cảm', 'Kỳ vọng cao'], roomDetail: { type: 'Phòng yên tĩnh, góc thiền/yoga', why: 'Bạn CẢM NHẬN phòng hợp ngay khi bước vào', direction: 'Đông', avoid: 'Phòng lịch sử xấu, gần khu ồn' }, floorDetail: { best: 'Tầng 11 hoặc thượng', why: 'Gần bầu trời, số thầy' }, fengshui: { element: 'Phong 🌬️', colors: ['Tím lavender', 'Trắng ngà', 'Bạc ánh'], material: 'Pha lê, lụa, gỗ nhẹ' }, compatibility: { best: [2, 6, 9], ok: [7, 11], avoid: [4, 5, 8] }, career: ['Life Coach', 'Nghệ sĩ', 'Cố vấn tâm linh'], relationship: 'Cần người "hiểu không cần nói"', luckyDay: 'Ngày 11, 22', warning: 'ĐI XEM TRỰC TIẾP — tin trực giác' },
    22: { title: 'Bậc thầy xây dựng', emoji: '🏛️', color: '#d946ef', personality: ['Master 22 — số hiếm mạnh nhất', 'Tầm nhìn lớn + biến giấc mơ thành thực', 'Kết hợp trực giác 11 + thực tế 4', 'Áp lực cực lớn'], strengths: ['Xây dựng đế chế từ 0', 'Tầm nhìn chiến lược dài nhất', 'Biến ý tưởng thành công trình'], weaknesses: ['Burn-out', 'Khó hài lòng', 'Kiểm soát quá mức'], roomDetail: { type: 'Căn hộ lớn hoặc TOÀN BỘ một tầng', why: 'Bạn biến mọi chỗ thành "công trình"', direction: 'Đông Nam', avoid: 'Phòng nhỏ chật' }, floorDetail: { best: 'Tầng nền hoặc thượng', why: 'Nền móng hoặc đỉnh cao' }, fengshui: { element: 'Thổ + Kim 🏛️💰', colors: ['Vàng hoàng gia', 'Đen', 'Nâu đỏ'], material: 'Đá granite, gỗ quý' }, compatibility: { best: [4, 6, 8], ok: [2, 22], avoid: [3, 5, 7] }, career: ['Chủ đầu tư', 'CEO tập đoàn', 'Kiến trúc sư tổng thể'], relationship: 'Cần đối tác hiểu tầm nhìn lớn', luckyDay: 'Ngày 4, 22', warning: 'Cân nhắc MUA BĐS thay vì thuê' },
};

function calcLifePath(d: number, m: number, y: number): number {
    function reduce(n: number): number { while (n > 9 && n !== 11 && n !== 22) n = String(n).split('').reduce((s, c) => s + parseInt(c), 0); return n; }
    return reduce(reduce(d) + reduce(m) + reduce(y));
}
function calcSoulNumber(name: string): number {
    const v: Record<string, number> = { a: 1, e: 5, i: 9, o: 6, u: 3, y: 7 };
    let s = 0; for (const ch of name.toLowerCase().replace(/[^a-z]/g, '')) if (v[ch]) s += v[ch];
    while (s > 9 && s !== 11 && s !== 22) s = String(s).split('').reduce((a, c) => a + parseInt(c), 0);
    return s || 1;
}

/* ═══════════════ TABS ═══════════════ */
const TABS = [
    { id: 'numerology', label: '🔢 Thần số học', desc: 'Life Path Number' },
    { id: 'zodiac', label: '♈ Cung hoàng đạo', desc: '12 Zodiac Signs' },
    { id: 'ikigai', label: '🎯 Ikigai', desc: 'Mục đích sống' },
    { id: 'elements', label: '🌿 Ngũ hành', desc: 'Five Elements' },
] as const;

type TabId = typeof TABS[number]['id'];

/* ═══════════════ MAIN PAGE ═══════════════ */
export default function NumerologyPage() {
    const [activeTab, setActiveTab] = useState<TabId>('numerology');

    return (
        <>
            <div className="page-header">
                <h1>🔮 Smile Future — Dự đoán & Phong thủy nhà ở</h1>
                <p>Khám phá bản thân qua Thần số học, Cung hoàng đạo, Ikigai & Ngũ hành — tìm không gian sống hoàn hảo</p>
            </div>

            {/* Tab Bar */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        padding: '10px 18px', borderRadius: 10, border: activeTab === tab.id ? '2px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                        background: activeTab === tab.id ? 'var(--accent-blue-glow)' : 'var(--bg-card)', color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
                        fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                        {tab.label}
                        <div style={{ fontSize: '0.6rem', fontWeight: 400, opacity: 0.7, marginTop: 2 }}>{tab.desc}</div>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'numerology' && <NumerologyTab />}
            {activeTab === 'zodiac' && <ZodiacTab />}
            {activeTab === 'ikigai' && <IkigaiTab />}
            {activeTab === 'elements' && <ElementsTab />}
        </>
    );
}

/* ═══════════════ TAB 1: NUMEROLOGY ═══════════════ */
function NumerologyTab() {
    const [day, setDay] = useState(''); const [month, setMonth] = useState(''); const [year, setYear] = useState('');
    const [name, setName] = useState(''); const [result, setResult] = useState<number | null>(null); const [soulNum, setSoulNum] = useState<number | null>(null);
    function handleCalc() {
        const d = parseInt(day), m = parseInt(month), y = parseInt(year);
        if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900) return;
        setResult(calcLifePath(d, m, y)); setSoulNum(name.trim() ? calcSoulNumber(name) : null);
    }
    const info = result ? DATA[result] : null;
    return (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div className="card" style={{ flex: '1 1 320px', maxWidth: 380, alignSelf: 'flex-start' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>📅 Nhập ngày sinh</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                    {[{ l: 'Ngày', v: day, s: setDay, p: '15', max: 31 }, { l: 'Tháng', v: month, s: setMonth, p: '08', max: 12 }, { l: 'Năm', v: year, s: setYear, p: '1995', max: 2025 }].map(f => (
                        <div key={f.l}><label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{f.l}</label>
                            <input className="form-input" type="number" placeholder={f.p} min="1" max={f.max} value={f.v} onChange={e => f.s(e.target.value)} /></div>
                    ))}
                </div>
                <div style={{ marginBottom: 14 }}><label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Tên (tùy chọn)</label>
                    <input className="form-input" placeholder="VD: Nguyen Van A" value={name} onChange={e => setName(e.target.value)} /></div>
                <button onClick={handleCalc} style={{ width: '100%', padding: 12, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>🔮 Phân tích ngay</button>
            </div>
            {info && result && (
                <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '28px 24px', textAlign: 'center', background: `linear-gradient(135deg, ${info.color}12, ${info.color}06)`, borderBottom: '1px solid var(--border-subtle)' }}>
                            <div style={{ fontSize: '3rem' }}>{info.emoji}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>Số chủ đạo</div>
                            <div style={{ fontSize: '2.8rem', fontWeight: 900, color: info.color }}>{result}</div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{info.title}</div>
                            {(result === 11 || result === 22) && <div style={{ marginTop: 6, padding: '3px 12px', borderRadius: 20, background: `${info.color}20`, color: info.color, fontSize: '0.7rem', fontWeight: 700, display: 'inline-block' }}>⭐ Master Number</div>}
                        </div>
                    </div>
                    <div className="card"><SH icon="🧬" t="Tính cách" /><ul style={{ margin: 0, padding: '0 0 0 18px' }}>{info.personality.map((p, i) => <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{p}</li>)}</ul>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
                            <MiniBox title="💪 Điểm mạnh" items={info.strengths} color="#34d399" />
                            <MiniBox title="⚡ Điểm yếu" items={info.weaknesses} color="#fb7185" />
                        </div>
                    </div>
                    <div className="card"><SH icon="🏠" t="Phòng phù hợp" />
                        <div style={{ padding: 14, borderRadius: 10, background: `${info.color}08`, border: `1px solid ${info.color}15`, marginBottom: 12 }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: info.color, marginBottom: 6 }}>{info.roomDetail.type}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{info.roomDetail.why}</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <IB emoji="🧭" label="Hướng phòng" value={info.roomDetail.direction} />
                            <IB emoji="🚫" label="Tránh chọn" value={info.roomDetail.avoid} />
                            <IB emoji="🏗️" label={`Tầng: ${info.floorDetail.best}`} value={info.floorDetail.why} />
                            <IB emoji="🎨" label={`Phong thủy: ${info.fengshui.element}`} value={`Màu: ${info.fengshui.colors.join(', ')}`} />
                        </div>
                    </div>
                    <div className="card"><SH icon="💞" t="Tương hợp" />
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                            <CG label="❤️ Rất hợp" nums={info.compatibility.best} color="#34d399" />
                            <CG label="👍 Ổn" nums={info.compatibility.ok} color="#fbbf24" />
                            <CG label="⚠️ Cẩn thận" nums={info.compatibility.avoid} color="#fb7185" />
                        </div>
                    </div>
                    <div className="card"><SH icon="💼" t="Nghề & Lời khuyên" />
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>{info.career.map((c, i) => <span key={i} style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: `${info.color}10`, color: info.color, border: `1px solid ${info.color}20` }}>{c}</span>)}</div>
                        {soulNum && <div style={{ padding: 12, borderRadius: 10, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', marginBottom: 12 }}><div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa' }}>💜 Số Linh hồn: {soulNum}</div></div>}
                        <div style={{ padding: 14, borderRadius: 10, background: `${info.color}08`, border: `1px solid ${info.color}20` }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: info.color, marginBottom: 4 }}>⚡ LỜI KHUYÊN:</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>"{info.warning}"</div>
                        </div>
                    </div>
                    <div className="card"><SH icon="🎰" t="Số phòng may mắn" />
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>{[result, result + 10, result * 2, result + 100].map((n, i) => <span key={i} style={{ padding: '8px 16px', borderRadius: 10, fontWeight: 700, background: `${info.color}12`, color: info.color, border: `1px solid ${info.color}25` }}>P.{n}</span>)}</div>
                        <a href="/rooms" style={{ display: 'block', textAlign: 'center', padding: 14, borderRadius: 10, background: `linear-gradient(135deg, ${info.color}, ${info.color}cc)`, color: '#fff', fontWeight: 700, textDecoration: 'none' }}>🏠 Tìm phòng phù hợp →</a>
                    </div>
                </div>
            )}
            {!result && <OverviewGrid />}
        </div>
    );
}

/* ═══════════════ TAB 2: ZODIAC ═══════════════ */
function ZodiacTab() {
    const [day, setDay] = useState(''); const [month, setMonth] = useState(''); const [year, setYear] = useState('');
    const [zodiac, setZodiac] = useState<ReturnType<typeof getWesternZodiac> | null>(null);
    const [chiIdx, setChiIdx] = useState<number | null>(null);
    function handleCalc() {
        const d = parseInt(day), m = parseInt(month), y = parseInt(year);
        if (!d || !m || !y) return;
        setZodiac(getWesternZodiac(d, m));
        setChiIdx(y % 12);
    }
    const chi = chiIdx !== null ? CHI_ZODIAC[chiIdx] : null;
    return (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div className="card" style={{ flex: '1 1 320px', maxWidth: 380, alignSelf: 'flex-start' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>📅 Nhập ngày sinh</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                    {[{ l: 'Ngày', v: day, s: setDay, p: '15' }, { l: 'Tháng', v: month, s: setMonth, p: '08' }, { l: 'Năm', v: year, s: setYear, p: '1995' }].map(f => (
                        <div key={f.l}><label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{f.l}</label>
                            <input className="form-input" type="number" placeholder={f.p} value={f.v} onChange={e => f.s(e.target.value)} /></div>
                    ))}
                </div>
                <button onClick={handleCalc} style={{ width: '100%', padding: 12, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>♈ Xem cung & con giáp</button>
            </div>
            {zodiac && (
                <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '28px 24px', textAlign: 'center', background: `linear-gradient(135deg, ${zodiac.color}12, ${zodiac.color}06)`, borderBottom: '1px solid var(--border-subtle)' }}>
                            <div style={{ fontSize: '3rem' }}>{zodiac.emoji}</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: zodiac.color }}>{zodiac.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{zodiac.dateRange} • {zodiac.element}</div>
                        </div>
                    </div>
                    <div className="card"><SH icon="🧬" t="Tính cách" /><ul style={{ margin: 0, padding: '0 0 0 18px' }}>{zodiac.personality.map((p, i) => <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{p}</li>)}</ul></div>
                    <div className="card"><SH icon="🏠" t="Phòng phù hợp" />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <IB emoji="🏠" label="Loại phòng lý tưởng" value={zodiac.roomAdvice} />
                            <IB emoji="🧭" label="Hướng may mắn" value={zodiac.luckyDirection} />
                            <IB emoji="🏗️" label="Tầng phù hợp" value={zodiac.luckyFloor} />
                            <IB emoji="⚠️" label="Lưu ý" value={zodiac.warning} />
                        </div>
                    </div>
                    <div className="card"><SH icon="💞" t="Cung hoàng đạo tương hợp" />
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{zodiac.compatibility.map((c, i) => <span key={i} style={{ padding: '6px 14px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600, background: 'rgba(52,211,153,0.08)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>❤️ {c}</span>)}</div>
                    </div>
                    {chi && (
                        <div className="card"><SH icon="🐲" t="12 Con Giáp — Tử Vi" />
                            <div style={{ textAlign: 'center', padding: 16, background: 'var(--bg-secondary)', borderRadius: 10, marginBottom: 12 }}>
                                <div style={{ fontSize: '2.5rem' }}>{chi.emoji}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: 4 }}>{chi.name}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{chi.years} • Ngũ hành: {chi.element}</div>
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8 }}>🧬 <strong>Tính cách:</strong> {chi.personality}</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>🏠 <strong>Phòng phù hợp:</strong> {chi.roomTip}</div>
                        </div>
                    )}
                </div>
            )}
            {!zodiac && (
                <div className="card" style={{ flex: '1 1 500px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>♈ 12 Cung hoàng đạo & Nhà ở</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                        {WESTERN_ZODIAC.map(z => (
                            <div key={z.name} style={{ padding: 12, borderRadius: 10, background: `${z.color}08`, border: `1px solid ${z.color}15`, textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem' }}>{z.emoji}</div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: z.color, marginTop: 4 }}>{z.name.split(' (')[0]}</div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{z.dateRange}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══════════════ TAB 3: IKIGAI ═══════════════ */
function IkigaiTab() {
    const [answers, setAnswers] = useState<number[]>(Array(IKIGAI_QUESTIONS.length).fill(-1));
    const [result, setResult] = useState<IkigaiResult | null>(null);
    function handleAnswer(qIdx: number, aIdx: number) { const n = [...answers]; n[qIdx] = aIdx; setAnswers(n); }
    function handleSubmit() { if (answers.some(a => a < 0)) return; setResult(calculateIkigai(answers)); }
    return (
        <div style={{ maxWidth: 720 }}>
            {!result ? (
                <>
                    <div className="card" style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>🎯 Khám phá Ikigai — Mục đích sống</h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Trả lời 4 câu hỏi để tìm phong cách sống và không gian ở phù hợp nhất với bạn.</p>
                    </div>
                    {IKIGAI_QUESTIONS.map((q, qi) => (
                        <div key={qi} className="card" style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 12 }}>Câu {qi + 1}: {q.question}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {q.options.map((opt, oi) => (
                                    <button key={oi} onClick={() => handleAnswer(qi, oi)} style={{
                                        padding: '10px 14px', borderRadius: 8, border: answers[qi] === oi ? '2px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                                        background: answers[qi] === oi ? 'var(--accent-blue-glow)' : 'var(--bg-secondary)',
                                        color: answers[qi] === oi ? 'var(--accent-blue)' : 'var(--text-secondary)',
                                        textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem', fontWeight: answers[qi] === oi ? 700 : 500, transition: 'all 0.2s',
                                    }}>{opt.label}</button>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button onClick={handleSubmit} disabled={answers.some(a => a < 0)} style={{
                        width: '100%', padding: 14, borderRadius: 10, border: 'none', background: answers.some(a => a < 0) ? '#333' : 'linear-gradient(135deg, #f97316, #eab308)',
                        color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: answers.some(a => a < 0) ? 'not-allowed' : 'pointer',
                    }}>🎯 Tìm Ikigai của tôi</button>
                </>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '32px 24px', textAlign: 'center', background: `linear-gradient(135deg, ${result.color}12, ${result.color}06)`, borderBottom: '1px solid var(--border-subtle)' }}>
                            <div style={{ fontSize: '3.5rem' }}>{result.emoji}</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: result.color, marginTop: 8 }}>{result.type}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6, maxWidth: 500, margin: '8px auto 0' }}>{result.description}</div>
                        </div>
                    </div>
                    <div className="card"><SH icon="🏠" t="Không gian sống lý tưởng" />
                        <IB emoji="🏠" label="Loại phòng" value={result.idealRoom} />
                        <div style={{ marginTop: 12 }}><IB emoji="🌿" label="Phong cách sống" value={result.lifestyle} /></div>
                    </div>
                    <div className="card" style={{ padding: 16, background: `${result.color}08`, border: `1px solid ${result.color}20` }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: result.color, marginBottom: 6 }}>💡 Lời khuyên Ikigai:</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.6 }}>"{result.advice}"</div>
                    </div>
                    <button onClick={() => { setResult(null); setAnswers(Array(IKIGAI_QUESTIONS.length).fill(-1)); }} style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>🔄 Làm lại quizz</button>
                </div>
            )}
        </div>
    );
}

/* ═══════════════ TAB 4: FIVE ELEMENTS ═══════════════ */
function ElementsTab() {
    const [year, setYear] = useState(''); const [year2, setYear2] = useState('');
    const [el, setEl] = useState<string | null>(null); const [el2, setEl2] = useState<string | null>(null);
    function handleCalc() { const y = parseInt(year); if (y >= 1900) setEl(getElementFromYear(y)); if (year2) { const y2 = parseInt(year2); if (y2 >= 1900) setEl2(getElementFromYear(y2)); } else setEl2(null); }
    const elInfo = el ? ELEMENTS[el] : null;
    const relation = el && el2 ? getElementRelation(el, el2) : null;
    return (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div className="card" style={{ flex: '1 1 320px', maxWidth: 380, alignSelf: 'flex-start' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>🌿 Tra cứu Ngũ hành</h3>
                <div style={{ marginBottom: 14 }}><label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Năm sinh của bạn</label>
                    <input className="form-input" type="number" placeholder="1995" value={year} onChange={e => setYear(e.target.value)} /></div>
                <div style={{ marginBottom: 14 }}><label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Năm sinh đối phương (tùy chọn)</label>
                    <input className="form-input" type="number" placeholder="1998" value={year2} onChange={e => setYear2(e.target.value)} /></div>
                <button onClick={handleCalc} style={{ width: '100%', padding: 12, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #22c55e, #14b8a6)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>🌿 Xem Ngũ hành</button>
            </div>
            {elInfo && el && (
                <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '28px 24px', textAlign: 'center', background: elInfo.gradient, borderBottom: '1px solid var(--border-subtle)' }}>
                            <div style={{ fontSize: '3rem' }}>{elInfo.emoji}</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{elInfo.name}</div>
                        </div>
                    </div>
                    <div className="card"><SH icon="🧬" t="Đặc điểm" />
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>{elInfo.traits.map((tr, i) => <span key={i} style={{ padding: '6px 14px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600, background: `${elInfo.color}15`, color: elInfo.color, border: `1px solid ${elInfo.color}25` }}>{tr}</span>)}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: '0.75rem' }}>
                            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(52,211,153,0.06)', textAlign: 'center' }}>💚 Sinh: <strong>{elInfo.produces}</strong></div>
                            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(251,113,133,0.06)', textAlign: 'center' }}>⚡ Khắc: <strong>{elInfo.destroys}</strong></div>
                            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(239,68,68,0.06)', textAlign: 'center' }}>🛡️ Bị khắc: <strong>{elInfo.weakAgainst}</strong></div>
                        </div>
                    </div>
                    <div className="card"><SH icon="🏠" t="Phong thủy nhà ở" />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <IB emoji="🎨" label="Màu phù hợp" value={elInfo.roomColors.join(', ')} />
                            <IB emoji="🪵" label="Chất liệu" value={elInfo.materials.join(', ')} />
                            <IB emoji="🧭" label="Hướng tốt" value={elInfo.directions.join(', ')} />
                            <IB emoji="🏠" label="Lời khuyên" value={elInfo.roomAdvice} />
                        </div>
                    </div>
                    {relation && el2 && (
                        <div className="card" style={{ borderLeft: `4px solid ${relation.color}` }}>
                            <SH icon={relation.emoji} t={`Tương quan: ${el} ↔ ${el2}`} />
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: relation.color, marginBottom: 8 }}>{relation.relation}</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{relation.detail}</div>
                        </div>
                    )}
                </div>
            )}
            {!elInfo && (
                <div className="card" style={{ flex: '1 1 500px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>🌿 Ngũ hành & Phong thủy</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>Ngũ hành (Kim, Mộc, Thủy, Hỏa, Thổ) là nền tảng phong thủy. Nhập năm sinh để biết mệnh và trang trí nhà phù hợp.</p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {Object.values(ELEMENTS).map(e => (
                            <div key={e.name} style={{ padding: 16, borderRadius: 12, background: e.gradient, textAlign: 'center', minWidth: 100 }}>
                                <div style={{ fontSize: '2rem' }}>{e.emoji}</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.3)', marginTop: 4 }}>{e.name.split(' (')[0]}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══════════════ SHARED COMPONENTS ═══════════════ */
function SH({ icon, t }: { icon: string; t: string }) { return <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12 }}>{icon} {t}</div>; }
function IB({ emoji, label, value }: { emoji: string; label: string; value: string }) {
    return (<div style={{ padding: 10, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{emoji} {label}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{value}</div>
    </div>);
}
function MiniBox({ title, items, color }: { title: string; items: string[]; color: string }) {
    return (<div style={{ padding: 10, borderRadius: 8, background: `${color}08`, border: `1px solid ${color}15` }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color, marginBottom: 6 }}>{title}</div>
        {items.map((s, i) => <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 3, lineHeight: 1.5 }}>• {s}</div>)}
    </div>);
}
function CG({ label, nums, color }: { label: string; nums: number[]; color: string }) {
    return (<div style={{ padding: '8px 12px', borderRadius: 8, background: `${color}08`, border: `1px solid ${color}20` }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 600, color, marginBottom: 4 }}>{label}</div>
        <div style={{ display: 'flex', gap: 6 }}>{nums.map(n => <span key={n} style={{ width: 28, height: 28, borderRadius: '50%', background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>{n}</span>)}</div>
    </div>);
}
function OverviewGrid() {
    return (<div className="card" style={{ flex: '1 1 500px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>📖 Thần số học là gì?</h3>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>Thần số học nghiên cứu ý nghĩa các con số dựa trên ngày sinh để tìm <strong>Số chủ đạo</strong>. Smile Home kết hợp thần số học + phong thủy để gợi ý <strong>phòng phù hợp năng lượng</strong>.</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>{Object.entries(DATA).map(([num, d]) => (
            <div key={num} style={{ padding: '10px 14px', borderRadius: 10, background: `${d.color}08`, border: `1px solid ${d.color}15`, textAlign: 'center', minWidth: 85 }}>
                <div style={{ fontSize: '1.2rem' }}>{d.emoji}</div><div style={{ fontSize: '1rem', fontWeight: 800, color: d.color }}>{num}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2 }}>{d.title}</div>
            </div>
        ))}</div>
    </div>);
}
