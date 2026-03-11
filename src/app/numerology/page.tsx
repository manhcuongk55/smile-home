'use client';

import { useState } from 'react';

const LIFE_PATH: Record<number, { title: string; emoji: string; traits: string; room: string; floor: string; color: string; advice: string }> = {
    1: { title: 'Người tiên phong', emoji: '🔥', traits: 'Độc lập, lãnh đạo, sáng tạo, quyết đoán', room: 'Studio riêng tư, căn góc — cần không gian riêng để tập trung', floor: 'Tầng cao nhất — thích tầm nhìn và vị trí dẫn đầu', color: '#ef4444', advice: 'Chọn phòng có ban công hướng Đông — đón ánh sáng đầu tiên mỗi ngày' },
    2: { title: 'Người hòa hợp', emoji: '🌙', traits: 'Nhạy cảm, hợp tác, kiên nhẫn, chu đáo', room: 'Phòng đôi hoặc căn hộ mini — cần không gian chia sẻ', floor: 'Tầng 2 hoặc tầng giữa — cân bằng, hài hòa', color: '#f97316', advice: 'Ưu tiên phòng gần khu vực chung — bạn cần cộng đồng xung quanh' },
    3: { title: 'Người biểu đạt', emoji: '🎨', traits: 'Sáng tạo, vui vẻ, giao tiếp tốt, lạc quan', room: 'Phòng rộng, nhiều ánh sáng — cần không gian thể hiện', floor: 'Tầng 3 — con số may mắn của bạn', color: '#eab308', advice: 'Chọn phòng có view đẹp hoặc gần café — cảm hứng là năng lượng sống' },
    4: { title: 'Người xây dựng', emoji: '🏗️', traits: 'Ổn định, thực tế, chăm chỉ, đáng tin cậy', room: 'Phòng vuông vắn, bố cục rõ ràng — cần trật tự', floor: 'Tầng 4 — nền tảng vững chắc', color: '#22c55e', advice: 'Ưu tiên phòng có tủ kệ sẵn, gần thang máy — tiện ích thực tế là số 1' },
    5: { title: 'Người tự do', emoji: '🌊', traits: 'Phiêu lưu, linh hoạt, tò mò, năng động', room: 'Sleepbox hoặc phòng ngắn hạn — bạn không thích gắn bó lâu', floor: 'Bất kỳ tầng nào — miễn là thay đổi được', color: '#3b82f6', advice: 'Hợp đồng ngắn hạn 3-6 tháng — giữ sự tự do di chuyển' },
    6: { title: 'Người chăm sóc', emoji: '💝', traits: 'Yêu thương, trách nhiệm, gia đình, hòa nhã', room: 'Căn hộ gia đình, phòng gần bếp — cần không gian ấm cúng', floor: 'Tầng thấp (1-3) — gần gũi, dễ tiếp cận', color: '#ec4899', advice: 'Chọn khu có cộng đồng tốt, an ninh — gia đình là ưu tiên hàng đầu' },
    7: { title: 'Người tìm kiếm', emoji: '🔮', traits: 'Trí tuệ, nội tâm, phân tích, tâm linh', room: 'Phòng yên tĩnh, hướng Bắc — cần không gian suy tư', floor: 'Tầng 7 — con số tâm linh mạnh nhất', color: '#8b5cf6', advice: 'Tránh phòng gần thang máy hoặc khu ồn — bạn cần sự tĩnh lặng' },
    8: { title: 'Người quyền lực', emoji: '👑', traits: 'Tham vọng, thành công, tài chính, lãnh đạo', room: 'Penthouse hoặc phòng VIP — xứng tầm vị trí', floor: 'Tầng 8 — con số thịnh vượng trong phong thủy', color: '#0ea5e9', advice: 'Đầu tư phòng tốt nhất — chất lượng sống quyết định chất lượng công việc' },
    9: { title: 'Người nhân ái', emoji: '🌍', traits: 'Bao dung, lý tưởng, sáng tạo, nhân đạo', room: 'Phòng có view thoáng, gần công viên — cần kết nối tự nhiên', floor: 'Tầng cao — tầm nhìn rộng như trái tim bạn', color: '#14b8a6', advice: 'Chọn nơi có community space — bạn sống vì cộng đồng' },
    11: { title: 'Bậc thầy trực giác', emoji: '✨', traits: 'Trực giác mạnh, truyền cảm hứng, tâm linh, nhạy bén', room: 'Phòng đặc biệt, vị trí đẹp nhất tòa nhà', floor: 'Tầng 11 hoặc tầng thượng — gần bầu trời', color: '#a855f7', advice: 'Bạn là người đặc biệt — tin vào trực giác khi chọn phòng, cảm nhận năng lượng' },
    22: { title: 'Bậc thầy xây dựng', emoji: '🏛️', traits: 'Tầm nhìn lớn, khả năng hiện thực hóa, kiến tạo, bền bỉ', room: 'Toàn bộ tầng hoặc căn hộ lớn — bạn cần không gian để kiến tạo', floor: 'Tầng thấp vững chắc — nền móng cho đế chế', color: '#d946ef', advice: 'Cân nhắc đầu tư BĐS — bạn sinh ra để xây dựng, không chỉ ở' },
};

function calcLifePath(day: number, month: number, year: number): number {
    function reduce(n: number): number {
        while (n > 9 && n !== 11 && n !== 22) {
            n = String(n).split('').reduce((s, d) => s + parseInt(d), 0);
        }
        return n;
    }
    const d = reduce(day);
    const m = reduce(month);
    const y = reduce(year);
    return reduce(d + m + y);
}

function calcSoulNumber(name: string): number {
    const vowels: Record<string, number> = { a: 1, e: 5, i: 9, o: 6, u: 3, y: 7 };
    let sum = 0;
    for (const ch of name.toLowerCase().replace(/[^a-z]/g, '')) {
        if (vowels[ch]) sum += vowels[ch];
    }
    while (sum > 9 && sum !== 11 && sum !== 22) {
        sum = String(sum).split('').reduce((s, d) => s + parseInt(d), 0);
    }
    return sum || 1;
}

export default function NumerologyPage() {
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [name, setName] = useState('');
    const [result, setResult] = useState<number | null>(null);
    const [soulNum, setSoulNum] = useState<number | null>(null);

    function handleCalc() {
        const d = parseInt(day), m = parseInt(month), y = parseInt(year);
        if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900) return;
        const lp = calcLifePath(d, m, y);
        setResult(lp);
        if (name.trim()) setSoulNum(calcSoulNumber(name));
        else setSoulNum(null);
    }

    const info = result ? (LIFE_PATH[result] || LIFE_PATH[9]) : null;

    return (
        <>
            <div className="page-header">
                <h1>🔮 Thần số học & Phong thủy nhà ở</h1>
                <p>Khám phá con số chủ đạo — tìm phòng phù hợp năng lượng của bạn</p>
            </div>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {/* Input Card */}
                <div className="card" style={{ flex: '1 1 340px', maxWidth: 420 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>📅 Nhập ngày sinh</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                        <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Ngày</label>
                            <input className="form-input" type="number" placeholder="15" min="1" max="31" value={day} onChange={e => setDay(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Tháng</label>
                            <input className="form-input" type="number" placeholder="08" min="1" max="12" value={month} onChange={e => setMonth(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Năm</label>
                            <input className="form-input" type="number" placeholder="1995" min="1900" max="2025" value={year} onChange={e => setYear(e.target.value)} />
                        </div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Tên (tùy chọn — tính Số linh hồn)</label>
                        <input className="form-input" placeholder="VD: Nguyen Van A" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <button onClick={handleCalc} style={{
                        width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                        color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                    }}>
                        🔮 Xem kết quả
                    </button>
                </div>

                {/* Result Card */}
                {info && result && (
                    <div className="card" style={{ flex: '1 1 400px', padding: 0, overflow: 'hidden' }}>
                        {/* Header */}
                        <div style={{
                            padding: '24px 20px', textAlign: 'center',
                            background: `linear-gradient(135deg, ${info.color}15, ${info.color}08)`,
                            borderBottom: '1px solid var(--border-subtle)',
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: 8 }}>{info.emoji}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase' }}>Số chủ đạo</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: info.color }}>{result}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 4 }}>{info.title}</div>
                        </div>

                        {/* Details */}
                        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <DetailRow icon="🧬" label="Tính cách" value={info.traits} />
                            <DetailRow icon="🏠" label="Phòng phù hợp" value={info.room} color={info.color} />
                            <DetailRow icon="🏗️" label="Tầng may mắn" value={info.floor} />
                            <DetailRow icon="💡" label="Lời khuyên" value={info.advice} color={info.color} />

                            {soulNum && (
                                <div style={{ padding: 12, borderRadius: 10, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                                    <div style={{ fontSize: '0.72rem', color: '#a78bfa', fontWeight: 600, marginBottom: 4 }}>💜 Số linh hồn: {soulNum}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                        {soulNum <= 3 ? 'Bạn tìm kiếm sự đơn giản và hài hòa trong không gian sống.' :
                                            soulNum <= 6 ? 'Bạn cần không gian thể hiện bản thân và kết nối cảm xúc.' :
                                                'Bạn khao khát không gian yên tĩnh, tâm linh và sâu sắc.'}
                                    </div>
                                </div>
                            )}

                            {/* Lucky Numbers */}
                            <div style={{ padding: 12, borderRadius: 10, background: 'var(--bg-secondary)' }}>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>🎰 Số phòng may mắn</div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {[result, result * 2, result + 10, result * 3 + 1, result + 100].map((n, i) => (
                                        <span key={i} style={{
                                            padding: '6px 14px', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem',
                                            background: `${info.color}15`, color: info.color, border: `1px solid ${info.color}30`,
                                        }}>P.{n}</span>
                                    ))}
                                </div>
                            </div>

                            {/* CTA */}
                            <a href="/rooms" style={{
                                display: 'block', textAlign: 'center', padding: '12px', borderRadius: 10,
                                background: `linear-gradient(135deg, ${info.color}, ${info.color}cc)`,
                                color: '#fff', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
                            }}>
                                🏠 Tìm phòng phù hợp với bạn →
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Info Section */}
            {!result && (
                <div className="card" style={{ marginTop: 20 }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>📖 Thần số học là gì?</h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                        Thần số học (Numerology) nghiên cứu ý nghĩa tâm linh của các con số, dựa trên ngày tháng năm sinh để tìm ra <strong>Số chủ đạo (Life Path Number)</strong> — con số định hình tính cách, sứ mệnh và lựa chọn cuộc sống của bạn.
                        <br /><br />
                        Tại <strong>Smile Home</strong>, chúng tôi kết hợp thần số học với phong thủy để gợi ý <strong>phòng phù hợp năng lượng</strong> của bạn — giúp mang đến không gian sống hài hòa, may mắn.
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
                        {Object.entries(LIFE_PATH).map(([num, info]) => (
                            <div key={num} style={{
                                padding: '8px 12px', borderRadius: 10, background: `${info.color}10`,
                                border: `1px solid ${info.color}20`, textAlign: 'center', minWidth: 80,
                            }}>
                                <div style={{ fontSize: '1.2rem' }}>{info.emoji}</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: info.color }}>{num}</div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2 }}>{info.title}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

function DetailRow({ icon, label, value, color }: { icon: string; label: string; value: string; color?: string }) {
    return (
        <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3 }}>{icon} {label}</div>
            <div style={{ fontSize: '0.82rem', color: color || 'var(--text-primary)', lineHeight: 1.5 }}>{value}</div>
        </div>
    );
}
