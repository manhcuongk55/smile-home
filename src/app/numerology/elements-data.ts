export interface FiveElement {
    name: string; emoji: string; color: string; gradient: string;
    traits: string[];
    produces: string; destroys: string; weakAgainst: string;
    roomColors: string[]; materials: string[];
    directions: string[];
    roomAdvice: string;
}

export const ELEMENTS: Record<string, FiveElement> = {
    'Kim': {
        name: 'Kim (Metal)', emoji: '⚔️', color: '#94a3b8', gradient: 'linear-gradient(135deg, #94a3b8, #e2e8f0)',
        traits: ['Quyết đoán', 'Kỷ luật', 'Công bằng', 'Cứng rắn'],
        produces: 'Thủy', destroys: 'Mộc', weakAgainst: 'Hỏa',
        roomColors: ['Trắng', 'Bạc', 'Xám', 'Vàng nhạt'], materials: ['Kim loại', 'Inox', 'Kính', 'Đá trắng'],
        directions: ['Tây', 'Tây Bắc'], roomAdvice: 'Phòng tối giản, sạch sẽ, nội thất kim loại/kính. Tránh quá nhiều cây xanh.'
    },
    'Mộc': {
        name: 'Mộc (Wood)', emoji: '🌳', color: '#22c55e', gradient: 'linear-gradient(135deg, #22c55e, #86efac)',
        traits: ['Sáng tạo', 'Phát triển', 'Linh hoạt', 'Nhân ái'],
        produces: 'Hỏa', destroys: 'Thổ', weakAgainst: 'Kim',
        roomColors: ['Xanh lá', 'Nâu gỗ', 'Xanh ngọc'], materials: ['Gỗ tự nhiên', 'Tre', 'Mây', 'Cây xanh sống'],
        directions: ['Đông', 'Đông Nam'], roomAdvice: 'Phòng nhiều cây xanh, nội thất gỗ, ánh sáng tự nhiên. Tránh nhiều kim loại.'
    },
    'Thủy': {
        name: 'Thủy (Water)', emoji: '💧', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #93c5fd)',
        traits: ['Thông minh', 'Linh hoạt', 'Sâu sắc', 'Bí ẩn'],
        produces: 'Mộc', destroys: 'Hỏa', weakAgainst: 'Thổ',
        roomColors: ['Xanh dương', 'Đen', 'Xanh navy'], materials: ['Kính', 'Gương', 'Bể cá', 'Đài phun nước mini'],
        directions: ['Bắc'], roomAdvice: 'Phòng có yếu tố nước (bể cá, đài phun), gương lớn, màu tối. Tránh quá nhiều đất/gốm.'
    },
    'Hỏa': {
        name: 'Hỏa (Fire)', emoji: '🔥', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #fca5a5)',
        traits: ['Nhiệt huyết', 'Quyết đoán', 'Sáng tạo', 'Nóng nảy'],
        produces: 'Thổ', destroys: 'Kim', weakAgainst: 'Thủy',
        roomColors: ['Đỏ', 'Cam', 'Hồng', 'Tím'], materials: ['Nến', 'Đèn ấm', 'Da', 'Vải đỏ'],
        directions: ['Nam'], roomAdvice: 'Phòng hướng Nam, ánh sáng ấm, nến thơm, tông màu ấm. Tránh quá nhiều nước/gương.'
    },
    'Thổ': {
        name: 'Thổ (Earth)', emoji: '🌍', color: '#eab308', gradient: 'linear-gradient(135deg, #eab308, #fde047)',
        traits: ['Ổn định', 'Trung thực', 'Kiên nhẫn', 'Bảo thủ'],
        produces: 'Kim', destroys: 'Thủy', weakAgainst: 'Mộc',
        roomColors: ['Vàng', 'Nâu đất', 'Be', 'Cam đất'], materials: ['Gốm', 'Đá', 'Gạch', 'Pha lê'],
        directions: ['Trung tâm', 'Tây Nam', 'Đông Bắc'], roomAdvice: 'Phòng vuông vắn, nền đá/gạch, gốm sứ trang trí. Tránh quá nhiều cây xanh lớn.'
    },
};

export function getElementFromYear(year: number): string {
    const heavenlyStems = ['Kim', 'Kim', 'Thủy', 'Thủy', 'Mộc', 'Mộc', 'Hỏa', 'Hỏa', 'Thổ', 'Thổ'];
    return heavenlyStems[year % 10];
}

export function getElementRelation(el1: string, el2: string): { relation: string; emoji: string; color: string; detail: string } {
    const e = ELEMENTS[el1];
    if (!e) return { relation: 'Không xác định', emoji: '❓', color: '#94a3b8', detail: '' };
    if (el1 === el2) return { relation: 'Bình hòa', emoji: '☯️', color: '#eab308', detail: `${el1} gặp ${el2}: năng lượng cùng loại, trung hòa ổn định.` };
    if (e.produces === el2) return { relation: 'Tương sinh (bạn sinh ra)', emoji: '💚', color: '#22c55e', detail: `${el1} sinh ${el2}: bạn nuôi dưỡng đối phương, mối quan hệ cho đi.` };
    if (e.destroys === el2) return { relation: 'Tương khắc (bạn khắc)', emoji: '⚡', color: '#f97316', detail: `${el1} khắc ${el2}: bạn chi phối, cẩn thận xung đột.` };
    if (e.weakAgainst === el2) return { relation: 'Bị khắc', emoji: '🛡️', color: '#ef4444', detail: `${el2} khắc ${el1}: đối phương chi phối bạn, cần cân bằng.` };
    const other = ELEMENTS[el2];
    if (other?.produces === el1) return { relation: 'Được sinh', emoji: '💜', color: '#8b5cf6', detail: `${el2} sinh ${el1}: bạn được nuôi dưỡng, mối quan hệ nhận lại.` };
    return { relation: 'Trung tính', emoji: '⚪', color: '#94a3b8', detail: 'Không có tương tác trực tiếp.' };
}
