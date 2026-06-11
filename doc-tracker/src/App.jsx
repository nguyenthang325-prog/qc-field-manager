import { useState, useEffect, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { sb } from './supabase.js';

async function sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function mapToDB(doc, code) {
  return {
    id: doc.id,
    project_code: code,
    so_hieu_doc: doc.soHieuDoc || null,
    ten_doc: doc.tenDoc,
    loai_doc: doc.loaiDoc || null,
    du_an: doc.duAn || null,
    don_vi_gui: doc.donViGui || null,
    don_vi_nhan: doc.donViNhan || null,
    trang_thai: doc.trangThai || 'cho_nop',
    ngay_nop_du_kien: doc.ngayNopDuKien || null,
    ngay_het_han: doc.ngayHetHan || null,
    ngay_hoan_thanh: doc.ngayHoanThanh || null,
    sla_ngay: doc.slaNgay || null,
    so_lan_tra_lai: doc.soLanTraLai || 0,
    nguoi_phu_trach: doc.nguoiPhuTrach || null,
    tags: doc.tags || [],
    link_drive: doc.linkDrive || null,
    ghi_chu: doc.ghiChu || null,
    history: doc.history || [],
    created_at: doc.createdAt || new Date().toISOString(),
  };
}

function mapFromDB(row) {
  return {
    id: row.id,
    soHieuDoc: row.so_hieu_doc || '',
    tenDoc: row.ten_doc,
    loaiDoc: row.loai_doc || '',
    duAn: row.du_an || '',
    donViGui: row.don_vi_gui || '',
    donViNhan: row.don_vi_nhan || '',
    trangThai: row.trang_thai || 'cho_nop',
    ngayNopDuKien: row.ngay_nop_du_kien || '',
    ngayHetHan: row.ngay_het_han || '',
    ngayHoanThanh: row.ngay_hoan_thanh || '',
    slaNgay: row.sla_ngay || SLA_DEFAULTS[row.loai_doc] || 14,
    soLanTraLai: row.so_lan_tra_lai || 0,
    nguoiPhuTrach: row.nguoi_phu_trach || '',
    tags: row.tags || [],
    linkDrive: row.link_drive || '',
    ghiChu: row.ghi_chu || '',
    history: row.history || [],
    createdAt: row.created_at,
  };
}

const NAVY = "#1e3a8a";
const RED = "#ef4444"; const RED_BG = "#fef2f2";
const ORANGE = "#f59e0b"; const ORANGE_BG = "#fffbeb";
const GREEN = "#22c55e"; const GREEN_BG = "#f0fdf4";
const GRAY = "#94a3b8"; const GRAY_BG = "#f8fafc";

const SLA_DEFAULTS = { thiet_ke: 14, nghiem_thu: 7, phap_ly: 30, hanh_chinh: 5 };
const TYPE_LABELS = { thiet_ke: "Thiết kế / BV", nghiem_thu: "Biên bản NT", phap_ly: "Pháp lý / GP", hanh_chinh: "Hành chính" };
const TYPE_COLORS = { thiet_ke: "#3b82f6", nghiem_thu: "#10b981", phap_ly: "#8b5cf6", hanh_chinh: "#f97316" };
const STATUS_LABELS = { cho_nop: "Chờ nộp", dang_duyet: "Đang duyệt", da_duyet: "Đã duyệt" };
const STATUS_COLORS = { cho_nop: "#64748b", dang_duyet: "#f59e0b", da_duyet: "#22c55e" };
const ALL_TYPES = ["thiet_ke", "nghiem_thu", "phap_ly", "hanh_chinh"];
const ALL_STATUSES = ["cho_nop", "dang_duyet", "da_duyet"];

// ── ICONS ────────────────────────────────────────────────────────────────────
function Ic({ n, s = 18, c = "currentColor" }) {
  const a = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: c, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", flexShrink: 0 };
  if (n === "home") return <svg {...a}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
  if (n === "list") return <svg {...a}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
  if (n === "bell") return <svg {...a}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
  if (n === "settings") return <svg {...a}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
  if (n === "plus") return <svg {...a}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
  if (n === "x") return <svg {...a}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
  if (n === "edit") return <svg {...a}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
  if (n === "trash") return <svg {...a}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
  if (n === "copy") return <svg {...a}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>;
  if (n === "search") return <svg {...a}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
  if (n === "filter") return <svg {...a}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
  if (n === "chev-d") return <svg {...a}><polyline points="6 9 12 15 18 9"/></svg>;
  if (n === "chev-r") return <svg {...a}><polyline points="9 18 15 12 9 6"/></svg>;
  if (n === "chev-l") return <svg {...a}><polyline points="15 18 9 12 15 6"/></svg>;
  if (n === "menu") return <svg {...a}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
  if (n === "link") return <svg {...a}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;
  if (n === "clock") return <svg {...a}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
  if (n === "tag") return <svg {...a}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
  if (n === "undo") return <svg {...a}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>;
  if (n === "print") return <svg {...a}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
  if (n === "download") return <svg {...a}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
  if (n === "upload") return <svg {...a}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
  if (n === "alert") return <svg {...a}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
  if (n === "check") return <svg {...a}><polyline points="20 6 9 17 4 12"/></svg>;
  if (n === "doc") return <svg {...a}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
  if (n === "sort-asc") return <svg {...a}><polyline points="17 11 12 6 7 11"/><line x1="12" y1="6" x2="12" y2="18"/></svg>;
  if (n === "sort-desc") return <svg {...a}><polyline points="17 13 12 18 7 13"/><line x1="12" y1="18" x2="12" y2="6"/></svg>;
  if (n === "sort") return <svg {...a}><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>;
  return null;
}

// ── UTILITIES ────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
function isoToday() { return new Date().toISOString().slice(0, 10); }
function addDays(iso, n) {
  if (!iso) return "";
  const d = new Date(iso); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function daysUntil(iso) {
  if (!iso) return null;
  const diff = new Date(iso) - new Date(isoToday());
  return Math.ceil(diff / 86400000);
}
function normalizeStr(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
function getDocUrgency(doc) {
  const today = isoToday();
  if (doc.trangThai === "da_duyet") return { color: GRAY, bg: GRAY_BG, label: "Hoàn thành", days: null };
  if (doc.ngayHetHan && today > doc.ngayHetHan) {
    const d = Math.abs(daysUntil(doc.ngayHetHan));
    return { color: RED, bg: RED_BG, label: `Quá hạn ${d} ngày`, days: -d };
  }
  if (doc.ngayHetHan) {
    const d = daysUntil(doc.ngayHetHan);
    if (d <= 3) return { color: ORANGE, bg: ORANGE_BG, label: `Còn ${d} ngày`, days: d };
  }
  if (doc.ngayNopDuKien && today > doc.ngayNopDuKien)
    return { color: ORANGE, bg: ORANGE_BG, label: "Trễ nộp", days: null };
  return { color: GREEN, bg: GREEN_BG, label: "Đúng tiến độ", days: null };
}
function nowIso() { return new Date().toISOString(); }
function makeId() { return "doc_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6); }

// ── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1e293b", color: "#fff", padding: "10px 20px", borderRadius: 8, zIndex: 9999, fontSize: 14, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
      {msg}
    </div>
  );
}

// ── ALERT BANNER ─────────────────────────────────────────────────────────────
function AlertBanner({ docs, onViewOverdue }) {
  const today = isoToday();
  const overdue = docs.filter(d => d.trangThai !== "da_duyet" && d.ngayHetHan && today > d.ngayHetHan);
  const soon = docs.filter(d => {
    if (d.trangThai === "da_duyet" || !d.ngayHetHan) return false;
    const dl = daysUntil(d.ngayHetHan);
    return dl !== null && dl >= 0 && dl <= 3;
  });
  if (!overdue.length && !soon.length) return null;
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
      {overdue.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 16px", background: RED_BG, borderBottom: soon.length ? `1px solid #fecaca` : "none" }}>
          <Ic n="alert" s={15} c={RED} />
          <span style={{ fontSize: 13, color: "#991b1b", fontWeight: 600 }}>
            {overdue.length} hồ sơ QUÁ HẠN:&nbsp;
            <span style={{ fontWeight: 400 }}>{overdue.slice(0, 3).map(d => d.soHieuDoc || d.tenDoc).join(", ")}{overdue.length > 3 ? ` +${overdue.length - 3}` : ""}</span>
          </span>
          <button onClick={onViewOverdue} style={{ marginLeft: "auto", fontSize: 12, color: RED, background: "none", border: "none", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>Xem →</button>
        </div>
      )}
      {soon.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 16px", background: ORANGE_BG }}>
          <Ic n="clock" s={15} c={ORANGE} />
          <span style={{ fontSize: 13, color: "#92400e", fontWeight: 600 }}>
            {soon.length} hồ sơ sắp đến hạn (≤3 ngày):&nbsp;
            <span style={{ fontWeight: 400 }}>{soon.slice(0, 3).map(d => d.soHieuDoc || d.tenDoc).join(", ")}{soon.length > 3 ? ` +${soon.length - 3}` : ""}</span>
          </span>
          <button onClick={onViewOverdue} style={{ marginLeft: "auto", fontSize: 12, color: ORANGE, background: "none", border: "none", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>Xem →</button>
        </div>
      )}
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function Sidebar({ tab, setTab, loaiFilter, setLoaiFilter, docs, collapsed, setCollapsed }) {
  const today = isoToday();
  const overdueCount = docs.filter(d => d.trangThai !== "da_duyet" && d.ngayHetHan && today > d.ngayHetHan).length;
  const navItem = (id, icon, label, badge, onClick) => {
    const active = onClick ? false : (tab === id && !loaiFilter);
    return (
      <button key={id} onClick={onClick || (() => { setTab(id); setLoaiFilter(null); })}
        title={collapsed ? label : ""}
        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: collapsed ? "10px 0" : "9px 14px", justifyContent: collapsed ? "center" : "flex-start", background: active ? "#e0e7ff" : "none", border: "none", borderRadius: 8, cursor: "pointer", color: active ? NAVY : "#475569", fontWeight: active ? 600 : 400, fontSize: 13, transition: "background .15s", marginBottom: 2, position: "relative" }}>
        <Ic n={icon} s={17} c={active ? NAVY : "#64748b"} />
        {!collapsed && <span style={{ flex: 1, textAlign: "left" }}>{label}</span>}
        {badge > 0 && (
          <span style={{ background: RED, color: "#fff", borderRadius: 99, fontSize: 11, fontWeight: 700, padding: "1px 6px", minWidth: 20, textAlign: "center", position: collapsed ? "absolute" : "static", top: collapsed ? 6 : "auto", right: collapsed ? 6 : "auto" }}>{badge}</span>
        )}
      </button>
    );
  };
  const typeItem = (loai) => {
    const count = docs.filter(d => d.loaiDoc === loai).length;
    const active = loaiFilter === loai && tab === "docs";
    return (
      <button key={loai} onClick={() => { setTab("docs"); setLoaiFilter(loai); }}
        title={collapsed ? TYPE_LABELS[loai] : ""}
        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: collapsed ? "8px 0" : "7px 14px", justifyContent: collapsed ? "center" : "flex-start", background: active ? "#e0e7ff" : "none", border: "none", borderRadius: 8, cursor: "pointer", color: active ? NAVY : "#64748b", fontSize: 13, fontWeight: active ? 600 : 400, marginBottom: 2 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: TYPE_COLORS[loai], flexShrink: 0 }} />
        {!collapsed && <span style={{ flex: 1, textAlign: "left" }}>{TYPE_LABELS[loai]}</span>}
        {!collapsed && count > 0 && <span style={{ fontSize: 11, color: "#94a3b8", background: "#f1f5f9", borderRadius: 99, padding: "1px 6px" }}>{count}</span>}
      </button>
    );
  };
  return (
    <div style={{ width: collapsed ? 52 : 220, minWidth: collapsed ? 52 : 220, background: "#fff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", padding: "8px 6px", overflowY: "auto", transition: "width .2s, min-width .2s" }}>
      {navItem("home", "home", "Tổng quan")}
      {navItem("docs", "list", "Tất cả tài liệu")}
      {navItem("overdue", "bell", "Quá hạn", overdueCount)}
      <div style={{ height: 1, background: "#e2e8f0", margin: "8px 4px" }} />
      {ALL_TYPES.map(typeItem)}
      <div style={{ height: 1, background: "#e2e8f0", margin: "8px 4px" }} />
      {navItem("settings", "settings", "Cài đặt")}
      <div style={{ flex: 1 }} />
      <button onClick={() => setCollapsed(c => !c)}
        title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", background: "none", border: "none", borderRadius: 8, cursor: "pointer", color: "#94a3b8" }}>
        <Ic n={collapsed ? "chev-r" : "chev-l"} s={16} />
      </button>
    </div>
  );
}

// ── STATUS POPOVER ────────────────────────────────────────────────────────────
function StatusPopover({ doc, onSave, onClose, anchorRef }) {
  const [sel, setSel] = useState(doc.trangThai);
  const [note, setNote] = useState("");
  const ref = useRef();
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target) && (!anchorRef?.current || !anchorRef.current.contains(e.target))) onClose(); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef]);
  return (
    <div ref={ref} style={{ position: "absolute", zIndex: 500, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", padding: 14, minWidth: 200, top: "100%", left: 0 }}>
      {ALL_STATUSES.map(s => (
        <label key={s} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 4px", cursor: "pointer", borderRadius: 6, background: sel === s ? "#eff6ff" : "none" }}>
          <input type="radio" checked={sel === s} onChange={() => setSel(s)} style={{ accentColor: NAVY }} />
          <span style={{ fontSize: 13, color: sel === s ? NAVY : "#374151", fontWeight: sel === s ? 600 : 400 }}>{STATUS_LABELS[s]}</span>
        </label>
      ))}
      <div style={{ height: 1, background: "#e2e8f0", margin: "8px 0" }} />
      <input value={note} onChange={e => setNote(e.target.value)} placeholder="Ghi chú (tuỳ chọn)" style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 6, padding: "5px 8px", fontSize: 12, outline: "none" }} />
      <button onClick={() => { onSave(sel, note); onClose(); }}
        style={{ marginTop: 8, width: "100%", background: NAVY, color: "#fff", border: "none", borderRadius: 6, padding: "7px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
        Lưu
      </button>
    </div>
  );
}

// ── FILTER TOOLBAR ────────────────────────────────────────────────────────────
const FILTERS_DEFAULT = { q: "", loai: null, status: null, quick: null, sort: "deadline_asc", tag: null, dateFrom: null, dateTo: null };

function FilterToolbar({ filters, setFilters, searchRef, allTags }) {
  const quickFilters = [
    { id: "week", label: "Tuần này" },
    { id: "month", label: "Tháng này" },
    { id: "overdue", label: "Quá hạn" },
  ];
  const pill = (active, label, onClick, color) => (
    <button onClick={onClick} style={{ padding: "4px 12px", borderRadius: 99, border: `1px solid ${active ? (color || NAVY) : "#e2e8f0"}`, background: active ? (color || NAVY) : "#fff", color: active ? "#fff" : "#475569", fontSize: 12, fontWeight: active ? 600 : 400, cursor: "pointer", whiteSpace: "nowrap" }}>
      {label}
    </button>
  );
  const hasActive = filters.q || filters.loai || filters.status || filters.quick || filters.tag || filters.dateFrom || filters.dateTo;
  const dateInputStyle = { border: "1px solid #e2e8f0", borderRadius: 6, padding: "5px 7px", fontSize: 12, color: "#374151", cursor: "pointer", outline: "none" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "10px 16px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 340 }}>
          <input ref={searchRef} value={filters.q} onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
            placeholder="Tìm kiếm...  Ctrl+K"
            style={{ width: "100%", paddingLeft: 32, paddingRight: 8, paddingTop: 7, paddingBottom: 7, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          <div style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><Ic n="search" s={15} c="#94a3b8" /></div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {quickFilters.map(qf => pill(filters.quick === qf.id, qf.label, () => setFilters(f => ({ ...f, quick: f.quick === qf.id ? null : qf.id, dateFrom: null, dateTo: null })), qf.id === "overdue" ? RED : ORANGE))}
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>Hạn:</span>
          <input type="date" value={filters.dateFrom || ""} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value || null, quick: null }))} style={dateInputStyle} />
          <span style={{ fontSize: 11, color: "#94a3b8" }}>→</span>
          <input type="date" value={filters.dateTo || ""} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value || null, quick: null }))} style={dateInputStyle} />
        </div>
        <select value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
          style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, color: "#374151", background: "#fff", cursor: "pointer" }}>
          <option value="deadline_asc">Hạn gần nhất</option>
          <option value="deadline_desc">Hạn xa nhất</option>
          <option value="created_desc">Mới nhất</option>
          <option value="urgency">Khẩn cấp nhất</option>
        </select>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <Ic n="filter" s={13} c="#94a3b8" />
        {pill(!filters.loai, "Tất cả", () => setFilters(f => ({ ...f, loai: null })))}
        {ALL_TYPES.map(t => pill(filters.loai === t, TYPE_LABELS[t], () => setFilters(f => ({ ...f, loai: f.loai === t ? null : t })), TYPE_COLORS[t]))}
        <div style={{ width: 1, height: 16, background: "#e2e8f0", margin: "0 4px" }} />
        {pill(!filters.status, "Tất cả TT", () => setFilters(f => ({ ...f, status: null })))}
        {ALL_STATUSES.map(s => pill(filters.status === s, STATUS_LABELS[s], () => setFilters(f => ({ ...f, status: f.status === s ? null : s })), STATUS_COLORS[s]))}
        {allTags.length > 0 && <>
          <div style={{ width: 1, height: 16, background: "#e2e8f0", margin: "0 4px" }} />
          <select value={filters.tag || ""} onChange={e => setFilters(f => ({ ...f, tag: e.target.value || null }))}
            style={{ padding: "4px 8px", border: "1px solid #e2e8f0", borderRadius: 99, fontSize: 12, color: "#475569", background: "#fff" }}>
            <option value="">Tag: Tất cả</option>
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </>}
        {hasActive && (
          <button onClick={() => setFilters(FILTERS_DEFAULT)}
            style={{ marginLeft: "auto", padding: "4px 10px", borderRadius: 99, border: "1px solid #fecaca", background: "#fff", color: RED, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 500 }}>
            ✕ Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}

// ── DOC TABLE ────────────────────────────────────────────────────────────────
function DocTable({ docs, filteredDocs, selectedIds, setSelectedIds, onDetail, onEdit, onDelete, onDuplicate, onStatusChange, searchQ }) {
  const [popoverId, setPopoverId] = useState(null);
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const hasLink = filteredDocs.some(d => d.linkDrive);

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }
  function toggleAll(e) {
    if (e.target.checked) setSelectedIds(filteredDocs.map(d => d.id));
    else setSelectedIds([]);
  }
  function toggleOne(id) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  function highlight(text) {
    if (!searchQ || !text) return text || "";
    const norm = normalizeStr(searchQ);
    const idx = normalizeStr(text).indexOf(norm);
    if (idx === -1) return text;
    return <>{text.slice(0, idx)}<mark style={{ background: "#fef08a", borderRadius: 2 }}>{text.slice(idx, idx + searchQ.length)}</mark>{text.slice(idx + searchQ.length)}</>;
  }

  const thStyle = (col) => ({
    padding: "9px 10px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b",
    background: "#f8fafc", borderBottom: "2px solid #e2e8f0", cursor: "pointer", whiteSpace: "nowrap",
    userSelect: "none", position: "sticky", top: 0, zIndex: 10
  });

  return (
    <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
      {filteredDocs.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 12, color: "#94a3b8" }}>
          <Ic n="doc" s={48} c="#cbd5e1" />
          <p style={{ fontSize: 15, fontWeight: 500 }}>Không tìm thấy hồ sơ nào</p>
          <p style={{ fontSize: 13 }}>Thử thay đổi bộ lọc hoặc thêm hồ sơ mới</p>
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ ...thStyle(), width: 36 }}><input type="checkbox" onChange={toggleAll} checked={selectedIds.length === filteredDocs.length && filteredDocs.length > 0} style={{ accentColor: NAVY }} /></th>
              <th style={thStyle()} onClick={() => toggleSort("soHieuDoc")}>#&nbsp;{sortCol === "soHieuDoc" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
              <th style={{ ...thStyle(), minWidth: 200 }} onClick={() => toggleSort("tenDoc")}>Tên tài liệu&nbsp;{sortCol === "tenDoc" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
              <th style={thStyle()}>Loại</th>
              <th style={thStyle()} onClick={() => toggleSort("trangThai")}>Trạng thái</th>
              <th style={thStyle()} onClick={() => toggleSort("ngayNopDuKien")}>Hạn nộp</th>
              <th style={thStyle()} onClick={() => toggleSort("ngayHetHan")}>Ngày hết hạn</th>
              <th style={{ ...thStyle(), minWidth: 120 }}>Cảnh báo</th>
              <th style={thStyle()}>Trả lại</th>
              <th style={thStyle()}>Tags</th>
              {hasLink && <th style={thStyle()}>Link</th>}
              <th style={thStyle()}>Người PT</th>
              <th style={{ ...thStyle(), width: 100 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map(doc => {
              const urg = getDocUrgency(doc);
              const isSel = selectedIds.includes(doc.id);
              return (
                <tr key={doc.id}
                  onClick={e => { if (e.target.closest("button,a,input,select")) return; onDetail(doc.id); }}
                  style={{ background: isSel ? "#eff6ff" : urg.bg, borderBottom: "1px solid #e2e8f0", cursor: "pointer", transition: "filter .1s" }}
                  onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.97)"}
                  onMouseLeave={e => e.currentTarget.style.filter = "none"}>
                  <td style={{ padding: "8px 10px" }} onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={isSel} onChange={() => toggleOne(doc.id)} style={{ accentColor: NAVY }} />
                  </td>
                  <td style={{ padding: "8px 10px", color: "#64748b", fontFamily: "monospace", fontSize: 12, whiteSpace: "nowrap" }}>{highlight(doc.soHieuDoc) || "—"}</td>
                  <td style={{ padding: "8px 10px", fontWeight: 500, color: "#1e293b" }}>
                    <div style={{ borderLeft: `3px solid ${TYPE_COLORS[doc.loaiDoc] || GRAY}`, paddingLeft: 8 }}>{highlight(doc.tenDoc)}</div>
                    {doc.duAn && <div style={{ fontSize: 11, color: "#94a3b8", paddingLeft: 11, marginTop: 2 }}>{highlight(doc.duAn)}</div>}
                  </td>
                  <td style={{ padding: "8px 10px" }}>
                    <span style={{ fontSize: 11, background: TYPE_COLORS[doc.loaiDoc] + "22", color: TYPE_COLORS[doc.loaiDoc], borderRadius: 99, padding: "2px 8px", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {TYPE_LABELS[doc.loaiDoc] || doc.loaiDoc}
                    </span>
                  </td>
                  <td style={{ padding: "8px 10px", position: "relative" }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => setPopoverId(popoverId === doc.id ? null : doc.id)}
                      style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", border: `1px solid ${STATUS_COLORS[doc.trangThai]}40`, borderRadius: 99, background: STATUS_COLORS[doc.trangThai] + "18", color: STATUS_COLORS[doc.trangThai], fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                      {STATUS_LABELS[doc.trangThai]}
                      <Ic n="chev-d" s={11} c={STATUS_COLORS[doc.trangThai]} />
                    </button>
                    {popoverId === doc.id && (
                      <StatusPopover doc={doc}
                        onSave={(newStatus, note) => onStatusChange(doc.id, newStatus, note)}
                        onClose={() => setPopoverId(null)} />
                    )}
                  </td>
                  <td style={{ padding: "8px 10px", fontSize: 12, color: "#475569", whiteSpace: "nowrap" }}>{formatDate(doc.ngayNopDuKien)}</td>
                  <td style={{ padding: "8px 10px", fontSize: 12, fontWeight: 500, color: urg.color, whiteSpace: "nowrap" }}>{formatDate(doc.ngayHetHan)}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 99, background: urg.color + "18", color: urg.color, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{urg.label}</span>
                  </td>
                  <td style={{ padding: "8px 10px", textAlign: "center" }}>
                    {doc.soLanTraLai > 0 && <span style={{ color: RED, fontWeight: 700, fontSize: 13 }}>{doc.soLanTraLai}</span>}
                  </td>
                  <td style={{ padding: "8px 10px" }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 150 }}>
                      {(doc.tags || []).slice(0, 2).map(t => (
                        <span key={t} style={{ fontSize: 10, background: "#e0e7ff", color: NAVY, borderRadius: 99, padding: "1px 6px" }}>{t}</span>
                      ))}
                      {(doc.tags || []).length > 2 && <span style={{ fontSize: 10, color: "#94a3b8" }}>+{doc.tags.length - 2}</span>}
                    </div>
                  </td>
                  {hasLink && (
                    <td style={{ padding: "8px 10px", textAlign: "center" }}>
                      {doc.linkDrive && <a href={doc.linkDrive} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: NAVY }}><Ic n="link" s={16} /></a>}
                    </td>
                  )}
                  <td style={{ padding: "8px 10px", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{doc.nguoiPhuTrach || "—"}</td>
                  <td style={{ padding: "8px 10px" }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: 4, opacity: 0 }} className="row-actions"
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                      <button onClick={() => onDuplicate(doc.id)} title="Nhân bản" style={actionBtnStyle}><Ic n="copy" s={14} /></button>
                      <button onClick={() => onEdit(doc.id)} title="Sửa" style={actionBtnStyle}><Ic n="edit" s={14} /></button>
                      <button onClick={() => onDelete(doc.id)} title="Xóa" style={{ ...actionBtnStyle, color: RED }}><Ic n="trash" s={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <style>{`.row-actions { opacity: 0 !important; } tr:hover .row-actions { opacity: 1 !important; }`}</style>
    </div>
  );
}
const actionBtnStyle = { background: "none", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 6px", cursor: "pointer", color: "#475569", display: "flex", alignItems: "center" };

// ── BATCH ACTIONS BAR ─────────────────────────────────────────────────────────
function BatchBar({ selectedIds, docs, onClearSel, onBatchStatus, onBatchDelete }) {
  const [open, setOpen] = useState(false);
  if (!selectedIds.length) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1e293b", color: "#fff", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 12, zIndex: 400, boxShadow: "0 8px 24px rgba(0,0,0,0.3)", whiteSpace: "nowrap" }}>
      <span style={{ fontSize: 13, fontWeight: 600 }}>✓ {selectedIds.length} hồ sơ đã chọn</span>
      <div style={{ position: "relative" }}>
        <button onClick={() => setOpen(o => !o)} style={{ background: "#3b82f6", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          Đổi trạng thái <Ic n="chev-d" s={12} c="#fff" />
        </button>
        {open && (
          <div style={{ position: "absolute", bottom: "110%", left: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", overflow: "hidden", minWidth: 150 }}>
            {ALL_STATUSES.map(s => (
              <button key={s} onClick={() => { onBatchStatus(s); setOpen(false); }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", border: "none", background: "none", fontSize: 13, color: "#374151", cursor: "pointer" }}>
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        )}
      </div>
      <button onClick={onBatchDelete} style={{ background: "#ef4444", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Xóa</button>
      <button onClick={onClearSel} style={{ background: "none", border: "1px solid #475569", color: "#94a3b8", borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>Bỏ chọn</button>
    </div>
  );
}

// ── DETAIL PANEL ──────────────────────────────────────────────────────────────
function DetailPanel({ doc, onClose, onEdit, onDelete, onStatusChange }) {
  if (!doc) return null;
  const urg = getDocUrgency(doc);
  const steps = ["cho_nop", "dang_duyet", "da_duyet"];
  const stepIdx = steps.indexOf(doc.trangThai);
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 300 }} />
      <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 420, background: "#fff", zIndex: 301, boxShadow: "-4px 0 24px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
              <span style={{ fontSize: 11, background: TYPE_COLORS[doc.loaiDoc] + "22", color: TYPE_COLORS[doc.loaiDoc], borderRadius: 99, padding: "2px 8px", fontWeight: 600 }}>{TYPE_LABELS[doc.loaiDoc]}</span>
              <span style={{ fontSize: 11, background: STATUS_COLORS[doc.trangThai] + "22", color: STATUS_COLORS[doc.trangThai], borderRadius: 99, padding: "2px 8px", fontWeight: 600 }}>{STATUS_LABELS[doc.trangThai]}</span>
            </div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.4 }}>{doc.tenDoc}</h2>
            {doc.soHieuDoc && <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{doc.soHieuDoc}</p>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}><Ic n="x" s={20} /></button>
        </div>

        {doc.trangThai !== "da_duyet" && (
          <div style={{ margin: "12px 20px", padding: "10px 14px", background: urg.bg, border: `1px solid ${urg.color}40`, borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <Ic n="alert" s={16} c={urg.color} />
            <span style={{ fontSize: 13, fontWeight: 700, color: urg.color }}>{urg.label}</span>
          </div>
        )}

        <div style={{ padding: "4px 20px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 16 }}>
            {steps.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: i <= stepIdx ? NAVY : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {i <= stepIdx ? <Ic n="check" s={13} c="#fff" /> : <span style={{ fontSize: 11, color: "#94a3b8" }}>{i + 1}</span>}
                  </div>
                  <span style={{ fontSize: 10, color: i <= stepIdx ? NAVY : "#94a3b8", fontWeight: i === stepIdx ? 700 : 400, whiteSpace: "nowrap" }}>{STATUS_LABELS[s]}</span>
                </div>
                {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < stepIdx ? NAVY : "#e2e8f0", margin: "0 4px", marginBottom: 14 }} />}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "0 20px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
          {[
            ["Dự án", doc.duAn],
            ["Đơn vị gửi", doc.donViGui],
            ["Đơn vị nhận", doc.donViNhan],
            ["Người phụ trách", doc.nguoiPhuTrach],
            ["Hạn nộp DK", formatDate(doc.ngayNopDuKien)],
            ["SLA", doc.slaNgay ? `${doc.slaNgay} ngày` : "—"],
            ["Ngày hết hạn", formatDate(doc.ngayHetHan)],
            ["Hoàn thành", formatDate(doc.ngayHoanThanh)],
          ].map(([label, val]) => val && val !== "—" ? (
            <div key={label}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{val}</div>
            </div>
          ) : null)}
          {doc.soLanTraLai > 0 && (
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>Số lần trả lại</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: RED }}>{doc.soLanTraLai} lần</div>
            </div>
          )}
        </div>

        {(doc.tags || []).length > 0 && (
          <div style={{ padding: "0 20px 12px" }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>Tags</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {doc.tags.map(t => <span key={t} style={{ fontSize: 12, background: "#e0e7ff", color: NAVY, borderRadius: 99, padding: "2px 10px" }}>{t}</span>)}
            </div>
          </div>
        )}

        {doc.ghiChu && (
          <div style={{ padding: "0 20px 12px" }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Ghi chú</div>
            <div style={{ fontSize: 13, color: "#374151", background: "#f8fafc", padding: "8px 12px", borderRadius: 8, lineHeight: 1.5 }}>{doc.ghiChu}</div>
          </div>
        )}

        {doc.linkDrive && (
          <div style={{ padding: "0 20px 12px" }}>
            <a href={doc.linkDrive} target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, color: NAVY, fontSize: 13, fontWeight: 600, textDecoration: "none", background: "#eff6ff", padding: "8px 14px", borderRadius: 8, border: "1px solid #bfdbfe" }}>
              <Ic n="link" s={15} c={NAVY} /> Mở tài liệu trên Drive →
            </a>
          </div>
        )}

        {(doc.history || []).length > 0 && (
          <div style={{ padding: "0 20px 12px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 8 }}>Lịch sử thay đổi</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[...doc.history].reverse().map((h, i) => (
                <div key={i} style={{ fontSize: 12, display: "flex", gap: 8, padding: "6px 10px", background: "#f8fafc", borderRadius: 6 }}>
                  <span style={{ color: "#94a3b8", whiteSpace: "nowrap" }}>{formatDate(h.date?.slice(0, 10))}</span>
                  <span style={{ color: "#374151" }}>
                    {h.action}{h.from && h.to ? `: ${STATUS_LABELS[h.from] || h.from} → ${STATUS_LABELS[h.to] || h.to}` : ""}
                    {h.note ? ` — "${h.note}"` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: "12px 20px", borderTop: "1px solid #e2e8f0", display: "flex", gap: 8, marginTop: "auto" }}>
          <button onClick={() => onEdit(doc.id)} style={{ flex: 1, padding: "9px", background: "#eff6ff", color: NAVY, border: `1px solid #bfdbfe`, borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Ic n="edit" s={15} c={NAVY} /> Sửa
          </button>
          <button onClick={() => onDelete(doc.id)} style={{ padding: "9px 14px", background: "#fff", color: RED, border: `1px solid ${RED}40`, borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            <Ic n="trash" s={15} c={RED} />
          </button>
        </div>
      </div>
    </>
  );
}

// ── DOC LIST SCREEN ───────────────────────────────────────────────────────────
function DocListScreen({ docs, loaiFilter, onDetail, onEdit, onDelete, onDuplicate, onStatusChange, selectedIds, setSelectedIds, onBatchStatus, onBatchDelete, searchRef }) {
  const [filters, setFilters] = useState({ ...FILTERS_DEFAULT, loai: loaiFilter || null });
  useEffect(() => { setFilters(f => ({ ...f, loai: loaiFilter || null })); }, [loaiFilter]);
  const today = isoToday();
  const allTags = [...new Set(docs.flatMap(d => d.tags || []))];

  const filtered = docs.filter(doc => {
    if (filters.loai && doc.loaiDoc !== filters.loai) return false;
    if (filters.status && doc.trangThai !== filters.status) return false;
    if (filters.tag && !(doc.tags || []).includes(filters.tag)) return false;
    if (filters.dateFrom || filters.dateTo) {
      if (!doc.ngayHetHan) return false;
      if (filters.dateFrom && doc.ngayHetHan < filters.dateFrom) return false;
      if (filters.dateTo && doc.ngayHetHan > filters.dateTo) return false;
    }
    if (filters.quick === "overdue") {
      if (doc.trangThai === "da_duyet" || !doc.ngayHetHan || today <= doc.ngayHetHan) return false;
    } else if (filters.quick === "week") {
      if (!doc.ngayHetHan) return false;
      const d = daysUntil(doc.ngayHetHan);
      if (d === null || d < 0 || d > 7) return false;
    } else if (filters.quick === "month") {
      if (!doc.ngayHetHan) return false;
      const d = daysUntil(doc.ngayHetHan);
      if (d === null || d < 0 || d > 30) return false;
    }
    if (filters.q) {
      const q = normalizeStr(filters.q);
      const hay = [doc.tenDoc, doc.soHieuDoc, doc.duAn, doc.nguoiPhuTrach, doc.donViGui, doc.donViNhan, doc.ghiChu, ...(doc.tags || [])].map(normalizeStr).join(" ");
      if (!hay.includes(q)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (filters.sort === "deadline_asc") return (a.ngayHetHan || "9") < (b.ngayHetHan || "9") ? -1 : 1;
    if (filters.sort === "deadline_desc") return (a.ngayHetHan || "") > (b.ngayHetHan || "") ? -1 : 1;
    if (filters.sort === "created_desc") return a.createdAt < b.createdAt ? 1 : -1;
    if (filters.sort === "urgency") {
      const urgOrder = { [RED]: 0, [ORANGE]: 1, [GREEN]: 2, [GRAY]: 3 };
      return (urgOrder[getDocUrgency(a).color] || 3) - (urgOrder[getDocUrgency(b).color] || 3);
    }
    return 0;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <FilterToolbar filters={filters} setFilters={setFilters} searchRef={searchRef} allTags={allTags} />
      <div style={{ padding: "8px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 12, color: "#64748b" }}>
        {filtered.length} / {docs.length} hồ sơ
      </div>
      <DocTable docs={docs} filteredDocs={filtered} selectedIds={selectedIds} setSelectedIds={setSelectedIds}
        onDetail={onDetail} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate}
        onStatusChange={onStatusChange} searchQ={filters.q} />
      <BatchBar selectedIds={selectedIds} docs={docs} onClearSel={() => setSelectedIds([])}
        onBatchStatus={onBatchStatus} onBatchDelete={onBatchDelete} />
    </div>
  );
}

// ── DASHBOARD SCREEN ──────────────────────────────────────────────────────────
function DashScreen({ docs, setTab, setLoaiFilter, onDetail }) {
  const today = isoToday();
  const counts = { cho_nop: 0, dang_duyet: 0, da_duyet: 0 };
  docs.forEach(d => { if (counts[d.trangThai] !== undefined) counts[d.trangThai]++; });

  const typeStats = ALL_TYPES.map(t => {
    const typeDocs = docs.filter(d => d.loaiDoc === t);
    return {
      loai: t,
      total: typeDocs.length,
      cho_nop: typeDocs.filter(d => d.trangThai === "cho_nop").length,
      dang_duyet: typeDocs.filter(d => d.trangThai === "dang_duyet").length,
      overdue: typeDocs.filter(d => d.trangThai !== "da_duyet" && d.ngayHetHan && today > d.ngayHetHan).length,
      traLai: typeDocs.reduce((s, d) => s + (d.soLanTraLai || 0), 0),
    };
  });

  const urgentDocs = docs.filter(d => d.trangThai !== "da_duyet" && d.ngayHetHan)
    .sort((a, b) => a.ngayHetHan < b.ngayHetHan ? -1 : 1).slice(0, 5);

  const statCard = (label, count, color, bg, onClick) => (
    <div onClick={onClick} style={{ flex: 1, background: bg, border: `1px solid ${color}30`, borderRadius: 12, padding: "18px 20px", cursor: onClick ? "pointer" : "default", transition: "transform .1s" }}
      onMouseEnter={e => onClick && (e.currentTarget.style.transform = "scale(1.02)")}
      onMouseLeave={e => onClick && (e.currentTarget.style.transform = "scale(1)")}>
      <div style={{ fontSize: 32, fontWeight: 800, color }}>{count}</div>
      <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        {statCard("Chờ nộp / gửi", counts.cho_nop, "#64748b", "#f8fafc", () => { setTab("docs"); setLoaiFilter(null); })}
        {statCard("Đang trình duyệt", counts.dang_duyet, ORANGE, ORANGE_BG, () => { setTab("docs"); setLoaiFilter(null); })}
        {statCard("Đã duyệt", counts.da_duyet, GREEN, GREEN_BG, () => { setTab("docs"); setLoaiFilter(null); })}
        {statCard("Tổng hồ sơ", docs.length, NAVY, "#eff6ff")}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Phân loại hồ sơ</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Loại", "Tổng", "Chờ nộp", "Đang duyệt", "Trả lại", "Quá hạn"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {typeStats.map(ts => (
                <tr key={ts.loai} onClick={() => { setTab("docs"); setLoaiFilter(ts.loai); }} style={{ cursor: "pointer", borderBottom: "1px solid #f1f5f9" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}>
                  <td style={{ padding: "9px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: TYPE_COLORS[ts.loai], flexShrink: 0 }} />
                      <span style={{ fontWeight: 500 }}>{TYPE_LABELS[ts.loai]}</span>
                    </div>
                  </td>
                  <td style={{ padding: "9px 12px", fontWeight: 700 }}>{ts.total}</td>
                  <td style={{ padding: "9px 12px", color: "#64748b" }}>{ts.cho_nop}</td>
                  <td style={{ padding: "9px 12px", color: ORANGE }}>{ts.dang_duyet}</td>
                  <td style={{ padding: "9px 12px", color: ts.traLai > 0 ? RED : "#94a3b8" }}>{ts.traLai || "—"}</td>
                  <td style={{ padding: "9px 12px" }}>
                    {ts.overdue > 0 ? <span style={{ color: RED, fontWeight: 700 }}>🔴 {ts.overdue}</span> : <span style={{ color: GREEN }}>✓ 0</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", fontSize: 13, fontWeight: 700, color: "#1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Hồ sơ cần xử lý sớm
            <button onClick={() => setTab("overdue")} style={{ fontSize: 12, color: NAVY, background: "none", border: "none", cursor: "pointer" }}>Xem tất cả →</button>
          </div>
          {urgentDocs.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Không có hồ sơ nào cần xử lý</div>
          ) : (
            <div>
              {urgentDocs.map(doc => {
                const urg = getDocUrgency(doc);
                return (
                  <div key={doc.id} onClick={() => onDetail(doc.id)} style={{ padding: "10px 16px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, background: urg.bg }}
                    onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.97)"}
                    onMouseLeave={e => e.currentTarget.style.filter = "none"}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.tenDoc}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{doc.soHieuDoc} · {formatDate(doc.ngayHetHan)}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: urg.color, whiteSpace: "nowrap" }}>{urg.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── OVERDUE SCREEN ────────────────────────────────────────────────────────────
function OverdueScreen({ docs, onDetail }) {
  const today = isoToday();
  const overdue = docs.filter(d => d.trangThai !== "da_duyet" && d.ngayHetHan && today > d.ngayHetHan)
    .sort((a, b) => a.ngayHetHan < b.ngayHetHan ? -1 : 1);
  const soon = docs.filter(d => {
    if (d.trangThai === "da_duyet" || !d.ngayHetHan) return false;
    const dl = daysUntil(d.ngayHetHan);
    return dl !== null && dl >= 0 && dl <= 3;
  }).sort((a, b) => a.ngayHetHan < b.ngayHetHan ? -1 : 1);

  const miniTable = (list, color, bg) => (
    <div style={{ background: "#fff", border: `1px solid ${color}30`, borderRadius: 12, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: bg }}>
            {["Số hiệu", "Tên tài liệu", "Loại", "Trạng thái", "Ngày hết hạn", "Cảnh báo", "Người PT"].map(h => (
              <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color, borderBottom: `1px solid ${color}20` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.map(doc => {
            const urg = getDocUrgency(doc);
            return (
              <tr key={doc.id} onClick={() => onDetail(doc.id)} style={{ cursor: "pointer", borderBottom: "1px solid #f1f5f9", background: urg.bg }}
                onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.97)"}
                onMouseLeave={e => e.currentTarget.style.filter = "none"}>
                <td style={{ padding: "9px 12px", fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>{doc.soHieuDoc || "—"}</td>
                <td style={{ padding: "9px 12px", fontWeight: 500 }}>{doc.tenDoc}</td>
                <td style={{ padding: "9px 12px" }}><span style={{ fontSize: 11, background: TYPE_COLORS[doc.loaiDoc] + "22", color: TYPE_COLORS[doc.loaiDoc], borderRadius: 99, padding: "2px 7px", fontWeight: 600 }}>{TYPE_LABELS[doc.loaiDoc]}</span></td>
                <td style={{ padding: "9px 12px" }}><span style={{ fontSize: 11, color: STATUS_COLORS[doc.trangThai], fontWeight: 600 }}>{STATUS_LABELS[doc.trangThai]}</span></td>
                <td style={{ padding: "9px 12px", fontSize: 12, color: urg.color, fontWeight: 600 }}>{formatDate(doc.ngayHetHan)}</td>
                <td style={{ padding: "9px 12px" }}><span style={{ fontSize: 11, fontWeight: 700, color: urg.color }}>{urg.label}</span></td>
                <td style={{ padding: "9px 12px", fontSize: 12, color: "#64748b" }}>{doc.nguoiPhuTrach || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ padding: 24, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ background: RED_BG, color: RED, border: `1px solid ${RED}30`, borderRadius: 8, padding: "4px 14px", fontSize: 13, fontWeight: 700 }}>🔴 Quá hạn ({overdue.length})</span>
        </div>
        {overdue.length === 0 ? <div style={{ padding: 24, background: GREEN_BG, border: `1px solid ${GREEN}30`, borderRadius: 12, textAlign: "center", color: GREEN, fontSize: 14, fontWeight: 600 }}>✓ Không có hồ sơ nào quá hạn</div>
          : miniTable(overdue, RED, RED_BG)}
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ background: ORANGE_BG, color: ORANGE, border: `1px solid ${ORANGE}30`, borderRadius: 8, padding: "4px 14px", fontSize: 13, fontWeight: 700 }}>🟠 Sắp đến hạn — ≤3 ngày ({soon.length})</span>
        </div>
        {soon.length === 0 ? <div style={{ padding: 24, background: GREEN_BG, border: `1px solid ${GREEN}30`, borderRadius: 12, textAlign: "center", color: GREEN, fontSize: 14, fontWeight: 600 }}>✓ Không có hồ sơ nào sắp đến hạn</div>
          : miniTable(soon, ORANGE, ORANGE_BG)}
      </div>
    </div>
  );
}

// ── DOC FORM MODAL ────────────────────────────────────────────────────────────
function DocFormModal({ editDoc, onClose, onSave }) {
  const empty = { id: "", soHieuDoc: "", tenDoc: "", loaiDoc: "thiet_ke", duAn: "", donViGui: "", donViNhan: "", trangThai: "cho_nop", ngayNopDuKien: "", ngayHetHan: "", ngayHoanThanh: "", slaNgay: SLA_DEFAULTS.thiet_ke, soLanTraLai: 0, nguoiPhuTrach: "", ghiChu: "", linkDrive: "", tags: [], history: [], createdAt: nowIso() };
  const [form, setForm] = useState(editDoc ? { ...empty, ...editDoc } : empty);
  const [slaManual, setSlaManual] = useState(false);
  const [tagInput, setTagInput] = useState("");

  function f(field, val) {
    setForm(prev => {
      const next = { ...prev, [field]: val };
      if (field === "loaiDoc" && !slaManual) next.slaNgay = SLA_DEFAULTS[val] || 7;
      if ((field === "ngayNopDuKien" || field === "slaNgay") && !slaManual && next.ngayNopDuKien) {
        next.ngayHetHan = addDays(next.ngayNopDuKien, Number(next.slaNgay) || 0);
      }
      if (field === "ngayHetHan") setSlaManual(true);
      return next;
    });
  }

  function addTag(val) {
    const t = val.trim();
    if (t && !(form.tags || []).includes(t)) setForm(prev => ({ ...prev, tags: [...(prev.tags || []), t] }));
    setTagInput("");
  }
  function removeTag(t) { setForm(prev => ({ ...prev, tags: prev.tags.filter(x => x !== t) })); }

  function handleSave() {
    if (!form.tenDoc.trim()) return alert("Vui lòng nhập tên tài liệu");
    onSave(form);
    onClose();
  }

  const inp = (label, field, type = "text", opts = {}) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{label}{opts.req && <span style={{ color: RED }}> *</span>}</label>
      <input type={type} value={form[field] || ""} onChange={e => f(field, type === "number" ? Number(e.target.value) : e.target.value)}
        style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none" }} {...opts.extra} />
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{editDoc ? "Sửa hồ sơ" : "Thêm hồ sơ mới"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><Ic n="x" s={22} /></button>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {inp("Tên tài liệu", "tenDoc", "text", { req: true })}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {inp("Số hiệu / Ký hiệu", "soHieuDoc")}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Loại tài liệu <span style={{ color: RED }}>*</span></label>
              <select value={form.loaiDoc} onChange={e => f("loaiDoc", e.target.value)} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none" }}>
                {ALL_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Trạng thái <span style={{ color: RED }}>*</span></label>
            <div style={{ display: "flex", gap: 8 }}>
              {ALL_STATUSES.map(s => (
                <button key={s} onClick={() => f("trangThai", s)} style={{ flex: 1, padding: "8px", border: `2px solid ${form.trangThai === s ? STATUS_COLORS[s] : "#e2e8f0"}`, borderRadius: 8, background: form.trangThai === s ? STATUS_COLORS[s] + "18" : "#fff", color: form.trangThai === s ? STATUS_COLORS[s] : "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {inp("Dự án", "duAn")}
            {inp("Người phụ trách", "nguoiPhuTrach")}
            {inp("Đơn vị gửi", "donViGui")}
            {inp("Đơn vị nhận", "donViNhan")}
            {inp("Ngày nộp dự kiến", "ngayNopDuKien", "date", { req: true })}
            {inp("SLA (ngày xử lý)", "slaNgay", "number")}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Ngày hết hạn (SLA) {slaManual && <span style={{ fontSize: 11, color: ORANGE }}>(đã sửa thủ công)</span>}</label>
              <input type="date" value={form.ngayHetHan || ""} onChange={e => f("ngayHetHan", e.target.value)} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none" }} />
            </div>
            {inp("Số lần trả lại", "soLanTraLai", "number")}
            {form.trangThai === "da_duyet" && inp("Ngày hoàn thành", "ngayHoanThanh", "date")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "flex", alignItems: "center", gap: 4 }}><Ic n="tag" s={13} c="#64748b" /> Tags (nhập + Enter)</label>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 10px", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", minHeight: 40 }}>
              {(form.tags || []).map(t => (
                <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, background: "#e0e7ff", color: NAVY, borderRadius: 99, padding: "2px 8px" }}>
                  {t}<button onClick={() => removeTag(t)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6366f1", padding: 0, lineHeight: 1 }}>×</button>
                </span>
              ))}
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); } }}
                placeholder={form.tags?.length ? "" : "Thêm nhãn..."}
                style={{ border: "none", outline: "none", fontSize: 13, minWidth: 100, flex: 1 }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "flex", alignItems: "center", gap: 4 }}><Ic n="link" s={13} c="#64748b" /> Link Drive / SharePoint</label>
            <input value={form.linkDrive || ""} onChange={e => f("linkDrive", e.target.value)}
              placeholder="https://drive.google.com/..."
              style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Ghi chú</label>
            <textarea value={form.ghiChu || ""} onChange={e => f("ghiChu", e.target.value)} rows={3}
              style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none", resize: "vertical" }} />
          </div>
        </div>
        <div style={{ padding: "14px 24px", borderTop: "1px solid #e2e8f0", display: "flex", gap: 10, justifyContent: "flex-end", position: "sticky", bottom: 0, background: "#fff" }}>
          <button onClick={onClose} style={{ padding: "9px 20px", background: "#f1f5f9", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#475569", fontWeight: 500 }}>Hủy</button>
          <button onClick={handleSave} style={{ padding: "9px 24px", background: NAVY, border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#fff", fontWeight: 700 }}>Lưu tài liệu</button>
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS SCREEN ───────────────────────────────────────────────────────────
function SettingsScreen({ settings: parentSettings, onSave, onImport, onExport }) {
  const [settings, setSettings] = useState(parentSettings);
  const timer = useRef(null);
  function save(field, val) {
    const s = { ...settings, [field]: val };
    setSettings(s);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSave(s), 600);
  }
  const inp = (label, field) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{label}</label>
      <input value={settings[field] || ""} onChange={e => save(field, e.target.value)} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", maxWidth: 400 }} />
    </div>
  );
  return (
    <div style={{ padding: 32, overflowY: "auto", flex: 1 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 24 }}>Cài đặt</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 500, marginBottom: 32 }}>
        {inp("Tên dự án", "tenDuAn")}
        {inp("Đơn vị chủ đầu tư", "chuDauTu")}
        {inp("Đơn vị tư vấn giám sát", "tvgs")}
        {inp("Kỹ sư phụ trách", "kysu")}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, background: NAVY, color: "#fff", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
          <Ic n="upload" s={16} c="#fff" /> Import Excel
          <input type="file" accept=".xlsx,.xls" onChange={e => { if (e.target.files[0]) onImport(e.target.files[0]); e.target.value = ""; }} style={{ display: "none" }} />
        </label>
        <button onClick={onExport} style={{ display: "flex", alignItems: "center", gap: 8, background: GREEN, color: "#fff", padding: "10px 20px", borderRadius: 8, cursor: "pointer", border: "none", fontSize: 13, fontWeight: 600 }}>
          <Ic n="download" s={16} c="#fff" /> Export Excel
        </button>
      </div>
      <div style={{ marginTop: 24, padding: "14px 18px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, maxWidth: 500 }}>
        <p style={{ fontSize: 12, color: "#64748b", marginBottom: 6, fontWeight: 600 }}>Phím tắt</p>
        {[["Ctrl+K", "Focus ô tìm kiếm"], ["Ctrl+N", "Thêm hồ sơ mới"], ["Ctrl+Z", "Hoàn tác thay đổi cuối"], ["Ctrl+P", "In báo cáo"], ["Escape", "Đóng modal / panel"]].map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: 12, padding: "4px 0", fontSize: 12 }}>
            <span style={{ background: "#e2e8f0", padding: "2px 8px", borderRadius: 4, fontFamily: "monospace", minWidth: 70 }}>{k}</span>
            <span style={{ color: "#475569" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PRINT VIEW ────────────────────────────────────────────────────────────────
function PrintView({ docs, settings }) {
  const today = isoToday();
  const activeDocs = docs.filter(d => d.trangThai !== "da_duyet").sort((a, b) => a.ngayHetHan < b.ngayHetHan ? -1 : 1);
  return (
    <div id="print-view" style={{ display: "none", padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 18, marginBottom: 4 }}>Báo cáo Hồ sơ Dự án — {settings.tenDuAn || "Doc Tracker"}</h1>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Ngày in: {formatDate(today)} · Tổng: {docs.length} hồ sơ · Đang xử lý: {activeDocs.length}</p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "#1e3a8a", color: "#fff" }}>
            {["Số hiệu", "Tên tài liệu", "Loại", "Trạng thái", "Hạn nộp", "Ngày hết hạn", "Cảnh báo", "Người PT"].map(h => (
              <th key={h} style={{ padding: "8px 10px", textAlign: "left", border: "1px solid #3b5bdb" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activeDocs.map(doc => {
            const urg = getDocUrgency(doc);
            return (
              <tr key={doc.id} style={{ borderBottom: "1px solid #e2e8f0", background: urg.bg }}>
                <td style={{ padding: "7px 10px", border: "1px solid #e2e8f0" }}>{doc.soHieuDoc || "—"}</td>
                <td style={{ padding: "7px 10px", border: "1px solid #e2e8f0", fontWeight: 500 }}>{doc.tenDoc}</td>
                <td style={{ padding: "7px 10px", border: "1px solid #e2e8f0" }}>{TYPE_LABELS[doc.loaiDoc]}</td>
                <td style={{ padding: "7px 10px", border: "1px solid #e2e8f0" }}>{STATUS_LABELS[doc.trangThai]}</td>
                <td style={{ padding: "7px 10px", border: "1px solid #e2e8f0" }}>{formatDate(doc.ngayNopDuKien)}</td>
                <td style={{ padding: "7px 10px", border: "1px solid #e2e8f0", color: urg.color, fontWeight: 600 }}>{formatDate(doc.ngayHetHan)}</td>
                <td style={{ padding: "7px 10px", border: "1px solid #e2e8f0", color: urg.color, fontWeight: 700 }}>{urg.label}</td>
                <td style={{ padding: "7px 10px", border: "1px solid #e2e8f0" }}>{doc.nguoiPhuTrach || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── XLSX EXPORT ───────────────────────────────────────────────────────────────
function exportToXLSX(docs) {
  const headers = ["Số hiệu", "Tên tài liệu", "Loại", "Dự án", "Đơn vị gửi", "Đơn vị nhận", "Trạng thái", "Ngày nộp DK", "Ngày hết hạn", "Hoàn thành", "SLA", "Số lần trả", "Người PT", "Tags", "Link Drive", "Ghi chú"];
  const rows = docs.map(d => [
    d.soHieuDoc, d.tenDoc, TYPE_LABELS[d.loaiDoc] || d.loaiDoc, d.duAn, d.donViGui, d.donViNhan,
    STATUS_LABELS[d.trangThai] || d.trangThai,
    formatDate(d.ngayNopDuKien), formatDate(d.ngayHetHan), formatDate(d.ngayHoanThanh),
    d.slaNgay, d.soLanTraLai, d.nguoiPhuTrach, (d.tags || []).join(", "), d.linkDrive, d.ghiChu
  ]);
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws["!cols"] = [12, 30, 18, 20, 20, 20, 14, 14, 14, 14, 8, 10, 18, 20, 30, 30].map(w => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Hồ sơ");
  XLSX.writeFile(wb, `doc-tracker-${isoToday()}.xlsx`);
}

// ── XLSX IMPORT ───────────────────────────────────────────────────────────────
function parseImportDate(val) {
  if (!val) return "";
  if (typeof val === "number") {
    const d = XLSX.SSF.parse_date_code(val);
    if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const s = String(val).trim();
  const m1 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m1) return `${m1[3]}-${m1[2].padStart(2, "0")}-${m1[1].padStart(2, "0")}`;
  const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m2) return s;
  return "";
}
function importFromXLSX(file, existingDocs, onDone) {
  const reader = new FileReader();
  reader.onload = e => {
    const wb = XLSX.read(e.target.result, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (rows.length < 2) return onDone(existingDocs, 0);
    const hdrs = (rows[0] || []).map(h => normalizeStr(String(h || "")));
    const col = name => hdrs.findIndex(h => h.includes(normalizeStr(name)));
    const iSoHieu = col("so hieu"); const iTen = col("ten tai lieu"); const iLoai = col("loai");
    const iDuAn = col("du an"); const iDGui = col("don vi gui"); const iDNhan = col("don vi nhan");
    const iTT = col("trang thai"); const iNopDK = col("ngay nop"); const iHetHan = col("ngay het");
    const iHoanThanh = col("hoan thanh"); const iSLA = col("sla"); const iTraLai = col("so lan tra");
    const iNguoiPT = col("nguoi"); const iTags = col("tag"); const iLink = col("link"); const iGhiChu = col("ghi chu");
    const typeMap = { "thiet ke": "thiet_ke", "bv": "thiet_ke", "nghiem thu": "nghiem_thu", "nt": "nghiem_thu", "phap ly": "phap_ly", "gp": "phap_ly", "hanh chinh": "hanh_chinh", "hc": "hanh_chinh" };
    const statusMap = { "cho nop": "cho_nop", "cho gui": "cho_nop", "dang duyet": "dang_duyet", "da duyet": "da_duyet", "hoan thanh": "da_duyet" };
    const newDocs = [];
    rows.slice(1).forEach((row, idx) => {
      const tenDoc = String(row[iTen] || "").trim();
      if (!tenDoc) return;
      const soHieuDoc = String(row[iSoHieu] || "").trim();
      const existing = soHieuDoc ? existingDocs.find(d => d.soHieuDoc === soHieuDoc) : null;
      const loaiRaw = normalizeStr(String(row[iLoai] || ""));
      const loaiDoc = Object.entries(typeMap).find(([k]) => loaiRaw.includes(k))?.[1] || "hanh_chinh";
      const ttRaw = normalizeStr(String(row[iTT] || ""));
      const trangThai = Object.entries(statusMap).find(([k]) => ttRaw.includes(k))?.[1] || "cho_nop";
      const doc = {
        id: existing ? existing.id : makeId(),
        soHieuDoc, tenDoc, loaiDoc,
        duAn: String(row[iDuAn] || "").trim(),
        donViGui: String(row[iDGui] || "").trim(),
        donViNhan: String(row[iDNhan] || "").trim(),
        trangThai,
        ngayNopDuKien: parseImportDate(row[iNopDK]),
        ngayHetHan: parseImportDate(row[iHetHan]),
        ngayHoanThanh: parseImportDate(row[iHoanThanh]),
        slaNgay: Number(row[iSLA]) || SLA_DEFAULTS[loaiDoc],
        soLanTraLai: Number(row[iTraLai]) || 0,
        nguoiPhuTrach: String(row[iNguoiPT] || "").trim(),
        tags: String(row[iTags] || "").split(",").map(t => t.trim()).filter(Boolean),
        linkDrive: String(row[iLink] || "").trim(),
        ghiChu: String(row[iGhiChu] || "").trim(),
        history: existing?.history || [{ date: nowIso(), action: "Import từ Excel", from: "", to: trangThai, note: "" }],
        createdAt: existing?.createdAt || nowIso(),
      };
      newDocs.push(doc);
    });
    const merged = [...existingDocs.filter(d => !newDocs.find(n => n.id === d.id)), ...newDocs];
    onDone(merged, newDocs.length);
  };
  reader.readAsArrayBuffer(file);
}

// ── AUTH SCREEN ───────────────────────────────────────────────────────────────
function AuthScreen({ onEnter }) {
  const [code, setCode] = useState('');
  const [mode, setMode] = useState('enter');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleEnter() {
    const c = code.trim().toUpperCase();
    if (!c) return;
    setLoading(true); setError('');
    const { data, error: rpcErr } = await sb.rpc('dt_verify_pin', { p_code: c, p_pin: pin });
    setLoading(false);
    if (rpcErr) { setError('Lỗi kết nối. Vui lòng thử lại.'); return; }
    if (!data) { setError('Mã dự án hoặc PIN không đúng.'); return; }
    onEnter(c);
  }

  async function handleCreate() {
    const c = code.trim().toUpperCase();
    const n = name.trim();
    if (!c || !n) { setError('Vui lòng nhập đủ mã và tên dự án.'); return; }
    setLoading(true); setError('');
    const pin_hash = pin ? await sha256Hex(pin) : null;
    const { error: err } = await sb.from('dt_projects').insert({ code: c, name: n, settings: {}, pin_hash });
    if (err) { setLoading(false); setError('Mã đã tồn tại hoặc lỗi hệ thống.'); return; }
    const existing = (() => { try { return JSON.parse(localStorage.getItem('dt_docs') || '[]'); } catch { return []; } })();
    if (existing.length > 0) {
      await sb.from('dt_docs').insert(existing.map(d => mapToDB(d, c)));
      localStorage.removeItem('dt_docs');
    }
    setLoading(false);
    onEnter(c);
  }

  const inputStyle = { width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 10 };
  const btnPrimary = { width: '100%', background: NAVY, color: '#fff', border: 'none', borderRadius: 8, padding: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 10 };
  const btnSecondary = { width: '100%', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, padding: 10, fontSize: 13, cursor: 'pointer' };
  const lbl = txt => <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>{txt}</label>;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, width: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <Ic n="doc" s={26} c={NAVY} />
          <span style={{ fontSize: 20, fontWeight: 700, color: NAVY }}>Doc Tracker</span>
        </div>
        {mode === 'enter' ? (
          <>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Nhập mã dự án để truy cập danh sách tài liệu.</p>
            {lbl('Mã dự án')}
            <input autoFocus value={code} onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
              placeholder="VD: DA-AB12XY" style={inputStyle} />
            {lbl('Mã PIN')}
            <input type="password" value={pin} onChange={e => { setPin(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleEnter()} placeholder="Để trống nếu dự án không đặt PIN" style={inputStyle} />
            {error && <div style={{ color: RED, fontSize: 12, marginBottom: 8 }}>{error}</div>}
            <button onClick={handleEnter} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Đang tải...' : 'Vào dự án'}
            </button>
            <button onClick={() => { setMode('create'); setError(''); }} style={btnSecondary}>+ Tạo dự án mới</button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Tạo không gian mới để quản lý tài liệu.</p>
            {lbl('Mã dự án (tự đặt)')}
            <input autoFocus value={code} onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
              placeholder="VD: DA-AB12XY" style={inputStyle} />
            {lbl('Tên dự án')}
            <input value={name} onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="Tên dự án xây dựng..." style={inputStyle} />
            {lbl('Mã PIN (tùy chọn)')}
            <input type="password" value={pin} onChange={e => { setPin(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Đặt PIN để bảo vệ truy cập" style={inputStyle} />
            {error && <div style={{ color: RED, fontSize: 12, marginBottom: 8 }}>{error}</div>}
            <button onClick={handleCreate} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Đang tạo...' : 'Tạo dự án'}
            </button>
            <button onClick={() => { setMode('enter'); setError(''); }} style={btnSecondary}>← Quay lại</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [projectCode, setProjectCode] = useState(() => localStorage.getItem('dt_code') || '');
  const [docs, setDocsRaw] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("home");
  const [loaiFilter, setLoaiFilter] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [formState, setFormState] = useState({ open: false, editId: null });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [toast, setToast] = useState(null);
  const searchRef = useRef();

  const showToast = useCallback(msg => { setToast(msg); }, []);

  useEffect(() => {
    if (!projectCode) return;
    setLoading(true);
    Promise.all([
      sb.from('dt_docs').select('*').eq('project_code', projectCode).order('created_at'),
      sb.from('dt_projects').select('settings').eq('code', projectCode).single(),
    ]).then(([{ data: docsData, error: e1 }, { data: projData }]) => {
      if (e1) {
        const fallback = (() => { try { return JSON.parse(localStorage.getItem('dt_docs') || '[]'); } catch { return []; } })();
        setDocsRaw(fallback);
        showToast('Không kết nối được — đang dùng dữ liệu cục bộ');
      } else {
        setDocsRaw((docsData || []).map(mapFromDB));
      }
      if (projData?.settings) setSettings(projData.settings);
      setLoading(false);
    });
  }, [projectCode, showToast]);

  const setDocs = useCallback((v, undoLabel) => {
    setDocsRaw(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      if (undoLabel) setUndoStack(s => [...s.slice(-9), { label: undoLabel, snapshot: prev }]);
      return next;
    });
  }, []);

  const handleUndo = useCallback(() => {
    if (!undoStack.length) return;
    const last = undoStack[undoStack.length - 1];
    const snapIds = new Set(last.snapshot.map(d => d.id));
    const removedIds = docs.filter(d => !snapIds.has(d.id)).map(d => d.id);
    setDocsRaw(last.snapshot);
    setUndoStack(s => s.slice(0, -1));
    showToast(`Đã hoàn tác: ${last.label}`);
    // Đồng bộ snapshot lên Supabase: upsert toàn bộ + xóa các bản ghi không còn trong snapshot
    (async () => {
      const { error } = await sb.from('dt_docs').upsert(last.snapshot.map(d => mapToDB(d, projectCode)));
      if (error) { showToast('Lỗi đồng bộ hoàn tác: ' + error.message); return; }
      if (removedIds.length) await sb.from('dt_docs').delete().in('id', removedIds);
    })();
  }, [undoStack, docs, projectCode, showToast]);

  useEffect(() => {
    const handler = e => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "k") { e.preventDefault(); setTab("docs"); setTimeout(() => searchRef.current?.focus(), 100); }
      if (ctrl && e.key === "n") { e.preventDefault(); setFormState({ open: true, editId: null }); }
      if (ctrl && e.key === "z") { e.preventDefault(); handleUndo(); }
      if (ctrl && e.key === "p") { e.preventDefault(); window.print(); }
      if (e.key === "Escape") { setDetailId(null); setFormState({ open: false, editId: null }); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleUndo]);

  const detailDoc = detailId ? docs.find(d => d.id === detailId) : null;
  const editDoc = formState.editId ? docs.find(d => d.id === formState.editId) : null;

  async function handleSaveDoc(form) {
    const prevDocs = docs;
    const isNew = !form.id || !docs.find(d => d.id === form.id);
    const docToSave = {
      ...form,
      id: form.id || makeId(),
      createdAt: form.createdAt || nowIso(),
      history: isNew
        ? [{ date: nowIso(), action: "Tạo mới", from: "", to: form.trangThai, note: "" }]
        : form.history,
    };
    setDocs(prev => isNew ? [...prev, docToSave] : prev.map(d => d.id === docToSave.id ? docToSave : d), isNew ? "Thêm hồ sơ mới" : "Cập nhật hồ sơ");
    showToast(isNew ? "Đã thêm hồ sơ" : "Đã cập nhật hồ sơ");
    const row = mapToDB(docToSave, projectCode);
    const { error } = isNew
      ? await sb.from('dt_docs').insert(row)
      : await sb.from('dt_docs').update(row).eq('id', docToSave.id);
    if (error) { setDocsRaw(prevDocs); setUndoStack(s => s.slice(0, -1)); showToast('Lỗi lưu: ' + error.message); }
  }

  async function handleStatusChange(docId, newStatus, note) {
    const doc = docs.find(d => d.id === docId);
    if (!doc) return;
    const prevDocs = docs;
    const entry = { date: nowIso(), action: "Đổi trạng thái", from: doc.trangThai, to: newStatus, note: note || "" };
    const newHistory = [...(doc.history || []), entry];
    setDocs(prev => prev.map(d => d.id === docId ? { ...d, trangThai: newStatus, history: newHistory } : d), "Đổi trạng thái");
    showToast("Đã cập nhật trạng thái");
    const { error } = await sb.from('dt_docs').update({ trang_thai: newStatus, history: newHistory }).eq('id', docId);
    if (error) { setDocsRaw(prevDocs); setUndoStack(s => s.slice(0, -1)); showToast('Lỗi cập nhật: ' + error.message); }
  }

  async function handleDelete(docId) {
    if (!confirm("Xóa hồ sơ này?")) return;
    const doc = docs.find(d => d.id === docId);
    setDocs(prev => prev.filter(d => d.id !== docId), `Xóa "${doc?.tenDoc || "hồ sơ"}"`);
    if (detailId === docId) setDetailId(null);
    showToast("Đã xóa hồ sơ");
    const { error } = await sb.from('dt_docs').delete().eq('id', docId);
    if (error) {
      if (doc) setDocs(prev => [...prev, doc]);
      showToast('Lỗi xóa: ' + error.message);
    }
  }

  function handleDuplicate(docId) {
    const src = docs.find(d => d.id === docId);
    if (!src) return;
    const copy = { ...src, id: makeId(), trangThai: "cho_nop", ngayHoanThanh: "", soLanTraLai: 0, history: [{ date: nowIso(), action: `Nhân bản từ ${src.soHieuDoc || src.tenDoc}`, from: "", to: "cho_nop", note: "" }], createdAt: nowIso() };
    setFormState({ open: true, editId: null, duplicateData: copy });
  }

  async function handleBatchStatus(newStatus) {
    const ids = [...selectedIds];
    if (!ids.length) return;
    const prevDocs = docs;
    const idSet = new Set(ids);
    const updated = docs.map(d => {
      if (!idSet.has(d.id)) return d;
      const entry = { date: nowIso(), action: "Đổi trạng thái", from: d.trangThai, to: newStatus, note: "Cập nhật hàng loạt" };
      return { ...d, trangThai: newStatus, history: [...(d.history || []), entry] };
    });
    setDocs(updated, `Cập nhật ${ids.length} hồ sơ`);
    setSelectedIds([]);
    showToast(`Đã cập nhật ${ids.length} hồ sơ`);
    const rows = updated.filter(d => idSet.has(d.id)).map(d => mapToDB(d, projectCode));
    const { error } = await sb.from('dt_docs').upsert(rows);
    if (error) { setDocsRaw(prevDocs); setUndoStack(s => s.slice(0, -1)); showToast('Lỗi cập nhật: ' + error.message); }
  }

  async function handleBatchDelete() {
    if (!confirm(`Xóa ${selectedIds.length} hồ sơ đã chọn?`)) return;
    const toDelete = [...selectedIds];
    const deletedDocs = docs.filter(d => toDelete.includes(d.id));
    setDocs(prev => prev.filter(d => !toDelete.includes(d.id)), `Xóa ${toDelete.length} hồ sơ`);
    setSelectedIds([]);
    showToast(`Đã xóa ${toDelete.length} hồ sơ`);
    const { error } = await sb.from('dt_docs').delete().in('id', toDelete);
    if (error) {
      setDocs(prev => [...prev, ...deletedDocs]);
      showToast('Lỗi xóa: ' + error.message);
    }
  }

  function handleImport(file) {
    const prevDocs = docs;
    importFromXLSX(file, docs, async (merged, count) => {
      setDocs(merged, "Import Excel");
      showToast(`Import thành công ${count} hồ sơ`);
      const { error } = await sb.from('dt_docs').upsert(merged.map(d => mapToDB(d, projectCode)));
      if (error) { setDocsRaw(prevDocs); setUndoStack(s => s.slice(0, -1)); showToast('Lỗi lưu import: ' + error.message); }
    });
  }

  async function handleSaveSettings(newSettings) {
    setSettings(newSettings);
    await sb.from('dt_projects').update({ settings: newSettings }).eq('code', projectCode);
  }

  function handleChangeProject() {
    setProjectCode('');
    localStorage.removeItem('dt_code');
    setDocsRaw([]);
    setSettings({});
    setTab("home");
  }

  const contentStyle = { flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" };

  if (!projectCode) return <AuthScreen onEnter={code => { setProjectCode(code); localStorage.setItem('dt_code', code); }} />;

  if (loading) return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 36, height: 36, border: '4px solid #e2e8f0', borderTop: `4px solid ${NAVY}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#64748b', fontSize: 14 }}>Đang tải dữ liệu...</p>
      </div>
    </>
  );

  return (
    <div id="app-shell" style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: NAVY, color: "#fff", padding: "0 20px", height: 52, display: "flex", alignItems: "center", gap: 12, flexShrink: 0, zIndex: 100 }}>
        <button onClick={() => setSidebarCollapsed(c => !c)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 4 }}>
          <Ic n="menu" s={20} c="#fff" />
        </button>
        <Ic n="doc" s={22} c="#93c5fd" />
        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px" }}>Doc Tracker</span>
        {settings.tenDuAn && <span style={{ fontSize: 13, color: "#93c5fd", marginLeft: 4 }}>— {settings.tenDuAn}</span>}
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginLeft: 2 }}>[{projectCode}]</span>
        <div style={{ flex: 1 }} />
        <button onClick={handleChangeProject}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
          Đổi DA
        </button>
        <button onClick={() => setFormState({ open: true, editId: null })}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#3b82f6", border: "none", color: "#fff", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
          <Ic n="plus" s={16} c="#fff" /> Thêm mới
        </button>
        <label style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
          <Ic n="upload" s={16} c="#fff" /> Import
          <input type="file" accept=".xlsx,.xls" onChange={e => { if (e.target.files[0]) handleImport(e.target.files[0]); e.target.value = ""; }} style={{ display: "none" }} />
        </label>
        <button onClick={() => exportToXLSX(docs)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
          <Ic n="download" s={16} c="#fff" /> Export
        </button>
        <button onClick={() => window.print()}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
          <Ic n="print" s={16} c="#fff" /> In
        </button>
      </div>

      {/* Alert Banner */}
      <AlertBanner docs={docs} onViewOverdue={() => setTab("overdue")} />

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Sidebar tab={tab} setTab={setTab} loaiFilter={loaiFilter} setLoaiFilter={setLoaiFilter}
          docs={docs} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div style={contentStyle}>
          {tab === "home" && <DashScreen docs={docs} setTab={setTab} setLoaiFilter={setLoaiFilter} onDetail={id => { setDetailId(id); setTab("docs"); }} />}
          {tab === "docs" && <DocListScreen docs={docs} loaiFilter={loaiFilter}
            onDetail={setDetailId} onEdit={id => setFormState({ open: true, editId: id })}
            onDelete={handleDelete} onDuplicate={handleDuplicate} onStatusChange={handleStatusChange}
            selectedIds={selectedIds} setSelectedIds={setSelectedIds}
            onBatchStatus={handleBatchStatus} onBatchDelete={handleBatchDelete}
            searchRef={searchRef} />}
          {tab === "overdue" && <OverdueScreen docs={docs} onDetail={id => { setDetailId(id); setTab("docs"); }} />}
          {tab === "settings" && <SettingsScreen settings={settings} onSave={handleSaveSettings} onImport={handleImport} onExport={() => exportToXLSX(docs)} />}
        </div>
      </div>

      {/* Detail Panel */}
      {detailDoc && <DetailPanel doc={detailDoc} onClose={() => setDetailId(null)}
        onEdit={id => { setFormState({ open: true, editId: id }); setDetailId(null); }}
        onDelete={id => { handleDelete(id); setDetailId(null); }}
        onStatusChange={handleStatusChange} />}

      {/* Form Modal */}
      {formState.open && <DocFormModal
        editDoc={formState.duplicateData || editDoc}
        onClose={() => setFormState({ open: false, editId: null })}
        onSave={handleSaveDoc} />}

      {/* Toast */}
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* Print View */}
      <PrintView docs={docs} settings={settings} />
    </div>
  );
}
