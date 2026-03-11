'use client';

import { useState } from 'react';

interface NumInfo {
    title: string; emoji: string; color: string;
    personality: string[];
    strengths: string[];
    weaknesses: string[];
    roomDetail: { type: string; why: string; direction: string; avoid: string };
    floorDetail: { best: string; why: string };
    fengshui: { element: string; colors: string[]; material: string };
    compatibility: { best: number[]; ok: number[]; avoid: number[] };
    career: string[];
    relationship: string;
    luckyDay: string;
    warning: string;
}

const DATA: Record<number, NumInfo> = {
    1: {
        title: 'Người tiên phong', emoji: '🔥', color: '#ef4444',
        personality: ['Bạn là người lãnh đạo bẩm sinh, luôn muốn đi đầu và tự quyết định mọi thứ', 'Độc lập cao — không thích bị ràng buộc hay phụ thuộc vào ai', 'Tư duy sáng tạo, dám nghĩ dám làm, sẵn sàng chấp nhận rủi ro', 'Có xu hướng cố chấp và khó chấp nhận ý kiến trái chiều'],
        strengths: ['Quyết đoán và hành động nhanh', 'Tự tin trong mọi tình huống', 'Khả năng khởi nghiệp và dẫn dắt xuất sắc'],
        weaknesses: ['Dễ kiêu ngạo hoặc bỏ qua cảm xúc người khác', 'Khó làm việc nhóm vì muốn kiểm soát', 'Thiếu kiên nhẫn với tiến trình chậm'],
        roomDetail: { type: 'Studio riêng biệt hoặc căn góc biệt lập', why: 'Bạn cần không gian 100% riêng tư để tập trung sáng tạo — không chia sẻ, không bị quấy rầy. Phòng mở layout thoáng rộng giúp tư duy bay bổng.', direction: 'Hướng Đông hoặc Đông Nam — đón năng lượng mặt trời buổi sáng, khởi đầu mới', avoid: 'Tránh phòng giữa dãy, phòng kẹp giữa 2 phòng khác, phòng không có cửa sổ' },
        floorDetail: { best: 'Tầng cao nhất hoặc tầng thượng', why: 'Bạn cần vị trí "trên đỉnh" — tầm nhìn rộng, không bị ai bên trên. Penthouse là lý tưởng nhất.' },
        fengshui: { element: 'Hỏa (🔥)', colors: ['Đỏ', 'Cam', 'Vàng gold'], material: 'Gỗ sáng màu, kim loại mạ vàng' },
        compatibility: { best: [3, 5, 9], ok: [2, 6], avoid: [4, 8] },
        career: ['CEO/Founder', 'Kiến trúc sư', 'Đạo diễn', 'Nhà đầu tư BĐS'],
        relationship: 'Cần đối tác tôn trọng sự độc lập. Số 3 và 5 hợp nhất — đủ tự do cho cả hai.',
        luckyDay: 'Chủ nhật, Thứ 3',
        warning: 'Đừng chọn phòng chỉ vì nó đắt nhất — hãy chọn vì nó cho bạn cảm giác "đây là lãnh thổ của mình".',
    },
    2: {
        title: 'Người hòa hợp', emoji: '🌙', color: '#f97316',
        personality: ['Bạn nhạy cảm, thấu hiểu cảm xúc người khác rất tốt', 'Luôn tìm kiếm sự hài hòa, tránh xung đột bằng mọi giá', 'Là người lắng nghe tuyệt vời — bạn bè thường tâm sự với bạn', 'Có xu hướng phụ thuộc cảm xúc vào người khác quá nhiều'],
        strengths: ['Khả năng hợp tác và làm việc nhóm tốt nhất', 'Trực giác mạnh về con người', 'Kiên nhẫn và biết chờ đợi thời cơ'],
        weaknesses: ['Khó đưa ra quyết định vì sợ làm mất lòng', 'Dễ bị tổn thương bởi lời nói', 'Hay hy sinh bản thân quá mức'],
        roomDetail: { type: 'Căn hộ đôi hoặc phòng có 2 không gian (ngủ + sinh hoạt)', why: 'Bạn cần cảm giác "chia sẻ" — phòng quá lớn một mình khiến bạn cô đơn. 2 không gian tách biệt giúp cân bằng riêng tư và kết nối.', direction: 'Hướng Bắc hoặc Tây Bắc — năng lượng âm, dịu nhẹ, thư thái', avoid: 'Tránh phòng sát đường lớn (ồn ào), phòng cuối hành lang tối (cảm giác bị bỏ rơi)' },
        floorDetail: { best: 'Tầng 2, tầng 4, hoặc tầng giữa tòa nhà', why: 'Vị trí "giữa" là nơi bạn cảm thấy an toàn nhất — không quá cao (cô lập), không quá thấp (ồn).' },
        fengshui: { element: 'Thủy (💧)', colors: ['Xanh dương nhạt', 'Trắng', 'Bạc'], material: 'Gương, kính, vật liệu phản chiếu nhẹ' },
        compatibility: { best: [4, 6, 8], ok: [1, 9], avoid: [5, 7] },
        career: ['Tư vấn viên', 'Nhân viên xã hội', 'Nhà trung gian BĐS', 'Y tá/Bác sĩ'],
        relationship: 'Cần người ổn định, đáng tin cậy. Số 4 và 6 là match hoàn hảo — cho bạn cảm giác an toàn.',
        luckyDay: 'Thứ 2, Thứ 6',
        warning: 'Đừng chọn phòng chỉ vì bạn bè/người yêu thích — hãy hỏi "MÌNH có thấy bình yên ở đây không?"',
    },
    3: {
        title: 'Người biểu đạt', emoji: '🎨', color: '#eab308',
        personality: ['Bạn là người sáng tạo, lạc quan, luôn mang năng lượng tích cực cho mọi người', 'Giao tiếp giỏi — có thể nói chuyện với bất kỳ ai, ở bất kỳ đâu', 'Hay mơ mộng và có trí tưởng tượng phong phú', 'Dễ chán, hay nhảy việc và thay đổi kế hoạch'],
        strengths: ['Khả năng truyền cảm hứng xuất sắc', 'Sáng tạo và nghệ thuật trong mọi lĩnh vực', 'Luôn tìm ra cách biến khó khăn thành câu chuyện vui'],
        weaknesses: ['Khó tập trung lâu vào một việc', 'Tiêu tiền không kiểm soát', 'Hay hứa quá nhiều, làm không hết'],
        roomDetail: { type: 'Phòng rộng, trần cao, có ban công và tường trắng/sáng', why: 'Bạn sáng tạo nhất trong không gian mở, nhiều ánh sáng. Tường sáng = canvas cho trí tưởng tượng. Ban công = nơi ngắm trời và mơ mộng.', direction: 'Hướng Nam hoặc Đông Nam — ánh sáng rực rỡ, năng lượng sáng tạo', avoid: 'Tránh phòng tầng hầm, phòng tối, phòng chật và bức bí' },
        floorDetail: { best: 'Tầng 3, tầng 6, hoặc tầng có view (tầng cao)', why: 'Tầng 3 là con số cộng hưởng. View đẹp = cảm hứng. Bạn sáng tạo tốt khi nhìn thấy bầu trời.' },
        fengshui: { element: 'Mộc (🌳)', colors: ['Vàng', 'Cam', 'Xanh lá nhạt'], material: 'Gỗ tự nhiên, cây xanh, vải cotton' },
        compatibility: { best: [1, 5, 9], ok: [3, 6], avoid: [4, 7] },
        career: ['Họa sĩ/Designer', 'Content Creator', 'MC/Diễn giả', 'Marketing BĐS'],
        relationship: 'Cần người hiểu và ủng hộ sự sáng tạo. Số 1 dẫn dắt, số 5 cùng phiêu lưu.',
        luckyDay: 'Thứ 4, Thứ 7',
        warning: 'Đừng thuê phòng rẻ nhất — không gian xấu giết chết sáng tạo. Đầu tư vào nơi ở = đầu tư vào cảm hứng.',
    },
    4: {
        title: 'Người xây dựng', emoji: '🏗️', color: '#22c55e',
        personality: ['Bạn thực tế, có tổ chức, luôn lên kế hoạch trước khi hành động', 'Đáng tin cậy — khi đã hứa là làm, không bao giờ bỏ cuộc giữa chừng', 'Tiết kiệm, biết quản lý tài chính tốt', 'Cứng nhắc, khó thích ứng với thay đổi bất ngờ'],
        strengths: ['Kỷ luật và kiên trì bậc nhất', 'Xây dựng nền tảng vững chắc cho mọi thứ', 'Quản lý tài chính cá nhân xuất sắc'],
        weaknesses: ['Quá cầu toàn, hay căng thẳng', 'Khó chấp nhận cách làm khác mình', 'Thiếu linh hoạt trong các mối quan hệ'],
        roomDetail: { type: 'Phòng hình vuông, bố cục rõ ràng, có phòng bếp riêng', why: 'Bạn ghét sự lộn xộn. Phòng vuông = ổn định. Bố cục rõ = mỗi thứ đúng chỗ. Bếp riêng = tự nấu, tiết kiệm, kiểm soát.', direction: 'Hướng Tây hoặc Tây Nam — năng lượng đất, ổn định vững vàng', avoid: 'Tránh phòng hình dạng bất thường, phòng concept loft mở, phòng không có tủ/kệ' },
        floorDetail: { best: 'Tầng 1-4 (tầng thấp, gần mặt đất)', why: 'Bạn cần cảm giác "chạm đất" — nền tảng vững. Tầng thấp thực tế hơn: ra vào dễ, không phụ thuộc thang máy.' },
        fengshui: { element: 'Thổ (🌍)', colors: ['Nâu đất', 'Be', 'Xanh rêu'], material: 'Đá, gạch, gốm sứ, gỗ nặng' },
        compatibility: { best: [2, 6, 8], ok: [4, 7], avoid: [1, 3, 5] },
        career: ['Kỹ sư xây dựng', 'Kế toán', 'Quản lý dự án BĐS', 'Kiến trúc sư'],
        relationship: 'Cần người chu đáo, ổn định. Số 2 và 6 cho bạn mái ấm bạn luôn mong muốn.',
        luckyDay: 'Thứ 5, Thứ 7',
        warning: 'Đừng chọn phòng rẻ mà chất lượng kém — bạn sẽ tốn nhiều hơn để sửa chữa. Đầu tư đúng ngay từ đầu.',
    },
    5: {
        title: 'Người tự do', emoji: '🌊', color: '#3b82f6',
        personality: ['Bạn yêu tự do hơn bất cứ thứ gì — ghét bị trói buộc', 'Tò mò, phiêu lưu, luôn muốn trải nghiệm điều mới', 'Có sức hút tự nhiên, dễ kết bạn và giao tiếp đa văn hóa', 'Thiếu cam kết, hay thay đổi ý kiến, khó gắn bó lâu dài'],
        strengths: ['Thích nghi nhanh với bất kỳ môi trường nào', 'Đa tài, biết nhiều thứ ở nhiều lĩnh vực', 'Năng lượng tích cực, vui vẻ bẩm sinh'],
        weaknesses: ['Không thích ràng buộc, khó ký hợp đồng dài', 'Dễ bị cám dỗ và mất kiểm soát', 'Thiếu kiên nhẫn với công việc lặp lại'],
        roomDetail: { type: 'Sleepbox, phòng trọ ngắn hạn, hoặc căn hộ tối giản (minimalist)', why: 'Bạn không cần nhiều đồ. Gọn nhẹ = tự do. Thuê ngắn hạn = muốn đổi lúc nào cũng được. Sleepbox hoàn hảo cho lối sống di chuyển.', direction: 'BẤT KỲ — miễn gần trung tâm hoặc giao thông thuận tiện', avoid: 'Tránh ký HĐ 12 tháng, phòng cách xa trung tâm, khu quá yên tĩnh' },
        floorDetail: { best: 'Tầng 5 hoặc bất kỳ tầng nào — thay đổi tầng mỗi lần thuê mới', why: 'Bạn cần sự mới mẻ. Đừng trung thành với một tầng.' },
        fengshui: { element: 'Kim (⚡)', colors: ['Xanh biển', 'Trắng', 'Xám bạc'], material: 'Kim loại, kính, inox — hiện đại tối giản' },
        compatibility: { best: [1, 3, 7], ok: [5, 9], avoid: [2, 4, 6] },
        career: ['Travel blogger', 'Sale BĐS', 'Freelancer', 'Hướng dẫn viên du lịch'],
        relationship: 'Khó gắn bó lâu. Số 1 hiểu sự tự do, số 3 cùng phiêu lưu. Tránh số 4 (quá nghiêm túc).',
        luckyDay: 'Thứ 4, Thứ 6',
        warning: 'Tiết kiệm 1 tháng tiền thuê dự phòng — lối sống tự do cần "quỹ tự do" đi kèm.',
    },
    6: {
        title: 'Người chăm sóc', emoji: '💝', color: '#ec4899',
        personality: ['Bạn yêu thương, luôn đặt gia đình và người thân lên hàng đầu', 'Có bản năng bảo vệ và chăm sóc mạnh mẽ', 'Tạo không gian ấm cúng ở bất cứ đâu bạn sống', 'Hay lo lắng quá mức, dễ bị lợi dụng lòng tốt'],
        strengths: ['Tạo "nhà" từ bất kỳ không gian nào', 'Giải quyết xung đột giỏi, giữ hòa khí', 'Biết chăm sóc bản thân và người khác'],
        weaknesses: ['Hy sinh bản thân quá nhiều cho người khác', 'Khó nói "không"', 'Dễ kiểm soát người khác vì muốn bảo vệ'],
        roomDetail: { type: 'Căn hộ có bếp, phòng khách chung, hoặc phòng gia đình rộng', why: 'Nấu ăn = tình yêu của bạn. Phòng khách = nơi sum họp. Bạn biến phòng thuê thành "mái nhà thực sự".', direction: 'Hướng Tây Nam hoặc Nam — năng lượng gia đình, ấm áp', avoid: 'Tránh phòng studio tối giản (cảm giác lạnh lẽo), phòng không có bếp' },
        floorDetail: { best: 'Tầng 1-3 (tầng thấp)', why: 'Gần gũi mặt đất, dễ di chuyển, an toàn cho gia đình. Gần khu tiện ích chung.' },
        fengshui: { element: 'Thổ (🌍)', colors: ['Hồng pastel', 'Be kem', 'Xanh mint'], material: 'Vải mềm, gỗ ấm, gốm men trắng' },
        compatibility: { best: [2, 4, 9], ok: [6, 8], avoid: [1, 5, 7] },
        career: ['Quản lý KTX/nhà trọ', 'Đầu bếp', 'Giáo viên', 'Nhân viên chăm sóc khách hàng'],
        relationship: 'Bạn là đối tác lý tưởng. Số 2 cùng xây tổ ấm, số 9 cùng yêu thương cộng đồng.',
        luckyDay: 'Thứ 6, Chủ nhật',
        warning: 'Đừng chọn phòng CHỈ vì "gần chỗ làm" — hãy hỏi "nơi này có khiến mình muốn nấu bữa tối không?"',
    },
    7: {
        title: 'Người tìm kiếm', emoji: '🔮', color: '#8b5cf6',
        personality: ['Bạn sống nội tâm, luôn tìm kiếm ý nghĩa sâu xa trong mọi thứ', 'Trí tuệ sắc bén, phân tích logic giỏi, nhưng cũng rất tâm linh', 'Cần nhiều thời gian một mình để suy nghĩ và "sạc năng lượng"', 'Có thể bị coi là lạnh lùng, khép kín, hoặc quá bí ẩn'],
        strengths: ['Chiều sâu tư duy và phân tích vượt trội', 'Khả năng nghiên cứu, tìm sự thật', 'Trực giác mạnh — thường đúng về người khác'],
        weaknesses: ['Khó tin tưởng người khác', 'Cô đơn vì tự cô lập mình', 'Quá suy nghĩ, hay trì hoãn hành động'],
        roomDetail: { type: 'Phòng yên tĩnh ở góc yên tĩnh nhất tòa nhà, có giá sách', why: 'Im lặng = năng lượng của bạn. Giá sách = thế giới nội tâm. Bạn cần nơi "ẩn náu" khỏi thế giới bên ngoài để tái tạo.', direction: 'Hướng Bắc — năng lượng tĩnh lặng, sâu sắc, tập trung', avoid: 'Tránh phòng gần thang máy/hành lang đông, phòng có tường mỏng nghe tiếng hàng xóm' },
        floorDetail: { best: 'Tầng 7 hoặc tầng cao yên tĩnh', why: 'Tầng 7 cộng hưởng trực giác. Tầng cao = ít tiếng ồn, ít người qua lại.' },
        fengshui: { element: 'Thủy (💧)', colors: ['Tím', 'Xanh đậm', 'Trắng đục'], material: 'Đá tự nhiên, pha lê, gỗ tối' },
        compatibility: { best: [5, 7, 3], ok: [1, 9], avoid: [2, 6, 8] },
        career: ['Nhà nghiên cứu', 'Lập trình viên', 'Nhà tâm lý học', 'Phân tích dữ liệu BĐS'],
        relationship: 'Khó mở lòng. Cần thời gian lâu để tin ai. Số 5 kéo bạn ra ngoài, số 3 làm bạn cười.',
        luckyDay: 'Thứ 2, Thứ 7',
        warning: 'Đừng chọn phòng rẻ ở khu ồn để "tiết kiệm" — tiết kiệm sai chỗ = mất giấc ngủ = mất sức khỏe tinh thần.',
    },
    8: {
        title: 'Người quyền lực', emoji: '👑', color: '#0ea5e9',
        personality: ['Bạn tham vọng, hướng tới thành công và quyền lực tài chính', 'Có bản năng kinh doanh mạnh — nhìn đâu cũng thấy cơ hội', 'Kỷ luật bản thân cao, chịu được áp lực lớn', 'Có xu hướng tham công tiếc việc, bỏ quên sức khỏe và cảm xúc'],
        strengths: ['Khả năng kiếm tiền và quản lý tài chính top 1', 'Tầm nhìn chiến lược xa', 'Tạo ảnh hưởng lớn trong tổ chức'],
        weaknesses: ['Work-life balance kém', 'Hay đo lường mọi thứ bằng tiền', 'Khó thể hiện cảm xúc yêu thương'],
        roomDetail: { type: 'Penthouse, phòng VIP, hoặc căn hộ có phòng làm việc riêng', why: 'Bạn cần nơi "xứng tầm" — phòng xấu ảnh hưởng tâm lý khi bạn về nhà. Phòng làm việc riêng vì bạn hay mang việc về.', direction: 'Hướng Đông Nam — năng lượng thịnh vượng, phát triển tài chính', avoid: 'Tránh phòng cũ/xuống cấp, khu vực kém an ninh, phòng chung/chia sẻ' },
        floorDetail: { best: 'Tầng 8 hoặc tầng cao nhất', why: 'Số 8 là con số thịnh vượng trong phong thủy. Tầng cao = tầm nhìn chiến lược.' },
        fengshui: { element: 'Thổ + Kim (💰)', colors: ['Vàng gold', 'Đen', 'Xanh navy'], material: 'Da, mạ vàng, gỗ sẫm cao cấp' },
        compatibility: { best: [2, 4, 6], ok: [8], avoid: [1, 3, 5, 7] },
        career: ['Giám đốc', 'Nhà đầu tư BĐS', 'Ngân hàng', 'Luật sư doanh nghiệp'],
        relationship: 'Cần người hiểu bạn bận. Số 2 và 6 lo liệu gia đình khi bạn chinh chiến.',
        luckyDay: 'Thứ 3, Thứ 5',
        warning: 'Phòng đẹp nhưng quá tải tài chính = áp lực thêm. Chọn phòng tốt nhất TRONG ngân sách cho phép.',
    },
    9: {
        title: 'Người nhân ái', emoji: '🌍', color: '#14b8a6',
        personality: ['Bạn sống vì lý tưởng, luôn muốn giúp đỡ cộng đồng và thế giới', 'Bao dung, rộng lượng — sẵn sàng cho đi mà không cần nhận lại', 'Sáng tạo, nghệ sĩ trong tâm hồn, yêu cái đẹp', 'Dễ thất vọng khi thế giới không như mình mong đợi'],
        strengths: ['Khả năng kết nối cộng đồng xuất sắc', 'Tầm nhìn rộng, lý tưởng cao', 'Truyền cảm hứng cho người khác sống tốt hơn'],
        weaknesses: ['Quá lý tưởng, đôi khi xa rời thực tế', 'Hay cho đi quá nhiều, quên chăm sóc bản thân', 'Khó buông bỏ quá khứ'],
        roomDetail: { type: 'Phòng thoáng view công viên/cây xanh, hoặc căn hộ gần khu cộng đồng', why: 'Bạn cần kết nối tự nhiên (cây cối, ánh sáng tự nhiên) và kết nối con người (hàng xóm thân thiện, common area).', direction: 'Hướng Đông hoặc Bắc — năng lượng nhân ái, kết nối', avoid: 'Tránh phòng biệt lập hoàn toàn, khu vực không có cộng đồng' },
        floorDetail: { best: 'Tầng cao có view rộng', why: 'Tầm nhìn rộng = trái tim rộng. Bạn cần nhìn thấy thế giới bên ngoài mỗi ngày.' },
        fengshui: { element: 'Hỏa + Mộc (🌿🔥)', colors: ['Đỏ hồng', 'Xanh lá', 'Tím nhẹ'], material: 'Gỗ tự nhiên, đá, cây xanh sống' },
        compatibility: { best: [1, 3, 6], ok: [2, 9], avoid: [4, 5, 8] },
        career: ['Nhà hoạt động xã hội', 'Kiến trúc sư xanh', 'Tình nguyện viên', 'Giáo viên yoga/thiền'],
        relationship: 'Yêu cả thế giới nhưng hay quên người bên cạnh. Số 6 giúp bạn "về nhà" thay vì "đi cứu thế giới".',
        luckyDay: 'Thứ 3, Thứ 6',
        warning: 'Chọn nơi có cộng đồng tốt quan trọng hơn phòng đẹp. Hàng xóm thân thiện = bạn sẽ Smile mỗi ngày.',
    },
    11: {
        title: 'Bậc thầy trực giác', emoji: '✨', color: '#a855f7',
        personality: ['Bạn mang năng lượng đặc biệt — Master Number 11 = trực giác siêu phàm', 'Truyền cảm hứng bẩm sinh, có khả năng chữa lành tinh thần cho người khác', 'Nhạy cảm gấp đôi số 2, cảm nhận năng lượng không gian rất mạnh', 'Dễ bị quá tải cảm xúc, anxiety cao khi ở môi trường năng lượng xấu'],
        strengths: ['Trực giác mạnh nhất trong 11 số', 'Khả năng truyền cảm hứng và lãnh đạo tinh thần', 'Nhìn thấy tiềm năng ở nơi người khác bỏ qua'],
        weaknesses: ['Lo lắng và căng thẳng thường xuyên', 'Quá nhạy cảm với năng lượng xung quanh', 'Kỳ vọng bản thân quá cao'],
        roomDetail: { type: 'Phòng yên tĩnh, thiên nhiên, có góc thiền/yoga', why: 'Năng lượng bạn rất đặc biệt — bạn CẢM NHẬN được phòng "hợp" hay "không hợp" ngay khi bước vào. Tin vào cảm nhận đầu tiên.', direction: 'Hướng Đông — ánh sáng tinh khiết buổi sáng kích hoạt trực giác', avoid: 'Tránh phòng có lịch sử xấu (tranh chấp, xung đột), phòng gần khu ồn ào' },
        floorDetail: { best: 'Tầng 11 hoặc tầng thượng gần bầu trời', why: 'Bạn cần kết nối "trên cao" — gần bầu trời. Tầng 11 = số thầy của bạn.' },
        fengshui: { element: 'Phong (🌬️)', colors: ['Tím lavender', 'Trắng ngà', 'Bạc ánh'], material: 'Pha lê, vải lụa, gỗ nhẹ' },
        compatibility: { best: [2, 6, 9], ok: [7, 11], avoid: [4, 5, 8] },
        career: ['Life Coach', 'Nhà trị liệu', 'Nghệ sĩ', 'Cố vấn tâm linh'],
        relationship: 'Cần người "hiểu mà không cần nói". Số 2 và 6 cho bạn sự an toàn tinh thần.',
        luckyDay: 'Ngày 11 và 22 hàng tháng',
        warning: 'HÃY ĐI XEM PHÒNG TRỰC TIẾP — đừng chọn qua ảnh. Bạn cần CẢM NHẬN năng lượng bằng trực giác.',
    },
    22: {
        title: 'Bậc thầy xây dựng', emoji: '🏛️', color: '#d946ef',
        personality: ['Master Number 22 — số hiếm nhất, mạnh nhất trong thần số học', 'Bạn có tầm nhìn lớn VÀ khả năng biến giấc mơ thành hiện thực', 'Kết hợp trực giác của 11 với thực tế của 4 — "visionary builder"', 'Áp lực nội tại cực lớn vì luôn thấy mình chưa đủ tốt'],
        strengths: ['Khả năng xây dựng đế chế từ con số 0', 'Tầm nhìn chiến lược dài hạn nhất', 'Biến ý tưởng điên rồ thành công trình cụ thể'],
        weaknesses: ['Áp lực bản thân quá lớn, dễ burn-out', 'Khó hài lòng với kết quả đạt được', 'Hay kiểm soát quá mức'],
        roomDetail: { type: 'Căn hộ lớn hoặc TOÀN BỘ một tầng — bạn cần không gian kiến tạo', why: 'Bạn không chỉ "ở" — bạn biến mọi chỗ thành "công trình". Không gian lớn cho phép tư duy lớn. Thậm chí bạn nên cân nhắc ĐẦU TƯ MUA thay vì thuê.', direction: 'Hướng Đông Nam — thịnh vượng + phát triển', avoid: 'Tránh phòng nhỏ chật — sẽ khiến bạn nghẹt thở và trì trệ' },
        floorDetail: { best: 'Tầng nền/tầng 1 (xây từ nền móng) hoặc tầng thượng (nhìn toàn cảnh)', why: 'Bạn là người xây dựng — nền móng hoặc đỉnh cao, không ở giữa.' },
        fengshui: { element: 'Thổ + Kim (🏛️💰)', colors: ['Vàng hoàng gia', 'Đen', 'Nâu đỏ'], material: 'Đá granite, gỗ quý, kim loại nặng' },
        compatibility: { best: [4, 6, 8], ok: [2, 22], avoid: [3, 5, 7] },
        career: ['Chủ đầu tư BĐS', 'CEO tập đoàn', 'Kiến trúc sư tổng thể', 'Nhà chiến lược'],
        relationship: 'Cần đối tác hiểu tầm nhìn lớn. Số 4 xây cùng, số 8 cùng chinh phục đỉnh cao.',
        luckyDay: 'Ngày 4, 22 hàng tháng',
        warning: 'Bạn sinh ra để XÂY DỰNG, không chỉ ở. Cân nhắc mua BĐS đầu tiên thay vì thuê mãi — đó là bước đầu của đế chế.',
    },
};

function calcLifePath(day: number, month: number, year: number): number {
    function reduce(n: number): number {
        while (n > 9 && n !== 11 && n !== 22) {
            n = String(n).split('').reduce((s, d) => s + parseInt(d), 0);
        }
        return n;
    }
    return reduce(reduce(day) + reduce(month) + reduce(year));
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
        setResult(calcLifePath(d, m, y));
        if (name.trim()) setSoulNum(calcSoulNumber(name));
        else setSoulNum(null);
    }

    const info = result ? DATA[result] : null;

    return (
        <>
            <div className="page-header">
                <h1>🔮 Thần số học & Phong thủy nhà ở</h1>
                <p>Phân tích chi tiết số chủ đạo — Tìm không gian sống phù hợp năng lượng của bạn</p>
            </div>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {/* Input */}
                <div className="card" style={{ flex: '1 1 320px', maxWidth: 380, alignSelf: 'flex-start' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>📅 Nhập ngày sinh của bạn</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                        {[{ l: 'Ngày', v: day, s: setDay, p: '15', max: 31 }, { l: 'Tháng', v: month, s: setMonth, p: '08', max: 12 }, { l: 'Năm', v: year, s: setYear, p: '1995', max: 2025 }].map(f => (
                            <div key={f.l}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{f.l}</label>
                                <input className="form-input" type="number" placeholder={f.p} min="1" max={f.max} value={f.v} onChange={e => f.s(e.target.value)} />
                            </div>
                        ))}
                    </div>
                    <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Tên (tùy chọn — tính Số Linh hồn)</label>
                        <input className="form-input" placeholder="VD: Nguyen Van A" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <button onClick={handleCalc} style={{ width: '100%', padding: 12, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                        🔮 Phân tích ngay
                    </button>
                </div>

                {/* Result */}
                {info && result && (
                    <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Header Card */}
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '28px 24px', textAlign: 'center', background: `linear-gradient(135deg, ${info.color}12, ${info.color}06)`, borderBottom: '1px solid var(--border-subtle)' }}>
                                <div style={{ fontSize: '3rem' }}>{info.emoji}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>Số chủ đạo</div>
                                <div style={{ fontSize: '2.8rem', fontWeight: 900, color: info.color }}>{result}</div>
                                <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{info.title}</div>
                                {(result === 11 || result === 22) && <div style={{ marginTop: 6, padding: '3px 12px', borderRadius: 20, background: `${info.color}20`, color: info.color, fontSize: '0.7rem', fontWeight: 700, display: 'inline-block' }}>⭐ Master Number — Số hiếm đặc biệt</div>}
                            </div>
                        </div>

                        {/* Personality */}
                        <div className="card">
                            <SectionTitle icon="🧬" title="Tính cách chi tiết" />
                            <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {info.personality.map((p, i) => <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{p}</li>)}
                            </ul>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
                                <div style={{ padding: 10, borderRadius: 8, background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.12)' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34d399', marginBottom: 6 }}>💪 Điểm mạnh</div>
                                    {info.strengths.map((s, i) => <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 3, lineHeight: 1.5 }}>• {s}</div>)}
                                </div>
                                <div style={{ padding: 10, borderRadius: 8, background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.12)' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fb7185', marginBottom: 6 }}>⚡ Điểm cần lưu ý</div>
                                    {info.weaknesses.map((w, i) => <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 3, lineHeight: 1.5 }}>• {w}</div>)}
                                </div>
                            </div>
                        </div>

                        {/* Room & Floor */}
                        <div className="card">
                            <SectionTitle icon="🏠" title="Phòng phù hợp với bạn" />
                            <div style={{ padding: 14, borderRadius: 10, background: `${info.color}08`, border: `1px solid ${info.color}15`, marginBottom: 12 }}>
                                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: info.color, marginBottom: 6 }}>{info.roomDetail.type}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{info.roomDetail.why}</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <InfoBox emoji="🧭" label="Hướng phòng" value={info.roomDetail.direction} />
                                <InfoBox emoji="🚫" label="Tránh chọn" value={info.roomDetail.avoid} />
                                <InfoBox emoji="🏗️" label={`Tầng tốt nhất: ${info.floorDetail.best}`} value={info.floorDetail.why} />
                                <InfoBox emoji="🎨" label={`Phong thủy: ${info.fengshui.element}`} value={`Màu: ${info.fengshui.colors.join(', ')} | Chất liệu: ${info.fengshui.material}`} />
                            </div>
                        </div>

                        {/* Compatibility */}
                        <div className="card">
                            <SectionTitle icon="💞" title="Tương hợp bạn cùng phòng" />
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                                <CompatGroup label="❤️ Rất hợp" nums={info.compatibility.best} color="#34d399" />
                                <CompatGroup label="👍 Ổn" nums={info.compatibility.ok} color="#fbbf24" />
                                <CompatGroup label="⚠️ Cẩn thận" nums={info.compatibility.avoid} color="#fb7185" />
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>💑 <strong>Tình cảm:</strong> {info.relationship}</div>
                        </div>

                        {/* Career & More */}
                        <div className="card">
                            <SectionTitle icon="💼" title="Nghề nghiệp & Lời khuyên" />
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                                {info.career.map((c, i) => <span key={i} style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: `${info.color}10`, color: info.color, border: `1px solid ${info.color}20` }}>{c}</span>)}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>📅 Ngày may mắn: <strong style={{ color: info.color }}>{info.luckyDay}</strong></div>

                            {soulNum && (
                                <div style={{ padding: 12, borderRadius: 10, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', marginBottom: 12 }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', marginBottom: 4 }}>💜 Số Linh hồn: {soulNum}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                        {soulNum <= 3 ? 'Linh hồn bạn tìm kiếm sự đơn giản, chân thật. Chọn phòng gọn gàng, không cầu kỳ.' :
                                            soulNum <= 6 ? 'Linh hồn bạn khao khát kết nối và biểu đạt. Chọn phòng có không gian chung để giao lưu.' :
                                                soulNum <= 9 ? 'Linh hồn bạn hướng về chiều sâu, tĩnh lặng. Chọn phòng yên tĩnh có góc riêng tư.' :
                                                    'Linh hồn Master Number — bạn cảm nhận năng lượng phòng rất mạnh. Hãy tin vào trực giác khi chọn.'}
                                    </div>
                                </div>
                            )}

                            <div style={{ padding: 14, borderRadius: 10, background: `${info.color}08`, border: `1px solid ${info.color}20` }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: info.color, marginBottom: 4 }}>⚡ LỜI KHUYÊN DÀNH RIÊNG CHO BẠN:</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic' }}>"{info.warning}"</div>
                            </div>
                        </div>

                        {/* Lucky Rooms + CTA */}
                        <div className="card">
                            <SectionTitle icon="🎰" title="Số phòng may mắn cho bạn" />
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                                {[result, result + 10, result * 2, result + 100, result * 3 + 1, result + 200, result * 11].map((n, i) => (
                                    <span key={i} style={{ padding: '8px 16px', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem', background: `${info.color}12`, color: info.color, border: `1px solid ${info.color}25` }}>P.{n}</span>
                                ))}
                            </div>
                            <a href="/rooms" style={{ display: 'block', textAlign: 'center', padding: 14, borderRadius: 10, background: `linear-gradient(135deg, ${info.color}, ${info.color}cc)`, color: '#fff', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                                🏠 Tìm phòng phù hợp với số {result} →
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Overview when no result */}
            {!result && (
                <div className="card" style={{ marginTop: 20 }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>📖 Thần số học là gì?</h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
                        Thần số học nghiên cứu ý nghĩa các con số dựa trên ngày sinh để tìm <strong>Số chủ đạo (Life Path Number)</strong> — con số định hình tính cách và vận mệnh. Smile Home kết hợp thần số học + phong thủy để gợi ý <strong>phòng phù hợp năng lượng</strong> của bạn.
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {Object.entries(DATA).map(([num, d]) => (
                            <div key={num} style={{ padding: '10px 14px', borderRadius: 10, background: `${d.color}08`, border: `1px solid ${d.color}15`, textAlign: 'center', minWidth: 85 }}>
                                <div style={{ fontSize: '1.2rem' }}>{d.emoji}</div>
                                <div style={{ fontSize: '1rem', fontWeight: 800, color: d.color }}>{num}</div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2 }}>{d.title}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
    return <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12 }}>{icon} {title}</div>;
}
function InfoBox({ emoji, label, value }: { emoji: string; label: string; value: string }) {
    return (
        <div style={{ padding: 10, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{emoji} {label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{value}</div>
        </div>
    );
}
function CompatGroup({ label, nums, color }: { label: string; nums: number[]; color: string }) {
    return (
        <div style={{ padding: '8px 12px', borderRadius: 8, background: `${color}08`, border: `1px solid ${color}20` }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, color, marginBottom: 4 }}>{label}</div>
            <div style={{ display: 'flex', gap: 6 }}>
                {nums.map(n => <span key={n} style={{ width: 28, height: 28, borderRadius: '50%', background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>{n}</span>)}
            </div>
        </div>
    );
}
