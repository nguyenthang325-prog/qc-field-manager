# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

No test suite is configured.

## Architecture

This is a **mobile-first PWA** built with React 19 + Vite. The entire application lives in a single file: [src/App.jsx](src/App.jsx) (~1478 lines). There is no router — navigation is managed entirely through React `useState`.

### Navigation model

The root `App` component owns three pieces of navigation state:
- `tab` — active main section: `"home"` | `"checklist"` | `"nhatky"` | `"thinghiem"` | `"baocao"` | `"maubieu"` | `"tcvn"` | `"saiso"`
- `st` — checklist subtype (e.g. `"ct"`, `"vk"`, `"bt"`, `"ht_xay"`, `"tm"`, etc.)
- `activeSession` — the currently open checklist session object

The checklist flow is three levels deep: `CLScreen` (category picker) → `SessionListScreen` (session CRUD) → `GenCL` (item-by-item checklist with photo capture and PDF export).

### Screens

| Component | Tab/context | Purpose |
|---|---|---|
| `Dash` | `home` | Dashboard: defect counts, overdue banner, latest diary entry |
| `CLScreen` | `checklist` | Category selector for all checklist types |
| `SessionListScreen` | `checklist` + `st` | Per-type session history (create / open / delete) |
| `GenCL` | `checklist` + `st` + `activeSession` | Checklist execution with pass/fail/N/A, photos, remediation notes, PDF export |
| `NKScreen` | `nhatky` | Construction diary (tc tab) + defect tracker (loi tab) |
| `TNScreen` | `thinghiem` | Sample quantity calculator + test-date reminder tracker |
| `WeeklyReportScreen` | `baocao` | Weekly PDF report + analytics dashboard + settings (3 tabs) |
| `XLSXScreen` | `maubieu` | Upload owner-provided `.xlsx` forms, fill result columns, export PDF |
| `TCVNScreen` | `tcvn` | Searchable TCVN standards + NĐ 06/2021 legal reference |
| `SSScreen` | `saiso` | Construction tolerance quick-reference table |
| `EmgModal` | FAB (any tab) | Emergency step-by-step guides (concrete in rain, failed samples) |

### Data

All reference data is hardcoded as constants near the top of [src/App.jsx](src/App.jsx) (lines 30–229):
- `clData` — general checklist categories (Nền móng, Cột & Vách, Dầm & Sàn, Bê tông, Hoàn thiện)
- `ctItems`, `vkItems`, `btItems` — TCVN 4453 checklist items
- `htXayItems`, `htTratItems`, `htLatItems`, `htOpItems`, `htSonItems`, `htTranItems`, `htCuaItems` — TCVN 9377 finishing work items
- `cthmItems` — TCVN 9065 waterproofing items
- `sampR` — sample quantity calculation rules per material type
- `tcvnData` — 12 Vietnamese construction standards
- `plData` — NĐ 06/2021 legal articles
- `ssData` — construction tolerances

`ITEMS_MAP` and `getItemsByType()` map a `st` string to the correct items array.

### State persistence (localStorage keys)

| Key | Content |
|---|---|
| `qcm_sessions` | All checklist sessions (results, photos as base64, metadata) |
| `qcm_loi` | Defect list (bao gồm các trường mới: thauphu, deadline, closureNote, closurePhotos, closedAt) |
| `qcm_nk` | Construction diary entries |
| `qcm_sp` | Test sample reminders |
| `qcm_gen` | General checklist pass/fail state |
| `qcm_xlsx_list` | Uploaded XLSX templates (rows + merges stored as JSON) |
| `qcm_settings` | Project settings for weekly report |

Shared state (`loiList`, `nkList`, `samp`) is lifted to `App` and passed down; wrapper setters auto-persist to localStorage. Photos are compressed to 900px JPEG 72% before storage (`compressImage()`).

### PDF export

PDF generation uses `window.open()` with raw HTML string + `window.print()` — no PDF library. The function `exportPDF()` handles standard checklists; `exportPDFXlsx()` handles XLSX-form PDFs (A4 landscape); `WeeklyReportScreen` has its own inline `exportWeekPDF()`.

### PWA

- Service worker: [public/sw.js](public/sw.js) — stale-while-revalidate, cache key `qcf-v3`
- Manifest: [public/manifest.json](public/manifest.json)
- Registered in [src/main.jsx](src/main.jsx)
- **Quan trọng**: mỗi khi deploy bundle mới, phải bump cache key trong `sw.js` (qcf-v3 → qcf-v4...) để người dùng nhận bản mới thay vì bị kẹt ở cache cũ

### Styling

All styles are inline (`style={{ ... }}`). The navy brand color `#1e3a8a` is stored as `const NAVY`. Minimum touch target height `44px` is enforced via `const T = { minHeight: 44 }` spread onto interactive elements.

### Icons

All icons are rendered by the `Ic` component (inline SVGs), selected by the `n` prop (e.g. `"home"`, `"check"`, `"cam"`, `"flask"`).

---

## Deployment

**Production URL:** `https://qc-field-manager.vercel.app`

**Auto-deploy:** Vercel kết nối GitHub, push lên `main` → tự động deploy.

**vercel.json quan trọng:**
```json
{"buildCommand":"npm run build","outputDirectory":"dist","installCommand":"npm install --include=dev","framework":"vite"}
```
`--include=dev` là bắt buộc vì Vercel chạy `NODE_ENV=production` mặc định, sẽ bỏ qua `devDependencies` (trong đó có `vite`). Nếu thiếu flag này → `vite: command not found` → build fail.

---

## Lịch sử phát triển & Trạng thái hiện tại

### Sprint 1: Tính năng cơ bản (trước 2026-06-08)

Các tính năng gốc đã hoàn thành và ổn định:
- Checklist nghiệm thu theo TCVN 4453, 9377, 9065
- Nhật ký thi công
- Quản lý mẫu thí nghiệm
- Báo cáo tuần PDF
- Tra cứu TCVN + NĐ 06/2021
- Bảng sai số thi công
- XLSX form upload + export PDF
- Hướng dẫn khẩn cấp (FAB)

---

### Sprint 2: Nâng cấp QC/QA cho Tổng thầu — ✅ HOÀN THÀNH & DEPLOYED (2026-06-08)

#### Tính năng 1: Defect Accountability — ✅ Live

Mục tiêu: Mỗi lỗi gắn thầu phụ + deadline + bằng chứng đóng lỗi.

**Những gì đã làm:**
- **Data model mở rộng** (`qcm_loi`): thêm 5 trường optional vào defect entity:
  - `thauphu` — tên thầu phụ chịu trách nhiệm (string)
  - `deadline` — ISO date hạn sửa lỗi (string)
  - `closureNote` — ghi chú bắt buộc khi đóng lỗi (string)
  - `closurePhotos` — ảnh bằng chứng (base64[], optional)
  - `closedAt` — timestamp khi đóng lỗi (ISO string)
- **Form tạo lỗi** (`NKScreen`): thêm 2 field "👷 Thầu phụ" + "📅 Hạn sửa" trong grid 2 cột
- **Closure modal**: intercept transition → "Đã xong"; modal yêu cầu `closureNote` bắt buộc + ảnh tùy chọn
- **Card hiển thị lỗi**: badge `👷 {thauphu}`, badge `📅 {deadline}` (đỏ nếu quá hạn), badge `✓ Đã đóng`
- **Filter "Quá hạn"**: button đỏ với count badge, lọc `deadline < today && tt !== "Đã xong"`
- **Dashboard alert**: banner đỏ `🔴 {n} lỗi QUÁ HẠN deadline` trên tab Home

**Quyết định kỹ thuật:**
- Backward-compatible: các trường mới đều optional → dữ liệu cũ không bị ảnh hưởng
- Dùng `setClosingLoi` state thay vì thêm button riêng → tránh thay đổi layout card hiện tại

#### Tính năng 2: Quality Analytics Dashboard — ✅ Live

Mục tiêu: Tổng thầu nhìn được sức khỏe chất lượng qua số liệu.

**Những gì đã làm:**
- **Tab mới "📈 Phân tích"** trong `WeeklyReportScreen` (tab switcher 3 tabs: Báo cáo / Phân tích / Cài đặt)
- **Pass Rate %**: tổng hợp từ tất cả `qcm_sessions`, đếm `results[id] === "d"` (đạt) vs `"k"` (không đạt), breakdown theo từng loại checklist với CSS bar chart
- **Xu hướng lỗi 4 tuần**: bar chart lỗi mới mỗi tuần dùng `getWeekRange(offset)` cho offset -3,-2,-1,0
- **Bảng theo thầu phụ**: group `loiList` by `thauphu || "Chưa phân công"`, cột Tổng / Đang mở / Quá hạn
- **Tình trạng mẫu**: Tổng / Chưa thử / Quá hạn
- **Truyền `sessions` prop**: `App` gọi `getSessions()` và truyền vào `WeeklyReportScreen`

**Quyết định kỹ thuật:**
- Không dùng chart library — CSS bar chart thuần (`div` với `width: X%`) → bundle nhỏ, offline-first
- IIFE pattern trong JSX (`{(() => { /* compute */ return <jsx> })()}`) → scope biến analytics cục bộ, tránh ô nhiễm component scope

#### Fix deployment (cùng session) — ✅ Resolved

- **Vấn đề**: `vercel.json` bị xóa tình cờ trong sprint trước → Vercel dùng config mặc định → `vite: command not found` vì `NODE_ENV=production` bỏ qua `devDependencies`
- **Fix**: Khôi phục `vercel.json` với `"installCommand":"npm install --include=dev"`
- **Service worker**: Bump cache key `qcf-v2` → `qcf-v3` để force invalidation, người dùng nhận bundle mới

**Commits sprint này:**
```
eac4ee1 fix: install devDependencies on Vercel to resolve vite not found
827b77c fix: bump SW cache to qcf-v3 to force cache invalidation on update
7e28a6f fix: restore vercel.json for production deployment
7b39eff feat: add defect accountability + quality analytics dashboard
```

**Build status:** `npm run build` — ✅ Pass (`✓ built in 519ms`, 0 errors, 17 modules)

---

## Trạng thái hiện tại (2026-06-08)

| Hạng mục | Trạng thái |
|---|---|
| Production URL | ✅ `https://qc-field-manager.vercel.app` — live |
| Build | ✅ Pass, 519ms |
| Service worker cache | ✅ `qcf-v3` — sẵn sàng serve bản mới |
| Defect Accountability | ✅ Deployed và hoạt động |
| Quality Analytics | ✅ Deployed và hoạt động |
| Auto-deploy từ GitHub | ✅ Kết nối — push main → deploy tự động |
| `vercel.json` | ✅ Đúng với `--include=dev` |

---

## Bước tiếp theo gợi ý

### Ưu tiên cao
1. **Filter thầu phụ trong tab Lỗi** — hiện tại filter chỉ có Tất cả / Mới / Đang xử lý / Đã xong / Quá hạn; thêm dropdown filter theo tên thầu phụ → impact cao khi có nhiều thầu phụ, ~30 phút
2. **Backup/Restore dữ liệu** — export toàn bộ localStorage ra JSON + import lại → giải quyết vấn đề chuyển dữ liệu giữa thiết bị (quan trọng vì hiện tại dữ liệu chỉ tồn tại trên 1 browser)

### Ưu tiên trung bình
3. **Export PDF bảng thầu phụ** — nút "Xuất PDF" riêng cho bảng phân tích trong tab Phân tích
4. **Thông báo deadline** — Web Notifications API cảnh báo lỗi sắp hết hạn (cần user grant permission)
5. **Xem ảnh closure** — trong card lỗi đã đóng, thêm nút xem `closurePhotos` (hiện tại ảnh được lưu nhưng chưa có UI xem lại)

### Ưu tiên thấp / Tương lai
6. **Đa dự án** — hiện app chỉ hỗ trợ 1 dự án; thêm project switcher
7. **Gantt chart đơn giản** — timeline defect theo tuần trong tab Phân tích

---

## Quyết định quan trọng & Lý do

| Quyết định | Lý do |
|---|---|
| Monolith `App.jsx` (~1478 dòng) | Không cần router, deploy/maintain đơn giản, không có backend team |
| Inline styles only | Không phụ thuộc CSS framework, dễ đọc và sửa trực tiếp |
| Closure modal thay vì nút riêng | Không thay đổi layout card hiện tại; người dùng quen flow đổi trạng thái |
| CSS bar chart, không dùng library | Giữ bundle < 700KB; app phải hoạt động offline |
| IIFE pattern cho analytics | Scope biến cục bộ trong JSX mà không cần tách component mới |
| `--include=dev` trong installCommand | Vercel đặt `NODE_ENV=production` → npm bỏ qua devDependencies → vite không tìm thấy |
| Bump SW cache key khi deploy | Stale-while-revalidate phục vụ cached bundle trước; nếu không bump key, người dùng bị kẹt ở bản cũ vô thời hạn |
| Backward-compatible data model | Các trường `thauphu`, `deadline`... là optional → dữ liệu lỗi cũ trong localStorage không bị break |
