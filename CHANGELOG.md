# CHANGELOG — Smile Home / Xgate Property OS

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
