import { useState } from "react";
import * as XLSX from "xlsx";

const NAVY = "#1e3a8a";
const T = { minHeight: 44 };

// ── ICONS ────────────────────────────────────────────────────────────────────
function Ic({ n, s = 22, c = "currentColor" }) {
  const a = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: c, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  if (n === "home") return <svg {...a}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
  if (n === "check") return <svg {...a}><polyline points="20 6 9 17 4 12" /></svg>;
  if (n === "x") return <svg {...a}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
  if (n === "chev") return <svg {...a}><polyline points="9 18 15 12 9 6" /></svg>;
  if (n === "back") return <svg {...a}><polyline points="15 18 9 12 15 6" /></svg>;
  if (n === "plus") return <svg {...a}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
  if (n === "search") return <svg {...a}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
  if (n === "log") return <svg {...a}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
  if (n === "flask") return <svg {...a}><path d="M9 3h6v10l4 7H5l4-7V3z" /><line x1="9" y1="9" x2="15" y2="9" /></svg>;
  if (n === "cl") return <svg {...a}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>;
  if (n === "scale") return <svg {...a}><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>;
  if (n === "save") return <svg {...a}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /></svg>;
  if (n === "trash") return <svg {...a}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>;
  if (n === "edit") return <svg {...a}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
  if (n === "cam") return <svg {...a}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>;
  if (n === "ruler") return <svg {...a}><path d="M2 20l20-20M8.5 15.5l-2-2M12.5 11.5l-2-2M16.5 7.5l-2-2" /></svg>;
  return null;
}

// ── DATA ─────────────────────────────────────────────────────────────────────
const clData = [
  { id: 1, cat: "Nền móng", items: ["Cao độ đáy móng", "KT hố móng", "Địa chất nền", "Lớp lót BT", "Cốt thép móng"] },
  { id: 2, cat: "Cột & Vách", items: ["Vị trí trục cột", "Tiết diện cột", "Thép dọc", "Đai cột", "Lớp bảo vệ"] },
  { id: 3, cat: "Dầm & Sàn", items: ["Cao độ đáy dầm", "Chiều dày sàn", "Thép sàn", "VK kín khít", "Lỗ chờ KT"] },
  { id: 4, cat: "Bê tông", items: ["Mác BT", "Phiếu XW", "Độ sụt", "Lấy mẫu", "Bảo dưỡng"] },
  { id: 5, cat: "Hoàn thiện", items: ["Mác vữa", "Trát phẳng", "Sơn đúng lớp", "Gạch lát", "MEP"] },
];
const ctItems = [
  { id: "c1", title: "Chủng loại thép", tc: "Mục 3.1 TCVN 4453", hd: "Kiểm tra chứng chỉ, nhãn mác, đường kính so với BV." },
  { id: "c2", title: "Khoảng cách cốt thép", tc: "Mục 3.3 TCVN 4453", hd: "Sai số: ±10mm sàn, ±5mm dầm/cột." },
  { id: "c3", title: "Độ sạch cốt thép", tc: "Mục 3.2 TCVN 4453", hd: "Không bùn đất, dầu mỡ, gỉ bong tróc." },
  { id: "c4", title: "Lớp bảo vệ", tc: "Mục 3.5 TCVN 4453&5574", hd: "Móng 40mm, Dầm/Cột 25-30mm, Sàn 15-20mm." },
  { id: "c5", title: "Mối nối & Buộc", tc: "Mục 3.4 TCVN 4453", hd: "Nối chồng >=40d, max 50% tiết diện." },
];
const vkItems = [
  { id: "v1", title: "Kích thước VK", tc: "Mục 2.1 TCVN 4453", hd: "Sai số ±5mm dài, ±3mm rộng." },
  { id: "v2", title: "Ổn định đà giáo", tc: "Mục 2.2 TCVN 4453", hd: "Giằng đủ, không rung, móng không lún." },
  { id: "v3", title: "Phẳng & khít", tc: "Mục 2.3 TCVN 4453", hd: "Khe hở <=2mm, bề mặt sạch." },
  { id: "v4", title: "Dầu chống dính", tc: "Mục 2.4 TCVN 4453", hd: "Toàn bộ bề mặt, không dính vào thép." },
  { id: "v5", title: "Cao độ & tim VK", tc: "Mục 2.1 TCVN 4453", hd: "Cao độ ±5mm, tim ±8mm." },
  { id: "v6", title: "Lỗ chờ KT", tc: "Mục 2.5 TCVN 4453", hd: "Đúng vị trí, cố định chắc." },
  { id: "v7", title: "Tháo dỡ & AT", tc: "Mục 5.1 TCVN 4453", hd: "Tháo khi BT >=70% R." },
];
const btItems = [
  { id: "b1", title: "Phiếu BT tươi", tc: "Mục 4.1 TCVN 4453", hd: "Phiếu mỗi xe. Xe >90 phút -> trả." },
  { id: "b2", title: "Độ sụt", tc: "TCVN 3106", hd: "BT thường: 10-18cm. Cột: 14-18cm." },
  { id: "b3", title: "Lấy mẫu nén", tc: "TCVN 3105", hd: ">=1 tổ/50m3. 6 mẫu/tổ." },
  { id: "b4", title: "Đầm BT", tc: "Mục 4.3 TCVN 4453", hd: "Bán kính <=50cm, đầm 20-40s." },
  { id: "b5", title: "Lớp đổ", tc: "Mục 4.2 TCVN 4453", hd: "Mỗi lớp <=50cm." },
  { id: "b6", title: "Mạch ngừng", tc: "Mục 4.4 TCVN 4453", hd: "Không ngừng >2h." },
  { id: "b7", title: "Bảo dưỡng", tc: "Mục 4.5 TCVN 4453", hd: "Tưới nước >=7 ngày." },
  { id: "b8", title: "Ngoại quan", tc: "Mục 5.2 TCVN 4453", hd: "Rỗ <=1cm2: vá vữa. Lớn: báo TVGS." },
];
const sampR = {
  betong: { l: "Bê tông", e: "🏗️", co: "#1e3a8a", u: "m³", tc: "TCVN 3105", calc: v => { const x = parseFloat(v); if (!x || x <= 0) return null; let t; if (x <= 20) t = 1; else if (x <= 50) t = Math.ceil(x / 20); else if (x <= 200) t = Math.ceil(x / 50); else t = Math.ceil(x / 100); return { t, rows: [["Tổ mẫu", t + " tổ", 1], ["Mẫu/tổ", "6 (3x7ng+3x28ng)"], ["Tổng", t * 6 + " viên"], ["KT mẫu", "150x150x150mm"]], note: "Thử Slump mỗi xe." }; } },
  cotthep: { l: "Cốt thép", e: "🔩", co: "#1e40af", u: "tấn", tc: "TCVN 1651:2008", calc: v => { const x = parseFloat(v); if (!x || x <= 0) return null; const t = Math.ceil(x / 50); return { t, rows: [["Tổ mẫu", t + " tổ", 1], ["Số thanh/tổ", "3 thanh"], ["Chiều dài mẫu", "≥ 1.0m/thanh"], ["Chỉ tiêu", "Thử kéo + uốn nguội"], ["Kèm theo", "Mill Certificate (CO/CQ)"]], note: "Mỗi lô 50 tấn, mỗi chủng loại đường kính, mỗi nhà SX = 1 lô riêng." }; } },
  cat: { l: "Cát", e: "🏖️", co: "#d97706", u: "m³", tc: "TCVN 7570:2006", calc: v => { const x = parseFloat(v); if (!x || x <= 0) return null; const t = Math.ceil(x / 350); return { t, rows: [["Tổ mẫu", t + " tổ", 1], ["KL mẫu", "≥ 10 kg/tổ"], ["Chỉ tiêu", "Thành phần hạt, bùn sét"], ["Bùn sét max", "≤ 3% (BT), ≤ 5% (xây trát)"], ["Lấy mẫu", "≥ 5 điểm trong lô"]], note: "350m³/lô hoặc mỗi khi thay đổi nguồn cung cấp." }; } },
  dadam: { l: "Đá dăm", e: "🪨", co: "#475569", u: "m³", tc: "TCVN 7570", calc: v => { const x = parseFloat(v); if (!x || x <= 0) return null; const t = Math.ceil(x / 200); return { t, rows: [["Tổ mẫu", t + " tổ", 1], ["KL mẫu", ">=30kg"], ["Chỉ tiêu", "Hạt, cường độ"]], note: "Thử mài mòn nếu chịu lực." }; } },
  ximang: { l: "Xi măng", e: "🛢️", co: "#374151", u: "tấn", tc: "TCVN 2682", calc: v => { const x = parseFloat(v); if (!x || x <= 0) return null; const t = Math.ceil(x / 50); return { t, rows: [["Tổ mẫu", t + " tổ", 1], ["KL mẫu", ">=5kg"], ["Chỉ tiêu", "R nén, đông kết"]], note: "Tồn >3 tháng thử lại." }; } },
};
const plData = [
  { d: "Đ.4", td: "Trách nhiệm CĐT", tags: ["chủ đầu tư"], tt: ["Chịu trách nhiệm toàn diện về CL", "Lựa chọn NT đủ năng lực", "Tổ chức QL CL từ khảo sát đến bảo trì", "Phê duyệt chỉ dẫn KT"], ly: "Có thể thuê BQLDA chuyên nghiệp." },
  { d: "Đ.11", td: "Giám sát thi công", tags: ["giám sát"], tt: ["Phải tổ chức GS suốt quá trình XD", "Kiểm tra VL trước khi dùng", "Theo dõi biện pháp TC của NT", "Lập BB nghiệm thu"], ly: "TVGS phải có chứng chỉ hành nghề." },
  { d: "Đ.13", td: "Nghiệm thu công việc XD", tags: ["nghiệm thu", "công việc"], tt: ["NT từng công việc trước khi chuyển tiếp", "GS của CĐT chủ trì", "Căn cứ: TK, QCVN, TCVN", "KQ thử nghiệm phải đạt", "Lập BB có chữ ký các bên"], ly: "Nghiêm cấm nghiệm thu khống." },
  { d: "Đ.14", td: "Nghiệm thu khuất lấp", tags: ["nghiệm thu", "khuất lấp"], tt: ["Bộ phận che khuất BẮT BUỘC NT trước lấp", "CĐT chủ trì", "Hồ sơ: BB + BVHC"], ly: "Không đổ BT trước khi có BB NT." },
  { d: "Đ.19", td: "Sự cố công trình", tags: ["sự cố"], tt: ["Báo cáo ngay CĐT", "Bảo vệ hiện trường", "Lập HĐ xác định nguyên nhân"], ly: "Che giấu sự cố -> hình sự." },
  { d: "Đ.21", td: "Bản vẽ hoàn công", tags: ["hoàn công", "bản vẽ"], tt: ["Phản ánh đúng KT thực tế", "Đúng TK: đóng dấu", "Thay đổi: vẽ lại, ghi lý do", "Có chữ ký đầy đủ"], ly: "Không có BVHC = vi phạm PL." },
  { d: "Đ.22", td: "Bảo hành CT", tags: ["bảo hành"], tt: ["Cấp I: >=24th; cấp III,IV: >=12th", "NT chịu trách nhiệm BH lỗi TC", "Tiền BH giữ ~5%"], ly: "Không áp dụng cho thiên tai." },
];

// ── CHECKLIST HOÀN THIỆN ────────────────────────────────────────────────────
const htXayItems = [
  { id: "x1", title: "Mác vữa xây đúng yêu cầu TK", tc: "TCVN 4314:2003", hd: "Kiểm tra phiếu XW vữa, thử mẫu đúng mác (M50/M75/M100). Vữa trộn phải dùng trong 2h." },
  { id: "x2", title: "Chiều dày tường đúng TK", tc: "TCVN 9377:2012", hd: "Đo bằng thước lá. Sai số cho phép ±5mm so với thiết kế." },
  { id: "x3", title: "Độ thẳng đứng tường", tc: "TCVN 9377:2012", hd: "Dùng ni-vô hoặc dây dọi. Sai số ≤5mm/3m chiều cao. Kiểm tra ≥3 điểm/mặt tường." },
  { id: "x4", title: "Mạch vữa ngang đều, ngang phẳng", tc: "TCVN 9377:2012", hd: "Mạch ngang 8–12mm, mạch đứng ≤10mm. Mạch phải so le, không trùng mạch dọc." },
  { id: "x5", title: "Gạch đặt đúng mô đun, so le mạch", tc: "TCVN 9377:2012", hd: "Gạch xây so le ≥ 1/4 viên. Không xây gạch nứt vỡ. Gạch tiếp xúc đủ vữa 4 mặt." },
  { id: "x6", title: "Lỗ chờ cửa & hộp KT đúng vị trí", tc: "TCVN 9377:2012", hd: "Kích thước lỗ cửa đúng TK (rộng hơn khung cửa 20-30mm mỗi bên). Hộp chờ điện, nước đúng vị trí bản vẽ." },
];
const htTratItems = [
  { id: "t1", title: "Xử lý bề mặt trước khi trát", tc: "TCVN 9377:2012", hd: "Bề mặt sạch, không bụi, dầu mỡ. Tưới ẩm trước khi trát 1-2h. Bề mặt BT phải được đục nhám hoặc phun vữa lót bám." },
  { id: "t2", title: "Chiều dày lớp trát", tc: "TCVN 9377:2012", hd: "Lớp lót: 10-15mm. Lớp mặt: 5-8mm. Tổng chiều dày ≤25mm. Sai số ±3mm. Đo bằng thước kim tại nhiều điểm." },
  { id: "t3", title: "Độ phẳng mặt trát", tc: "TCVN 9377:2012", hd: "Dùng thước nhôm 2m kiểm tra. Sai số ≤3mm. Kiểm tra theo cả 2 chiều ngang và dọc." },
  { id: "t4", title: "Độ thẳng đứng mặt trát", tc: "TCVN 9377:2012", hd: "Dùng ni-vô. Sai số ≤5mm/3m chiều cao. Kiểm tra ≥3 vị trí/bề mặt." },
  { id: "t5", title: "Không có nứt, phồng rộp, rỗ mặt", tc: "TCVN 9377:2012", hd: "Kiểm tra bằng mắt toàn bộ bề mặt. Gõ nhẹ để phát hiện vùng rỗng bên dưới. Vết nứt >0.2mm phải xử lý." },
  { id: "t6", title: "Góc tường, trần thẳng & vuông góc", tc: "TCVN 9377:2012", hd: "Dùng eke kiểm tra góc vuông 90°. Dùng thước thẳng kiểm tra cạnh góc phẳng. Sai số góc vuông ≤3mm/1m." },
];
const htLatItems = [
  { id: "l1", title: "Vật liệu gạch đúng chủng loại & kích thước", tc: "TCVN 9377:2012", hd: "Kiểm tra chứng chỉ xuất xưởng, kích thước thực tế so với TK. Gạch không sứt mẻ, đồng đều màu sắc, không cong vênh." },
  { id: "l2", title: "Cao độ mặt hoàn thiện đúng TK", tc: "TCVN 9377:2012", hd: "Dùng máy thủy bình hoặc ni-vô laser. Sai số cao độ ±5mm so với cốt thiết kế." },
  { id: "l3", title: "Mạch gạch đều, thẳng hàng", tc: "TCVN 9377:2012", hd: "Mạch gạch ≤3mm. Thẳng hàng cả 2 chiều. Dùng thước căng dây kiểm tra. Mạch phải đồng đều toàn diện tích." },
  { id: "l4", title: "Độ phẳng mặt gạch lát", tc: "TCVN 9377:2012", hd: "Dùng thước 2m: sai số ≤2mm. Mức chênh lệch cao độ giữa 2 viên kề nhau ≤1mm. Không có viên gạch bị vênh góc." },
  { id: "l5", title: "Gõ không bị rỗng", tc: "TCVN 9377:2012", hd: "Gõ nhẹ bằng dụng cụ chuyên dụng hoặc cán bay toàn bộ diện tích. Âm rỗng = chưa bám vữa nền, phải cậy lên thi công lại." },
  { id: "l6", title: "Chèn mạch đủ, đúng màu & vật liệu", tc: "TCVN 9377:2012", hd: "Vữa chèn mạch đúng loại (epoxy/xi măng). Màu đúng TK. Mạch đầy, phẳng với mặt gạch. Làm sạch mặt gạch sau chèn." },
];
const htOpItems = [
  { id: "o1", title: "Vật liệu gạch ốp đúng TK", tc: "TCVN 9377:2012", hd: "Kiểm tra chứng chỉ, kích thước thực tế. Gạch ốp không sứt mẻ, cùng lô sản xuất để đồng màu." },
  { id: "o2", title: "Bề mặt phẳng ốp đạt yêu cầu", tc: "TCVN 9377:2012", hd: "Thước 2m: sai số ≤2mm. Chênh cao giữa 2 viên kề nhau ≤0.5mm. Kiểm tra theo cả chiều ngang và dọc." },
  { id: "o3", title: "Mạch gạch đều, thẳng, thống nhất", tc: "TCVN 9377:2012", hd: "Mạch ốp 1-2mm (ốp sát) hoặc theo TK. Thẳng hàng từ sàn lên trần. Mạch ngang phải thống nhất trên toàn bộ tường." },
  { id: "o4", title: "Gõ không bị rỗng", tc: "TCVN 9377:2012", hd: "100% diện tích phải gõ kiểm tra. Viên rỗng phải cậy ra thi công lại. Đặc biệt kiểm tra kỹ 4 góc viên gạch." },
  { id: "o5", title: "Xử lý góc, đầu ốp, bo cạnh", tc: "TCVN 9377:2012", hd: "Góc trong/ngoài phải dùng gạch chặt cạnh hoặc phụ kiện góc inox. Đầu ốp tại cửa có nẹp nhôm bảo vệ cạnh." },
  { id: "o6", title: "Không sứt mẻ, không vết nứt", tc: "TCVN 9377:2012", hd: "Kiểm tra bằng mắt toàn bộ sau khi hoàn thành. Gạch nứt, sứt cạnh phải thay. Đặc biệt kiểm tra tại góc và vị trí cắt gạch." },
];
const htSonItems = [
  { id: "s1", title: "Bề mặt sơn đạt chuẩn trước khi sơn", tc: "Chỉ dẫn KT & nhà SX", hd: "Bề mặt trát khô hoàn toàn (độ ẩm ≤8%), phẳng, sạch. Trám bột trét toàn bộ lỗ đinh, vết nứt nhỏ. Đánh nhám mịn trước lớp lót." },
  { id: "s2", title: "Thi công đủ số lớp sơn", tc: "Chỉ dẫn KT & nhà SX", hd: "Tối thiểu: 1 lớp lót (sơn lót chống kiềm) + 2 lớp sơn phủ màu. Mỗi lớp phải khô hoàn toàn trước khi sơn lớp tiếp (thường 2-4h)." },
  { id: "s3", title: "Màu sơn đúng theo bảng màu TK", tc: "Chỉ dẫn KT", hd: "So sánh với mẫu màu được duyệt. Kiểm tra cùng điều kiện ánh sáng. Các mặt tường cùng khu vực phải đồng màu." },
  { id: "s4", title: "Bề mặt đều màu, không chảy, không vón", tc: "Chỉ dẫn KT & nhà SX", hd: "Kiểm tra bằng mắt dưới ánh sáng đủ. Không có vết chảy, đốm, loang màu, vết cọ, bọt khí. Không dày mỏng không đều." },
  { id: "s5", title: "Cạnh chân tường, góc cắt thẳng sắc", tc: "Chỉ dẫn KT", hd: "Ranh giới giữa 2 màu sơn phải thẳng, sắc nét. Dùng băng dính che mép khi sơn. Chân tường không bị lem màu sàn." },
  { id: "s6", title: "Bề mặt không mốc, không phồng rộp", tc: "Chỉ dẫn KT & nhà SX", hd: "Kiểm tra sau khi sơn khô hoàn toàn (≥24h). Phồng rộp = bề mặt chưa đủ khô hoặc nhiễm kiềm. Phải xử lý lại từ đầu." },
];
const htTranItems = [
  { id: "tr1", title: "Khung xương đúng module & khoảng cách", tc: "Chỉ dẫn KT & nhà SX", hd: "Thanh chính (main runner) cách nhau ≤1200mm. Thanh phụ cách nhau ≤400mm hoặc theo TK. Treo ty đủ số lượng, khoảng cách ≤1200mm." },
  { id: "tr2", title: "Cao độ trần đúng TK", tc: "Chỉ dẫn KT", hd: "Dùng máy laser kiểm tra cao độ đáy trần thạch cao. Sai số ±5mm. Kiểm tra tại ≥4 góc và giữa phòng." },
  { id: "tr3", title: "Bề mặt tấm phẳng ≤3mm/thước 2m", tc: "Chỉ dẫn KT", hd: "Đặt thước 2m theo nhiều hướng. Sai số ≤3mm. Tấm vênh, cong phải điều chỉnh hoặc thay ty treo." },
  { id: "tr4", title: "Mạch tấm xử lý kín, phẳng", tc: "Chỉ dẫn KT & nhà SX", hd: "Dùng băng lưới + bột trám chuyên dụng. Trám ≥2 lớp, mài phẳng sau khi khô. Không còn thấy vạch mạch sau khi sơn." },
  { id: "tr5", title: "Đèn, cửa gió, thiết bị đúng vị trí", tc: "Chỉ dẫn KT", hd: "So sánh với bản vẽ HVAC, điện chiếu sáng. Hộp đèn âm trần, miệng gió được gia cường khung phụ xung quanh." },
  { id: "tr6", title: "Không nứt, không cong vênh tấm", tc: "Chỉ dẫn KT", hd: "Kiểm tra toàn bộ sau khi hoàn thành. Nứt tại mạch = chưa trám đủ lớp. Cong vênh = ty treo bị lỏng hoặc sai cao độ." },
];
const htCuaItems = [
  { id: "cu1", title: "Kích thước khung cửa đúng TK", tc: "TCVN 9377:2012", hd: "Đo chiều rộng, chiều cao thông thủy thực tế so với bản vẽ. Sai số ±3mm. Đường chéo 2 khung phải bằng nhau (±3mm)." },
  { id: "cu2", title: "Khung cứng vững, thẳng đứng & phẳng", tc: "TCVN 9377:2012", hd: "Dùng ni-vô kiểm tra thẳng đứng cả 2 cạnh đứng và cạnh ngang trên. Sai số ≤2mm. Chèn kín khe hở giữa khung và tường." },
  { id: "cu3", title: "Cánh đóng mở trơn, không kẹt", tc: "TCVN 9377:2012", hd: "Thử đóng mở ≥5 lần. Cánh không kéo lê sàn, không chạm cửa. Không có âm thanh lạ. Tự giữ ở vị trí mở 45° và 90°." },
  { id: "cu4", title: "Khe hở giữa cánh và khung đều", tc: "TCVN 9377:2012", hd: "Khe hở ≤3mm xung quanh cánh cửa. Kiểm tra bằng thước lá. Khe dưới cánh cửa ≤8mm (hoặc theo yêu cầu thông gió)." },
  { id: "cu5", title: "Phụ kiện đầy đủ & hoạt động tốt", tc: "TCVN 9377:2012", hd: "Bản lề đủ số lượng (≥3 bản lề/cánh >1.5m), vặn chặt đủ ốc vít. Khóa, tay nắm hoạt động trơn. Chốt cài đủ hành trình." },
  { id: "cu6", title: "Bề mặt hoàn thiện đúng yêu cầu TK", tc: "Chỉ dẫn KT", hd: "Không trầy xước, không bong tróc sơn/veneer. Cạnh viền được xử lý gọn. Khe hở giữa khung và tường được bít kín bằng ron cao su hoặc silicon." },
];
const cthmItems = [
  { id: "tm1", title: "Vật liệu chống thấm", tc: "TCVN 9065:2012", hd: "Kiểm tra CO/CQ vật liệu, hạn sử dụng, bảo quản đúng điều kiện. Đúng chủng loại TK chỉ định." },
  { id: "tm2", title: "Xử lý bề mặt trước khi thi công", tc: "TCVN 9065:2012", hd: "Bề mặt sạch, không dầu mỡ. Nứt >=0.2mm phải trám vá trước. Bề mặt ẩm nhưng không đọng nước." },
  { id: "tm3", title: "Số lớp & chiều dày CT", tc: "TCVN 9065:2012", hd: "Đủ số lớp theo TK. Chiều dày mỗi lớp đúng quy định. Mỗi lớp khô mới thi công lớp tiếp." },
  { id: "tm4", title: "Xử lý góc và mép chống thấm", tc: "TCVN 9065:2012", hd: "Góc tường-sàn, xung quanh sàn thoát nước phải ốp vải tăng cường. Bán kính cong góc >=50mm." },
  { id: "tm5", title: "Thử nước kiểm tra chống thấm", tc: "TCVN 9065:2012", hd: "Ngâm nước toàn bộ diện tích >=24h (sân thượng, nhà vệ sinh, hồ bơi). Không có hiện tượng thấm qua." },
  { id: "tm6", title: "Bảo vệ lớp chống thấm", tc: "TCVN 9065:2012", hd: "Thi công lớp vữa bảo vệ >=30mm ngay sau khi nghiệm thu CT. Không đi lại khi CT chưa đủ cứng." },
];

// ── ITEM LOOKUP ───────────────────────────────────────────────────────────────
const ITEMS_MAP = {
  ct: ctItems, vk: vkItems, bt: btItems, tm: cthmItems,
  ht_xay: htXayItems, ht_trat: htTratItems, ht_lat: htLatItems,
  ht_op: htOpItems, ht_son: htSonItems, ht_tran: htTranItems, ht_cua: htCuaItems,
};
const getItemsByType = type => ITEMS_MAP[type] || [];

// ── TCVN DATA ─────────────────────────────────────────────────────────────────
const tcvnData = [
  { ma: "TCVN 4453:1995", ten: "Kết cấu BT & BTCT toàn khối", nhom: "Thi công", tomtat: "Quy phạm thi công và nghiệm thu kết cấu BT & BTCT đổ tại chỗ.", noidung: ["Yêu cầu VK & đà giáo (Mục 2)", "Gia công & lắp đặt cốt thép (Mục 3)", "Thi công BT: trộn, đổ, đầm (Mục 4)", "Tháo dỡ VK & bảo dưỡng (Mục 5)", "Nghiệm thu kết cấu (Mục 6)"] },
  { ma: "TCVN 5574:2018", ten: "Thiết kế kết cấu BTCT", nhom: "Thiết kế", tomtat: "Tiêu chuẩn thiết kế kết cấu bê tông cốt thép theo trạng thái giới hạn.", noidung: ["Lớp bảo vệ cốt thép tối thiểu", "Khoảng cách thông thuỷ giữa các thanh", "Neo và nối cốt thép (>=40d)", "Cốt đai vùng tới hạn cột", "Hàm lượng thép min/max"] },
  { ma: "TCVN 3105:1993", ten: "Lấy mẫu & thử BT nặng", nhom: "Thí nghiệm", tomtat: "Hỗn hợp BT nặng - lấy mẫu, chế tạo và bảo dưỡng mẫu thử cường độ nén.", noidung: ["Lấy mẫu tại nơi đổ (không tại xe)", "Khuôn: 150x150x150mm", "Bảo dưỡng: 24h trong khuôn -> ngâm nước", "Thử nén: 7 ngày & 28 ngày", ">=3 mẫu/tổ"] },
  { ma: "TCVN 3106:1993", ten: "Thử độ sụt hỗn hợp BT", nhom: "Thí nghiệm", tomtat: "Phương pháp xác định độ sụt (Slump) của hỗn hợp bê tông tươi.", noidung: ["Dùng côn Abrams H=300mm", "BT thường: Slump 10-18cm", "BT cột/vách: Slump 14-18cm", "Thử ngay khi xe đến công trình", "Ngoài phạm vi: không được đổ"] },
  { ma: "TCVN 1651:2018", ten: "Thép cốt bê tông", nhom: "Vật liệu", tomtat: "Thép thanh tròn trơn (CB240-T) và thép vằn (CB300-V, CB400-V, CB500-V) dùng cho kết cấu BTCT.", noidung: ["CB240-T: Fy ≥ 240 MPa — CB300-V: Fy ≥ 300 MPa", "CB400-V: Fy ≥ 400 MPa — CB500-V: Fy ≥ 500 MPa", "Tần suất: 1 tổ mẫu / 50 tấn / lô (mỗi chủng loại ĐK)", "Số lượng: 3 thanh dài 0,5–0,8m / mỗi chủng loại", "Chỉ tiêu: Giới hạn chảy, giới hạn bền, độ giãn dài", "Uốn nguội theo TCVN 197-1:2014 — Kèm Mill Certificate"] },
  { ma: "TCVN 7570:2006", ten: "Cốt liệu cho BT & vữa", nhom: "Vật liệu", tomtat: "Yêu cầu kỹ thuật của cát, đá dăm, đá sỏi dùng cho bê tông và vữa xây dựng.", noidung: ["Cát — Tần suất: 1 mẫu / 350m³ hoặc 500 tấn / lô", "Cát — KL mẫu: ≥ 100kg, lấy rải rác ≥ 5 vị trí", "Cát — Bùn sét: ≤ 3% (BT), ≤ 5% (xây trát)", "Đá dăm — Tần suất: 01 mẫu thử / 200m³ / lô", "Đá dăm — Hàm lượng hạt dẹt ≤ 25%, bùn sét ≤ 1%", "Thay đổi nguồn cung → bắt buộc lấy mẫu mới"] },
  { ma: "TCVN 2682:2009", ten: "Xi măng Portland", nhom: "Vật liệu", tomtat: "Yêu cầu kỹ thuật xi măng Portland thông thường (PC30, PC40, PC50).", noidung: ["PC30: R28 >= 30 MPa", "PC40: R28 >= 40 MPa", "Bắt đầu đông kết >= 45 phút", "Kết thúc đông kết <= 375 phút", "Tần suất thử: 1 tổ/50 tấn/lô"] },
  { ma: "TCVN 9377:2012", ten: "Công tác hoàn thiện XD", nhom: "Thi công", tomtat: "Thi công và nghiệm thu công tác hoàn thiện trong xây dựng dân dụng và công nghiệp.", noidung: ["Trát: dày <=25mm, phẳng <=3mm/2m", "Lát gạch: mạch <=3mm, phẳng <=2mm/2m", "Tường xây: thẳng đứng <=5mm/3m", "Sơn: đủ số lớp, đều màu", "Nghiệm thu từng công đoạn"] },
  { ma: "TCVN 9354:2012", ten: "Xác định độ chặt đất đắp", nhom: "Thí nghiệm", tomtat: "Xác định độ chặt tương đối của đất tại hiện trường bằng phương pháp rót cát.", noidung: ["Phương pháp rót cát (Sand Cone)", "K >= 0.95 (CT thông thường)", "Tần suất: 1 điểm/200m2/lớp", "Chiều dày lớp đắp <= 30cm", "Thử sau đầm trước khi đắp tiếp"] },
  { ma: "TCVN 9065:2012", ten: "Vật liệu chống thấm", nhom: "Thi công", tomtat: "Thi công và nghiệm thu các lớp chống thấm trong xây dựng.", noidung: ["Xử lý nứt >= 0.2mm trước khi CT", "Vải tăng cường tại góc & khe", "Thử nước >= 24h sau khi hoàn thành", "Lớp bảo vệ >= 30mm sau nghiệm thu", "Hồ sơ: BB thử nước bắt buộc"] },
  { ma: "TCVN 3985:1999", ten: "Khoan lõi kiểm tra BT", nhom: "Thí nghiệm", tomtat: "Phương pháp lấy mẫu lõi khoan từ kết cấu bê tông để kiểm tra cường độ tại chỗ.", noidung: ["Áp dụng khi mẫu đúc không đạt", "Đường kính lõi >= 100mm", "Tỷ lệ L/D = 1.0 để thử nén", "Hiệu chỉnh kết quả theo L/D", "Cần >= 3 lõi/vị trí nghi ngờ"] },
  { ma: "QCVN 06:2021", ten: "An toàn cháy công trình", nhom: "Pháp quy", tomtat: "Quy chuẩn kỹ thuật quốc gia về an toàn cháy cho nhà và công trình xây dựng.", noidung: ["Phân loại công trình theo rủi ro cháy", "Khoảng cách PCCC tối thiểu", "Lối thoát nạn và chiều rộng", "Hệ thống báo cháy & chữa cháy", "Nghiệm thu PCCC bắt buộc trước SDg"] },
];

// ── PDF EXPORT ────────────────────────────────────────────────────────────────
function exportPDF(title, items, results, bienphap, meta, tieuchuan, allPhotos = {}) {
  const dateStr = new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const dC = Object.values(results).filter(v => v === "d").length;
  const kC = Object.values(results).filter(v => v === "k").length;
  const nC = Object.values(results).filter(v => v === "n").length;
  const lm = { d: "✅ Đạt", k: "❌ Không đạt", n: "— N/A" };
  const rows = items.map((it, i) => {
    const rs = results[it.id], bp = bienphap[it.id] || "";
    const itPhotos = allPhotos[it.id] || [];
    const photosHtml = itPhotos.length > 0
      ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px;">${itPhotos.map(p => `<img src="${p}" style="width:80px;height:62px;object-fit:cover;border-radius:4px;border:1px solid #ddd;">`).join("")}</div>`
      : "";
    return `<tr>
      <td style="padding:8px;border:1px solid #ddd;text-align:center;font-weight:bold;">${i + 1}</td>
      <td style="padding:8px;border:1px solid #ddd;">${it.title}<br><small style="color:#888;">${it.tc}</small>${photosHtml}</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:center;color:${rs === "d" ? "#16a34a" : rs === "k" ? "#dc2626" : "#888"};font-weight:bold;">${lm[rs] || "—"}</td>
      <td style="padding:8px;border:1px solid #ddd;font-size:12px;color:#c00;">${rs === "k" ? bp || "Chưa nhập BP" : ""}</td>
    </tr>`;
  }).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
  <style>body{font-family:Arial,sans-serif;margin:20px;color:#111;}h1{color:#1e3a8a;font-size:18px;}h2{font-size:14px;color:#444;margin:0 0 16px;}table{width:100%;border-collapse:collapse;margin-top:16px;}th{background:#1e3a8a;color:#fff;padding:9px 8px;text-align:left;font-size:13px;}td{font-size:13px;}.info{display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#f0f4ff;padding:12px;border-radius:8px;margin:12px 0;}.stat{display:flex;gap:16px;margin:12px 0;}.sbox{padding:10px 18px;border-radius:8px;text-align:center;}.num{font-size:22px;font-weight:900;}.note{font-size:11px;color:#888;margin-top:20px;border-top:1px solid #ddd;padding-top:10px;}@media print{button{display:none;}}</style></head>
  <body>
  <h1>BIÊN BẢN NGHIỆM THU</h1>
  <h2>${title} — ${tieuchuan}</h2>
  <div style="font-size:12px;color:#666;margin-bottom:12px;">Ngày in: ${dateStr}</div>
  <div class="info">
    <div><strong>Công trình:</strong> ${meta.c || "—"}</div>
    <div><strong>Vị trí:</strong> ${meta.v || "—"}</div>
    <div><strong>Ngày kiểm tra:</strong> ${meta.d || "—"}</div>
    <div><strong>KS Giám sát:</strong> ${meta.k || "—"}</div>
  </div>
  <div class="stat">
    <div class="sbox" style="background:#dcfce7;"><div class="num" style="color:#16a34a;">${dC}</div><div style="color:#16a34a;font-weight:600;">Đạt</div></div>
    <div class="sbox" style="background:#fef2f2;"><div class="num" style="color:#dc2626;">${kC}</div><div style="color:#dc2626;font-weight:600;">Không đạt</div></div>
    <div class="sbox" style="background:#f1f5f9;"><div class="num" style="color:#64748b;">${nC}</div><div style="color:#64748b;font-weight:600;">N/A</div></div>
  </div>
  <table><thead><tr><th style="width:36px;">#</th><th>Hạng mục kiểm tra</th><th style="width:110px;">Kết quả</th><th>Biện pháp khắc phục</th></tr></thead><tbody>${rows}</tbody></table>
  ${kC === 0 ? '<div style="background:#dcfce7;padding:12px;border-radius:8px;text-align:center;margin-top:16px;color:#16a34a;font-weight:700;">🎉 Tất cả hạng mục đạt yêu cầu — Có thể nghiệm thu chính thức</div>' : ""}
  <div style="margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:20px;">
    <div style="text-align:center;"><div style="border-top:1px solid #000;padding-top:8px;margin-top:40px;">KS Giám sát thi công</div></div>
    <div style="text-align:center;"><div style="border-top:1px solid #000;padding-top:8px;margin-top:40px;">Đại diện Nhà thầu</div></div>
  </div>
  <div class="note">ⓘ Đây là báo cáo nháp. Biên bản chính thức phải được ký đầy đủ theo quy định NĐ 06/2021/NĐ-CP.</div>
  <script>window.onload=function(){window.print();}</script>
  </body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

const ssData = [
  { g: "Móng", l: "KT hố móng", s: "±20mm" }, { g: "Móng", l: "Cao độ đáy móng", s: "±10mm" },
  { g: "Cột", l: "Vị trí trục cột", s: "±5mm" }, { g: "Cột", l: "Tiết diện cột", s: "+5,-3mm" }, { g: "Cột", l: "Thẳng đứng H<=5m", s: "±10mm" }, { g: "Cột", l: "Thẳng đứng H>5m", s: "±15mm" }, { g: "Cột", l: "Cao độ đỉnh cột", s: "±10mm" },
  { g: "Dầm", l: "Tiết diện dầm", s: "+5,-3mm" }, { g: "Dầm", l: "Cao độ đáy dầm", s: "±5mm" },
  { g: "Sàn", l: "Chiều dày sàn", s: "+5,-3mm" }, { g: "Sàn", l: "Cao độ mặt sàn", s: "±10mm" }, { g: "Sàn", l: "Phẳng (thước 2m)", s: "<=5mm" },
  { g: "Cốt thép", l: "KC thép sàn", s: "±10mm" }, { g: "Cốt thép", l: "KC thép dầm/cột", s: "±5mm" }, { g: "Cốt thép", l: "Lớp bảo vệ", s: "±5mm" }, { g: "Cốt thép", l: "Nối chồng", s: "±1d" },
  { g: "Ván khuôn", l: "KT VK (dài)", s: "±5mm" }, { g: "Ván khuôn", l: "Khe hở tấm VK", s: "<=2mm" }, { g: "Ván khuôn", l: "Tim VK", s: "±8mm" },
  { g: "Tường", l: "Chiều dày tường", s: "±5mm" }, { g: "Tường", l: "Thẳng đứng", s: "±5mm" },
  { g: "Hoàn thiện", l: "Chiều dày trát", s: "±3mm" }, { g: "Hoàn thiện", l: "Phẳng gạch lát", s: "<=2mm" },
];
const emgData = [
  { id: "rain", e: "🌧️", t: "Đổ BT gặp mưa", co: "#1e40af", u: "KHẨN CẤP", st: ["DỪNG ngay nếu mưa to", "Che phủ BT bằng bạt", "Mưa nhẹ: tiếp tục, giảm nước", "Không thêm nước vào BT", "Ghi nhật ký đầy đủ", "Kiểm tra bề mặt sau tạnh", "Báo CĐT/TVGS"], nt: "Mưa trước BT đạt 50%R -> lấy thêm mẫu." },
  { id: "fail", e: "❌", t: "Mẫu TN không đạt", co: "#dc2626", u: "XỬ LÝ GẤP", st: ["Không tự ý phá dỡ", "Thông báo VB cho CĐT & TVGS", "Kiểm tra mẫu có lỗi KT?", "Thử lại tổ mẫu dự phòng", "Khoan lõi BT - TCVN 3985", "Lập HĐ đánh giá KT", "PA: gia cường/giảm tải/phá dỡ"], nt: "Lưu toàn bộ phiếu thử, BB." },
];
const loiInit = [
  { id: 1, vt: "Cột C3-T2", mt: "Cốt đai sai bước 250 thay vì 150mm", md: "Cao", tt: "Đang xử lý", ng: "2025-06-10", ph: [] },
  { id: 2, vt: "Sàn T1-S5", mt: "BT rỗ mặt ~0.3m2", md: "Trung bình", tt: "Mới", ng: "2025-06-12", ph: [] },
];
const nkInit = [
  { id: 1, ng: "2025-06-12", tt: "Nắng", nd: "34", nl: 25, tb: "Xe bơm BT, cẩu tháp, đầm dùi x4", cv: "Đổ BT sàn T3 ô S1-S4", kl: "85 m3 BT mác 300", sk: "Slump 16cm. Lấy 2 tổ mẫu.", gc: "7h00-15h30. Bảo dưỡng ngay." },
  { id: 2, ng: "2025-06-11", tt: "Mây", nd: "31", nl: 18, tb: "Cẩu tháp, máy uốn thép", cv: "Gia công & lắp đặt cốt thép sàn T3", kl: "3.2 tấn CB400-V", sk: "NT cốt thép sàn T3 - Đạt.", gc: "" },
];

// ── SESSION MANAGEMENT ────────────────────────────────────────────────────────
const SESS_KEY = "qcm_sessions";
const getSessions = () => { try { const s = localStorage.getItem(SESS_KEY); return s ? JSON.parse(s) : []; } catch { return []; } };
const saveSessions = arr => { try { localStorage.setItem(SESS_KEY, JSON.stringify(arr)); } catch (e) { console.warn("localStorage full", e); } };
const upsertSession = sess => {
  const all = getSessions(), idx = all.findIndex(s => s.id === sess.id);
  const next = idx >= 0 ? [...all.slice(0, idx), sess, ...all.slice(idx + 1)] : [sess, ...all];
  saveSessions(next); return next;
};
const deleteSessionById = id => { const next = getSessions().filter(s => s.id !== id); saveSessions(next); return next; };
const newSession = (type, title, tc) => ({
  id: "s" + Date.now(), type, title, tc,
  location: "", date: new Date().toISOString().slice(0, 10), ks: "",
  results: {}, bienphap: {}, photos: {}, createdAt: new Date().toISOString(),
});

// Image compression (max 900px, JPEG 72%)
const compressImage = file => new Promise(resolve => {
  const img = new Image(), url = URL.createObjectURL(file);
  img.onload = () => {
    const MAX = 900, r = Math.min(MAX / img.width, MAX / img.height, 1);
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    resolve(c.toDataURL("image/jpeg", 0.72));
  };
  img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
  img.src = url;
});

// ── EMERGENCY ────────────────────────────────────────────────────────────────
function EmgModal({ onClose }) {
  const [ac, sAc] = useState(null);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "22px 22px 0 0", width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto", paddingBottom: 32 }}>
        <div style={{ padding: "16px 20px 12px", borderBottom: "1.5px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#dc2626" }}>🚨 Emergency Guide</div>
          <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: 10, background: "#f1f5f9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="x" s={18} c="#374151" /></button>
        </div>
        {!ac ? <div style={{ padding: 16 }}>{emgData.map(g => (
          <button key={g.id} onClick={() => sAc(g.id)} style={{ width: "100%", background: "#fff", border: "2px solid " + g.co + "33", borderRadius: 16, padding: "18px 16px", marginBottom: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: g.co + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{g.e}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 800, color: g.co }}>{g.t}</div><div style={{ display: "inline-block", background: g.co, color: "#fff", borderRadius: 99, fontSize: 10.5, fontWeight: 700, padding: "2px 10px" }}>{g.u}</div></div>
          </button>
        ))}</div> : (() => {
          const g = emgData.find(x => x.id === ac);
          return <div>
            <button onClick={() => sAc(null)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "none", border: "none", cursor: "pointer", color: NAVY, fontSize: 13, fontWeight: 600 }}><Ic n="back" s={16} c={NAVY} /> Quay lại</button>
            <div style={{ padding: "0 16px" }}>
              {g.st.map((s, i) => <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10, background: "#f8fafc", borderRadius: 12, padding: "12px 14px", borderLeft: "3px solid " + g.co }}>
                <div style={{ width: 26, height: 26, borderRadius: 99, background: g.co, color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                <span style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6 }}>{s}</span>
              </div>)}
              <div style={{ background: "#fffbeb", borderRadius: 12, padding: "12px 14px", borderLeft: "3px solid #f59e0b", marginBottom: 16 }}>
                <div style={{ fontSize: 12.5, color: "#78350f", lineHeight: 1.6 }}>⚠️ {g.nt}</div>
              </div>
            </div>
          </div>;
        })()}
      </div>
    </div>
  );
}

// ── SESSION LIST SCREEN ───────────────────────────────────────────────────────
function SessionListScreen({ type, title, tc, onOpen }) {
  const [sessions, setSessions] = useState(() => getSessions().filter(s => s.type === type));
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ location: "", date: new Date().toISOString().slice(0, 10), ks: "" });

  const refresh = () => setSessions(getSessions().filter(s => s.type === type));

  const handleCreate = () => {
    if (!form.location.trim()) return;
    const sess = { ...newSession(type, title, tc), location: form.location.trim(), date: form.date, ks: form.ks };
    upsertSession(sess);
    setCreating(false);
    setForm({ location: "", date: new Date().toISOString().slice(0, 10), ks: "" });
    onOpen(sess);
  };

  const handleDelete = id => {
    if (!window.confirm("Xóa đợt nghiệm thu này?")) return;
    deleteSessionById(id); refresh();
  };

  const pct = sess => {
    const total = getItemsByType(type).length;
    const done = Object.keys(sess.results || {}).length;
    return total > 0 ? Math.round(done / total * 100) : 0;
  };

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ background: "#eff6ff", borderRadius: 14, padding: "12px 16px", marginBottom: 16, borderLeft: "4px solid " + NAVY }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{title}</div>
        <div style={{ fontSize: 11, color: "#64748b" }}>{tc} · Mỗi đợt lưu riêng biệt theo vị trí</div>
      </div>

      <button onClick={() => setCreating(c => !c)} style={{ width: "100%", padding: 13, borderRadius: 12, background: creating ? "#f1f5f9" : NAVY, color: creating ? NAVY : "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14, ...T }}>
        <Ic n="plus" s={18} c={creating ? NAVY : "#fff"} />{creating ? "Đóng" : "Tạo đợt nghiệm thu mới"}
      </button>

      {creating && (
        <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 16, border: "2px solid " + NAVY }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 12 }}>📋 Thông tin đợt nghiệm thu</div>
          {[["📍 Vị trí kiểm tra *", "location", "VD: Cột C3-T2, Sàn T3..."], ["👷 KS Giám sát", "ks", "Họ tên KS"]].map(([l, k, ph]) => (
            <div key={k} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{l}</div>
              <input value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} placeholder={ph}
                style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1.5px solid " + (k === "location" && !form.location ? "#fca5a5" : "#e2e8f0"), fontSize: 13, outline: "none", boxSizing: "border-box", ...T }} />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>📅 Ngày kiểm tra</div>
            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", ...T }} />
          </div>
          <button onClick={handleCreate} disabled={!form.location.trim()} style={{ width: "100%", padding: 14, background: form.location.trim() ? NAVY : "#e2e8f0", color: form.location.trim() ? "#fff" : "#94a3b8", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: form.location.trim() ? "pointer" : "not-allowed", ...T }}>
            Bắt đầu kiểm tra →
          </button>
        </div>
      )}

      {sessions.length === 0 && !creating && (
        <div style={{ textAlign: "center", padding: "48px 16px", color: "#94a3b8" }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>📋</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Chưa có đợt nghiệm thu nào</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Nhấn "Tạo đợt mới" để bắt đầu</div>
        </div>
      )}

      {sessions.length > 0 && (
        <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8 }}>LỊCH SỬ — {sessions.length} đợt</div>
      )}

      {sessions.map(sess => {
        const p = pct(sess);
        const dC = Object.values(sess.results || {}).filter(v => v === "d").length;
        const kC = Object.values(sess.results || {}).filter(v => v === "k").length;
        const photoCount = Object.values(sess.photos || {}).reduce((a, arr) => a + (arr?.length || 0), 0);
        return (
          <div key={sess.id} style={{ background: "#fff", borderRadius: 14, marginBottom: 10, border: "1.5px solid " + (p === 100 ? "#bbf7d0" : "#e2e8f0"), overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "stretch" }}>
              <button onClick={() => onOpen(sess)} style={{ flex: 1, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, flex: 1, lineHeight: 1.3 }}>{sess.location || "Chưa đặt tên"}</div>
                  <div style={{ display: "flex", gap: 4, marginLeft: 6, flexShrink: 0 }}>
                    {photoCount > 0 && <span style={{ fontSize: 10, background: "#eff6ff", color: NAVY, padding: "2px 6px", borderRadius: 99 }}>📷 {photoCount}</span>}
                    {p === 100 && <span style={{ fontSize: 10, background: "#dcfce7", color: "#16a34a", padding: "2px 6px", borderRadius: 99, fontWeight: 700 }}>✅ Xong</span>}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{sess.date}{sess.ks ? " · " + sess.ks : ""}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 99, height: 6 }}>
                    <div style={{ background: p === 100 ? "#22c55e" : NAVY, width: p + "%", height: 6, borderRadius: 99, transition: "0.3s" }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: p === 100 ? "#16a34a" : "#64748b", minWidth: 30 }}>{p}%</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {dC > 0 && <span style={{ fontSize: 11, background: "#dcfce7", color: "#16a34a", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>✅ {dC}</span>}
                  {kC > 0 && <span style={{ fontSize: 11, background: "#fef2f2", color: "#ef4444", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>❌ {kC}</span>}
                </div>
              </button>
              <button onClick={() => handleDelete(sess.id)} style={{ width: 50, background: "#fef2f2", border: "none", borderLeft: "1px solid #fee2e2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Ic n="trash" s={16} c="#ef4444" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── GENERIC CHECKLIST ────────────────────────────────────────────────────────
function GenCL({ items, session, onUpdate }) {
  const [results, setResults] = useState(session.results || {});
  const [bienphap, setBienphap] = useState(session.bienphap || {});
  const [photos, setPhotos] = useState(session.photos || {});
  const [meta, setMeta] = useState({
    c: session.meta?.c || "", v: session.location || "",
    d: session.date || new Date().toISOString().slice(0, 10), k: session.ks || "",
  });
  const [showReport, setShowReport] = useState(false);
  const [viewPhoto, setViewPhoto] = useState(null);
  const [uploading, setUploading] = useState({});

  const persist = (r, bp, ph, m) => {
    const updated = { ...session, results: r, bienphap: bp, photos: ph, location: m.v, date: m.d, ks: m.k, meta: m };
    upsertSession(updated);
    onUpdate(updated);
  };

  const setR = (id, v) => {
    const r = { ...results };
    if (r[id] === v) delete r[id]; else r[id] = v;
    setResults(r); persist(r, bienphap, photos, meta);
  };
  const setBP = (id, v) => { const bp = { ...bienphap, [id]: v }; setBienphap(bp); persist(results, bp, photos, meta); };
  const setM = (k, v) => { const m = { ...meta, [k]: v }; setMeta(m); persist(results, bienphap, photos, m); };

  const addPhotos = async (id, files) => {
    setUploading(u => ({ ...u, [id]: true }));
    const compressed = (await Promise.all([...files].map(compressImage))).filter(Boolean);
    const ph = { ...photos, [id]: [...(photos[id] || []), ...compressed] };
    setPhotos(ph); persist(results, bienphap, ph, meta);
    setUploading(u => ({ ...u, [id]: false }));
  };

  const removePhoto = (id, idx) => {
    const arr = (photos[id] || []).filter((_, i) => i !== idx);
    const ph = { ...photos }; if (arr.length) ph[id] = arr; else delete ph[id];
    setPhotos(ph); persist(results, bienphap, ph, meta);
  };

  const ans = Object.keys(results).length;
  const dC = Object.values(results).filter(v => v === "d").length;
  const kC = Object.values(results).filter(v => v === "k").length;
  const allDone = ans === items.length;
  const pct = Math.round(ans / items.length * 100);
  const bS = (active, color) => ({ flex: 1, padding: "10px 4px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, ...T, background: active ? color : "#f1f5f9", color: active ? "#fff" : "#94a3b8" });

  return (
    <div style={{ padding: "0 16px 16px" }}>
      {/* Progress */}
      <div style={{ background: NAVY, borderRadius: 16, padding: "14px 16px", marginBottom: 16, color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div><div style={{ fontSize: 12, opacity: 0.8 }}>Tiến độ</div><div style={{ fontSize: 24, fontWeight: 800 }}>{pct}%</div></div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, opacity: 0.8, maxWidth: 180, wordBreak: "break-word" }}>📍 {meta.v || "—"}</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>📅 {meta.d}</div>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 99, height: 8 }}>
          <div style={{ background: "#fff", width: pct + "%", height: 8, borderRadius: 99, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Meta */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 16, border: "1.5px solid #e2e8f0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[["Công trình", "c", "Tên CT"], ["Vị trí", "v", "Cột C3-T2"], ["Ngày", "d", ""], ["KS GS", "k", "Họ tên"]].map(([l, k, ph]) => (
            <div key={k}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 3 }}>{l}</div>
              <input type={k === "d" ? "date" : "text"} value={meta[k] || ""} onChange={e => setM(k, e.target.value)} placeholder={ph}
                style={{ width: "100%", padding: "9px 10px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", ...T }} />
            </div>
          ))}
        </div>
      </div>

      {/* Checklist items */}
      {items.map((it, i) => {
        const rs = results[it.id], bp = bienphap[it.id] || "";
        const itemPhotos = photos[it.id] || [];
        const bc = rs === "d" ? "#22c55e" : rs === "k" ? "#ef4444" : rs === "n" ? "#94a3b8" : "#e2e8f0";
        return (
          <div key={it.id} style={{ background: "#fff", borderRadius: 14, marginBottom: 12, border: "2px solid " + bc, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 99, background: NAVY, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", lineHeight: 1.35 }}>{it.title}</div>
                  <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 600 }}>{it.tc}</div>
                </div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 9, padding: "8px 12px", marginBottom: 12, borderLeft: "3px solid #cbd5e1" }}>
                <div style={{ fontSize: 11.5, color: "#475569", lineHeight: 1.6 }}>💡 {it.hd}</div>
              </div>
              {/* Action buttons + camera */}
              <div style={{ display: "flex", gap: 8 }}>
                <button style={bS(rs === "d", "#22c55e")} onClick={() => setR(it.id, "d")}>✅ Đạt</button>
                <button style={bS(rs === "k", "#ef4444")} onClick={() => setR(it.id, "k")}>❌ KĐạt</button>
                <button style={bS(rs === "n", "#64748b")} onClick={() => setR(it.id, "n")}>— N/A</button>
                <label style={{ width: 44, height: 44, borderRadius: 10, background: itemPhotos.length > 0 ? "#eff6ff" : "#f1f5f9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                  {uploading[it.id]
                    ? <div style={{ width: 18, height: 18, border: "2px solid " + NAVY, borderTopColor: "transparent", borderRadius: 99, animation: "spin 0.7s linear infinite" }} />
                    : <Ic n="cam" s={18} c={itemPhotos.length > 0 ? NAVY : "#94a3b8"} />}
                  {itemPhotos.length > 0 && !uploading[it.id] && (
                    <span style={{ position: "absolute", top: -5, right: -5, background: NAVY, color: "#fff", borderRadius: 99, fontSize: 9, fontWeight: 700, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{itemPhotos.length}</span>
                  )}
                  <input type="file" accept="image/*" capture="environment" multiple onChange={e => { addPhotos(it.id, e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
                </label>
              </div>
              {/* Photo thumbnails */}
              {itemPhotos.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                  {itemPhotos.map((p, pi) => (
                    <div key={pi} style={{ position: "relative" }}>
                      <img src={p} onClick={() => setViewPhoto(p)} style={{ width: 68, height: 68, borderRadius: 9, objectFit: "cover", cursor: "pointer", border: "2px solid #e2e8f0", display: "block" }} alt="" />
                      <button onClick={() => removePhoto(it.id, pi)} style={{ position: "absolute", top: -5, right: -5, width: 20, height: 20, borderRadius: 99, background: "#ef4444", border: "2px solid #fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Ic n="x" s={9} c="#fff" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {rs === "k" && (
              <div style={{ borderTop: "2px dashed #fecaca", background: "#fff5f5", padding: "12px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", marginBottom: 6 }}>🔧 Biện pháp khắc phục</div>
                <textarea value={bp} onChange={e => setBP(it.id, e.target.value)} placeholder="Mô tả biện pháp..." rows={3}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #fca5a5", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" }} />
              </div>
            )}
          </div>
        );
      })}

      <button onClick={() => setShowReport(true)} disabled={!allDone} style={{ width: "100%", padding: "15px", borderRadius: 14, background: allDone ? NAVY : "#e2e8f0", color: allDone ? "#fff" : "#94a3b8", border: "none", fontSize: 15, fontWeight: 700, cursor: allDone ? "pointer" : "not-allowed", ...T }}>
        📄 Xuất biên bản{!allDone && ` (còn ${items.length - ans})`}
      </button>

      {/* Photo lightbox */}
      {viewPhoto && (
        <div onClick={() => setViewPhoto(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <img src={viewPhoto} style={{ maxWidth: "100%", maxHeight: "88vh", borderRadius: 12 }} alt="" />
          <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.2)", borderRadius: 99, padding: "6px 12px", color: "#fff", fontSize: 13 }}>Nhấn để đóng</div>
        </div>
      )}

      {/* Report modal */}
      {showReport && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowReport(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto", padding: "20px 18px 32px" }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>BIÊN BẢN NGHIỆM THU</div>
              <div style={{ fontSize: 13, color: NAVY, fontWeight: 700 }}>{session.title}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{session.tc} · {session.location}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[["Đạt", dC, "#dcfce7", "#16a34a"], ["KĐạt", kC, "#fef2f2", "#ef4444"], ["N/A", ans - dC - kC, "#f1f5f9", "#64748b"]].map(([l, c, bg, cl]) => (
                <div key={l} style={{ background: bg, borderRadius: 10, padding: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: cl }}>{c}</div>
                  <div style={{ fontSize: 11.5, color: cl, fontWeight: 600 }}>{l}</div>
                </div>
              ))}
            </div>
            {items.map((it, i) => {
              const rs = results[it.id], bp = bienphap[it.id];
              const lm = { d: "✅ Đạt", k: "❌ KĐ", n: "— N/A" }, cm = { d: "#16a34a", k: "#ef4444", n: "#94a3b8" };
              const itemPhotos = photos[it.id] || [];
              return (
                <div key={it.id} style={{ borderBottom: i < items.length - 1 ? "1px solid #f1f5f9" : "none", paddingBottom: 10, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, flex: 1, lineHeight: 1.4 }}>{i + 1}. {it.title}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: cm[rs], flexShrink: 0, marginLeft: 8 }}>{lm[rs]}</span>
                  </div>
                  {rs === "k" && bp && <div style={{ background: "#fff5f5", borderRadius: 8, padding: "6px 10px", marginTop: 4, fontSize: 12, color: "#374151" }}>{bp}</div>}
                  {itemPhotos.length > 0 && (
                    <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
                      {itemPhotos.map((p, pi) => <img key={pi} src={p} style={{ width: 56, height: 56, borderRadius: 7, objectFit: "cover", border: "1px solid #e2e8f0" }} alt="" />)}
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowReport(false)} style={{ flex: 1, padding: "14px", background: "#f1f5f9", color: NAVY, border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", ...T }}>Đóng</button>
              <button onClick={() => exportPDF(session.title, items, results, bienphap, meta, session.tc, photos)} style={{ flex: 1, padding: "14px", background: NAVY, color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", ...T }}>🖨️ Xuất PDF</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── XLSX VIEWER ──────────────────────────────────────────────────────────────
function buildMergeMap(merges) {
  const mm = {};
  (merges || []).forEach(m => {
    mm[`${m.s.r}_${m.s.c}`] = { rs: m.e.r - m.s.r + 1, cs: m.e.c - m.s.c + 1 };
    for (let r = m.s.r; r <= m.e.r; r++)
      for (let c = m.s.c; c <= m.e.c; c++)
        if (r !== m.s.r || c !== m.s.c) mm[`${r}_${c}`] = null;
  });
  return mm;
}

function detectFillCols(rows) {
  const header = (rows[0] || []).concat(rows[1] || []);
  const nr = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const cols = {};
  header.forEach((cell, i) => {
    const s = nr(cell);
    const idx = i < (rows[0] || []).length ? i : i - (rows[0] || []).length;
    if (["ket qua", "dat", "khong dat", "ket luan", "danh gia"].some(k => s.includes(k))) cols[idx] = "result";
    else if (["ghi chu", "nhan xet", "bien phap", "ghi chep"].some(k => s.includes(k))) cols[idx] = "note";
  });
  return cols;
}

function XLSXScreen() {
  const initT = () => { try { const s = localStorage.getItem("qcm_xlsx_list"); return s ? JSON.parse(s) : []; } catch { return []; } };
  const [templates, setTemplates] = useState(initT);
  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState({});
  const [fillCols, setFillCols] = useState({});
  const [meta, setMeta] = useState({ vitri: "", ngay: new Date().toISOString().slice(0, 10), ks: "" });
  const [upErr, sUpErr] = useState("");
  const [loading, sLoading] = useState(false);

  const saveTemplates = v => { try { localStorage.setItem("qcm_xlsx_list", JSON.stringify(v)); } catch {} setTemplates(v); };

  const handleUpload = e => {
    const file = e.target.files[0]; if (!file) return;
    sUpErr(""); sLoading(true);
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const wb = XLSX.read(new Uint8Array(ev.target.result), { type: "array" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        const merges = ws["!merges"] || [];
        const colWidths = (ws["!cols"] || []).map(c => c ? (c.wch || c.wpx / 7 || 10) : 10);
        const t = { id: "xlsx_" + Date.now(), name: file.name.replace(/\.xlsx?$/i, ""), rows, merges, colWidths };
        const updated = [...templates, t];
        saveTemplates(updated);
        sLoading(false);
      } catch (err) { sUpErr("Lỗi đọc file. Kiểm tra file .xlsx và thử lại."); sLoading(false); }
    };
    reader.readAsArrayBuffer(file); e.target.value = "";
  };

  const openTemplate = t => {
    setActive(t); setAnswers({});
    const fc = detectFillCols(t.rows);
    setFillCols(Object.keys(fc).length > 0 ? fc : {});
  };

  const toggleFillCol = ci => {
    setFillCols(p => {
      const n = { ...p };
      if (!n[ci]) n[ci] = "result";
      else if (n[ci] === "result") n[ci] = "note";
      else delete n[ci];
      return n;
    });
  };

  const setAns = (key, val) => setAnswers(p => ({ ...p, [key]: val }));

  const exportPDFXlsx = () => {
    if (!active) return;
    const { rows, merges, name, colWidths } = active;
    const mm = buildMergeMap(merges);
    const colPcts = (() => {
      const total = colWidths.reduce((a, b) => a + (b || 10), 0) || 1;
      return colWidths.map(w => Math.round((w || 10) / total * 100));
    })();
    let colgroup = "<colgroup>";
    colPcts.forEach(p => { colgroup += `<col style="width:${p}%">`; });
    colgroup += "</colgroup>";
    let tableHtml = `<table style="border-collapse:collapse;width:100%;font-size:9pt;table-layout:fixed;">${colgroup}`;
    rows.forEach((row, ri) => {
      tableHtml += "<tr>";
      row.forEach((cell, ci) => {
        const key = `${ri}_${ci}`;
        const merge = mm[key];
        if (merge === null) return;
        const m = merge || {};
        const ra = m.rs > 1 ? ` rowspan="${m.rs}"` : "";
        const ca = m.cs > 1 ? ` colspan="${m.cs}"` : "";
        const ans = answers[key];
        const fc = fillCols[ci];
        let content = String(cell || "");
        let cellStyle = "border:1px solid #888;padding:3px 5px;vertical-align:middle;word-wrap:break-word;";
        if (ri === 0) cellStyle += "background:#d6e4f0;font-weight:bold;text-align:center;";
        if (fc === "result" && ans) {
          content = ans === "D" ? "✓ Đạt" : ans === "K" ? "✗ Không đạt" : "—";
          cellStyle += `color:${ans === "D" ? "#16a34a" : ans === "K" ? "#dc2626" : "#64748b"};font-weight:bold;text-align:center;`;
        } else if (fc === "note" && ans) { content = ans; }
        tableHtml += `<td${ra}${ca} style="${cellStyle}">${content}</td>`;
      });
      tableHtml += "</tr>";
    });
    tableHtml += "</table>";
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${name}</title>
    <style>body{font-family:Arial,sans-serif;margin:15mm 10mm;}h3{text-align:center;margin-bottom:6px;}.meta{display:flex;gap:20px;margin-bottom:10px;font-size:9pt;}@page{size:A4 landscape;margin:10mm;}@media print{button{display:none;}}</style></head><body>
    <h3>${name}</h3>
    <div class="meta"><div><strong>Vị trí KT:</strong> ${meta.vitri || "——"}</div><div><strong>Ngày:</strong> ${meta.ngay || "——"}</div><div><strong>KS Giám sát:</strong> ${meta.ks || "——"}</div></div>
    ${tableHtml}
    <div style="display:flex;gap:40px;margin-top:30px;font-size:9pt;"><div style="flex:1;text-align:center;"><div style="border-top:1px solid #000;margin-top:40px;padding-top:4px;">KS Giám sát thi công</div></div><div style="flex:1;text-align:center;"><div style="border-top:1px solid #000;margin-top:40px;padding-top:4px;">Đại diện Nhà thầu</div></div><div style="flex:1;text-align:center;"><div style="border-top:1px solid #000;margin-top:40px;padding-top:4px;">Chủ đầu tư / TVGS</div></div></div>
    <script>window.onload=function(){window.print();}<\/script></body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  };

  if (active) {
    const mm = buildMergeMap(active.merges);
    const hasFill = Object.keys(fillCols).length > 0;
    return <div style={{ padding: "0 0 16px" }}>
      <div style={{ background: NAVY, padding: "10px 16px", marginBottom: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[["Vị trí KT", "vitri", "Dầm D1-T2"], ["Ngày", "ngay", ""], ["KS Giám sát", "ks", "Họ tên KS"]].map(([l, k, ph]) => <div key={k}><div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginBottom: 2 }}>{l}</div><input type={k === "ngay" ? "date" : "text"} value={meta[k]} onChange={e => setMeta(p => ({ ...p, [k]: e.target.value }))} placeholder={ph} style={{ width: "100%", padding: "6px 8px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box" }} /></div>)}
        </div>
      </div>
      <div style={{ background: "#fffbeb", borderBottom: "1px solid #fde68a", padding: "8px 16px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 11.5, color: "#92400e", flex: 1 }}>{hasFill ? `✅ Phát hiện ${Object.keys(fillCols).length} cột có thể điền. ` : "⚠️ Chưa phát hiện cột kết quả. "}<strong>Nhấn vào tiêu đề cột</strong> để bật/tắt chế độ điền.</span>
        <div style={{ display: "flex", gap: 6 }}><span style={{ fontSize: 10, background: "#22c55e", color: "#fff", padding: "2px 6px", borderRadius: 99 }}>🟢=Kết quả</span><span style={{ fontSize: 10, background: "#3b82f6", color: "#fff", padding: "2px 6px", borderRadius: 99 }}>🔵=Ghi chú</span></div>
      </div>
      <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "calc(100vh - 320px)", padding: "0 0 8px" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 11, minWidth: "100%" }}>
          {active.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => {
                const key = `${ri}_${ci}`;
                const merge = mm[key];
                if (merge === null) return null;
                const m = merge || {};
                const fc = fillCols[ci];
                const ans = answers[key];
                const isHeader = ri === 0;
                if (isHeader) {
                  const colBg = fc === "result" ? "#bbf7d0" : fc === "note" ? "#bfdbfe" : "#d6e4f0";
                  return <th key={ci} rowSpan={m.rs} colSpan={m.cs} onClick={() => toggleFillCol(ci)} style={{ border: "1.5px solid #999", padding: "5px 6px", background: colBg, textAlign: "center", cursor: "pointer", fontSize: 10.5, fontWeight: 700, whiteSpace: "pre-wrap", minWidth: 60, position: "sticky", top: 0, zIndex: 2 }}>{fc === "result" ? "🟢 " : fc === "note" ? "🔵 " : ""}{String(cell || "")}</th>;
                }
                if (fc === "result") {
                  const bg = ans === "D" ? "#dcfce7" : ans === "K" ? "#fef2f2" : ans === "N" ? "#f1f5f9" : "#fff";
                  return <td key={ci} rowSpan={m.rs} colSpan={m.cs} style={{ border: "1px solid #ccc", padding: "3px", background: bg, textAlign: "center", cursor: "pointer", minWidth: 70 }}>
                    <div style={{ display: "flex", gap: 3, justifyContent: "center" }}>
                      {[["D", "✅", "#22c55e"], ["K", "❌", "#ef4444"], ["N", "—", "#94a3b8"]].map(([v, lbl, c]) =>
                        <button key={v} onClick={() => setAns(key, ans === v ? "" : v)} style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: ans === v ? c : "#f1f5f9", color: ans === v ? "#fff" : "#94a3b8", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>{lbl}</button>
                      )}
                    </div>
                  </td>;
                }
                if (fc === "note") {
                  return <td key={ci} rowSpan={m.rs} colSpan={m.cs} style={{ border: "1px solid #ccc", padding: "2px 4px", background: "#f0f9ff", minWidth: 80 }}>
                    <input value={ans || ""} onChange={e => setAns(key, e.target.value)} placeholder="Nhập..." style={{ width: "100%", border: "none", outline: "none", fontSize: 11, background: "transparent" }} />
                  </td>;
                }
                return <td key={ci} rowSpan={m.rs} colSpan={m.cs} style={{ border: "1px solid #ccc", padding: "3px 5px", whiteSpace: "pre-wrap", minWidth: 50 }}>{String(cell || "")}</td>;
              })}
            </tr>
          ))}
        </table>
      </div>
      <div style={{ padding: "12px 16px 0", display: "flex", gap: 10 }}>
        <button onClick={() => { setActive(null); setAnswers({}); }} style={{ flex: 1, padding: "13px", background: "#f1f5f9", color: NAVY, border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", ...T }}>← Quay lại</button>
        <button onClick={exportPDFXlsx} style={{ flex: 2, padding: "13px", background: NAVY, color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", ...T }}>🖨️ Xuất PDF theo form mẫu</button>
      </div>
    </div>;
  }

  return <div style={{ padding: "0 16px 16px" }}>
    <div style={{ background: "#eff6ff", borderRadius: 14, padding: "14px 16px", marginBottom: 16, borderLeft: "4px solid " + NAVY }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>📋 Mẫu biểu Chủ đầu tư ban hành</div>
      <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>Upload file <strong>.xlsx</strong> biểu mẫu checklist của CĐT. App sẽ hiển thị đúng cấu trúc bảng biểu để bạn điền kết quả và xuất PDF cùng định dạng.</div>
    </div>
    <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", background: "#fff", borderRadius: 14, border: "2px dashed #93c5fd", cursor: "pointer", marginBottom: 14, ...T }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📁</div>
      <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{loading ? "Đang xử lý..." : "Nhấn để upload file .xlsx"}</div><div style={{ fontSize: 12, color: "#64748b" }}>Biểu mẫu checklist của Chủ đầu tư</div></div>
      <input type="file" accept=".xlsx,.xls" onChange={handleUpload} style={{ display: "none" }} disabled={loading} />
    </label>
    {upErr && <div style={{ background: "#fef2f2", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: "#dc2626", marginBottom: 12 }}>❌ {upErr}</div>}
    {templates.length === 0 && <div style={{ textAlign: "center", padding: "32px 16px", color: "#94a3b8" }}><div style={{ fontSize: 36, marginBottom: 8 }}>📂</div><div style={{ fontSize: 14, fontWeight: 600 }}>Chưa có biểu mẫu nào</div><div style={{ fontSize: 12, marginTop: 4 }}>Upload file .xlsx để bắt đầu</div></div>}
    {templates.map(t => <div key={t.id} style={{ background: "#fff", borderRadius: 14, marginBottom: 10, border: "1.5px solid #e2e8f0", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <button onClick={() => openTemplate(t)} style={{ flex: 1, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12, ...T }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📊</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{t.name}</div><div style={{ fontSize: 11.5, color: "#64748b" }}>{t.rows.length} dòng × {(t.rows[0] || []).length} cột · {Object.keys(detectFillCols(t.rows)).length > 0 ? `${Object.keys(detectFillCols(t.rows)).length} cột điền tự động` : "Chọn cột thủ công"}</div></div>
          <Ic n="chev" s={18} c={NAVY} />
        </button>
        <button onClick={() => { const u = templates.filter(x => x.id !== t.id); saveTemplates(u); }} style={{ width: 50, height: 50, background: "#fef2f2", border: "none", borderLeft: "1px solid #fee2e2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="trash" s={16} c="#ef4444" /></button>
      </div>
    </div>)}
  </div>;
}

// ── CHECKLIST SCREEN ─────────────────────────────────────────────────────────
function CLScreen({ setST }) {
  const SK = "qcm_gen";
  const init = () => { try { const s = localStorage.getItem(SK); if (s) return JSON.parse(s); } catch (e) { } return {}; };
  const [ck, sCk] = useState(init);
  const [oc, sOC] = useState(1);
  const sC = fn => { sCk(p => { const n = fn(p); try { localStorage.setItem(SK, JSON.stringify(n)); } catch (e) { } return n; }); };
  const total = clData.reduce((a, c) => a + c.items.length, 0), done = Object.values(ck).filter(v => v === true).length, pct = Math.round((done / total) * 100);
  const tog = (k, v) => sC(p => ({ ...p, [k]: p[k] === v ? undefined : v }));

  return <div style={{ padding: "0 16px 16px" }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 10 }}>BTCT — TCVN 4453:1995</div>
    {[{ id: "ct", e: "🔩", l: "Cốt thép", s: "5 mục" }, { id: "vk", e: "🪵", l: "Ván khuôn", s: "7 mục" }, { id: "bt", e: "🏗️", l: "Bê tông", s: "8 mục" }].map(m => <button key={m.id} onClick={() => setST(m.id)} style={{ width: "100%", background: "linear-gradient(135deg," + NAVY + " 60%,#2d4fa3)", borderRadius: 14, padding: "14px 16px", marginBottom: 10, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left", ...T }}><div style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{m.e}</div><div style={{ flex: 1 }}><div style={{ color: "#fff", fontWeight: 700, fontSize: 13.5 }}>{m.l}</div><div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11.5 }}>{m.s}</div></div><Ic n="chev" s={16} c="rgba(255,255,255,0.6)" /></button>)}
    <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, marginTop: 4 }}>HOÀN THIỆN — TCVN 9377:2012</div>
    {[{ id: "ht_xay", e: "🧱", l: "Công tác Xây", s: "6 mục" }, { id: "ht_trat", e: "🪣", l: "Công tác Trát", s: "6 mục" }, { id: "ht_lat", e: "⬛", l: "Lát gạch nền", s: "6 mục" }, { id: "ht_op", e: "🔲", l: "Ốp gạch tường", s: "6 mục" }, { id: "ht_son", e: "🖌️", l: "Công tác Sơn", s: "6 mục" }, { id: "ht_tran", e: "⬜", l: "Trần thạch cao", s: "6 mục" }, { id: "ht_cua", e: "🚪", l: "Lắp đặt Cửa", s: "6 mục" }].map(m => <button key={m.id} onClick={() => setST(m.id)} style={{ width: "100%", background: "linear-gradient(135deg,#1e40af 60%,#1d4ed8)", borderRadius: 14, padding: "12px 16px", marginBottom: 8, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left", ...T }}><div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{m.e}</div><div style={{ flex: 1 }}><div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{m.l}</div><div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>{m.s}</div></div><Ic n="chev" s={14} c="rgba(255,255,255,0.6)" /></button>)}
    <button onClick={() => setST("tm")} style={{ width: "100%", background: "linear-gradient(135deg,#0f766e 60%,#0d9488)", borderRadius: 14, padding: "12px 16px", marginBottom: 8, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left", ...T }}><div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>💧</div><div style={{ flex: 1 }}><div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Chống thấm</div><div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>6 mục — TCVN 9065</div></div><Ic n="chev" s={14} c="rgba(255,255,255,0.6)" /></button>
    <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 10, marginTop: 8 }}>DANH MỤC TỔNG HỢP ({done}/{total} — {pct}%)</div>
    {clData.map(cat => <div key={cat.id} style={{ background: "#fff", borderRadius: 14, marginBottom: 10, overflow: "hidden", border: "1.5px solid #e2e8f0" }}>
      <button onClick={() => sOC(oc === cat.id ? null : cat.id)} style={{ width: "100%", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: oc === cat.id ? "#eff6ff" : "#fff", border: "none", cursor: "pointer", ...T }}><span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{cat.cat}</span><span style={{ transform: oc === cat.id ? "rotate(90deg)" : "none", transition: "0.2s", color: NAVY }}><Ic n="chev" s={16} /></span></button>
      {oc === cat.id && <div style={{ borderTop: "1px solid #e2e8f0" }}>{cat.items.map((it, i) => { const k = cat.id + "-" + i, s = ck[k]; return <div key={i} style={{ padding: "12px 16px", borderBottom: i < cat.items.length - 1 ? "1px solid #f1f5f9" : "none", display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 13, color: "#374151", flex: 1 }}>{it}</span><div style={{ display: "flex", gap: 8 }}><button onClick={() => tog(k, true)} style={{ width: 42, height: 42, borderRadius: 10, border: "none", background: s === true ? "#22c55e" : "#f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="check" s={17} c={s === true ? "#fff" : "#94a3b8"} /></button><button onClick={() => tog(k, false)} style={{ width: 42, height: 42, borderRadius: 10, border: "none", background: s === false ? "#ef4444" : "#f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="x" s={17} c={s === false ? "#fff" : "#94a3b8"} /></button></div></div>; })}</div>}
    </div>)}
  </div>;
}

// ── TCVN SCREEN ──────────────────────────────────────────────────────────────
function TCVNScreen() {
  const [mode, sMode] = useState("tcvn");
  const [q, sQ] = useState(""); const [ex, sEx] = useState(null); const [nhom, sNhom] = useState("Tất cả");
  const [qPL, sQPL] = useState(""); const [exPL, sExPL] = useState(null);
  const nhoms = ["Tất cả", "Thi công", "Vật liệu", "Thí nghiệm", "Thiết kế", "Pháp quy"];
  const nr = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const f = tcvnData.filter(d => {
    const mN = nhom === "Tất cả" || d.nhom === nhom;
    const mQ = !q.trim() || nr(d.ma).includes(nr(q)) || nr(d.ten).includes(nr(q)) || nr(d.tomtat).includes(nr(q)) || d.noidung.some(n => nr(n).includes(nr(q)));
    return mN && mQ;
  });
  const fPL = qPL.trim() ? plData.filter(d => nr(d.td).includes(nr(qPL)) || nr(d.d).includes(nr(qPL)) || d.tags.some(t => nr(t).includes(nr(qPL))) || d.tt.some(t => nr(t).includes(nr(qPL)))) : plData;
  const nhomColor = { "Thi công": "#1e3a8a", "Vật liệu": "#d97706", "Thí nghiệm": "#16a34a", "Thiết kế": "#7c3aed", "Pháp quy": "#dc2626" };

  return <div style={{ padding: "0 16px 16px" }}>
    <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 12, padding: 4, marginBottom: 16, gap: 4 }}>
      {[["tcvn", "📐 Tiêu chuẩn TCVN"], ["pl", "⚖️ NĐ 06/2021"]].map(([m, l]) => <button key={m} onClick={() => sMode(m)} style={{ flex: 1, padding: "10px 6px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, background: mode === m ? "#fff" : "transparent", color: mode === m ? NAVY : "#64748b", boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none", ...T }}>{l}</button>)}
    </div>
    {mode === "tcvn" && <>
      <div style={{ position: "relative", marginBottom: 12 }}><div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}><Ic n="search" s={18} c="#94a3b8" /></div><input value={q} onChange={e => sQ(e.target.value)} placeholder="Tìm mã, tên, nội dung..." style={{ width: "100%", padding: "13px 40px 13px 42px", borderRadius: 14, border: "2px solid " + (q ? NAVY : "#e2e8f0"), fontSize: 14, outline: "none", boxSizing: "border-box", ...T }} />{q && <button onClick={() => sQ("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "#f1f5f9", border: "none", borderRadius: 99, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="x" s={13} c="#64748b" /></button>}</div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 12, paddingBottom: 4 }}>{nhoms.map(n => <button key={n} onClick={() => sNhom(n)} style={{ whiteSpace: "nowrap", padding: "7px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: nhom === n ? NAVY : "#f1f5f9", color: nhom === n ? "#fff" : "#64748b", ...T }}>{n}</button>)}</div>
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>{f.length}/{tcvnData.length} tiêu chuẩn</div>
      {f.map(d => { const o = ex === d.ma; const nc = nhomColor[d.nhom] || NAVY; return <div key={d.ma} style={{ background: "#fff", borderRadius: 16, marginBottom: 10, border: "2px solid " + (o ? NAVY : "#e2e8f0"), overflow: "hidden" }}>
        <button onClick={() => sEx(o ? null : d.ma)} style={{ width: "100%", padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12, background: o ? "#eff6ff" : "#fff", border: "none", cursor: "pointer", textAlign: "left", ...T }}>
          <div style={{ flexShrink: 0, background: nc, borderRadius: 10, padding: "5px 8px", textAlign: "center", minWidth: 72 }}><div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>{d.nhom}</div><div style={{ fontSize: 11, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{d.ma.replace("TCVN ", "").replace("QCVN ", "QC")}</div></div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 700, color: NAVY, lineHeight: 1.35, marginBottom: 3 }}>{d.ten}</div><div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>{d.tomtat}</div></div>
          <span style={{ transform: o ? "rotate(90deg)" : "none", transition: "0.2s", color: NAVY, flexShrink: 0 }}><Ic n="chev" s={18} /></span>
        </button>
        {o && <div style={{ borderTop: "1px solid #e2e8f0", padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8 }}>NỘI DUNG CHÍNH:</div>
          {d.noidung.map((nd, i) => <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}><span style={{ width: 22, height: 22, borderRadius: 99, background: nc, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span><span style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6 }}>{nd}</span></div>)}
        </div>}
      </div>; })}
      {f.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}><div style={{ fontSize: 36 }}>🔍</div><div style={{ marginTop: 8 }}>Không tìm thấy</div></div>}
    </>}
    {mode === "pl" && <>
      <div style={{ position: "relative", marginBottom: 12 }}><div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}><Ic n="search" s={18} c="#94a3b8" /></div><input value={qPL} onChange={e => sQPL(e.target.value)} placeholder="Tìm điều luật, từ khóa..." style={{ width: "100%", padding: "13px 40px 13px 42px", borderRadius: 14, border: "2px solid " + (qPL ? NAVY : "#e2e8f0"), fontSize: 14, outline: "none", boxSizing: "border-box", ...T }} />{qPL && <button onClick={() => sQPL("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "#f1f5f9", border: "none", borderRadius: 99, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="x" s={13} c="#64748b" /></button>}</div>
      {!qPL && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>{["nghiệm thu", "hoàn công", "bảo hành", "giám sát", "sự cố"].map(t => <button key={t} onClick={() => sQPL(t)} style={{ padding: "7px 14px", borderRadius: 99, background: "#eff6ff", border: "1.5px solid #bfdbfe", fontSize: 12, color: NAVY, fontWeight: 600, cursor: "pointer", ...T }}>{t}</button>)}</div>}
      {fPL.map(d => { const o = exPL === d.d; return <div key={d.d} style={{ background: "#fff", borderRadius: 16, marginBottom: 10, border: "2px solid " + (o ? NAVY : "#e2e8f0"), overflow: "hidden" }}>
        <button onClick={() => sExPL(o ? null : d.d)} style={{ width: "100%", padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12, background: o ? "#eff6ff" : "#fff", border: "none", cursor: "pointer", textAlign: "left", ...T }}>
          <div style={{ flexShrink: 0, background: NAVY, borderRadius: 10, padding: "5px 10px", textAlign: "center", minWidth: 50 }}><div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)" }}>NĐ06</div><div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{d.d}</div></div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 700, color: NAVY, lineHeight: 1.35, marginBottom: 4 }}>{d.td}</div><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{d.tags.map(t => <span key={t} style={{ fontSize: 10.5, background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: 99 }}>{t}</span>)}</div></div>
          <span style={{ transform: o ? "rotate(90deg)" : "none", transition: "0.2s", color: NAVY }}><Ic n="chev" s={18} /></span>
        </button>
        {!o && <div style={{ padding: "0 16px 12px" }}>{d.tt.slice(0, 2).map((l, i) => <div key={i} style={{ fontSize: 12, color: "#475569", lineHeight: 1.5, marginBottom: 4 }}>• {l}</div>)}</div>}
        {o && <div style={{ borderTop: "1px solid #e2e8f0" }}><div style={{ padding: "14px 16px" }}>{d.tt.map((l, i) => <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}><span style={{ width: 22, height: 22, borderRadius: 99, background: NAVY, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span><span style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6 }}>{l}</span></div>)}</div><div style={{ background: "#fffbeb", borderTop: "1px solid #fde68a", padding: "10px 16px" }}><div style={{ fontSize: 12.5, color: "#78350f" }}>⚠️ {d.ly}</div></div></div>}
      </div>; })}
    </>}
  </div>;
}

// ── NHẬT KÝ ──────────────────────────────────────────────────────────────────
function NKScreen({ loiList, sLL, nkList, sNKL }) {
  const [mode, sM] = useState("loi");
  const [fil, sFil] = useState("Tất cả");
  const [sf, sSF] = useState(false);
  const [form, sForm] = useState({ vt: "", mt: "", md: "Trung bình", tt: "Mới", thauphu: "", deadline: "" });
  const [ph, sPh] = useState([]);
  const [vp, sVP] = useState(null);
  const [closingLoi, setClosingLoi] = useState(null);
  const [closureForm, setClosureForm] = useState({ note: "", photos: [] });
  const today2 = new Date().toISOString().slice(0, 10);
  const overdueLoiCount = loiList.filter(l => l.deadline && l.deadline < today2 && l.tt !== "Đã xong").length;
  const shown = fil === "Tất cả" ? loiList
    : fil === "Quá hạn" ? loiList.filter(l => l.deadline && l.deadline < today2 && l.tt !== "Đã xong")
    : loiList.filter(l => l.tt === fil);
  const hPh = e => { Array.from(e.target.files).forEach(f => { const r = new FileReader(); r.onload = ev => sPh(p => [...p, ev.target.result]); r.readAsDataURL(f); }); e.target.value = ""; };
  const addL = () => {
    if (!form.vt || !form.mt) return;
    sLL(p => [{ ...form, id: Date.now(), ng: new Date().toISOString().slice(0, 10), ph: [...ph] }, ...p]);
    sForm({ vt: "", mt: "", md: "Trung bình", tt: "Mới", thauphu: "", deadline: "" }); sPh([]); sSF(false);
  };
  const mMD = { "Cao": "#ef4444", "Trung bình": "#f59e0b", "Thấp": "#22c55e" };
  const mTT = { "Mới": { bg: "#fef2f2", c: "#ef4444" }, "Đang xử lý": { bg: "#fffbeb", c: "#d97706" }, "Đã xong": { bg: "#f0fdf4", c: "#16a34a" } };

  // ── Nhật ký TC ──
  const [snk, sSNK] = useState(false);
  const [enk, sENK] = useState(null);
  const [nf, sNF] = useState({ ng: new Date().toISOString().slice(0, 10), tt: "Nắng", nd: "", nl: "", tb: "", cv: "", kl: "", sk: "", gc: "" });

  const svNK = v => {
    const n = typeof v === "function" ? v(nkList) : v;
    try { localStorage.setItem("qcm_nk", JSON.stringify(n)); } catch (e) { }
    sNKL(n);
  };

  const addNK = () => {
    if (!nf.cv) return;
    svNK(p => [{ ...nf, id: Date.now(), nl: parseInt(nf.nl) || 0 }, ...p]);
    sNF({ ng: new Date().toISOString().slice(0, 10), tt: "Nắng", nd: "", nl: "", tb: "", cv: "", kl: "", sk: "", gc: "" });
    sSNK(false);
  };

  const ttIc = { "Nắng": "☀️", "Mây": "⛅", "Mưa nhẹ": "🌦️", "Mưa to": "🌧️", "Giông": "⛈️" };

  return <div style={{ padding: "0 16px 16px" }}>
    <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 12, padding: 4, marginBottom: 16, gap: 4 }}>
      {[["loi", "📋 Quản lý lỗi"], ["tc", "📓 Nhật ký TC"]].map(([m, l]) => <button key={m} onClick={() => sM(m)} style={{ flex: 1, padding: "10px 8px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, background: mode === m ? "#fff" : "transparent", color: mode === m ? NAVY : "#64748b", boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none", ...T }}>{l}</button>)}
    </div>

    {mode === "loi" && <>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto" }}>
        {["Tất cả", "Mới", "Đang xử lý", "Đã xong", "Quá hạn"].map(f => (
          <button key={f} onClick={() => sFil(f)} style={{ whiteSpace: "nowrap", padding: "9px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", background: fil === f ? (f === "Quá hạn" ? "#ef4444" : NAVY) : "#f1f5f9", color: fil === f ? "#fff" : f === "Quá hạn" ? "#ef4444" : "#64748b", ...T }}>
            {f}{f === "Quá hạn" && overdueLoiCount > 0 ? ` (${overdueLoiCount})` : ""}
          </button>
        ))}
      </div>
      <button onClick={() => sSF(!sf)} style={{ width: "100%", padding: "13px", borderRadius: 12, background: sf ? "#f1f5f9" : NAVY, color: sf ? NAVY : "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14, ...T }}><Ic n="plus" s={18} c={sf ? NAVY : "#fff"} />{sf ? "Đóng" : "Ghi lỗi mới"}</button>
      {sf && <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 14, border: "1.5px solid #e2e8f0" }}>
        {[["Vị trí", "vt", "Cột C3-T2"], ["Mô tả", "mt", "Chi tiết..."]].map(([l, k, p]) => <div key={k} style={{ marginBottom: 10 }}><div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{l}</div>{k === "mt" ? <textarea value={form[k]} onChange={e => sForm(prev => ({ ...prev, [k]: e.target.value }))} placeholder={p} rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" }} /> : <input value={form[k]} onChange={e => sForm(prev => ({ ...prev, [k]: e.target.value }))} placeholder={p} style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", ...T }} />}</div>)}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>{[["Mức độ", "md", ["Cao", "Trung bình", "Thấp"]], ["Trạng thái", "tt", ["Mới", "Đang xử lý", "Đã xong"]]].map(([l, k, o]) => <div key={k}><div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{l}</div><select value={form[k]} onChange={e => sForm(prev => ({ ...prev, [k]: e.target.value }))} style={{ width: "100%", padding: 11, borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", background: "#fff", ...T }}>{o.map(v => <option key={v}>{v}</option>)}</select></div>)}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div><div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>👷 Thầu phụ</div><input value={form.thauphu} onChange={e => sForm(p => ({ ...p, thauphu: e.target.value }))} placeholder="Tên thầu phụ" style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", ...T }} /></div>
          <div><div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>📅 Hạn sửa</div><input type="date" value={form.deadline} onChange={e => sForm(p => ({ ...p, deadline: e.target.value }))} style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", ...T }} /></div>
        </div>
        <div style={{ marginBottom: 12 }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>📸 Ảnh</div><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{ph.map((p, i) => <div key={i} style={{ position: "relative", width: 60, height: 60, borderRadius: 10, overflow: "hidden", border: "2px solid #e2e8f0" }}><img src={p} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /><button onClick={() => sPh(ps => ps.filter((_, j) => j !== i))} style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: 99, background: "#ef4444", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="x" s={9} c="#fff" /></button></div>)}<label style={{ width: 60, height: 60, borderRadius: 10, border: "2px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#f8fafc", flexDirection: "column" }}><Ic n="cam" s={18} c="#94a3b8" /><span style={{ fontSize: 8, color: "#94a3b8" }}>Thêm</span><input type="file" accept="image/*" capture="environment" multiple onChange={hPh} style={{ display: "none" }} /></label></div></div>
        <button onClick={addL} style={{ width: "100%", padding: 13, background: NAVY, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", ...T }}>Lưu lỗi</button>
      </div>}
      {shown.map(loi => <div key={loi.id} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 10, border: "1.5px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><div style={{ fontSize: 13.5, fontWeight: 700, color: NAVY, flex: 1 }}>{loi.vt}</div><div style={{ display: "flex", gap: 8 }}><button onClick={() => { const o = ["Mới", "Đang xử lý", "Đã xong"]; const next = o[(o.indexOf(loi.tt) + 1) % 3]; if (next === "Đã xong") { setClosingLoi(loi); setClosureForm({ note: "", photos: [] }); } else sLL(p => p.map(l => l.id === loi.id ? { ...l, tt: next } : l)); }} style={{ width: 42, height: 42, borderRadius: 9, background: "#eff6ff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="edit" s={15} c={NAVY} /></button><button onClick={() => sLL(p => p.filter(l => l.id !== loi.id))} style={{ width: 42, height: 42, borderRadius: 9, background: "#fef2f2", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="trash" s={15} c="#ef4444" /></button></div></div>
        <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, marginBottom: 8 }}>{loi.mt}</div>
        {loi.ph && loi.ph.length > 0 && <div style={{ display: "flex", gap: 6, marginBottom: 8, overflowX: "auto" }}>{loi.ph.map((p, i) => <img key={i} src={p} onClick={() => sVP(p)} style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover", cursor: "pointer", border: "1.5px solid #e2e8f0" }} alt="" />)}</div>}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: mMD[loi.md], background: mMD[loi.md] + "18", padding: "4px 12px", borderRadius: 99 }}>⚠ {loi.md}</span>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: mTT[loi.tt].c, background: mTT[loi.tt].bg, padding: "4px 12px", borderRadius: 99 }}>{loi.tt}</span>
          {loi.thauphu && <span style={{ fontSize: 11, background: "#eff6ff", color: NAVY, padding: "4px 10px", borderRadius: 99 }}>👷 {loi.thauphu}</span>}
          {loi.deadline && <span style={{ fontSize: 11, fontWeight: 600, background: loi.deadline < today2 && loi.tt !== "Đã xong" ? "#fef2f2" : "#f1f5f9", color: loi.deadline < today2 && loi.tt !== "Đã xong" ? "#dc2626" : "#64748b", padding: "4px 10px", borderRadius: 99 }}>📅 {loi.deadline < today2 && loi.tt !== "Đã xong" ? "QH " : ""}{loi.deadline}</span>}
          {loi.closureNote && <span style={{ fontSize: 11, background: "#f0fdf4", color: "#16a34a", padding: "4px 10px", borderRadius: 99 }}>✓ Đã đóng</span>}
          <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>{loi.ng}</span>
        </div>
      </div>)}
      {vp && <div onClick={() => sVP(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}><img src={vp} style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: 12 }} alt="" /></div>}
      {closingLoi && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 400, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setClosingLoi(null)}>
        <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "22px 22px 0 0", width: "100%", maxWidth: 480, padding: 20, paddingBottom: 32 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 4 }}>✅ Xác nhận đóng lỗi</div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>📍 {closingLoi.vt} — {closingLoi.mt}</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Ghi chú biện pháp xử lý *</div>
            <textarea value={closureForm.note} onChange={e => setClosureForm(f => ({ ...f, note: e.target.value }))} placeholder="Mô tả cách đã xử lý lỗi..." rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>📸 Ảnh bằng chứng (tùy chọn)</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {closureForm.photos.map((p, i) => <div key={i} style={{ position: "relative", width: 60, height: 60, borderRadius: 10, overflow: "hidden", border: "2px solid #e2e8f0" }}><img src={p} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /><button onClick={() => setClosureForm(f => ({ ...f, photos: f.photos.filter((_, j) => j !== i) }))} style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: 99, background: "#ef4444", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="x" s={9} c="#fff" /></button></div>)}
              <label style={{ width: 60, height: 60, borderRadius: 10, border: "2px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#f8fafc", flexDirection: "column" }}><Ic n="cam" s={18} c="#94a3b8" /><span style={{ fontSize: 8, color: "#94a3b8" }}>Thêm</span><input type="file" accept="image/*" capture="environment" multiple onChange={async e => { const imgs = (await Promise.all([...e.target.files].map(compressImage))).filter(Boolean); setClosureForm(f => ({ ...f, photos: [...f.photos, ...imgs] })); e.target.value = ""; }} style={{ display: "none" }} /></label>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setClosingLoi(null)} style={{ flex: 1, padding: 13, background: "#f1f5f9", color: "#374151", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", ...T }}>Hủy</button>
            <button disabled={!closureForm.note.trim()} onClick={() => { sLL(p => p.map(l => l.id === closingLoi.id ? { ...l, tt: "Đã xong", closureNote: closureForm.note, closurePhotos: closureForm.photos, closedAt: new Date().toISOString() } : l)); setClosingLoi(null); setClosureForm({ note: "", photos: [] }); }} style={{ flex: 2, padding: 13, background: closureForm.note.trim() ? "#16a34a" : "#e2e8f0", color: closureForm.note.trim() ? "#fff" : "#94a3b8", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: closureForm.note.trim() ? "pointer" : "not-allowed", ...T }}>Xác nhận đóng lỗi</button>
          </div>
        </div>
      </div>}
    </>}

    {mode === "tc" && <>
      <button onClick={() => sSNK(!snk)} style={{ width: "100%", padding: 13, borderRadius: 12, background: snk ? "#f1f5f9" : NAVY, color: snk ? NAVY : "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14, ...T }}><Ic n="plus" s={18} c={snk ? NAVY : "#fff"} />{snk ? "Đóng" : "Ghi nhật ký hôm nay"}</button>
      {snk && <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 14, border: "1.5px solid #e2e8f0" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 12 }}>📓 Nhật ký thi công</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          <div><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Ngày</div><input type="date" value={nf.ng} onChange={e => sNF(p => ({ ...p, ng: e.target.value }))} style={{ width: "100%", padding: "9px 10px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", ...T }} /></div>
          <div><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Thời tiết</div><select value={nf.tt} onChange={e => sNF(p => ({ ...p, tt: e.target.value }))} style={{ width: "100%", padding: "9px 10px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", background: "#fff", ...T }}>{["Nắng", "Mây", "Mưa nhẹ", "Mưa to", "Giông"].map(v => <option key={v}>{v}</option>)}</select></div>
          <div><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Nhiệt độ °C</div><input type="number" value={nf.nd} onChange={e => sNF(p => ({ ...p, nd: e.target.value }))} placeholder="32" style={{ width: "100%", padding: "9px 10px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", ...T }} /></div>
          <div><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Nhân lực</div><input type="number" value={nf.nl} onChange={e => sNF(p => ({ ...p, nl: e.target.value }))} placeholder="25" style={{ width: "100%", padding: "9px 10px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", ...T }} /></div>
        </div>
        {[["Thiết bị", "tb", "Cẩu tháp, xe bơm BT..."], ["Công việc", "cv", "Đổ BT sàn T3..."], ["Khối lượng", "kl", "85 m3 BT mác 300"], ["Sự kiện / NT", "sk", "Lấy mẫu, NT..."], ["Ghi chú", "gc", ""]].map(([l, k, p]) => <div key={k} style={{ marginBottom: 10 }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{l}</div><textarea value={nf[k]} onChange={e => sNF(prev => ({ ...prev, [k]: e.target.value }))} placeholder={p} rows={2} style={{ width: "100%", padding: "9px 10px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" }} /></div>)}
        <button onClick={addNK} style={{ width: "100%", padding: 13, background: NAVY, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", ...T }}>Lưu nhật ký</button>
      </div>}
      {nkList.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Chưa có nhật ký nào</div>}
      {nkList.map(nk => { const o = enk === nk.id; return <div key={nk.id} style={{ background: "#fff", borderRadius: 14, marginBottom: 10, border: "1.5px solid " + (o ? NAVY : "#e2e8f0"), overflow: "hidden" }}>
        <button onClick={() => sENK(o ? null : nk.id)} style={{ width: "100%", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, background: o ? "#eff6ff" : "#fff", border: "none", cursor: "pointer", textAlign: "left", ...T }}>
          <div style={{ textAlign: "center", flexShrink: 0 }}><div style={{ fontSize: 20, fontWeight: 800, color: NAVY }}>{nk.ng.slice(8)}</div><div style={{ fontSize: 10, color: "#64748b" }}>T{nk.ng.slice(5, 7)}</div></div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", lineHeight: 1.35 }}>{nk.cv}</div><div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}><span style={{ fontSize: 11, background: "#eff6ff", color: NAVY, padding: "2px 8px", borderRadius: 99 }}>{ttIc[nk.tt] || "🌤️"} {nk.tt}{nk.nd ? " " + nk.nd + "°C" : ""}</span>{nk.nl > 0 && <span style={{ fontSize: 11, background: "#f0fdf4", color: "#16a34a", padding: "2px 8px", borderRadius: 99 }}>👷 {nk.nl}</span>}</div></div>
          <span style={{ transform: o ? "rotate(90deg)" : "none", transition: "0.2s", color: NAVY }}><Ic n="chev" s={16} /></span>
        </button>
        {o && <div style={{ borderTop: "1px solid #e2e8f0", padding: "14px 16px" }}>
          {[["🏗️ Công việc", nk.cv], ["📦 Khối lượng", nk.kl], ["🔧 Thiết bị", nk.tb], ["📋 Sự kiện", nk.sk], ["💬 Ghi chú", nk.gc]].filter(([, v]) => v).map(([l, v]) => <div key={l} style={{ marginBottom: 8 }}><div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 2 }}>{l}</div><div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.5 }}>{v}</div></div>)}
          <button onClick={() => { svNK(p => p.filter(n => n.id !== nk.id)); sENK(null); }} style={{ marginTop: 8, padding: "8px 16px", borderRadius: 8, background: "#fef2f2", border: "none", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer", ...T }}>🗑 Xóa</button>
        </div>}
      </div>; })}
    </>}
  </div>;
}

// ── THÍ NGHIỆM ──────────────────────────────────────────────────────────────
function TNScreen({ samp, setSamp }) {
  const [mode, sM] = useState("calc");
  const [sel, sSel] = useState("betong");
  const [iv, sIV] = useState("");
  const [sas, sSAS] = useState(false);
  const [sf, sSF] = useState({ m: "Bê tông", lo: "", ng: new Date().toISOString().slice(0, 10) });

  const svS = v => {
    const n = typeof v === "function" ? v(samp) : v;
    try { localStorage.setItem("qcm_sp", JSON.stringify(n)); } catch (e) { }
    setSamp(n);
  };

  const addS = () => {
    if (!sf.lo) return;
    const d = sf.ng;
    const d7 = new Date(new Date(d).getTime() + 7 * 864e5).toISOString().slice(0, 10);
    const d28 = new Date(new Date(d).getTime() + 28 * 864e5).toISOString().slice(0, 10);
    svS(p => [{ id: Date.now(), ...sf, d7, d28, ok7: false, ok28: false }, ...p]);
    sSF({ m: "Bê tông", lo: "", ng: new Date().toISOString().slice(0, 10) });
    sSAS(false);
  };

  const tgD = (id, f) => svS(p => p.map(s => s.id === id ? { ...s, [f]: !s[f] } : s));
  const today = new Date().toISOString().slice(0, 10);
  const gSt = (d, dn) => {
    if (dn) return { l: "Đã thử ✓", c: "#16a34a", bg: "#f0fdf4" };
    const df = Math.ceil((new Date(d) - new Date(today)) / 864e5);
    if (df < 0) return { l: "Quá hạn " + (-df) + "ng!", c: "#dc2626", bg: "#fef2f2" };
    if (df === 0) return { l: "HÔM NAY!", c: "#ea580c", bg: "#fff7ed" };
    if (df <= 3) return { l: "Còn " + df + "ng", c: "#d97706", bg: "#fffbeb" };
    return { l: "Còn " + df + "ng", c: "#64748b", bg: "#f8fafc" };
  };
  const rule = sampR[sel];
  const result = iv ? rule.calc(iv) : null;

  return <div style={{ padding: "0 16px 16px" }}>
    <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 12, padding: 4, marginBottom: 16, gap: 4 }}>{[["calc", "🧮 Máy tính"], ["remind", "🔔 Nhắc nhở"]].map(([m, l]) => <button key={m} onClick={() => sM(m)} style={{ flex: 1, padding: "10px 6px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, background: mode === m ? "#fff" : "transparent", color: mode === m ? NAVY : "#64748b", boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none", ...T }}>{l}</button>)}</div>
    {mode === "calc" && <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>{Object.entries(sampR).map(([k, r]) => <button key={k} onClick={() => { sSel(k); sIV(""); }} style={{ padding: "12px 10px", borderRadius: 12, border: "2px solid " + (sel === k ? r.co : "#e2e8f0"), background: sel === k ? r.co + "12" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, textAlign: "left", ...T }}><div style={{ fontSize: 18 }}>{r.e}</div><div style={{ fontSize: 11, fontWeight: sel === k ? 700 : 500, color: sel === k ? r.co : "#374151", lineHeight: 1.3 }}>{r.l}</div></button>)}</div>
      <div style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, border: "2px solid " + rule.co + "22" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: rule.co, marginBottom: 8 }}>{rule.e} {rule.l} — {rule.tc}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="number" min="0" value={iv} onChange={e => sIV(e.target.value)} placeholder={rule.u + "..."} style={{ flex: 1, padding: "12px 14px", borderRadius: 10, border: "1.5px solid " + (iv ? rule.co : "#e2e8f0"), fontSize: 16, fontWeight: 600, outline: "none", ...T }} /><div style={{ fontSize: 14, fontWeight: 700, color: "#64748b" }}>{rule.u}</div></div>
      </div>
      {result ? <div style={{ background: "#fff", borderRadius: 16, border: "2px solid " + rule.co, overflow: "hidden" }}>
        <div style={{ background: rule.co, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(255,255,255,0.2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{result.t}</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>TỔ</div></div><div><div style={{ color: "#fff", fontSize: 15, fontWeight: 800 }}>Cần {result.t} tổ mẫu</div></div></div>
        <div style={{ padding: "12px 16px" }}>{result.rows.map((r, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: i < result.rows.length - 1 ? "1px solid #f1f5f9" : "none" }}><span style={{ fontSize: 12, color: "#64748b" }}>{r[0]}</span><span style={{ fontSize: 12.5, fontWeight: r[2] ? 700 : 600, color: r[2] ? rule.co : "#1e293b" }}>{r[1]}</span></div>)}{result.note && <div style={{ marginTop: 10, background: "#fffbeb", borderRadius: 10, padding: "10px 12px", borderLeft: "3px solid #f59e0b" }}><div style={{ fontSize: 11.5, color: "#92400e" }}>⚠️ {result.note}</div></div>}</div>
      </div> : <div style={{ background: "#fff", borderRadius: 14, padding: "28px 16px", textAlign: "center", border: "1.5px dashed #cbd5e1" }}><div style={{ fontSize: 36, marginBottom: 8 }}>🧮</div><div style={{ fontSize: 14, fontWeight: 600, color: "#64748b" }}>Nhập khối lượng để tính</div></div>}
    </>}
    {mode === "remind" && <>
      <button onClick={() => sSAS(!sas)} style={{ width: "100%", padding: 13, borderRadius: 12, background: sas ? "#f1f5f9" : NAVY, color: sas ? NAVY : "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14, ...T }}><Ic n="plus" s={18} c={sas ? NAVY : "#fff"} />{sas ? "Đóng" : "Thêm mẫu"}</button>
      {sas && <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 14, border: "1.5px solid #e2e8f0" }}>
        {[["Vật liệu", "m", null, ["Bê tông", "Cốt thép", "Vữa", "Xi măng"]], ["Vị trí", "lo", "Sàn T3"], ["Ngày lấy", "ng"]].map(([l, k, ph, opts]) => <div key={k} style={{ marginBottom: 10 }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{l}</div>{opts ? <select value={sf[k]} onChange={e => sSF(p => ({ ...p, [k]: e.target.value }))} style={{ width: "100%", padding: 11, borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", ...T }}>{opts.map(v => <option key={v}>{v}</option>)}</select> : <input type={k === "ng" ? "date" : "text"} value={sf[k]} onChange={e => sSF(p => ({ ...p, [k]: e.target.value }))} placeholder={ph || ""} style={{ width: "100%", padding: 11, borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", ...T }} />}</div>)}
        <button onClick={addS} style={{ width: "100%", padding: 13, background: NAVY, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", ...T }}>Lưu</button>
      </div>}
      {samp.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}><div style={{ fontSize: 36 }}>🔔</div><div style={{ marginTop: 8 }}>Chưa có mẫu nào</div></div>}
      {samp.map(s => { const s7 = gSt(s.d7, s.ok7), s28 = gSt(s.d28, s.ok28); return <div key={s.id} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 10, border: "1.5px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><div><div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{s.m}</div><div style={{ fontSize: 12, color: "#64748b" }}>{s.lo} — {s.ng}</div></div><button onClick={() => svS(p => p.filter(x => x.id !== s.id))} style={{ width: 32, height: 32, borderRadius: 8, background: "#fef2f2", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="trash" s={13} c="#ef4444" /></button></div>
        {[["7ng", s.d7, s.ok7, "ok7", s7], ["28ng", s.d28, s.ok28, "ok28", s28]].map(([l, d, dn, f, st]) => <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 10, background: st.bg, marginBottom: 4 }}><div><div style={{ fontSize: 12, fontWeight: 700, color: st.c }}>Thử {l} — {d}</div><div style={{ fontSize: 11, color: st.c }}>{st.l}</div></div><button onClick={() => tgD(s.id, f)} style={{ width: 36, height: 36, borderRadius: 8, background: dn ? "#22c55e" : "#fff", border: "2px solid " + (dn ? "#22c55e" : "#e2e8f0"), cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="check" s={16} c={dn ? "#fff" : "#94a3b8"} /></button></div>)}
      </div>; })}
    </>}
  </div>;
}

// ── SAI SỐ ───────────────────────────────────────────────────────────────────
function SSScreen() {
  const [q, sQ] = useState(""); const [on, sON] = useState("Cột");
  const nr = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const nhoms = [...new Set(ssData.map(d => d.g))];
  const f = q ? ssData.filter(d => nr(d.l).includes(nr(q)) || nr(d.g).includes(nr(q))) : ssData;
  const gn = q ? nhoms.filter(n => f.some(d => d.g === n)) : nhoms;
  return <div style={{ padding: "0 16px 16px" }}>
    <div style={{ position: "relative", marginBottom: 14 }}><div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}><Ic n="search" s={18} c="#94a3b8" /></div><input value={q} onChange={e => sQ(e.target.value)} placeholder="Tìm: cột, lớp bảo vệ..." style={{ width: "100%", padding: "13px 42px", borderRadius: 14, border: "2px solid " + (q ? NAVY : "#e2e8f0"), fontSize: 14, outline: "none", boxSizing: "border-box", ...T }} /></div>
    {gn.map(n => { const items = f.filter(d => d.g === n); const io = q || on === n; return <div key={n} style={{ background: "#fff", borderRadius: 14, marginBottom: 10, overflow: "hidden", border: "1.5px solid #e2e8f0" }}>
      <button onClick={() => sON(on === n ? null : n)} style={{ width: "100%", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: io ? "#eff6ff" : "#fff", border: "none", cursor: "pointer", ...T }}><span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{n} ({items.length})</span><span style={{ transform: io ? "rotate(90deg)" : "none", transition: "0.2s", color: NAVY }}><Ic n="chev" s={16} /></span></button>
      {io && <div style={{ borderTop: "1px solid #e2e8f0" }}>{items.map((d, i) => <div key={i} style={{ padding: "10px 16px", borderBottom: i < items.length - 1 ? "1px solid #f1f5f9" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}><div style={{ flex: 1, fontSize: 13, color: "#1e293b" }}>{d.l}</div><div style={{ background: "#eff6ff", borderRadius: 8, padding: "5px 12px", flexShrink: 0 }}><span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{d.s}</span></div></div>)}</div>}
    </div>; })}
  </div>;
}

// ── WEEKLY REPORT ─────────────────────────────────────────────────────────────
function getWeekRange(offset = 0) {
  const now = new Date();
  const day = now.getDay() || 7;
  const mon = new Date(now); mon.setDate(now.getDate() - day + 1 + offset * 7);
  const fri = new Date(mon); fri.setDate(mon.getDate() + 4);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  const fmt = d => d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const fmtS = d => d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  const weekNum = Math.ceil((((mon - new Date(mon.getFullYear(), 0, 1)) / 864e5) + 1) / 7);
  return { mon, fri, sun, fmt, fmtS, weekNum, label: `Tuần ${weekNum} (${fmtS(mon)} – ${fmt(fri)})` };
}

const initSettings = () => { try { const s = localStorage.getItem("qcm_settings"); if (s) return JSON.parse(s); } catch {} return { congtrinh: "", diachi: "", chudt: "", tvgs: "", ksphutrach: "", email: "" }; };
const saveSettings = v => { try { localStorage.setItem("qcm_settings", JSON.stringify(v)); } catch {} };

function WeeklyReportScreen({ loiList, nkList, samp, sessions = [] }) {
  const [settings, setSettings] = useState(initSettings);
  const [weekOffset, sWO] = useState(0);
  const [keHoach, sKH] = useState("");
  const [activeTab, sAT] = useState("report");
  const svS = v => { saveSettings(v); setSettings(v); };
  const wk = getWeekRange(weekOffset);
  const inWeek = ng => { const d = new Date(ng); return d >= wk.mon && d <= wk.sun; };
  const nkTuan = nkList.filter(n => inWeek(n.ng)).sort((a, b) => a.ng.localeCompare(b.ng));
  const loiMoi = loiList.filter(l => inWeek(l.ng));
  const loiTon = loiList.filter(l => l.tt !== "Đã xong");
  const loiDong = loiList.filter(l => l.tt === "Đã xong" && inWeek(l.ng));
  const today = new Date().toISOString().slice(0, 10);
  const sampTuan = samp.filter(s => inWeek(s.ng || ""));
  const samp7 = samp.filter(s => s.d7 >= wk.mon.toISOString().slice(0, 10) && s.d7 <= wk.sun.toISOString().slice(0, 10));
  const samp28 = samp.filter(s => s.d28 >= wk.mon.toISOString().slice(0, 10) && s.d28 <= wk.sun.toISOString().slice(0, 10));
  const sampQH = samp.filter(s => (!s.ok7 && s.d7 < today) || (!s.ok28 && s.d28 < today));
  const ttI = { "Nắng": "☀️", "Mây": "⛅", "Mưa nhẹ": "🌦️", "Mưa to": "🌧️", "Giông": "⛈️" };
  const mMD = { "Cao": "#ef4444", "Trung bình": "#f59e0b", "Thấp": "#22c55e" };
  const mTT = { "Mới": { c: "#ef4444" }, "Đang xử lý": { c: "#d97706" }, "Đã xong": { c: "#16a34a" } };
  const th = "background:#1e3a8a;color:#fff;padding:6px 8px;border:1px solid #1e3a8a;font-size:9.5pt;";

  const exportWeekPDF = () => {
    const nkR = nkTuan.length > 0 ? nkTuan.map(n => `<tr><td style="border:1px solid #ddd;padding:5px;text-align:center;">${n.ng}</td><td style="border:1px solid #ddd;padding:5px;text-align:center;">${ttI[n.tt] || "🌤️"} ${n.tt}${n.nd ? " " + n.nd + "°C" : ""}</td><td style="border:1px solid #ddd;padding:5px;text-align:center;">${n.nl || 0}</td><td style="border:1px solid #ddd;padding:5px;">${n.cv || ""}</td><td style="border:1px solid #ddd;padding:5px;">${n.kl || ""}</td><td style="border:1px solid #ddd;padding:5px;">${n.sk || ""}</td></tr>`).join("") : `<tr><td colspan="6" style="border:1px solid #ddd;padding:8px;text-align:center;color:#999;">Chưa có dữ liệu</td></tr>`;
    const loiR = loiTon.length > 0 ? loiTon.map((l, i) => `<tr><td style="border:1px solid #ddd;padding:5px;text-align:center;">${i + 1}</td><td style="border:1px solid #ddd;padding:5px;">${l.vt || ""}</td><td style="border:1px solid #ddd;padding:5px;">${l.mt || ""}</td><td style="border:1px solid #ddd;padding:5px;text-align:center;color:${mMD[l.md]};font-weight:bold;">${l.md}</td><td style="border:1px solid #ddd;padding:5px;text-align:center;">${l.ng || ""}</td><td style="border:1px solid #ddd;padding:5px;text-align:center;font-weight:bold;color:${mTT[l.tt]?.c || "#666"};">${l.tt}</td></tr>`).join("") : `<tr><td colspan="6" style="border:1px solid #ddd;padding:8px;text-align:center;color:#16a34a;font-weight:bold;">✅ Không có lỗi tồn đọng</td></tr>`;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Báo cáo tuần ${wk.weekNum}</title>
    <style>body{font-family:Arial,sans-serif;margin:15mm 12mm;font-size:10pt;}h1{color:#1e3a8a;font-size:15pt;margin:0 0 4px;}h2{color:#1e3a8a;font-size:11.5pt;margin:16px 0 8px;border-left:4px solid #1e3a8a;padding-left:8px;}table{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:9pt;}.info{display:grid;grid-template-columns:1fr 1fr;gap:4px 20px;background:#f0f4ff;padding:10px 14px;border-radius:6px;margin-bottom:12px;}.stat-row{display:flex;gap:10px;margin-bottom:12px;}.stat{flex:1;text-align:center;border-radius:8px;padding:10px 4px;}.num{font-size:20pt;font-weight:900;line-height:1;}.lbl{font-size:8.5pt;margin-top:2px;}.kh{background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;padding:10px 14px;white-space:pre-wrap;font-size:10pt;line-height:1.7;min-height:60px;}@page{size:A4;margin:10mm;}@media print{button{display:none;}}</style></head><body>
    <h1>📋 BÁO CÁO TUẦN — QUẢN LÝ CHẤT LƯỢNG</h1>
    <div style="color:#64748b;font-size:10pt;margin-bottom:10px;">${wk.label} &nbsp;|&nbsp; In ngày: ${new Date().toLocaleDateString("vi-VN")}</div>
    <div class="info"><div><strong>Công trình:</strong> ${settings.congtrinh || "——"}</div><div><strong>Địa điểm:</strong> ${settings.diachi || "——"}</div><div><strong>Chủ đầu tư:</strong> ${settings.chudt || "——"}</div><div><strong>TVGS:</strong> ${settings.tvgs || "——"}</div><div><strong>KS phụ trách QC:</strong> ${settings.ksphutrach || "——"}</div><div><strong>Email:</strong> ${settings.email || "——"}</div></div>
    <h2>1. NHẬT KÝ THI CÔNG (${nkTuan.length} ngày)</h2>
    <table><thead><tr><th style="${th}width:85px;">Ngày</th><th style="${th}width:100px;">Thời tiết</th><th style="${th}width:65px;">NL</th><th style="${th}">Công việc</th><th style="${th}width:95px;">KL</th><th style="${th}">Sự kiện/NT</th></tr></thead><tbody>${nkR}</tbody></table>
    <h2>2. QUẢN LÝ LỖI CHẤT LƯỢNG</h2>
    <div class="stat-row"><div class="stat" style="background:#fef2f2;"><div class="num" style="color:#ef4444;">${loiMoi.length}</div><div class="lbl" style="color:#ef4444;">Phát sinh mới</div></div><div class="stat" style="background:#fffbeb;"><div class="num" style="color:#d97706;">${loiTon.length}</div><div class="lbl" style="color:#d97706;">Tồn đọng</div></div><div class="stat" style="background:#f0fdf4;"><div class="num" style="color:#16a34a;">${loiDong.length}</div><div class="lbl" style="color:#16a34a;">Đã đóng</div></div></div>
    <table><thead><tr><th style="${th}width:28px;">#</th><th style="${th}">Vị trí</th><th style="${th}">Mô tả lỗi</th><th style="${th}width:75px;">Mức độ</th><th style="${th}width:80px;">Ngày PS</th><th style="${th}width:95px;">Trạng thái</th></tr></thead><tbody>${loiR}</tbody></table>
    <h2>3. KẾT QUẢ THÍ NGHIỆM</h2>
    <div class="stat-row"><div class="stat" style="background:#eff6ff;"><div class="num" style="color:#1e3a8a;">${sampTuan.length}</div><div class="lbl" style="color:#1e3a8a;">Tổ mẫu lấy</div></div><div class="stat" style="background:#fffbeb;"><div class="num" style="color:#d97706;">${samp7.length}</div><div class="lbl" style="color:#d97706;">Cần thử 7ng</div></div><div class="stat" style="background:#f0fdf4;"><div class="num" style="color:#16a34a;">${samp28.length}</div><div class="lbl" style="color:#16a34a;">Cần thử 28ng</div></div></div>
    ${sampQH.length > 0 ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:8px 12px;color:#dc2626;font-weight:bold;">⚠️ CÓ ${sampQH.length} TỔ MẪU QUÁ HẠN THỬ — XỬ LÝ NGAY!</div>` : `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:8px 12px;color:#16a34a;">✅ Không có tổ mẫu quá hạn.</div>`}
    <h2>4. KẾ HOẠCH TUẦN TỚI</h2>
    <div class="kh">${keHoach || "(Chưa nhập kế hoạch tuần tới)"}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:36px;"><div style="text-align:center;"><div style="border-top:1px solid #000;margin-top:40px;padding-top:5px;font-size:9pt;">KS Quản lý CL<br><strong>${settings.ksphutrach || "——"}</strong></div></div><div style="text-align:center;"><div style="border-top:1px solid #000;margin-top:40px;padding-top:5px;font-size:9pt;">Tư vấn giám sát<br><strong>${settings.tvgs || "——"}</strong></div></div><div style="text-align:center;"><div style="border-top:1px solid #000;margin-top:40px;padding-top:5px;font-size:9pt;">Đại diện CĐT<br><strong>${settings.chudt || "——"}</strong></div></div></div>
    <script>window.onload=function(){window.print();}<\/script></body></html>`;
    const w = window.open("", "_blank"); if (w) { w.document.write(html); w.document.close(); }
  };

  const sendEmail = () => {
    if (!settings.email) { alert("Vui lòng nhập email trong tab Cài đặt!"); sAT("settings"); return; }
    const sub = encodeURIComponent(`[BC Tuần ${wk.weekNum}] ${settings.congtrinh || "QC Field Manager"}`);
    const body = encodeURIComponent(`BÁO CÁO TUẦN ${wk.weekNum} — QUẢN LÝ CHẤT LƯỢNG\n${wk.label}\n\nCÔNG TRÌNH: ${settings.congtrinh || "——"}\nKS PHỤ TRÁCH: ${settings.ksphutrach || "——"}\n\nTÓM TẮT:\n• Nhật ký TC: ${nkTuan.length} ngày\n• Lỗi mới: ${loiMoi.length} | Tồn: ${loiTon.length} | Đóng: ${loiDong.length}\n• Mẫu TN: ${sampTuan.length} tổ | 7ng: ${samp7.length} | 28ng: ${samp28.length}\n${sampQH.length > 0 ? "⚠️ " + sampQH.length + " tổ mẫu QUÁ HẠN!" : "✅ Không có mẫu quá hạn"}\n\nKẾ HOẠCH TUẦN TỚI:\n${keHoach || "(Chưa nhập)"}\n\n---\nQC Field Manager`);
    window.location.href = `mailto:${settings.email}?subject=${sub}&body=${body}`;
  };

  const isFri = new Date().getDay() === 5;

  return <div style={{ padding: "0 16px 16px" }}>
    <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 12, padding: 4, marginBottom: 16, gap: 4 }}>
      {[["report", "📊 Báo cáo"], ["analytics", "📈 Phân tích"], ["settings", "⚙️ Cài đặt"]].map(([m, l]) =>
        <button key={m} onClick={() => sAT(m)} style={{ flex: 1, padding: "10px 4px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: activeTab === m ? "#fff" : "transparent", color: activeTab === m ? NAVY : "#64748b", boxShadow: activeTab === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none", ...T }}>{l}</button>
      )}
    </div>
    {activeTab === "settings" && <div>
      <div style={{ background: "#eff6ff", borderRadius: 14, padding: "12px 16px", marginBottom: 16, borderLeft: "4px solid " + NAVY }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 2 }}>⚙️ Thông tin cố định dự án</div>
        <div style={{ fontSize: 12, color: "#475569" }}>Nhập 1 lần, tự động điền vào mọi báo cáo.</div>
      </div>
      {[["🏗️ Tên công trình / Dự án", "congtrinh", "VD: Chung cư ABC - Tòa A"], ["📍 Địa điểm", "diachi", "VD: Quận 7, TP.HCM"], ["🏢 Chủ đầu tư", "chudt", "VD: Công ty CP XYZ"], ["👁️ Tư vấn giám sát", "tvgs", "VD: Công ty TVGS ABC"], ["👷 KS phụ trách QC", "ksphutrach", "VD: Nguyễn Văn A"], ["📧 Email gửi báo cáo", "email", "VD: giamdoc@congty.vn"]].map(([label, key, ph]) =>
        <div key={key} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{label}</div>
          <input value={settings[key] || ""} onChange={e => svS({ ...settings, [key]: e.target.value })} placeholder={ph} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", ...T }} />
        </div>
      )}
      <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "10px 14px", borderLeft: "3px solid #22c55e", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#166534" }}>✅ Lưu tự động vào bộ nhớ thiết bị — không mất khi đóng app.</div>
      </div>
    </div>}
    {activeTab === "analytics" && (() => {
      const typeLabels = { ct: "Cốt thép", vk: "Ván khuôn", bt: "Bê tông", tm: "Chống thấm", ht_xay: "Xây", ht_trat: "Trát", ht_lat: "Lát gạch", ht_op: "Ốp gạch", ht_son: "Sơn", ht_tran: "Trần TC", ht_cua: "Cửa" };
      let totalItems = 0, passItems = 0;
      const typeStats = {};
      sessions.forEach(sess => {
        const items = getItemsByType(sess.type);
        if (!typeStats[sess.type]) typeStats[sess.type] = { total: 0, pass: 0 };
        items.forEach(it => {
          const r = sess.results?.[it.id];
          if (r === "d" || r === "k") { totalItems++; typeStats[sess.type].total++; if (r === "d") { passItems++; typeStats[sess.type].pass++; } }
        });
      });
      const passRate = totalItems > 0 ? Math.round(passItems / totalItems * 100) : null;
      const weekTrend = [-3, -2, -1, 0].map(offset => {
        const wk = getWeekRange(offset);
        const mon = wk.mon.toISOString().slice(0, 10);
        const sun = wk.sun.toISOString().slice(0, 10);
        return { label: "T" + wk.weekNum, count: loiList.filter(l => l.ng >= mon && l.ng <= sun).length };
      });
      const maxTrend = Math.max(...weekTrend.map(w => w.count), 1);
      const tpMap = {};
      loiList.forEach(l => {
        const tp = l.thauphu || "Chưa phân công";
        if (!tpMap[tp]) tpMap[tp] = { total: 0, open: 0, overdue: 0 };
        tpMap[tp].total++;
        if (l.tt !== "Đã xong") tpMap[tp].open++;
        if (l.deadline && l.deadline < today && l.tt !== "Đã xong") tpMap[tp].overdue++;
      });
      const tpEntries = Object.entries(tpMap).sort((a, b) => b[1].total - a[1].total);
      return <div>
        <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 14, border: "1.5px solid #e2e8f0" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 10 }}>📊 Tỷ lệ nghiệm thu đạt</div>
          {passRate !== null ? <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: passRate >= 80 ? "#16a34a" : passRate >= 60 ? "#d97706" : "#ef4444" }}>{passRate}%</div>
              <div style={{ flex: 1 }}><div style={{ background: "#f1f5f9", borderRadius: 99, height: 12, overflow: "hidden" }}><div style={{ background: passRate >= 80 ? "#22c55e" : passRate >= 60 ? "#f59e0b" : "#ef4444", width: passRate + "%", height: 12, borderRadius: 99 }} /></div><div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{passItems}/{totalItems} hạng mục đạt</div></div>
            </div>
            {Object.entries(typeStats).map(([type, s]) => { const pct = s.total > 0 ? Math.round(s.pass / s.total * 100) : 0; return <div key={type} style={{ marginBottom: 8 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}><span style={{ color: "#374151" }}>{typeLabels[type] || type}</span><span style={{ fontWeight: 700, color: pct >= 80 ? "#16a34a" : "#d97706" }}>{pct}%</span></div><div style={{ background: "#f1f5f9", borderRadius: 99, height: 6 }}><div style={{ background: pct >= 80 ? "#22c55e" : "#f59e0b", width: pct + "%", height: 6, borderRadius: 99 }} /></div></div>; })}
          </> : <div style={{ textAlign: "center", padding: 20, color: "#94a3b8" }}>Chưa có dữ liệu nghiệm thu. Hãy tạo và thực hiện checklist.</div>}
        </div>
        <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 14, border: "1.5px solid #e2e8f0" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 10 }}>📈 Xu hướng lỗi (4 tuần)</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90, paddingBottom: 4 }}>
            {weekTrend.map((w, i) => <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              {w.count > 0 && <div style={{ fontSize: 12, fontWeight: 700, color: "#ef4444" }}>{w.count}</div>}
              <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", flex: 1 }}>
                <div style={{ background: i === 3 ? "#ef4444" : "#fca5a5", borderRadius: "4px 4px 0 0", height: Math.max(4, (w.count / maxTrend) * 56) + "px" }} />
              </div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: i === 3 ? 700 : 400 }}>{w.label}</div>
            </div>)}
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 14, border: "1.5px solid #e2e8f0" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 10 }}>👷 Lỗi theo thầu phụ</div>
          {tpEntries.length === 0 ? <div style={{ textAlign: "center", padding: 16, color: "#94a3b8" }}>Chưa có dữ liệu. Gán thầu phụ khi tạo lỗi.</div> : <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 44px 44px 44px", gap: 6, padding: "0 0 8px", borderBottom: "1px solid #f1f5f9", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Thầu phụ</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: NAVY, textAlign: "center" }}>Tổng</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#d97706", textAlign: "center" }}>Mở</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", textAlign: "center" }}>QH</span>
            </div>
            {tpEntries.map(([tp, s]) => <div key={tp} style={{ display: "grid", gridTemplateColumns: "1fr 44px 44px 44px", gap: 6, padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: 12.5, color: "#1e293b", fontWeight: tp === "Chưa phân công" ? 400 : 600 }}>{tp}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: NAVY, textAlign: "center" }}>{s.total}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: s.open > 0 ? "#d97706" : "#22c55e", textAlign: "center" }}>{s.open}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: s.overdue > 0 ? "#ef4444" : "#94a3b8", textAlign: "center" }}>{s.overdue}</span>
            </div>)}
          </>}
        </div>
        <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", border: "1.5px solid #e2e8f0" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 8 }}>🧪 Tình trạng mẫu thí nghiệm</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[["Tổng mẫu", samp.length, "#eff6ff", NAVY], ["Chưa thử", samp.filter(s => !s.ok7 || !s.ok28).length, "#fffbeb", "#d97706"], ["Quá hạn", sampQH.length, "#fef2f2", "#ef4444"]].map(([l, v, bg, c]) =>
              <div key={l} style={{ background: bg, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{v}</div>
                <div style={{ fontSize: 10, color: c, marginTop: 2 }}>{l}</div>
              </div>
            )}
          </div>
        </div>
      </div>;
    })()}
    {activeTab === "report" && <>
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 14, border: "1.5px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <button onClick={() => sWO(p => p - 1)} style={{ width: 38, height: 38, borderRadius: 9, background: "#f1f5f9", border: "none", cursor: "pointer", fontSize: 20 }}>‹</button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{wk.label}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{weekOffset === 0 ? "Tuần hiện tại" : weekOffset === -1 ? "Tuần trước" : Math.abs(weekOffset) + " tuần trước"}</div>
          </div>
          <button onClick={() => sWO(p => Math.min(p + 1, 0))} disabled={weekOffset === 0} style={{ width: 38, height: 38, borderRadius: 9, background: weekOffset === 0 ? "#f8fafc" : "#f1f5f9", border: "none", cursor: weekOffset === 0 ? "not-allowed" : "pointer", fontSize: 20, opacity: weekOffset === 0 ? 0.4 : 1 }}>›</button>
        </div>
        {isFri && weekOffset === 0 && <div style={{ background: "#eff6ff", borderRadius: 8, padding: "6px 12px", textAlign: "center", fontSize: 12.5, color: NAVY, fontWeight: 600 }}>📅 Hôm nay Thứ 6 — Đã đến lịch xuất báo cáo tuần!</div>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[["📓", "Ngày ghi NK", nkTuan.length, "#eff6ff", NAVY], ["❗", "Lỗi mới", loiMoi.length, "#fef2f2", "#ef4444"], ["⚠️", "Lỗi tồn", loiTon.length, "#fffbeb", "#d97706"], ["🧪", "Tổ mẫu lấy", sampTuan.length, "#f0fdf4", "#16a34a"]].map(([ic, l, c, bg, col]) =>
          <div key={l} style={{ background: bg, borderRadius: 12, padding: "12px 14px", border: "1.5px solid " + col + "33" }}>
            <div style={{ fontSize: 11, color: col, marginBottom: 4 }}>{ic} {l}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: col }}>{c}</div>
          </div>
        )}
      </div>
      {sampQH.length > 0 && <div style={{ background: "#fef2f2", borderRadius: 12, padding: "10px 14px", marginBottom: 14, borderLeft: "4px solid #ef4444" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>🔴 {sampQH.length} tổ mẫu QUÁ HẠN — xử lý ngay!</div>
      </div>}
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 14, border: "2px solid " + NAVY }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>📌 Kế hoạch tuần tới</div>
        <textarea value={keHoach} onChange={e => sKH(e.target.value)} placeholder={"• Hạng mục sẽ thi công\n• Dự kiến nghiệm thu\n• Thí nghiệm cần thực hiện\n• Kiến nghị với CĐT/TVGS..."} rows={6} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box", lineHeight: 1.7 }} />
      </div>
      {nkTuan.length > 0 && <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 14, border: "1.5px solid #e2e8f0" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 10 }}>📓 Nhật ký thi công trong tuần</div>
        {nkTuan.map(n => <div key={n.id} style={{ display: "flex", gap: 10, marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 11, color: "#64748b", minWidth: 68 }}>{n.ng}</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 600, color: "#1e293b" }}>{n.cv}</div><div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>{ttI[n.tt] || "🌤️"} {n.tt}{n.nd ? " · " + n.nd + "°C" : ""}{n.nl > 0 ? " · 👷 " + n.nl : ""}{n.kl ? " · " + n.kl : ""}</div></div>
        </div>)}
      </div>}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={exportWeekPDF} style={{ flex: 1, padding: "14px", background: NAVY, color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", ...T }}>🖨️ Xuất PDF</button>
        <button onClick={sendEmail} style={{ flex: 1, padding: "14px", background: "#1e40af", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", ...T }}>📧 Gửi Email</button>
      </div>
      <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 8 }}>Xuất PDF trước → đính kèm vào email khi gửi</div>
    </>}
  </div>;
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dash({ setTab, loiList, nkList, samp }) {
  const nc = loiList.filter(l => l.tt === "Mới").length;
  const pc = loiList.filter(l => l.tt === "Đang xử lý").length;
  const dc = loiList.filter(l => l.tt === "Đã xong").length;
  const today = new Date().toISOString().slice(0, 10);
  const overdue = samp.filter(s => (!s.ok7 && s.d7 < today) || (!s.ok28 && s.d28 < today)).length;
  const todayT = samp.filter(s => (!s.ok7 && s.d7 === today) || (!s.ok28 && s.d28 === today)).length;
  const overdueLoiDl = loiList.filter(l => l.deadline && l.deadline < today && l.tt !== "Đã xong").length;
  const lnk = nkList.length > 0 ? nkList[0] : null;
  const ttIc = { "Nắng": "☀️", "Mây": "⛅", "Mưa nhẹ": "🌦️", "Mưa to": "🌧️", "Giông": "⛈️" };

  return <div style={{ padding: "0 16px 16px" }}>
    <div style={{ padding: "16px 0 12px", textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 800, color: NAVY }}>QC Field Manager</div><div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div></div>
    {(overdue > 0 || todayT > 0 || nc > 0 || overdueLoiDl > 0) && <div style={{ background: overdue > 0 ? "#fef2f2" : todayT > 0 ? "#fff7ed" : "#eff6ff", borderRadius: 14, padding: "12px 16px", marginBottom: 14, borderLeft: "4px solid " + (overdue > 0 ? "#ef4444" : todayT > 0 ? "#ea580c" : NAVY) }}>
      {overdue > 0 && <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>🔴 {overdue} tổ mẫu QUÁ HẠN thử!</div>}
      {todayT > 0 && <div style={{ fontSize: 13, fontWeight: 700, color: "#ea580c" }}>🟠 {todayT} tổ mẫu cần thử HÔM NAY</div>}
      {overdueLoiDl > 0 && <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>🔴 {overdueLoiDl} lỗi QUÁ HẠN deadline — chưa đóng!</div>}
      {nc > 0 && <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>🔵 {nc} lỗi mới chưa xử lý</div>}
    </div>}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
      {[["Lỗi mới", nc, "#ef4444", "#fef2f2"], ["Đang XL", pc, "#d97706", "#fffbeb"], ["Đã xong", dc, "#16a34a", "#f0fdf4"]].map(([l, c, cl, bg]) => <div key={l} style={{ background: bg, borderRadius: 12, padding: "12px 10px", textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 800, color: cl }}>{c}</div><div style={{ fontSize: 11, color: cl, fontWeight: 600 }}>{l}</div></div>)}
    </div>
    {lnk && <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 14, border: "1.5px solid #e2e8f0" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>📓 NHẬT KÝ GẦN NHẤT — {lnk.ng}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>{lnk.cv}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, background: "#eff6ff", color: NAVY, padding: "2px 8px", borderRadius: 99 }}>{ttIc[lnk.tt] || "🌤️"} {lnk.tt}{lnk.nd ? " " + lnk.nd + "°C" : ""}</span>
        {lnk.kl && <span style={{ fontSize: 11, background: "#f0fdf4", color: "#16a34a", padding: "2px 8px", borderRadius: 99 }}>📦 {lnk.kl}</span>}
        {lnk.nl > 0 && <span style={{ fontSize: 11, background: "#fffbeb", color: "#d97706", padding: "2px 8px", borderRadius: 99 }}>👷 {lnk.nl}</span>}
      </div>
    </div>}
    <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 10 }}>TRUY CẬP NHANH</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {[{ t: "checklist", ic: "cl", l: "Checklist", d: "Cốt thép, VK, BT" }, { t: "tcvn", ic: "scale", l: "TCVN", d: "12 tiêu chuẩn tra cứu nhanh" }, { t: "maubieu", ic: "save", l: "Mẫu biểu CĐT", d: "Upload & điền form .xlsx" }, { t: "thinghiem", ic: "flask", l: "Thí nghiệm", d: "Máy tính + Nhắc nhở" }, { t: "saiso", ic: "ruler", l: "Sai số", d: "TCVN 4453 & 9377" }].map(c => <button key={c.t} onClick={() => setTab(c.t)} style={{ background: "#fff", border: "2px solid #e2e8f0", borderRadius: 16, padding: "16px 14px", textAlign: "left", cursor: "pointer", position: "relative", boxShadow: "0 2px 8px rgba(30,58,138,0.07)" }}>
        {c.badge && <span style={{ position: "absolute", top: 10, right: 10, background: "#ef4444", color: "#fff", borderRadius: 99, fontSize: 11, fontWeight: 700, padding: "2px 8px" }}>{c.badge}</span>}
        <div style={{ width: 42, height: 42, borderRadius: 12, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}><Ic n={c.ic} s={20} c="#fff" /></div>
        <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, lineHeight: 1.3, marginBottom: 2 }}>{c.l}</div>
        <div style={{ fontSize: 11, color: "#64748b" }}>{c.d}</div>
      </button>)}
    </div>
  </div>;
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, sTab] = useState("home");
  const [st, sST] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  // ── State tập trung — fix lỗi duplicate ──
  const initLoiList = () => { try { const s = localStorage.getItem("qcm_loi"); if (s) return JSON.parse(s); } catch (e) { } return loiInit; };
  const initNKList = () => { try { const s = localStorage.getItem("qcm_nk"); if (s) return JSON.parse(s); } catch (e) { } return nkInit; };
  const initSamp = () => { try { const s = localStorage.getItem("qcm_sp"); if (s) return JSON.parse(s); } catch (e) { } return []; };

  const [loiList, sLL_raw] = useState(initLoiList);
  const [nkList, sNKL_raw] = useState(initNKList);
  const [samp, setSamp_raw] = useState(initSamp);
  const [emg, sEmg] = useState(false);

  // Wrapper tự động lưu localStorage
  const sLL = v => {
    const n = typeof v === "function" ? v(loiList) : v;
    try { localStorage.setItem("qcm_loi", JSON.stringify(n)); } catch (e) { }
    sLL_raw(n);
  };
  const sNKL = v => {
    const n = typeof v === "function" ? v(nkList) : v;
    try { localStorage.setItem("qcm_nk", JSON.stringify(n)); } catch (e) { }
    sNKL_raw(n);
  };
  const setSamp = v => {
    const n = typeof v === "function" ? v(samp) : v;
    try { localStorage.setItem("qcm_sp", JSON.stringify(n)); } catch (e) { }
    setSamp_raw(n);
  };

  const nc = loiList.filter(l => l.tt === "Mới").length;
  const hTab = t => { sTab(t); sST(null); setActiveSession(null); };

  const navs = [
    { id: "home", ic: "home", l: "Trang chủ" },
    { id: "checklist", ic: "cl", l: "Nghiệm thu" },
    { id: "nhatky", ic: "log", l: "Nhật ký" },
    { id: "thinghiem", ic: "flask", l: "Thí nghiệm" },
    { id: "baocao", ic: "save", l: "Báo cáo" },
  ];

  const sM = {
    ct: { t: "Cốt thép", s: "TCVN 4453" }, vk: { t: "Ván khuôn", s: "TCVN 4453" }, bt: { t: "Bê tông", s: "TCVN 4453" },
    tm: { t: "Chống thấm", s: "TCVN 9065" },
    ht_xay: { t: "Công tác Xây", s: "TCVN 9377" }, ht_trat: { t: "Công tác Trát", s: "TCVN 9377" },
    ht_lat: { t: "Lát gạch nền", s: "TCVN 9377" }, ht_op: { t: "Ốp gạch tường", s: "TCVN 9377" },
    ht_son: { t: "Công tác Sơn", s: "Chỉ dẫn KT" }, ht_tran: { t: "Trần thạch cao", s: "Chỉ dẫn KT" },
    ht_cua: { t: "Lắp đặt Cửa", s: "TCVN 9377" }
  };

  const pT = {
    home: null, checklist: "Checklist Nghiệm thu", baocao: "Báo cáo Tuần",
    maubieu: "Mẫu biểu Chủ đầu tư", tcvn: "Tra cứu TCVN & Pháp lý",
    nhatky: "Nhật ký Công trường", thinghiem: "Thí nghiệm", saiso: "Bảng tra Sai số"
  };

  const hT = activeSession ? (activeSession.location || activeSession.title)
           : st ? (sM[st]?.t || st)
           : pT[tab];
  const hS = activeSession ? sM[st]?.t : st ? sM[st]?.s : null;

  return <div style={{ maxWidth: 480, margin: "0 auto", background: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Segoe UI',system-ui,-apple-system,sans-serif" }}>
    {(tab !== "home" || st) ? <div style={{ background: NAVY, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10, boxShadow: "0 2px 8px rgba(30,58,138,0.25)" }}>
      <button onClick={() => activeSession ? setActiveSession(null) : st ? sST(null) : hTab("home")} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><Ic n="back" s={20} c="#fff" /></button>
      <div><div style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>{hT}</div>{hS && <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>{hS}</div>}</div>
    </div> : <div style={{ background: NAVY, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>QC Field Manager</div><div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>{new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div></div><div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 10px", display: "flex", alignItems: "center", gap: 5 }}><span style={{ fontSize: 10 }}>💾</span><span style={{ color: "rgba(255,255,255,0.9)", fontSize: 10.5, fontWeight: 600 }}>Tự lưu</span></div></div>}

    <div style={{ flex: 1, overflowY: "auto", paddingBottom: 90, paddingTop: 12 }}>
      {tab === "home" && !st && <Dash setTab={hTab} loiList={loiList} nkList={nkList} samp={samp} />}
      {tab === "checklist" && !st && <CLScreen setST={sST} />}
      {tab === "checklist" && st && !activeSession && (
        <SessionListScreen
          type={st}
          title={sM[st]?.t || st}
          tc={sM[st]?.s || ""}
          onOpen={sess => setActiveSession(sess)}
        />
      )}
      {tab === "checklist" && st && activeSession && (
        <GenCL
          items={getItemsByType(st)}
          session={activeSession}
          onUpdate={updated => setActiveSession(updated)}
        />
      )}
      {tab === "baocao" && <WeeklyReportScreen loiList={loiList} nkList={nkList} samp={samp} sessions={getSessions()} />}
      {tab === "maubieu" && <XLSXScreen />}
      {tab === "tcvn" && <TCVNScreen />}
      {tab === "nhatky" && <NKScreen loiList={loiList} sLL={sLL} nkList={nkList} sNKL={sNKL} />}
      {tab === "thinghiem" && <TNScreen samp={samp} setSamp={setSamp} />}
      {tab === "saiso" && <SSScreen />}
    </div>

    <button onClick={() => sEmg(true)} style={{ position: "fixed", bottom: 86, right: 16, width: 56, height: 56, borderRadius: 99, background: "#dc2626", border: "3px solid #fff", boxShadow: "0 4px 18px rgba(220,38,38,0.45)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, fontSize: 24 }}>🚨</button>

    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: "1.5px solid #e2e8f0", display: "flex", zIndex: 100, boxShadow: "0 -4px 16px rgba(30,58,138,0.10)" }}>
      {navs.map(n => <button key={n.id} onClick={() => hTab(n.id)} style={{ flex: 1, paddingTop: 10, paddingBottom: 8, border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, position: "relative", minHeight: 56 }}>
        {n.id === "nhatky" && nc > 0 && <span style={{ position: "absolute", top: 6, right: "calc(50% - 18px)", background: "#ef4444", color: "#fff", borderRadius: 99, fontSize: 9, fontWeight: 700, padding: "1px 5px" }}>{nc}</span>}
        <Ic n={n.ic} s={23} c={tab === n.id ? NAVY : "#94a3b8"} /><span style={{ fontSize: 10.5, fontWeight: tab === n.id ? 700 : 500, color: tab === n.id ? NAVY : "#94a3b8" }}>{n.l}</span>
        {tab === n.id && <span style={{ position: "absolute", bottom: 0, left: "25%", right: "25%", height: 3, background: NAVY, borderRadius: "3px 3px 0 0" }} />}
      </button>)}
    </div>
    {emg && <EmgModal onClose={() => sEmg(false)} />}
  </div>;
}