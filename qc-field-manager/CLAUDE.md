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

This is a **mobile-first PWA** built with React 19 + Vite. The entire application lives in a single file: [src/App.jsx](src/App.jsx) (~1350 lines). There is no router — navigation is managed entirely through React `useState`.

### Navigation model

The root `App` component owns three pieces of navigation state:
- `tab` — active main section: `"home"` | `"checklist"` | `"nhatky"` | `"thinghiem"` | `"baocao"` | `"maubieu"` | `"tcvn"` | `"saiso"`
- `st` — checklist subtype (e.g. `"ct"`, `"vk"`, `"bt"`, `"ht_xay"`, `"tm"`, etc.)
- `activeSession` — the currently open checklist session object

The checklist flow is three levels deep: `CLScreen` (category picker) → `SessionListScreen` (session CRUD) → `GenCL` (item-by-item checklist with photo capture and PDF export).

### Screens

| Component | Tab/context | Purpose |
|---|---|---|
| `Dash` | `home` | Dashboard: defect counts, overdue samples, latest diary entry |
| `CLScreen` | `checklist` | Category selector for all checklist types |
| `SessionListScreen` | `checklist` + `st` | Per-type session history (create / open / delete) |
| `GenCL` | `checklist` + `st` + `activeSession` | Checklist execution with pass/fail/N/A, photos, remediation notes, PDF export |
| `NKScreen` | `nhatky` | Construction diary (tc tab) + defect tracker (loi tab) |
| `TNScreen` | `thinghiem` | Sample quantity calculator + test-date reminder tracker |
| `WeeklyReportScreen` | `baocao` | Weekly PDF report + email via `mailto:` |
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
| `qcm_loi` | Defect list |
| `qcm_nk` | Construction diary entries |
| `qcm_sp` | Test sample reminders |
| `qcm_gen` | General checklist pass/fail state |
| `qcm_xlsx_list` | Uploaded XLSX templates (rows + merges stored as JSON) |
| `qcm_settings` | Project settings for weekly report |

Shared state (`loiList`, `nkList`, `samp`) is lifted to `App` and passed down; wrapper setters auto-persist to localStorage. Photos are compressed to 900px JPEG 72% before storage (`compressImage()`).

### PDF export

PDF generation uses `window.open()` with raw HTML string + `window.print()` — no PDF library. The function `exportPDF()` handles standard checklists; `exportPDFXlsx()` handles XLSX-form PDFs (A4 landscape); `WeeklyReportScreen` has its own inline `exportWeekPDF()`.

### PWA

- Service worker: [public/sw.js](public/sw.js) — stale-while-revalidate caching strategy
- Manifest: [public/manifest.json](public/manifest.json)
- Registered in [src/main.jsx](src/main.jsx)

### Styling

All styles are inline (`style={{ ... }}`). The navy brand color `#1e3a8a` is stored as `const NAVY`. Minimum touch target height `44px` is enforced via `const T = { minHeight: 44 }` spread onto interactive elements.

### Icons

All icons are rendered by the `Ic` component (inline SVGs), selected by the `n` prop (e.g. `"home"`, `"check"`, `"cam"`, `"flask"`).

---

## Lịch sử phát triển & Trạng thái hiện tại

### Sprint: Nâng cấp QC/QA cho Tổng thầu (hoàn thành 2026-06-08)

#### Tính năng 1: Defect Accountability — ✅ HOÀN THÀNH

Mục tiêu: Mỗi lỗi gắn thầu phụ + deadline + bằng chứng đóng lỗi.

**Những gì đã làm:**
- **Data model mở rộng** (`qcm_loi`): thêm 5 trường optional vào defect entity:
  - `thauphu` — tên thầu phụ chịu trách nhiệm (string)
  - `deadline` — ISO date hạn sửa lỗi (string)
  - `closureNote` — ghi chú bắt buộc khi đóng lỗi (string)
  - `closurePhotos` — ảnh bằng chứng (base64[], optional)
  - `closedAt` — timestamp khi đóng lỗi (ISO string)
- **Form tạo lỗi** (`NKScreen`): thêm 2 field "👷 Thầu phụ" + "📅 Hạn sửa" trong grid 2 cột
- **Closure modal**: intercept transition → "Đã xong" bằng cách bắt trong `onClick` của edit button; thay vì update trực tiếp, mở modal yêu cầu `closureNote` (bắt buộc) + ảnh (tùy chọn)
- **Card hiển thị lỗi**: badge `👷 {thauphu}`, badge `📅 {deadline}` (đỏ nếu quá hạn), badge `✓ Đã đóng`
- **Filter "Quá hạn"**: button đỏ với count badge, lọc lỗi có deadline < today và tt ≠ "Đã xong"
- **Dashboard alert**: banner đỏ `🔴 {n} lỗi QUÁ HẠN deadline` trên tab Home

**Quyết định kỹ thuật:**
- Backward-compatible: các trường mới đều optional, dữ liệu cũ không bị ảnh hưởng
- Dùng `setClosingLoi` state thay vì thêm button riêng — tránh thay đổi layout card hiện tại

#### Tính năng 2: Quality Analytics Dashboard — ✅ HOÀN THÀNH

Mục tiêu: Tổng thầu nhìn được sức khỏe chất lượng qua số liệu.

**Những gì đã làm:**
- **Tab mới "📈 Phân tích"** trong `WeeklyReportScreen` (tab switcher 3 tabs: Báo cáo / Phân tích / Cài đặt)
- **Pass Rate %**: tổng hợp từ tất cả `qcm_sessions`, đếm `results[id] === "d"` (đạt) vs `"k"` (không đạt), breakdown theo từng loại checklist với CSS bar chart
- **Xu hướng lỗi 4 tuần**: bar chart lỗi mới mỗi tuần dùng `getWeekRange(offset)` cho offset -3,-2,-1,0
- **Bảng theo thầu phụ**: group `loiList` by `thauphu || "Chưa phân công"`, cột Tổng / Đang mở / Quá hạn
- **Tình trạng mẫu**: Tổng / Chưa thử / Quá hạn
- **Truyền `sessions` prop**: `App` gọi `getSessions()` và truyền vào `WeeklyReportScreen`

**Quyết định kỹ thuật:**
- Không dùng chart library — CSS bar chart thuần (div với `width: X%`) để giữ bundle nhỏ và offline-first
- IIFE pattern trong JSX (`{(() => { /* compute */ return <jsx> })()}`) để scope biến analytics cục bộ, tránh ô nhiễm top-level component scope

**Build status:** `npm run build` — ✅ Pass (`✓ built in 211ms`, 0 errors)

---

## Bước tiếp theo gợi ý

### Ưu tiên cao
1. **Kiểm tra UI trực quan** — chạy `npm run dev` trong terminal VSCode, test các flow:
   - Tạo lỗi mới với thầu phụ + deadline
   - Đổi lỗi sang "Đã xong" → xác nhận modal xuất hiện đúng
   - Để lỗi quá deadline → kiểm tra badge đỏ + cảnh báo home
   - Mở tab Báo cáo → Phân tích → kiểm tra các widget hiển thị
2. **Deploy lên Vercel** — nếu cần cập nhật production (file `vercel.json` đã bị xóa trong sprint trước, cần kiểm tra)

### Ưu tiên trung bình
3. **Filter thầu phụ trong tab Lỗi** — hiện tại filter chỉ có Tất cả / Mới / Đang xử lý / Đã xong / Quá hạn; có thể thêm dropdown filter theo tên thầu phụ
4. **Export báo cáo thầu phụ** — nút "Xuất PDF" riêng cho bảng phân tích thầu phụ từ tab Phân tích
5. **Thông báo deadline** — dùng Web Notifications API để cảnh báo lỗi sắp hết hạn (cần permission)

### Ưu tiên thấp / Tương lai
6. **Đa dự án** — hiện app chỉ hỗ trợ 1 dự án; có thể thêm project switcher
7. **Sync dữ liệu** — backup/restore JSON để chuyển dữ liệu giữa thiết bị
