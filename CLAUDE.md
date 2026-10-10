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

This is a **mobile-first PWA** built with React 19 + Vite. The entire application lives in a single file: [src/App.jsx](src/App.jsx) (~1820 lines). There is no router — navigation is managed entirely through React `useState`.

### Navigation model

The root `App` component owns three pieces of navigation state:
- `tab` — active main section: `"home"` | `"checklist"` | `"nhatky"` | `"thinghiem"` | `"baocao"` | `"maubieu"` | `"tcvn"` | `"saiso"` | `"kiemsoat"`
- `st` — checklist subtype (e.g. `"ct"`, `"vk"`, `"bt"`, `"ht_xay"`, `"tm"`, etc.)
- `activeSession` — the currently open checklist session object

The checklist flow is three levels deep: `CLScreen` (category picker) → `SessionListScreen` (session CRUD) → `GenCL` (item-by-item checklist and PDF export; no photo capture since Sprint 8).

### Screens

| Component | Tab/context | Purpose |
|---|---|---|
| `Dash` | `home` | Dashboard: defect counts, overdue banner, latest diary entry |
| `CLScreen` | `checklist` | Category selector for all checklist types |
| `SessionListScreen` | `checklist` + `st` | Per-type session history (create / open / delete) |
| `GenCL` | `checklist` + `st` + `activeSession` | Checklist execution with pass/fail/N/A, remediation notes, PDF export (old photos view/delete only) |
| `NKScreen` | `nhatky` | Construction diary (tc tab) + defect tracker (loi tab) |
| `TNScreen` | `thinghiem` | Sample quantity calculator + test-date reminder tracker |
| `WeeklyReportScreen` | `baocao` | Weekly PDF report + analytics dashboard + settings (3 tabs) |
| `XLSXScreen` | `maubieu` | Upload owner-provided `.xlsx` forms, fill result columns, export PDF |
| `TCVNScreen` | `tcvn` | Searchable TCVN standards + NĐ 06/2021 legal reference |
| `SSScreen` | `saiso` | Construction tolerance quick-reference table |
| `ControlScreen` | `kiemsoat` | Kiểm soát hồ sơ: danh mục Mã BB, cờ đã/chưa xuất YCNT-BBNT theo từng phiên nghiệm thu |
| `EmgModal` | FAB (any tab) | Emergency step-by-step guides (concrete in rain, failed samples) |
| `DefectModal` | inside `GenCL` | "Lỗi thường gặp" warnings for the current checklist type — flat cards, no drill-down (unlike `EmgModal`) |

### Data

All reference data is hardcoded as constants near the top of [src/App.jsx](src/App.jsx) (lines 30–230):
- `clData` — general checklist categories (Nền móng, Cột & Vách, Dầm & Sàn, Bê tông, Hoàn thiện)
- `ctItems`, `vkItems`, `btItems` — TCVN 4453 checklist items
- `htXayItems`, `htTratItems`, `htLatItems`, `htOpItems`, `htSonItems`, `htTranItems`, `htCuaItems` — TCVN 9377 finishing work items
- `cthmItems` — TCVN 9065 waterproofing items
- `defectData` — "lỗi thường gặp" warnings per checklist type, shape `{ id, t, hd }` (same shape as `ctItems` etc., but `hd` describes a common mistake a junior QC would miss, not a spec/tolerance)
- `prepChecklist` — flat list of admin self-check items shown before exporting Phiếu YCNT (not type-specific)
- `sampR` — sample quantity calculation rules per material type
- `tcvnData` — 12 Vietnamese construction standards
- `plData` — NĐ 06/2021 legal articles
- `ssData` — construction tolerances

`ITEMS_MAP`/`getItemsByType()` map a `st` string to the checklist items array; `getDefectsByType()` does the same for `defectData`.

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

Shared state (`loiList`, `nkList`, `samp`) is lifted to `App` and passed down; wrapper setters auto-persist to localStorage.

**App KHÔNG chụp/lưu ảnh mới (từ 10/10/2026, Sprint 8).** Ảnh hiện trường để ở máy ảnh điện thoại / Zalo. Trường ảnh cũ (`session.photos`, `loi.ph`, `loi.closurePhotos`) vẫn giữ trong schema và vẫn hiển thị/in nếu còn — chỉ bỏ đường nhập. **Không thêm lại ô chụp ảnh lưu base64 vào localStorage** — nếu thật sự cần ảnh thì phải chuyển sang IndexedDB.

**Mọi lệnh ghi localStorage phải đi qua `lsSet(key, str)`** (đầu mục SESSION MANAGEMENT) — không viết `try { localStorage.setItem(...) } catch {}` mới. `lsSet` phát sự kiện `qcm-storage-full` khi ghi thất bại → `App` hiện banner đỏ. Ngoại lệ duy nhất: `importAllData` (lỗi đã báo qua `onDone(err)`). Giới hạn ~5 triệu ký tự/trang (`LS_LIMIT`); dữ liệu chữ ~1 KB/mục nên khi không có ảnh gần như không thể đầy.

### PDF export

PDF generation uses `window.open()` with raw HTML string + `window.print()` — no PDF library. The function `exportPDF()` handles standard checklists; `exportPDFXlsx()` handles XLSX-form PDFs (A4 landscape); `WeeklyReportScreen` has its own inline `exportWeekPDF()`.

### PWA

- Service worker: [public/sw.js](public/sw.js) — stale-while-revalidate, cache key `qcf-v6`
- Manifest: [public/manifest.json](public/manifest.json)
- Registered in [src/main.jsx](src/main.jsx)
- **Tự động từ 05/07/2026**: plugin `sw-cache-bump` trong [vite.config.js](vite.config.js) tự append `-b<timestamp>` vào cache key trong `dist/sw.js` mỗi lần build — KHÔNG còn phải bump tay `public/sw.js` khi deploy (tên nguồn giữ `qcf-v6`)

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

**Repo standalone (25/06/2026):** GitHub repo `nguyenthang325-prog/qc-field-manager` đã chuyển từ monorepo thành **standalone repo** — files nằm ở root. Vercel Root Directory = `.` (rỗng). Repo nằm tại `d:\HOC TAP\APP\qc-field-manager\`.

**Auto-deploy:** `git push origin main` → Vercel tự build và deploy lên `https://qc-field-manager.vercel.app`.

> **Lịch sử:** Trước 25/06/2026, repo là monorepo tại `C:\Users\Admin` với Root Directory = `qc-field-manager`. Đã migrate về standalone. Nếu gặp lỗi `vite: command not found` → kiểm tra `vercel.json` có `"installCommand":"npm install --include=dev"` không.

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

### Sprint 3: Định hướng lại — mini-app QC nội nghiệp cho 1 dự án (2026-06-16) — Bước 1-3 ✅, Bước 4 ⬜ (tùy chọn)

**Ngữ cảnh quan trọng (đính chính mục đích app):** App dùng để **tự quản lý công việc QC nội nghiệp**, làm việc với **TVGS + Chủ đầu tư** — **KHÔNG** quản lý thầu phụ. Mục tiêu: mini-app đủ chuyên nghiệp áp dụng cho **1 dự án cụ thể**, hỗ trợ tối đa **QC mới vào nghề / trợ lý kỹ sư**. → Tính năng "Defect Accountability theo thầu phụ" của Sprint 2 đã được gỡ/đổi hướng.

**Lộ trình 4 bước (làm tuần tự, dừng kiểm tra sau mỗi bước):**
1. ✅ **Nền tảng** — backup/restore + chuẩn hóa dự án + gỡ thầu phụ. (commit `15d0f99`)
2. ✅ **Sinh hồ sơ nghiệm thu** (bước này) — Biên bản NTCV + Phiếu YCNT theo NĐ 06/2021, khối ký 2 bên (TVGS + Nhà thầu).
3. ✅ **Trợ lý cho QC mới** — checklist chuẩn bị trước nghiệm thu, cảnh báo lỗi thường gặp.
4. ⬜ **Đa thiết bị** (tùy chọn) — cân nhắc backend nhẹ.

**Bước 1 — đã làm:**
- **Backup/Restore**: helper `exportAllData()` / `importAllData()` (gần `deleteSessionById`), gom 7 key (`QCM_KEYS`) ra 1 file `.json` `{app,version,exportedAt,data}`; UI 2 nút trong tab Cài đặt của `WeeklyReportScreen` (`handleImport` confirm ghi đè + reload).
- **Chuẩn hóa dự án**: `qcm_settings` thêm `hangmuc`, `mahieu`, `nhathau` — phục vụ sinh biên bản ở Bước 2.
- **Gỡ thầu phụ**: bỏ field "👷 Thầu phụ" + badge; bảng "Lỗi theo thầu phụ" (tab Phân tích) thay bằng card "📋 Tổng quan tồn tại". Field `thauphu` giữ optional trong data cũ, chỉ ẩn UI.
- **Đổi thuật ngữ**: "lỗi" → "tồn tại" trong tab Nhật ký. *(PDF báo cáo tuần + Dashboard vẫn dùng "lỗi" — chờ quyết định ở checkpoint.)*
- **Xem lại ảnh closure**: badge "✓ Đã khắc phục ›" mở modal `viewClosure` (ghi chú + ảnh + thời điểm đóng).

**Dọn lint:** 26 lỗi pre-existing (`no-empty`/`no-unused-vars` trên `catch(e){}`, `no-useless-escape` trên `<\/script>`) đã dọn sạch — bỏ tham số `e`/`err` không dùng ở các catch rỗng, thêm `allowEmptyCatch: true` vào [eslint.config.js](eslint.config.js) (các catch này cố ý nuốt lỗi quota localStorage), gỡ escape thừa trong `<\/script>`.

**Build:** ✅ `vite build` 189ms, 0 lỗi biên dịch. **Lint:** ✅ 0 lỗi. **SW cache:** `qcf-v3` → `qcf-v4`.

**Bước 2 — đã làm (2026-06-16):**
- **`exportPhieuYCNT(session, settings)`** ([src/App.jsx](src/App.jsx), ngay sau `exportPDF`) — Phiếu yêu cầu nghiệm thu 1 trang, Nhà thầu đề nghị TVGS/CĐT tổ chức nghiệm thu; chỉ 1 khối ký (Nhà thầu) vì là văn bản đề nghị một chiều.
- **`exportBienBanNghiemThu(session, items, results, bienphap, meta, settings)`** — Biên bản nghiệm thu công việc xây dựng chính thức theo NĐ 06/2021 Đ.13: căn cứ pháp lý (TCVN áp dụng + Đ.13/Đ.14), bảng kết quả từng hạng mục, kết luận tự suy ra Đạt/Chưa đạt, **khối ký 2 bên: TVGS + Nhà thầu thi công** (đính chính của người dùng: biên bản nghiệm thu công việc tại hiện trường KHÔNG có CĐT ký — CĐT chỉ ký biên bản nghiệm thu giai đoạn/hoàn thành công trình).
- Cả 2 hàm đọc `settings` qua `initSettings()` trực tiếp tại thời điểm export (cùng pattern với các hàm đọc localStorage khác trong file) — không cần truyền `settings` qua props xuống `GenCL`.
- UI: trong modal xem trước của `GenCL`, nút cũ đổi nhãn "🖨️ Checklist nội bộ" (giữ nguyên hành vi cũ); thêm hàng nút mới "📋 Phiếu YCNT" + "📄 Biên bản NT".
- **Mẫu hiện dùng là mẫu tham khảo theo tinh thần NĐ 06/2021**, không phải mẫu thật của dự án — người dùng cho biết mẫu thật sẽ được TVGS/CĐT cung cấp lúc bắt đầu từng dự án cụ thể; khi đó chỉnh lại nội dung HTML trong 2 hàm trên (hoặc xét dùng cơ chế upload `.xlsx` đã có ở tab "Mẫu biểu" nếu mẫu thật là file Excel).

**Build:** ✅ `vite build` 178ms, 0 lỗi. **Lint:** ✅ 0 lỗi. **SW cache:** `qcf-v4` → `qcf-v5`.

**Bước 3 — đã làm (2026-06-16):**
- **`defectData`** ([src/App.jsx](src/App.jsx), ngay sau `ITEMS_MAP`/`getItemsByType`) — object cảnh báo "lỗi thường gặp" key theo đúng type checklist (ct, vk, bt, tm, ht_xay...ht_cua), 3 mục/loại, shape `{ id, t, hd }`. Khác với `hd` trong `ctItems` (nói về tiêu chuẩn/sai số cần đo), `defectData.hd` nói về lỗi QC mới hay bỏ sót vì chưa biết (nguyên nhân/cách phát hiện/cách tránh). Truy xuất qua `getDefectsByType(type)`.
- **`DefectModal({ type, onClose })`** (ngay sau `EmgModal`) — bottom-sheet đơn giản, không drill-down 2 cấp như `EmgModal` vì nội dung ngắn (khác `EmgModal` có urgency badge + step-by-step cho tình huống khẩn cấp nhiều bước). Mở từ nút "⚠️ Lỗi thường gặp ở công tác này" trong `GenCL`, đặt ngay dưới khối Tiến độ — hỗ trợ **trong lúc đang kiểm tra**, không phải FAB (tránh đụng FAB khẩn cấp 🚨 đỏ đã có sẵn).
- **`prepChecklist`** (cạnh `defectData`) — array string chung (không phân theo type) gồm 6 mục hành chính cần tự-kiểm trước khi gọi TVGS (đã làm hết hạng mục, biện pháp xử lý cho mục Không đạt, ảnh minh chứng, phiếu thí nghiệm liên quan, báo TVGS đúng giờ nếu là công tác che khuất, điền đủ meta).
- UI: trong modal xem trước của `GenCL`, thêm khối "📝 Trước khi gọi TVGS nghiệm thu" với checkbox, đặt giữa phần thống kê Đạt/KĐạt/N-A và danh sách hạng mục. State `prepChecked` cục bộ (`useState({})`), **không lưu localStorage/session** — chỉ là tự-kiểm cuối cùng trước khi xuất hồ sơ, không phải dữ liệu nghiệm thu nên không cần migrate session cũ; reset về `{}` mỗi lần bấm "Xuất biên bản" để luôn là một lượt tự-kiểm mới. Không gate nút xuất (chỉ nhắc nhở, vì nút "Xuất biên bản" đã có gate `allDone` riêng).

**Build:** ✅ `vite build` 188ms, 0 lỗi. **Lint:** ✅ 0 lỗi. **SW cache:** `qcf-v5` → `qcf-v6`.

---

## Trạng thái hiện tại (rà soát 2026-10-10)

| Hạng mục | Trạng thái |
|---|---|
| Production URL | ✅ `https://qc-field-manager.vercel.app` — `bd8c234` live 10/10 (bundle `index-BGzw5iXR.js`) |
| Auto-deploy GitHub → Vercel | ✅ Hoạt động (kết nối từ 15/05). Lưu ý 10/10: push `f1315f7..bd8c234` bị Vercel **bỏ lỡ 1 lần** (không commit status, không deployment) → đã deploy tay `vercel --prod --yes`; push kế tiếp `ea52862` thì tự deploy bình thường. **Sau push nên kiểm tra:** `gh api repos/nguyenthang325-prog/qc-field-manager/commits/<sha>/status` có context `Vercel` = success; nếu sau ~3 phút vẫn `pending` + 0 status → chạy `vercel --prod --yes` |
| Build | ✅ Pass, ~200–400ms; bundle 686 KB (gần mốc 700 KB tự đặt) |
| Lint | ✅ 0 lỗi |
| Service worker cache | ✅ `qcf-v6` + hậu tố tự bump (`qcf-v6-b20260828025900` trên prod tại 10/10) |
| `xlsx` 0.18.5 | ⚠️ `npm audit`: 2 lỗ hổng high (Prototype Pollution, ReDoS), npm không có bản vá — cần chuyển sang tarball SheetJS CDN 0.20.x nếu muốn vá. Chỉ dùng khi upload mẫu `.xlsx` từ TVGS/CĐT → rủi ro thực tế thấp |
| Vercel Root Directory | ✅ `.` (rỗng — standalone repo từ 25/06/2026) |
| Git repo | ✅ `nguyenthang325-prog/qc-field-manager` standalone tại `d:\HOC TAP\APP\qc-field-manager\` |
| Sprint 3 — Bước 1 Nền tảng | ✅ Live |
| Sprint 3 — Bước 2 Sinh hồ sơ nghiệm thu | ✅ Live |
| Sprint 3 — Bước 3 Trợ lý cho QC mới | ✅ Live |
| Sprint 3 — Bước 4 Đa thiết bị | ⬜ Chưa làm (tùy chọn) |
| Auto-deploy từ GitHub | ✅ `git push origin main` → deploy tự động |
| `vercel.json` | ✅ Đúng với `--include=dev` |

---

### Sprint 4: Cầu QC ↔ BIM — Nấc 2 Chuẩn hóa vị trí (2026-07-18) — ✅ Live

Bối cảnh: bắt đầu bắc cầu dữ liệu nghiệm thu ↔ mô hình IFC (công cụ `qc_to_bim_map.py` ở `d:\HOC TAP\CONG_CU\QUAN_LY_THI_CONG\3_QC_Hien_Truong\`). Điểm chặn: `session.location` là text tự do, không map được sang mô hình. Nấc 2 chuẩn hóa **tại nguồn nhập**, không đổi schema.

- **`detectTang(loc)`** (ngay sau `getItemsByType`) — regex nhận diện "Tầng N" / "TN" trong location.
- **Gợi ý sống trong form tạo session** (`SessionListScreen`): dưới ô "Vị trí kiểm tra", hiện phản hồi thời gian thực — placeholder mẹo khi trống, 🟢 "✓ Nhận diện Tầng N — đối chiếu được với mô hình BIM" khi bắt được tầng, 🟠 "⚠ Chưa rõ tầng" khi không. Placeholder mới: "Dầm sàn Tầng 4 · trục B3".
- **KHÔNG chặn nhập, tương thích ngược**: chỉ nudge, không validation gate, không đổi `newSession`/schema → dữ liệu cũ nguyên vẹn.

**Build:** ✅ 235ms, 0 lỗi. **Lint:** ✅ 0 lỗi. **SW cache:** nguồn giữ `qcf-v6` (plugin tự bump `-b<timestamp>` khi build).

> Lộ trình cầu QC↔BIM 6 nấc: Nấc 1 (thống kê nghiệm thu từ backup) ✅, Nấc 2 (chuẩn hóa location) ✅. Tiếp: gom dữ liệu thật → Nấc 3 (cầu thô Tầng×Loại) khi gate ≥80%.

---

### Sprint 5: Rà soát pháp lý — NĐ06/2021 → NĐ207/2026 (2026-07-30) — ✅ Live

Bối cảnh: rà soát pháp lý toàn kho tri thức phát hiện **Nghị định 207/2026/NĐ-CP** (15/6/2026, hiệu lực 01/7/2026) đã thay thế **NĐ06/2021/NĐ-CP** mà app trích dẫn trực tiếp trong tab tra cứu pháp quy và 2 mẫu văn bản in cho dự án thật (`exportBienBanNghiemThu`, `exportPhieuYCNT`).

- **Banner cảnh báo** trong tab pháp quy (`mode === "pl"`, ngay trên ô tìm kiếm) — nền vàng, ghi rõ NĐ06/2021 đã bị thay thế, số điều `plData` bên dưới **chưa xác minh lại**, chỉ tra cứu tham khảo
- **Tab label** đổi từ `"⚖️ NĐ 06/2021"` → `"⚖️ NĐ 06/2021 ⚠️"` để cảnh báo ngay ở navigation, không cần mở tab mới thấy
- **`exportBienBanNghiemThu`**: đổi trích dẫn "Nghị định 06/2021/NĐ-CP, Điều 13/14" → "Nghị định 207/2026/NĐ-CP ... (thay thế NĐ06/2021/NĐ-CP; số điều cụ thể cần đối chiếu văn bản gốc)"; ghi chú cuối trang cũng cập nhật
- **`exportPhieuYCNT`**: ghi chú cuối trang đổi tương tự
- **`plData` (7 điều Đ.4/11/13/14/19/21/22) CHƯA sửa số điều** — không tìm được bảng đối chiếu điều khoản NĐ207/2026 ↔ NĐ06/2021 miễn phí (LuatVietnam thu phí, toàn văn Công báo không truy cập được qua WebFetch). Bịa số điều mới rủi ro hơn giữ số cũ kèm banner cảnh báo rõ ràng

**Quyết định kỹ thuật:** không tự suy đoán số điều mới khi chưa có nguồn xác thực — cùng nguyên tắc với việc **không** sửa checklist TCVN 4453 khi phát hiện "TCVN 4453:2025" trên thực tế chỉ là bản dự thảo (ký hiệu "202x") chưa được Bộ KHCN công bố chính thức, chưa có Quyết định công bố. Xem chi tiết đầy đủ đợt rà soát tại `d:\HOC TAP\CLAUDE.md` mục "Tiêu chuẩn áp dụng".

**Build:** ✅ `vite build` 256ms, 0 lỗi. **Lint:** ✅ 0 lỗi. **SW cache:** tự bump qua plugin (nguồn giữ `qcf-v6`).

---

### Sprint 6: Mã BB tự sinh + Kiểm soát hồ sơ (2026-08-28) — ✅ Live (commit `f1315f7`)

Phục vụ vai trò Chỉ huy phó nội nghiệp (kiểm soát, không trực tiếp làm hồ sơ).

- **`genMaBB(session, settings)`** — mã `[viết tắt hạng mục]-[LOẠI]-[STT]` (vd hạng mục "Phần thân - Tầng 5" → `PTT5-CT-3`); `initialsTag` bỏ dấu tiếng Việt, giữ số cuối nếu ≤4 ký tự. STT = số session đã có mã cùng tiền tố + 1 — **tính từ session hiện có, không lưu bộ đếm riêng**.
- **`markExported(session, "ycnt"|"bbnt")`** — gọi khi bấm Phiếu YCNT / Biên bản NT: gán `maBB` (giữ mã cũ nếu đã có) + cờ `exportedYCNT`/`exportedBBNT` trên session. Mã in trên đầu cả 2 mẫu PDF.
- **`ControlScreen`** (tab `kiemsoat`, thẻ đầu tiên trên Dashboard) — bảng toàn bộ phiên nghiệm thu: Mã BB, loại · vị trí, ngày, đã xuất YCNT/BBNT, kết luận; lọc theo loại. Phát hiện hồ sơ còn thiếu.
- Trường mới trên session (`maBB`, `exportedYCNT`, `exportedBBNT`) đều optional → session cũ hiện "Chưa cấp".

---

### Sprint 7: Cảnh báo bộ nhớ đầy (2026-10-10) — ✅ Code xong, verify trên browser

Rà soát sau 6 tuần không dùng phát hiện: **9 chỗ ghi localStorage nuốt lỗi im lặng** (`catch {}`) → khi đầy quota, UI vẫn hiện dữ liệu nhưng tải lại trang là mất, không có dấu hiệu gì. Với ảnh base64 trong session, ~25–40 ảnh là chạm giới hạn.

- **`lsSet(key, str)`** thay toàn bộ 9 chỗ `try{setItem}catch{}`; thất bại → `window.dispatchEvent(new Event("qcm-storage-full"))`
- **Banner đỏ trong `App`** (giữa header và nội dung, mọi tab): "Bộ nhớ thiết bị đã đầy — dữ liệu vừa nhập CHƯA được lưu" + nút "⬇️ Sao lưu ngay" (`exportAllData`) + nút × đóng. Hiện lại ở lần ghi thất bại tiếp theo.
- **Thanh dung lượng** trong Báo cáo → Cài đặt (khối Sao lưu): `lsUsage()` / `LS_LIMIT`, xanh <70%, cam 70–89%, đỏ ≥90%.
- **Giới hạn đã biết:** "Sao lưu ngay" chỉ sao lưu phần ĐÃ lưu trong localStorage — phần vừa nhập bị từ chối nằm trong state bộ nhớ, không vào file backup. Banner nói rõ điều này. Sửa tận gốc = chuyển ảnh sang IndexedDB (chưa làm, chờ khi dùng lại cho dự án nhiều ảnh).

**Verify (Chrome, `vite preview`):** golden path thanh hiện `≈ 0.0 / 5 MB (0%)`; edge case nhồi đầy localStorage rồi gõ vào ô cài đặt → banner hiện, thanh `≈ 5.0 / 5 MB (100%)` màu đỏ (khớp giới hạn thật của Chrome); nút × ẩn banner. **Build:** ✅ 197ms. **Lint:** ✅ 0 lỗi.

---

### Sprint 8: Bỏ lưu ảnh trong app (2026-10-10) — ✅ Code xong, verify trên browser

Quyết định của người dùng (sau Sprint 7): **không lưu ảnh trong app** để không bao giờ đầy bộ nhớ. Ảnh hiện trường để ở máy ảnh / Zalo. Rà code phát hiện thêm: ảnh tồn tại (`hPh`) lưu **nguyên gốc không nén** qua `readAsDataURL` → 1 ảnh camera 3–5 MB có thể đầy ngay tấm đầu.

- **Bỏ đường nhập ảnh ở cả 3 chỗ:** nút 📷 trong `GenCL` (mỗi hạng mục), ô "📸 Ảnh" trong form tồn tại (`NKScreen`), "📸 Ảnh bằng chứng" trong modal khắc phục. Gỡ `compressImage`, `addPhotos`, `uploading`, `hPh`, state `ph`.
- **Ảnh cũ giữ nguyên:** vẫn hiển thị, vẫn xoá từng ảnh được (`removePhoto`), vẫn in trong PDF Checklist nội bộ. Tồn tại mới ghi `ph: []`; khắc phục mới ghi `closurePhotos: []` (giữ shape cũ).
- **Nút "🗑️ Xoá toàn bộ ảnh cũ (N ảnh)"** trong Báo cáo → Cài đặt: `countPhotos()` + `purgeAllPhotos()` (cạnh `exportAllData`). Xoá `photos` mọi session + `ph`/`closurePhotos` mọi tồn tại, giữ nguyên chữ; `confirm` nhắc Sao lưu trước, xong `reload()`. Nút khoá khi N = 0. Không có key `qcm_loi` → không ghi (giữ dữ liệu mẫu `loiInit`).
- Biên bản NT / Phiếu YCNT / Báo cáo tuần **vốn không dùng ảnh** → không ảnh hưởng.

**Verify (Chrome, dữ liệu giả 1 phiên 2 ảnh + 1 tồn tại 1 ảnh + 1 khắc phục 1 ảnh):** checklist 0 ô chụp, 2 ảnh cũ vẫn hiện; tạo tồn tại mới → lưu `ph: []`; modal khắc phục không còn mục ảnh, ghi chú bắt buộc vẫn chạy; nút xoá hiện "(4 ảnh)" → sau xoá: ảnh = 0, `results`/`bienphap`/`location`/`closureNote` nguyên vẹn, nút về "(0 ảnh)" bị khoá. **Build:** ✅ 210ms. **Lint:** ✅ 0 lỗi.

---

## Bước tiếp theo gợi ý

### Ưu tiên cao
1. **Bước 4 — Đa thiết bị (nếu cần)**: hiện dữ liệu chỉ ở localStorage 1 browser/máy; backup/restore JSON (Bước 1) đã giải quyết tạm việc chuyển dữ liệu thủ công. Nếu cần đồng bộ thật giữa nhiều thiết bị/nhiều người dùng cùng lúc thì mới cần backend nhẹ — cân nhắc kỹ trước khi làm vì đổi từ "không backend" sang "có backend" là thay đổi kiến trúc lớn.
2. **Thay mẫu PDF tham khảo bằng mẫu thật của dự án** — `exportPhieuYCNT`/`exportBienBanNghiemThu` đang dùng mẫu tham khảo theo NĐ207/2026/NĐ-CP (đổi từ NĐ 06/2021 ở Sprint 5); khi TVGS/CĐT cung cấp mẫu thật, sửa nội dung HTML trong 2 hàm này (hoặc dùng cơ chế upload `.xlsx` ở tab "Mẫu biểu" nếu mẫu thật là file Excel).
3. **Đối chiếu số điều chính xác NĐ207/2026 ↔ NĐ06/2021 khi có nguồn miễn phí** — `plData` (7 mục) hiện vẫn hiển thị số điều NĐ06 cũ kèm banner cảnh báo (Sprint 5); cập nhật số điều mới khi có bảng so sánh đầy đủ (LuatVietnam bán, hoặc toàn văn Công báo Chính phủ).

### Ưu tiên trung bình
4. **Mở rộng `defectData`** — hiện 3 cảnh báo/loại; có thể bổ sung thêm khi gặp lỗi thực tế mới trong quá trình dùng.
5. **Thông báo deadline tồn tại** — Web Notifications API cảnh báo tồn tại sắp hết hạn (cần user grant permission).

### Ưu tiên thấp / Tương lai
6. **Đa dự án** — hiện app chỉ hỗ trợ 1 dự án cụ thể (đúng mục tiêu Sprint 3); nếu sau này dùng cho nhiều dự án khác nhau thì mới cần project switcher.

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
| SW cache key tự bump khi build (plugin `sw-cache-bump`, từ 05/07/2026) | Stale-while-revalidate phục vụ cached bundle trước; không đổi key thì người dùng kẹt ở bản cũ vô thời hạn — plugin bỏ bước sửa tay hay bị quên |
| Backward-compatible data model | Các trường `thauphu`, `deadline`... là optional → dữ liệu lỗi cũ trong localStorage không bị break |
| `settings` đọc qua `initSettings()` tại thời điểm export, không truyền props | Cùng pattern với các hàm đọc localStorage khác trong file; không cần đổi chữ ký props của `GenCL` |
| `DefectModal` tách riêng, không tái dùng `EmgModal` | `EmgModal` có drill-down 2 cấp + urgency badge cho tình huống khẩn cấp nhiều bước; `defectData` chỉ là cảnh báo ngắn 1 cấp — ép chung 1 component sẽ phải thêm mode switch không cần thiết |
| `prepChecked` (checklist trước khi gọi TVGS) không lưu localStorage/session | Chỉ là tự-kiểm cuối cùng trước khi xuất hồ sơ, không phải dữ liệu nghiệm thu; lưu sẽ cần đổi schema session + migrate session cũ mà không ai đọc lại giá trị này sau đó |
| Không lưu ảnh trong app (10/10/2026) | localStorage ~5 MB, ảnh base64 làm đầy sau vài chục tấm và mất dữ liệu. Ảnh hiện trường vốn đã nằm ở máy ảnh/Zalo; Biên bản NT/YCNT không dùng ảnh. Chọn bỏ thay vì IndexedDB để giữ app đơn giản |
| Vercel Root Directory = `.` (rỗng) từ 25/06/2026 | Repo đã migrate sang standalone (không còn monorepo). Root Directory = rỗng = toàn bộ repo là app. Trước 25/06 là `qc-field-manager` khi còn monorepo — không dùng giá trị cũ đó nữa |
