export interface IkigaiResult {
    type: string;
    emoji: string;
    color: string;
    description: string;
    idealRoom: string;
    lifestyle: string;
    advice: string;
}

export const IKIGAI_TYPES: IkigaiResult[] = [
    {
        type: 'Người Kiến Tạo', emoji: '🏗️', color: '#f97316', description: 'Bạn tìm thấy ý nghĩa trong việc XÂY DỰNG — tạo ra thứ gì đó từ con số 0.',
        idealRoom: 'Căn hộ có phòng làm việc/workshop riêng, không gian mở để sáng tạo', lifestyle: 'Cần sự ổn định lâu dài, đầu tư vào nơi ở chất lượng',
        advice: 'Hãy biến nơi ở thành "xưởng sáng tạo" — đây là nơi giấc mơ bắt đầu.'
    },
    {
        type: 'Người Kết Nối', emoji: '🤝', color: '#3b82f6', description: 'Bạn tìm thấy ý nghĩa trong việc KẾT NỐI con người — xây cầu nối giữa mọi người.',
        idealRoom: 'Co-living, căn hộ có common area, gần cộng đồng', lifestyle: 'Cần không gian giao lưu, gần quán cafe, công viên',
        advice: 'Chọn nơi có hàng xóm thân thiện — mạng lưới của bạn là siêu năng lực.'
    },
    {
        type: 'Người Chữa Lành', emoji: '💚', color: '#22c55e', description: 'Bạn tìm thấy ý nghĩa trong việc CHỮA LÀNH — giúp người khác và chính mình.',
        idealRoom: 'Phòng yên tĩnh, gần thiên nhiên, có góc thiền/yoga', lifestyle: 'Cần sự bình yên, tránh xa ồn ào và stress',
        advice: 'Nơi ở là "thánh đường" của bạn — chọn nơi bạn cảm thấy bình an nhất.'
    },
    {
        type: 'Người Khám Phá', emoji: '🧭', color: '#8b5cf6', description: 'Bạn tìm thấy ý nghĩa trong việc KHÁM PHÁ — luôn tìm kiếm điều mới mẻ.',
        idealRoom: 'Sleepbox, phòng ngắn hạn, minimalist, gần giao thông', lifestyle: 'Linh hoạt, thay đổi, không cần nhiều đồ đạc',
        advice: 'Thuê ngắn hạn, keep it simple — tự do di chuyển là ưu tiên số 1.'
    },
    {
        type: 'Người Lãnh Đạo', emoji: '👑', color: '#eab308', description: 'Bạn tìm thấy ý nghĩa trong việc DẪN DẮT — tạo ảnh hưởng và thay đổi.',
        idealRoom: 'Penthouse, căn hộ VIP, phòng có phòng họp nhỏ/home office', lifestyle: 'Cần vị thế và không gian "xứng tầm"',
        advice: 'Đầu tư vào nơi ở premium — nó phản ánh và nuôi dưỡng tầm nhìn của bạn.'
    },
    {
        type: 'Người Nghệ Sĩ', emoji: '🎨', color: '#ec4899', description: 'Bạn tìm thấy ý nghĩa trong việc SÁNG TẠO — biến cái đẹp thành hiện thực.',
        idealRoom: 'Phòng trần cao, tường trắng, view đẹp, có ban công', lifestyle: 'Cần cảm hứng từ không gian, ánh sáng, màu sắc',
        advice: 'Không gian xấu = sáng tạo chết. Đầu tư vào nơi truyền cảm hứng.'
    },
];

export interface IkigaiQuestion {
    question: string;
    options: { label: string; types: number[] }[];
}

export const IKIGAI_QUESTIONS: IkigaiQuestion[] = [
    {
        question: 'Khi rảnh rỗi, bạn thường làm gì?',
        options: [
            { label: '🔨 Làm đồ handmade / sửa chữa', types: [0] },
            { label: '☕ Cafe với bạn bè / networking', types: [1] },
            { label: '🧘 Thiền, yoga, đọc sách', types: [2] },
            { label: '✈️ Đi du lịch / khám phá', types: [3] },
            { label: '📊 Lên kế hoạch, chiến lược', types: [4] },
            { label: '🎵 Vẽ, chơi nhạc, viết', types: [5] },
        ]
    },
    {
        question: 'Người khác thường khen bạn điều gì?',
        options: [
            { label: 'Tay nghề giỏi, làm ra sản phẩm chất', types: [0] },
            { label: 'Dễ gần, kết nối mọi người', types: [1] },
            { label: 'Biết lắng nghe, an ủi tốt', types: [2] },
            { label: 'Dũng cảm, dám thử cái mới', types: [3] },
            { label: 'Tầm nhìn xa, quyết đoán', types: [4] },
            { label: 'Sáng tạo, có gu thẩm mỹ', types: [5] },
        ]
    },
    {
        question: 'Bạn muốn nơi ở mang lại gì nhất?',
        options: [
            { label: '🏠 Ổn định, sở hữu, tự tay cải tạo', types: [0] },
            { label: '🎉 Cộng đồng vui vẻ, giao lưu', types: [1] },
            { label: '🌿 Bình yên, gần thiên nhiên', types: [2] },
            { label: '🚀 Tiện di chuyển, linh hoạt', types: [3] },
            { label: '💎 Đẳng cấp, sang trọng', types: [4] },
            { label: '✨ Cảm hứng, đẹp, ánh sáng', types: [5] },
        ]
    },
    {
        question: 'Nếu có 1 tỷ, bạn sẽ làm gì đầu tiên?',
        options: [
            { label: '🏗️ Mua đất xây nhà theo ý mình', types: [0] },
            { label: '🤝 Mở quán cafe/co-working', types: [1] },
            { label: '🏥 Mở trung tâm chữa lành/từ thiện', types: [2] },
            { label: '🌍 Du lịch vòng quanh thế giới', types: [3] },
            { label: '📈 Đầu tư BĐS / doanh nghiệp', types: [4] },
            { label: '🎨 Mở studio / gallery nghệ thuật', types: [5] },
        ]
    },
];

export function calculateIkigai(answers: number[]): IkigaiResult {
    const scores = Array(6).fill(0);
    answers.forEach((ansIdx, qIdx) => {
        if (ansIdx >= 0 && IKIGAI_QUESTIONS[qIdx]?.options[ansIdx]) {
            IKIGAI_QUESTIONS[qIdx].options[ansIdx].types.forEach(t => scores[t]++);
        }
    });
    const maxIdx = scores.indexOf(Math.max(...scores));
    return IKIGAI_TYPES[maxIdx];
}
