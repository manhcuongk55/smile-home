---
description: Quy trình đánh version và push code cho team
---

# Quy trình Versioning & Deploy

// turbo-all

## Quy ước Version: `vMAJOR.MINOR.PATCH`
- **MAJOR**: Thay đổi lớn, breaking changes (VD: đổi DB schema lớn, đổi framework)
- **MINOR**: Tính năng mới (VD: thêm trang Commission, thêm module mới)
- **PATCH**: Sửa lỗi, tinh chỉnh nhỏ (VD: fix UI, sửa typo, chỉnh CSS)

## Các bước khi push code

1. Kiểm tra git status
```bash
git status
```

2. Stage tất cả thay đổi
```bash
git add -A
```

3. Commit với message rõ ràng theo format:
```
git commit -m "feat(v1.X.X): [Tên tính năng] - [Mô tả ngắn]"
```
Ví dụ:
- `feat(v1.2.0): Sales Commission - Quan ly doi sale, tu dong tinh hoa hong`
- `fix(v1.2.1): Commission page - Fix tinh toan bonus sai`
- `chore(v1.2.2): Update seed data, cleanup CSS`

4. Tag version
```bash
git tag -a v1.X.X -m "Mô tả tính năng chính của version này"
```

5. Push code + tag
```bash
git push origin main
git push origin v1.X.X
```

6. Cập nhật file `CHANGELOG.md` ở root project với:
- Version number
- Ngày deploy
- Commit hash
- Danh sách tính năng / sửa lỗi
- Số files thay đổi

7. Thông báo cho sếp version đã deploy:
```
✅ Đã deploy v1.X.X
📝 Tính năng: [tóm tắt]
🔗 Link test: https://smile-home.vercel.app/[trang-mới]
```
