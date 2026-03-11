export interface ZodiacInfo {
    name: string; emoji: string; color: string;
    dateRange: string;
    element: string;
    personality: string[];
    roomAdvice: string;
    luckyDirection: string;
    luckyFloor: string;
    compatibility: string[];
    warning: string;
}

export const WESTERN_ZODIAC: ZodiacInfo[] = [
    {
        name: 'Bạch Dương (Aries)', emoji: '♈', color: '#ef4444', dateRange: '21/3 - 19/4', element: 'Hỏa 🔥',
        personality: ['Năng động, dũng cảm, tự tin', 'Thích thử thách và khám phá', 'Nóng tính nhưng nhanh quên'],
        roomAdvice: 'Phòng rộng, nhiều ánh sáng, gần khu thể thao', luckyDirection: 'Hướng Đông', luckyFloor: 'Tầng cao',
        compatibility: ['Sư Tử', 'Nhân Mã', 'Song Tử'], warning: 'Tránh phòng chật, thiếu ánh sáng'
    },
    {
        name: 'Kim Ngưu (Taurus)', emoji: '♉', color: '#22c55e', dateRange: '20/4 - 20/5', element: 'Thổ 🌍',
        personality: ['Kiên nhẫn, đáng tin cậy, thực tế', 'Yêu sự thoải mái và xa hoa', 'Bướng bỉnh khi đã quyết'],
        roomAdvice: 'Căn hộ có bếp riêng, nội thất chất lượng', luckyDirection: 'Hướng Tây Nam', luckyFloor: 'Tầng thấp (1-4)',
        compatibility: ['Xử Nữ', 'Ma Kết', 'Cự Giải'], warning: 'Đừng tiết kiệm quá mức cho nơi ở'
    },
    {
        name: 'Song Tử (Gemini)', emoji: '♊', color: '#eab308', dateRange: '21/5 - 20/6', element: 'Phong 🌬️',
        personality: ['Linh hoạt, thông minh, hay nói', 'Đa tài nhưng hay thay đổi', 'Tò mò và yêu học hỏi'],
        roomAdvice: 'Phòng gần trung tâm, có wifi mạnh, co-living', luckyDirection: 'Hướng Đông Nam', luckyFloor: 'Tầng giữa',
        compatibility: ['Bạch Dương', 'Thiên Bình', 'Bảo Bình'], warning: 'Tránh ký HĐ quá dài hạn'
    },
    {
        name: 'Cự Giải (Cancer)', emoji: '♋', color: '#3b82f6', dateRange: '21/6 - 22/7', element: 'Thủy 💧',
        personality: ['Tình cảm, chu đáo, yêu gia đình', 'Trực giác mạnh, nhạy cảm', 'Hay lo lắng và bất an'],
        roomAdvice: 'Căn hộ ấm cúng, có phòng khách, gần gia đình', luckyDirection: 'Hướng Bắc', luckyFloor: 'Tầng 2-4',
        compatibility: ['Kim Ngưu', 'Xử Nữ', 'Bọ Cạp'], warning: 'Đừng chọn phòng quá xa người thân'
    },
    {
        name: 'Sư Tử (Leo)', emoji: '♌', color: '#f97316', dateRange: '23/7 - 22/8', element: 'Hỏa 🔥',
        personality: ['Tự tin, hào phóng, lãnh đạo', 'Yêu sự sang trọng và được chú ý', 'Kiêu hãnh, khó chấp nhận sai'],
        roomAdvice: 'Penthouse hoặc phòng VIP, view đẹp', luckyDirection: 'Hướng Nam', luckyFloor: 'Tầng cao nhất',
        compatibility: ['Bạch Dương', 'Nhân Mã', 'Song Tử'], warning: 'Đừng chọn phòng xứng tầm ngoài ngân sách'
    },
    {
        name: 'Xử Nữ (Virgo)', emoji: '♍', color: '#14b8a6', dateRange: '23/8 - 22/9', element: 'Thổ 🌍',
        personality: ['Tỉ mỉ, có tổ chức, cầu toàn', 'Phân tích logic, thực tế', 'Hay lo lắng tiểu tiết'],
        roomAdvice: 'Phòng sạch sẽ, bố cục rõ ràng, nhiều tủ kệ', luckyDirection: 'Hướng Tây', luckyFloor: 'Tầng 3-6',
        compatibility: ['Kim Ngưu', 'Ma Kết', 'Cự Giải'], warning: 'Kiểm tra kỹ phòng trước khi ký HĐ'
    },
    {
        name: 'Thiên Bình (Libra)', emoji: '♎', color: '#ec4899', dateRange: '23/9 - 22/10', element: 'Phong 🌬️',
        personality: ['Hòa nhã, công bằng, yêu cái đẹp', 'Giỏi ngoại giao nhưng hay do dự', 'Ghét xung đột'],
        roomAdvice: 'Phòng đẹp, cân đối, có ban công nhìn cây xanh', luckyDirection: 'Hướng Tây Bắc', luckyFloor: 'Tầng chẵn',
        compatibility: ['Song Tử', 'Bảo Bình', 'Sư Tử'], warning: 'Đừng do dự quá lâu — phòng tốt hết nhanh'
    },
    {
        name: 'Bọ Cạp (Scorpio)', emoji: '♏', color: '#8b5cf6', dateRange: '23/10 - 21/11', element: 'Thủy 💧',
        personality: ['Mạnh mẽ, quyết đoán, bí ẩn', 'Trực giác sắc bén, đam mê', 'Hay nghi ngờ và ghen tuông'],
        roomAdvice: 'Phòng riêng tư, cách âm tốt, an ninh cao', luckyDirection: 'Hướng Bắc', luckyFloor: 'Tầng 7-8',
        compatibility: ['Cự Giải', 'Song Ngư', 'Xử Nữ'], warning: 'Kiểm tra an ninh khu vực kỹ lưỡng'
    },
    {
        name: 'Nhân Mã (Sagittarius)', emoji: '♐', color: '#6366f1', dateRange: '22/11 - 21/12', element: 'Hỏa 🔥',
        personality: ['Lạc quan, phiêu lưu, tự do', 'Thẳng thắn, yêu triết học', 'Thiếu kiên nhẫn, hay hứa suông'],
        roomAdvice: 'Phòng ngắn hạn, gần sân bay/bến xe, tối giản', luckyDirection: 'Hướng Đông Nam', luckyFloor: 'Tầng 5-9',
        compatibility: ['Bạch Dương', 'Sư Tử', 'Bảo Bình'], warning: 'Thuê ngắn hạn phù hợp hơn dài hạn'
    },
    {
        name: 'Ma Kết (Capricorn)', emoji: '♑', color: '#0ea5e9', dateRange: '22/12 - 19/1', element: 'Thổ 🌍',
        personality: ['Tham vọng, kỷ luật, kiên trì', 'Thực tế, biết quản lý tài chính', 'Cứng nhắc, ít thể hiện cảm xúc'],
        roomAdvice: 'Căn hộ chất lượng, gần chỗ làm, đầu tư dài hạn', luckyDirection: 'Hướng Nam', luckyFloor: 'Tầng 1-4',
        compatibility: ['Kim Ngưu', 'Xử Nữ', 'Bọ Cạp'], warning: 'Cân nhắc MUA thay vì thuê nếu có khả năng'
    },
    {
        name: 'Bảo Bình (Aquarius)', emoji: '♒', color: '#06b6d4', dateRange: '20/1 - 18/2', element: 'Phong 🌬️',
        personality: ['Sáng tạo, độc lập, nhân đạo', 'Tư duy đột phá, yêu công nghệ', 'Lập dị, khó gần'],
        roomAdvice: 'Smart home, co-living sáng tạo, khu startup', luckyDirection: 'Hướng Đông', luckyFloor: 'Tầng 11+',
        compatibility: ['Song Tử', 'Thiên Bình', 'Nhân Mã'], warning: 'Chọn nơi có cộng đồng sáng tạo'
    },
    {
        name: 'Song Ngư (Pisces)', emoji: '♓', color: '#a855f7', dateRange: '19/2 - 20/3', element: 'Thủy 💧',
        personality: ['Mơ mộng, giàu cảm xúc, nghệ sĩ', 'Trực giác siêu mạnh, đồng cảm', 'Hay trốn tránh thực tế'],
        roomAdvice: 'Phòng gần nước (hồ/sông), yên tĩnh, có góc nghệ thuật', luckyDirection: 'Hướng Tây Bắc', luckyFloor: 'Tầng cao, view đẹp',
        compatibility: ['Cự Giải', 'Bọ Cạp', 'Kim Ngưu'], warning: 'Cần nơi yên tĩnh để tái tạo năng lượng'
    },
];

export const CHI_ZODIAC: { name: string; emoji: string; years: string; element: string; personality: string; roomTip: string }[] = [
    { name: 'Tý (Chuột)', emoji: '🐭', years: '...2008, 2020, 2032', element: 'Thủy', personality: 'Thông minh, nhanh nhẹn, tiết kiệm', roomTip: 'Phòng nhỏ gọn, tiện nghi, giá hợp lý' },
    { name: 'Sửu (Trâu)', emoji: '🐂', years: '...2009, 2021, 2033', element: 'Thổ', personality: 'Kiên nhẫn, chăm chỉ, đáng tin', roomTip: 'Phòng chắc chắn, tầng thấp, gần đất' },
    { name: 'Dần (Hổ)', emoji: '🐯', years: '...2010, 2022, 2034', element: 'Mộc', personality: 'Dũng cảm, tự tin, thích độc lập', roomTip: 'Phòng rộng, tầng cao, view rừng/núi' },
    { name: 'Mão (Mèo)', emoji: '🐱', years: '...2011, 2023, 2035', element: 'Mộc', personality: 'Khéo léo, nhạy cảm, yêu cái đẹp', roomTip: 'Phòng ấm cúng, trang trí đẹp, yên tĩnh' },
    { name: 'Thìn (Rồng)', emoji: '🐉', years: '...2012, 2024, 2036', element: 'Thổ', personality: 'Mạnh mẽ, tham vọng, may mắn', roomTip: 'Penthouse, căn góc, vị trí đắc địa' },
    { name: 'Tỵ (Rắn)', emoji: '🐍', years: '...2013, 2025, 2037', element: 'Hỏa', personality: 'Thông thái, bí ẩn, trực giác mạnh', roomTip: 'Phòng kín đáo, an ninh tốt, yên tĩnh' },
    { name: 'Ngọ (Ngựa)', emoji: '🐴', years: '...2014, 2026, 2038', element: 'Hỏa', personality: 'Năng động, tự do, lạc quan', roomTip: 'Gần trung tâm, giao thông thuận tiện' },
    { name: 'Mùi (Dê)', emoji: '🐐', years: '...2015, 2027, 2039', element: 'Thổ', personality: 'Hiền lành, nghệ sĩ, yêu hòa bình', roomTip: 'Phòng có vườn/cây xanh, view thiên nhiên' },
    { name: 'Thân (Khỉ)', emoji: '🐵', years: '...2016, 2028, 2040', element: 'Kim', personality: 'Thông minh, linh hoạt, hài hước', roomTip: 'Co-living, gần cộng đồng trẻ, sáng tạo' },
    { name: 'Dậu (Gà)', emoji: '🐔', years: '...2017, 2029, 2041', element: 'Kim', personality: 'Chính xác, có tổ chức, đúng giờ', roomTip: 'Phòng ngăn nắp, gần chỗ làm, tiện nghi đầy đủ' },
    { name: 'Tuất (Chó)', emoji: '🐕', years: '...2018, 2030, 2042', element: 'Thổ', personality: 'Trung thành, dũng cảm, bảo vệ', roomTip: 'Phòng an ninh tốt, gần gia đình, khu dân cư tốt' },
    { name: 'Hợi (Lợn)', emoji: '🐷', years: '...2019, 2031, 2043', element: 'Thủy', personality: 'Hào phóng, vui vẻ, chân thật', roomTip: 'Phòng thoải mái, rộng rãi, có bếp nấu ăn' },
];

export function getWesternZodiac(day: number, month: number): ZodiacInfo {
    const idx = [
        month === 3 && day >= 21 || month === 4 && day <= 19 ? 0 : -1,
        month === 4 && day >= 20 || month === 5 && day <= 20 ? 1 : -1,
        month === 5 && day >= 21 || month === 6 && day <= 20 ? 2 : -1,
        month === 6 && day >= 21 || month === 7 && day <= 22 ? 3 : -1,
        month === 7 && day >= 23 || month === 8 && day <= 22 ? 4 : -1,
        month === 8 && day >= 23 || month === 9 && day <= 22 ? 5 : -1,
        month === 9 && day >= 23 || month === 10 && day <= 22 ? 6 : -1,
        month === 10 && day >= 23 || month === 11 && day <= 21 ? 7 : -1,
        month === 11 && day >= 22 || month === 12 && day <= 21 ? 8 : -1,
        month === 12 && day >= 22 || month === 1 && day <= 19 ? 9 : -1,
        month === 1 && day >= 20 || month === 2 && day <= 18 ? 10 : -1,
        month === 2 && day >= 19 || month === 3 && day <= 20 ? 11 : -1,
    ].find(i => i >= 0);
    return WESTERN_ZODIAC[idx ?? 0];
}

export function getChiZodiac(year: number) {
    const animals = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];
    const idx = year % 12;
    return CHI_ZODIAC[animals.indexOf(CHI_ZODIAC[idx >= 0 ? idx : 0]?.name.split(' ')[0]) >= 0 ? idx : idx];
}
