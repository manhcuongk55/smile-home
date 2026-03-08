# CHANGELOG — Smile Home / Xgate Property OS

## v1.5.0 — Bot Đăng Bài + Landing Page Bán PM
**Deploy:** 2026-03-08 | **Commit:** `c3f8fdb` | **Branch:** `main`

### ✨ Tính năng mới
- **🤖 Đăng Bài Tìm Khách** — `/post-generator`
  - Template cho Facebook, Zalo, Messenger, SMS
  - Tự động lấy phòng trống từ DB → fill thông tin
  - Bulk mode: tạo bài cho tất cả phòng trống cùng lúc
  - Nút Copy 1 click → paste vào group
- **🏢 Landing Page Bán PM** — `/sell`
  - Giới thiệu 8 tính năng nổi bật
  - Pricing 3 gói: Starter (500K), Pro (1.2TR), Enterprise
  - Social proof + Contact form

### 📁 Files changed: 4 files (+531 lines)

---

## v1.4.0 — Nhắc Tiền Phòng (Rent Reminders)
**Deploy:** 2026-03-08 | **Commit:** `d3ad7a2` | **Branch:** `main`

### ✨ Tính năng mới
- **Trang Nhắc Tiền Phòng** — `/rent-reminders`
  - Dashboard tổng quan: phòng đã trả / chờ trả / quá hạn
  - Progress bar tiến độ thu tiền (% rooms paid)
  - Filter tabs: Tất cả / Quá hạn / Chưa trả
  - Nút **📋 Copy nhắc nhở** → tạo tin nhắn Zalo/SMS tự động
  - Hiển thị: tên khách, SĐT, tiền phòng, số ngày quá hạn
- **i18n**: ~30 keys mới (EN + VI)

### 📁 Files changed: 4 files (+357 lines)

---

## v1.3.0 — Activity History (Lịch Sử Hoạt Động)
**Deploy:** 2026-03-07 | **Commit:** `52a30e8` | **Branch:** `main`

### ✨ Tính năng mới
- **Trang Lịch Sử Hoạt Động** — `/activity`
  - Timeline UI premium với dot indicators theo màu action
  - Bấm vào mỗi dòng → xem chi tiết giá trị cũ/mới (JSON diff)
  - Lọc theo: Loại đối tượng, Hành động, Khoảng ngày
  - Stats: Tổng bản ghi, Hôm nay, Loại đối tượng, Người dùng
- **Auto-logging**: Hợp đồng, Đội Sale, Hóa đơn → tự ghi lịch sử
- **i18n**: ~60 keys mới (EN + VI)

### 📁 Files changed: 7 files (+475 lines)

---

## v1.2.0 — Sales Commission (Hoa Hồng) System
**Deploy:** 2026-03-07 | **Commit:** `6c75f24` | **Branch:** `main`

### ✨ Tính năng mới
- **Hệ thống Hoa Hồng Đội Sale** — Trang `/commissions`
  - Tab 1: Quản lý Đội Sale (mã code, tỷ lệ HH, KPI thưởng)
  - Tab 2: Sổ Hoa Hồng (tính tự động, duyệt, đánh dấu đã trả)
- **2 Model DB mới**: `SalesTeam`, `Commission`
- **4 API mới**: `/api/sales-teams`, `/api/commissions`
- **Form Hợp đồng**: Thêm dropdown chọn đội sale
- **i18n**: ~100 keys mới (EN + VI)

### 📁 Files changed: 12 files (+1115 lines)

---

## v1.1.0 — Stakeholder Ecosystem & i18n
**Commit:** `5716832` | **Branch:** `main`

### ✨ Tính năng
- Rich invoice data, expense tracking, contractor assignments
- Investor dashboard
- Vietnamese translation (i18n)
- QA mock data for utilities and invoices
