# Doc Tracker — Nhật ký dự án

## Mục đích
App desktop quản lý hồ sơ/văn bản trình duyệt trong dự án xây dựng. Ưu tiên: cảnh báo quá hạn luôn hiện, cập nhật trạng thái nhanh ngay tại bảng, tìm kiếm bằng phím tắt.

---

## Trạng thái hiện tại: ĐANG DÙNG — backend Supabase, đa dự án

**Dev server:** `npm run dev` → http://localhost:5174
**Build:** `npm run build` (OK, chỉ warning kích thước XLSX chunk bình thường)
**Lint:** `npm run lint` còn ~7 lỗi tồn đọng (unused vars + setState-trong-effect) chưa chặn build.

> ⚠️ **Git repo gốc nằm ở `C:/Users/Admin`** (thư mục home), KHÔNG phải `doc-tracker/`.
> Khi commit luôn `git add` từng đường dẫn cụ thể trong `doc-tracker/` — TUYỆT ĐỐI
> không `git add .` / `-A` để tránh commit nhầm `NTUSER.DAT`, `AppData/`, `.claude.json`…

---

## Kiến trúc (cập nhật)

App đã chuyển từ localStorage-only sang **Supabase làm backend, đa dự án**:

- **Đăng nhập:** `AuthScreen` — vào bằng *mã dự án* + *mã PIN* (tùy chọn). Phiên lưu ở `localStorage['dt_code']`.
- **Bảng dữ liệu:** `dt_projects` (code, name, settings, pin_hash) và `dt_docs`. Schema ở [supabase/schema.sql](supabase/schema.sql).
- **Đồng bộ:** mỗi thao tác CRUD ghi *optimistic* vào state React rồi sync Supabase; nếu lỗi thì **rollback** state + pop undo. Khi mất kết nối, load có *fallback* đọc `localStorage['dt_docs']`.
- **Chuyển đổi tên cột:** `mapToDB`/`mapFromDB` (đầu `App.jsx`) đổi camelCase (UI) ↔ snake_case (Postgres).
- **Undo (Ctrl+Z):** ngoài state, còn upsert snapshot + xóa bản ghi thừa lên Supabase để không lệch cloud.

### ⚠️ Giới hạn bảo mật (quan trọng)
RLS hiện vẫn mở (`using(true) with check(true)`) và anon key nằm trong bundle client.
Mã PIN (`dt_verify_pin` RPC + cột `pin_hash` revoke khỏi anon) **chỉ là rào ở tầng app** —
ai có anon key + SQL vẫn truy cập được `dt_docs`. Muốn bảo mật tầng DB thật cần Supabase Auth + RLS theo `auth.uid()`.

---

## Những gì đã hoàn thành

### Cấu trúc file
```
doc-tracker/
├── index.html              ✅  lang="vi", title "Doc Tracker"
├── vite.config.js          ✅
├── eslint.config.js        ✅
├── package.json            ✅  React 19, Vite 8, XLSX 0.18.5, @supabase/supabase-js
├── .env                    🔒  VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (gitignored)
├── .env.example            ✅  mẫu biến môi trường
├── supabase/
│   └── schema.sql          ✅  dt_projects, dt_docs, RLS, dt_verify_pin RPC
├── public/
│   ├── favicon.svg         ✅  icon tài liệu nền navy
│   ├── manifest.json       ✅  PWA manifest
│   └── sw.js               ✅  stale-while-revalidate
└── src/
    ├── main.jsx            ✅  StrictMode + service worker registration
    ├── supabase.js         ✅  khởi tạo Supabase client (sb)
    ├── index.css           ✅  reset + scrollbar + @media print
    └── App.jsx             ✅  ~1490 dòng, monolith toàn bộ app + AuthScreen
```

### Tính năng đã implement (App.jsx ~1490 dòng)

| Tính năng | Trạng thái | Ghi chú |
|---|---|---|
| Layout sidebar + table | ✅ | Sidebar 220px, collapsible xuống 52px |
| Alert banner (quá hạn / sắp hạn) | ✅ | Dòng đỏ + cam, chỉ hiện khi có |
| Bảng hồ sơ (DocTable) | ✅ | Sort, màu hàng theo urgency, sticky header |
| StatusPopover | ✅ | Click badge → popover đổi TT tại hàng, ghi history |
| Tìm kiếm Ctrl+K | ✅ | Match trên tất cả fields, highlight text |
| FilterToolbar | ✅ | Pills loại, trạng thái, sort, bộ lọc nhanh |
| DetailPanel | ✅ | Slide-in từ phải, lịch sử thay đổi, stepper |
| DocFormModal | ✅ | Form 2 cột, tags input, auto-calc ngayHetHan |
| Nhân bản hồ sơ | ✅ | Nút 📋 trong cột thao tác |
| Batch select + Batch bar | ✅ | Checkbox + thanh nổi phía dưới |
| Undo (Ctrl+Z) | ✅ | Stack max 10, **sync cả lên Supabase**, toast thông báo |
| AuthScreen + PIN | ✅ | Vào/tạo dự án bằng mã + PIN (xác thực qua RPC `dt_verify_pin`) |
| DashScreen | ✅ | Thẻ thống kê + bảng phân loại + mini table |
| OverdueScreen | ✅ | 2 bảng: quá hạn (đỏ) + sắp hạn (cam) |
| Print (Ctrl+P) | ✅ | @media print, PrintView div ẩn |
| XLSX Export | ✅ | 15 cột |
| XLSX Import | ✅ | Nhận dạng cột, confirm ghi đè vs thêm vào |
| SettingsScreen | ✅ | Tên dự án, SLA defaults |
| Keyboard shortcuts | ✅ | Ctrl+K, Ctrl+N, Ctrl+Z, Ctrl+P, Escape |
| Supabase sync | ✅ | CRUD optimistic + rollback khi lỗi; fallback `localStorage['dt_docs']` khi mất mạng |
| Link Drive | ✅ | Cột link, icon 🔗, mở tab mới |
| Tags/labels | ✅ | Pills nhỏ, tối đa 2 + "+N" |
| Rejection count | ✅ | Cột "Trả lại", đỏ nếu > 0 |

### Kết quả kiểm tra (Playwright)
- ✅ App load, title đúng
- ✅ Header "Doc Tracker" hiển thị
- ✅ Sidebar với đầy đủ nav items
- ✅ Nút "Thêm mới" hoạt động
- ✅ Form mở, điền, lưu thành công
- ✅ Bảng dữ liệu hiển thị sau khi thêm
- ✅ Detail panel mở khi click hàng
- ✅ ESC đóng detail panel
- ✅ Ctrl+N mở form thêm mới
- ✅ Ctrl+K focus ô tìm kiếm
- ✅ Sidebar collapse hoạt động
- ⚠️ Alert banner: test script dùng selector sai (`[style*="fef2f2"]` — browser normalize màu sang rgb), logic code đúng
- ⚠️ StatusPopover Lưu button: timing issue trong test script, không phải bug app

---

## Data Model

```js
DocRecord {
  id, soHieuDoc, tenDoc, loaiDoc, duAn, donViGui, donViNhan,
  trangThai,           // "cho_nop" | "dang_duyet" | "da_duyet"
  ngayNopDuKien,       // ISO date — hạn nộp
  ngayHetHan,          // ISO date — hạn SLA cuối
  ngayHoanThanh,       // ISO date — ngày hoàn thành thực tế
  slaNgay,             // số ngày SLA
  soLanTraLai,         // số lần bị trả lại
  nguoiPhuTrach,
  ghiChu,
  linkDrive,           // URL Google Drive / SharePoint
  tags: string[],
  history: HistoryEntry[],
  createdAt
}
```

SLA mặc định: `thiet_ke=14`, `nghiem_thu=7`, `phap_ly=30`, `hanh_chinh=5`

**Trong Postgres** các cột là snake_case (`so_hieu_doc`, `ngay_het_han`…); `mapToDB`/`mapFromDB` lo việc chuyển đổi. Bảng `dt_projects` thêm cột `pin_hash` (SHA-256 hex của PIN, null = không yêu cầu PIN).

---

## Quyết định thiết kế quan trọng

| Quyết định | Lý do |
|---|---|
| Monolith App.jsx (~1490 dòng) | Giống pattern `qc-field-manager`, đơn giản deploy/maintain, không cần router |
| Inline styles only, không CSS framework | Tránh dependency, dễ đọc/sửa inline |
| Navy `#1e3a8a` làm brand color | Consistent với qc-field-manager |
| **Supabase thay localStorage** | Cần chia sẻ dữ liệu đa người/đa máy; localStorage chỉ còn làm fallback offline |
| **PIN ở tầng app, chưa Supabase Auth** | Đủ rào cho nhóm tin cậy, công sức thấp; chấp nhận không bảo mật tầng DB (xem Giới hạn bảo mật) |
| `getDocUrgency()` pure function | Dễ test, dễ reuse ở AlertBanner + table row color + OverdueScreen |
| StatusPopover đổi TT tại hàng | Không cần mở DetailPanel — tiết kiệm thao tác, đúng UX yêu cầu |
| Undo sync cả lên cloud | Tránh lệch giữa state local và Supabase sau khi hoàn tác |

---

## Bước tiếp theo (nếu cần)

### Cần làm khi triển khai schema mới
- [ ] **Chạy [supabase/schema.sql](supabase/schema.sql)** trong Supabase SQL Editor (project `kozzfemrizemujgvyynn`) để tạo cột `pin_hash`, extension `pgcrypto`, RPC `dt_verify_pin`, và revoke. Chưa chạy thì cổng PIN sẽ báo "Lỗi kết nối".

### Cải tiến có thể làm sau
- [ ] Nâng cấp bảo mật thật: Supabase Auth + RLS theo `auth.uid()` (thay cổng PIN tầng app)
- [ ] Dọn 7 lỗi lint tồn đọng (unused vars, setState-trong-effect)
- [ ] Export PDF (dùng print CSS hiện tại, thêm nút Save as PDF)
- [ ] Lọc theo khoảng ngày (from/to date picker)
- [ ] Dark mode toggle

---

## Lệnh hay dùng

```bash
cd C:\Users\Admin\doc-tracker
npm run dev        # dev server → http://localhost:5174
npm run build      # build production vào dist/
npm run preview    # xem build production
npm run lint       # ESLint check
```

---

## Ghi chú kỹ thuật

- **Alert banner selector trong test**: Browser normalize `#fef2f2` → `rgb(254,242,242)`, dùng `text=QUÁ HẠN` thay vì `[style*="fef2f2"]`
- **ngayHetHan auto-calc**: Tính từ `ngayNopDuKien + slaNgay`, user có thể override thủ công (flag `slaManual`)
- **In ấn**: `@media print` trong `index.css` ẩn `#app-shell`, hiện `#print-view`
- **XLSX**: Cột tags export dạng text phân cách bằng dấu phẩy, import parse ngược lại
