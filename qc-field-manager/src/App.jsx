import { useState, useCallback, useEffect } from "react";

const NAVY = "#1e3a8a";
const TOUCH = { minHeight: 44, minWidth: 44 }; // WCAG touch target

// ─── DATA ────────────────────────────────────────────────────────────────────
const checklistData = [
  { id: 1, category: "Nền móng", items: ["Cao độ đáy móng đúng thiết kế", "Kích thước hố móng đúng bản vẽ", "Địa chất nền đúng yêu cầu", "Lớp lót bê tông đúng chiều dày", "Cốt thép móng đúng chủng loại & khoảng cách"] },
  { id: 2, category: "Cột & Vách", items: ["Vị trí cột đúng tim trục", "Kích thước tiết diện đúng TK", "Cốt thép dọc đủ số lượng & đúng loại", "Đai cột đúng bước & chủng loại", "Lớp bảo vệ cốt thép đúng quy định"] },
  { id: 3, category: "Dầm & Sàn", items: ["Cao độ đáy dầm đúng TK", "Chiều dày sàn đúng thiết kế", "Cốt thép sàn đúng khoảng cách", "Ván khuôn kín khít, không rò rỉ", "Lỗ chờ kỹ thuật đúng vị trí"] },
  { id: 4, category: "Bê tông", items: ["Mác bê tông đúng yêu cầu TK", "Phiếu xuất xưởng hợp lệ", "Độ sụt đạt yêu cầu", "Lấy mẫu thử nén đúng tần suất", "Bảo dưỡng bê tông đúng quy trình"] },
  { id: 5, category: "Hoàn thiện", items: ["Tường xây đúng mác vữa", "Trát phẳng, không rỗ, không nứt", "Sơn đúng số lớp quy định", "Lát gạch phẳng, mạch đều", "MEP hoàn chỉnh trước khi trát"] },
];
const cotthepItems = [
  { id:"ct1", title:"Sự phù hợp chủng loại thép", tieuchuan:"Mục 3.1 TCVN 4453:1995", huongdan:"Kiểm tra chứng chỉ, nhãn mác, đường kính so với bản vẽ. Đúng mác CB240-T, CB300-V, CB400-V..." },
  { id:"ct2", title:"Khoảng cách cốt thép", tieuchuan:"Mục 3.3 TCVN 4453:1995", huongdan:"Đo khoảng cách thông thủy. Sai số: ±10mm sàn, ±5mm dầm/cột." },
  { id:"ct3", title:"Độ sạch của cốt thép", tieuchuan:"Mục 3.2 TCVN 4453:1995", huongdan:"Không có bùn đất, dầu mỡ, gỉ bong tróc. Gỉ mịn có thể chấp nhận nếu đánh sạch." },
  { id:"ct4", title:"Chiều dày lớp bảo vệ", tieuchuan:"Mục 3.5 TCVN 4453 & TCVN 5574", huongdan:"Móng 40mm, Dầm/Cột 25–30mm, Sàn 15–20mm. Sai số ±5mm." },
  { id:"ct5", title:"Mối nối & Buộc cốt thép", tieuchuan:"Mục 3.4 TCVN 4453:1995", huongdan:"Nối chồng ≥40d, không quá 50% tiết diện tại một mặt cắt. Dây buộc chắc." },
];
const vanKhuonItems = [
  { id:"vk1", title:"Kích thước & hình dạng ván khuôn", tieuchuan:"Mục 2.1 TCVN 4453:1995", huongdan:"Sai số ±5mm chiều dài, ±3mm chiều rộng. Góc vuông 90°." },
  { id:"vk2", title:"Độ ổn định & chắc chắn đà giáo", tieuchuan:"Mục 2.2 TCVN 4453:1995", huongdan:"Giằng chéo đủ, không rung khi tác dụng lực ngang. Móng đà giáo không lún." },
  { id:"vk3", title:"Độ phẳng & khít bề mặt", tieuchuan:"Mục 2.3 TCVN 4453:1995", huongdan:"Khe hở ≤2mm. Bề mặt sạch, không có mùn cưa, đất bám." },
  { id:"vk4", title:"Bôi dầu chống dính", tieuchuan:"Mục 2.4 TCVN 4453:1995", huongdan:"Toàn bộ bề mặt tiếp xúc với BT. Không để dầu dính vào cốt thép." },
  { id:"vk5", title:"Cao độ & tim cốt ván khuôn", tieuchuan:"Mục 2.1 TCVN 4453:1995", huongdan:"Cao độ sai số ±5mm, tim ±8mm so với trục thiết kế." },
  { id:"vk6", title:"Lỗ chờ, hộp chờ kỹ thuật", tieuchuan:"Mục 2.5 TCVN 4453:1995", huongdan:"Vị trí, kích thước, cao độ đúng. Hộp chờ cố định chắc." },
  { id:"vk7", title:"Khả năng tháo dỡ & an toàn", tieuchuan:"Mục 5.1 TCVN 4453:1995", huongdan:"Tháo dỡ khi BT đạt ≥70% cường độ. Có lối thoát hiểm." },
];
const betonItems = [
  { id:"bt1", title:"Chứng chỉ & phiếu kiểm tra BT tươi", tieuchuan:"Mục 4.1 TCVN 4453 & TCVN 3105", huongdan:"Phiếu xuất xưởng mỗi chuyến xe. Không chấp nhận xe trộn >90 phút." },
  { id:"bt2", title:"Độ sụt (Slump) tại chân công trình", tieuchuan:"TCVN 3106:1993", huongdan:"BT thông thường: 10–18cm. Cột/vách: 14–18cm. Ngoài phạm vi → trả xe." },
  { id:"bt3", title:"Lấy mẫu thử nén", tieuchuan:"TCVN 3105:1993", huongdan:"≥1 tổ/50m³. 6 mẫu/tổ (3 thử 7 ngày, 3 thử 28 ngày). Ghi nhãn đầy đủ." },
  { id:"bt4", title:"Công tác đầm bê tông", tieuchuan:"Mục 4.3 TCVN 4453:1995", huongdan:"Bán kính ảnh hưởng ≤50cm, cắm sâu 5–10cm vào lớp trước. Đầm 20–40s." },
  { id:"bt5", title:"Chiều dày lớp đổ bê tông", tieuchuan:"Mục 4.2 TCVN 4453:1995", huongdan:"Mỗi lớp ≤50cm. Không để BT lớp dưới đông cứng trước khi đổ lớp trên." },
  { id:"bt6", title:"Thời gian đổ & mạch ngừng", tieuchuan:"Mục 4.4 TCVN 4453:1995", huongdan:"Không ngừng đổ quá 2 giờ (xi măng PC). Xử lý mạch ngừng trước khi đổ tiếp." },
  { id:"bt7", title:"Bảo dưỡng bê tông sau đổ", tieuchuan:"Mục 4.5 TCVN 4453:1995", huongdan:"Bắt đầu sau 4–6h. Tưới nước ≥7 ngày. Tránh rung động trong 24h đầu." },
  { id:"bt8", title:"Kiểm tra ngoại quan sau tháo VK", tieuchuan:"Mục 5.2 TCVN 4453:1995", huongdan:"Rỗ mặt ≤1cm²/sâu ≤1cm: vá vữa. Rỗ lớn/sâu: báo tư vấn giám sát." },
];

const samplingRules = {
  betong: { label:"Bê tông thương phẩm", emoji:"🏗️", color:"#1e3a8a", unit:"m³", inputLabel:"Khối lượng đổ bê tông", inputPlaceholder:"Nhập thể tích (m³)...", tieuchuan:"TCVN 3105:1993 & TCVN 4453:1995",
    calc: v => { const vol=parseFloat(v); if(!vol||vol<=0) return null; let toMau,lyDo; if(vol<=20){toMau=1;lyDo="≤20m³: tối thiểu 1 tổ"}else if(vol<=50){toMau=Math.ceil(vol/20);lyDo="20–50m³: 1 tổ/20m³"}else if(vol<=200){toMau=Math.ceil(vol/50);lyDo="50–200m³: 1 tổ/50m³"}else{toMau=Math.ceil(vol/100);lyDo=">200m³: 1 tổ/100m³"} return { toMau, lyDo, rows:[{label:"Số tổ mẫu cần lấy",value:`${toMau} tổ`,highlight:true},{label:"Số mẫu mỗi tổ",value:"6 mẫu (3 thử 7ng + 3 thử 28ng)"},{label:"Tổng số mẫu",value:`${toMau*6} mẫu`},{label:"Kích thước mẫu",value:"150 × 150 × 150 mm"},{label:"Bảo dưỡng",value:"24h trong khuôn → ngâm nước"},{label:"Nơi lấy mẫu",value:"Tại nơi đổ, không lấy tại xe trộn"}], note:"Thử độ sụt (Slump) cho mỗi chuyến xe nhập công trình." }; }
  },
  cotthep: { label:"Cốt thép xây dựng", emoji:"🔩", color:"#1e40af", unit:"tấn", inputLabel:"Khối lượng thép nhập (tấn)", inputPlaceholder:"Nhập khối lượng (tấn)...", tieuchuan:"TCVN 1651:2008",
    calc: v => { const w=parseFloat(v); if(!w||w<=0) return null; const t=Math.ceil(w/10); return { toMau:t, lyDo:"1 tổ/10 tấn/lô/chủng loại", rows:[{label:"Số tổ mẫu cần lấy",value:`${t} tổ`,highlight:true},{label:"Mẫu thử kéo",value:`${t*3} mẫu (3/tổ)`},{label:"Mẫu uốn nguội",value:`${t*3} mẫu (3/tổ)`},{label:"Chiều dài mẫu kéo",value:"≥500mm"},{label:"Kèm theo",value:"Phiếu kiểm tra xuất xưởng"}], note:"Mỗi lô từ một nhà sản xuất, một đường kính = một lô riêng." }; }
  },
  datdap: { label:"Đất đắp / Nền", emoji:"⛏️", color:"#92400e", unit:"m²", inputLabel:"Diện tích lớp đắp (m²)", inputPlaceholder:"Nhập diện tích (m²)...", tieuchuan:"TCVN 9354:2012",
    calc: v => { const a=parseFloat(v); if(!a||a<=0) return null; const d=Math.ceil(a/200); return { toMau:d, lyDo:"1 điểm thử/200m²/lớp đầm", rows:[{label:"Số điểm thử",value:`${d} điểm`,highlight:true},{label:"Phương pháp",value:"Rót cát hoặc Dao vòng"},{label:"Chiều dày lớp đắp",value:"≤30cm (đầm cơ giới)"},{label:"Độ chặt yêu cầu",value:"K ≥ 0.95"},{label:"Proctor",value:"1 tổ/500m³ hoặc khi đổi nguồn đất"}], note:"Thử sau khi đầm xong mỗi lớp, trước khi đắp lớp tiếp theo." }; }
  },
  cat: { label:"Cát xây dựng", emoji:"🏖️", color:"#d97706", unit:"m³", inputLabel:"Khối lượng cát nhập (m³)", inputPlaceholder:"Nhập thể tích (m³)...", tieuchuan:"TCVN 7570:2006",
    calc: v => { const vol=parseFloat(v); if(!vol||vol<=0) return null; const t=Math.ceil(vol/100); return { toMau:t, lyDo:"1 tổ/100m³/nguồn cung", rows:[{label:"Số tổ mẫu",value:`${t} tổ`,highlight:true},{label:"Khối lượng mẫu",value:"≥10kg/tổ"},{label:"Chỉ tiêu thử",value:"Thành phần hạt, hàm lượng bùn sét"},{label:"Bùn sét max",value:"≤3% (BT), ≤5% (xây trát)"},{label:"Module độ lớn",value:"Mk=2.0–2.8 (vừa); >2.8 (thô)"}], note:"Lấy ≥5 điểm khác nhau trong lô cát." }; }
  },
  dadam: { label:"Đá dăm / Đá sỏi", emoji:"🪨", color:"#475569", unit:"m³", inputLabel:"Khối lượng đá nhập (m³)", inputPlaceholder:"Nhập thể tích (m³)...", tieuchuan:"TCVN 7570:2006",
    calc: v => { const vol=parseFloat(v); if(!vol||vol<=0) return null; const t=Math.ceil(vol/200); return { toMau:t, lyDo:"1 tổ/200m³/nguồn cung", rows:[{label:"Số tổ mẫu",value:`${t} tổ`,highlight:true},{label:"Khối lượng mẫu",value:"≥30kg/tổ"},{label:"Chỉ tiêu thử",value:"Thành phần hạt, bùn, cường độ nén"},{label:"Hạt dẹt max",value:"≤25%"},{label:"Cỡ hạt phổ biến",value:"5–10, 10–20, 20–40mm"}], note:"Thử mài mòn Los Angeles cho kết cấu chịu lực." }; }
  },
  ximang: { label:"Xi măng", emoji:"🛢️", color:"#374151", unit:"tấn", inputLabel:"Khối lượng xi măng (tấn)", inputPlaceholder:"Nhập khối lượng (tấn)...", tieuchuan:"TCVN 2682:2009",
    calc: v => { const w=parseFloat(v); if(!w||w<=0) return null; const t=Math.ceil(w/50); return { toMau:t, lyDo:"1 tổ/50 tấn/lô nhập", rows:[{label:"Số tổ mẫu",value:`${t} tổ`,highlight:true},{label:"Khối lượng mẫu",value:"≥5kg/tổ (≥3 bao)"},{label:"Chỉ tiêu thử",value:"Cường độ nén 3,7,28ng; đông kết"},{label:"Bắt đầu đông kết",value:"≥45 phút"},{label:"Cường độ 28ng",value:"PC30:≥30MPa, PC40:≥40MPa"}], note:"Xi măng tồn kho >3 tháng phải thử lại trước khi dùng." }; }
  },
};

const thinghiemData = [
  { vatlieu:"Bê tông tươi", tieuchuan:"TCVN 3105", tangsuat:"50m³/tổ hoặc mỗi ca đổ", soluong:"6 mẫu/tổ (3 thử 7ng, 3 thử 28ng)", ghichu:"Lấy mẫu tại nơi đổ BT" },
  { vatlieu:"Thép CB300-V/CB400-V", tieuchuan:"TCVN 1651", tangsuat:"Mỗi 10 tấn/lô", soluong:"3 mẫu kéo + 3 mẫu uốn nguội", ghichu:"Kèm phiếu xuất xưởng" },
  { vatlieu:"Cát xây dựng", tieuchuan:"TCVN 7570", tangsuat:"Mỗi 100m³/nguồn cung", soluong:"1 tổ mẫu", ghichu:"Thử thành phần hạt, bùn sét" },
  { vatlieu:"Đá dăm / Đá sỏi", tieuchuan:"TCVN 7570", tangsuat:"Mỗi 200m³/nguồn cung", soluong:"1 tổ mẫu", ghichu:"Thử cường độ, thành phần hạt" },
  { vatlieu:"Xi măng", tieuchuan:"TCVN 2682", tangsuat:"Mỗi 50 tấn/lô nhập", soluong:"1 tổ mẫu (5kg)", ghichu:"Thử cường độ nén, thời gian đông kết" },
  { vatlieu:"Gạch đặc / rỗng", tieuchuan:"TCVN 1451/1450", tangsuat:"Mỗi 10.000 viên/lô nhập", soluong:"10 viên/tổ", ghichu:"Thử kích thước, cường độ nén" },
  { vatlieu:"Vữa xây / trát", tieuchuan:"TCVN 4314", tangsuat:"Mỗi 5m³/ca trộn", soluong:"3 mẫu/tổ", ghichu:"Thử cường độ nén 28 ngày" },
  { vatlieu:"Đất đắp / nền", tieuchuan:"TCVN 9354", tangsuat:"Mỗi lớp đầm, 200m²/điểm", soluong:"1 điểm/200m²", ghichu:"Thử độ chặt (rót cát)" },
];

const phapLyData = [
  { dieu:"Điều 4", tieu_de:"Trách nhiệm của chủ đầu tư", tags:["chủ đầu tư","trách nhiệm","quản lý chất lượng"], tom_tat:["Chịu trách nhiệm toàn diện về chất lượng công trình đầu tư xây dựng","Lựa chọn nhà thầu có đủ điều kiện năng lực theo quy định","Tổ chức quản lý chất lượng từ khảo sát, thiết kế đến thi công và bảo trì","Phê duyệt chỉ dẫn kỹ thuật, biện pháp thi công, kế hoạch kiểm tra CL","Không can thiệp làm thay đổi thiết kế đã được phê duyệt trái quy định","Chịu trách nhiệm khi để xảy ra vi phạm chất lượng mà không xử lý kịp thời"], luu_y:"Chủ đầu tư được thuê Ban quản lý dự án chuyên nghiệp thực hiện một số quyền hạn." },
  { dieu:"Điều 11", tieu_de:"Giám sát thi công xây dựng", tags:["giám sát","thi công","tư vấn giám sát"], tom_tat:["Chủ đầu tư phải tổ chức giám sát thi công trong suốt quá trình xây dựng","Có thể thuê tư vấn có đủ điều kiện năng lực để giám sát","Kiểm tra vật liệu, cấu kiện, thiết bị trước khi sử dụng","Theo dõi, kiểm tra biện pháp thi công của nhà thầu","Lập biên bản nghiệm thu khi hạng mục hoàn thành","Không được giám sát khi không đủ năng lực hoặc có xung đột lợi ích"], luu_y:"Tư vấn giám sát phải có chứng chỉ hành nghề phù hợp với loại, cấp công trình." },
  { dieu:"Điều 12", tieu_de:"Trách nhiệm của nhà thầu thi công", tags:["nhà thầu","trách nhiệm","chất lượng"], tom_tat:["Thực hiện các biện pháp kiểm soát chất lượng thi công","Chỉ sử dụng vật tư, vật liệu, thiết bị đáp ứng yêu cầu thiết kế","Lập và lưu trữ hồ sơ quản lý chất lượng trong quá trình thi công","Nhật ký thi công phải ghi chép đầy đủ, trung thực","Không thi công khi phát hiện yếu tố gây mất an toàn","Chịu trách nhiệm về chất lượng theo hợp đồng và quy định pháp luật"], luu_y:"Nhà thầu phải có đủ năng lực hoạt động xây dựng theo quy định." },
  { dieu:"Điều 13", tieu_de:"Nghiệm thu công việc xây dựng", tags:["nghiệm thu","công việc","biên bản","kiểm tra"], tom_tat:["Nghiệm thu từng công việc trước khi chuyển sang công việc tiếp theo","Người giám sát của chủ đầu tư chủ trì nghiệm thu","Căn cứ: hồ sơ thiết kế, QCVN, TCVN, chỉ dẫn kỹ thuật được duyệt","Kết quả kiểm tra, thử nghiệm vật liệu phải đạt yêu cầu","Lập biên bản nghiệm thu có chữ ký các bên liên quan","Không đạt: lập biên bản nêu rõ khiếm khuyết, yêu cầu khắc phục"], luu_y:"Nghiêm cấm nghiệm thu khống — biên bản phải phản ánh đúng thực tế." },
  { dieu:"Điều 14", tieu_de:"Nghiệm thu giai đoạn / bộ phận công trình", tags:["nghiệm thu","giai đoạn","khuất lấp"], tom_tat:["Áp dụng khi hoàn thành giai đoạn hoặc bộ phận sắp bị che khuất","Chủ đầu tư tổ chức, chủ trì nghiệm thu giai đoạn","Thành phần: chủ đầu tư, nhà thầu, tư vấn thiết kế (nếu cần)","Bộ phận bị che khuất BẮT BUỘC nghiệm thu trước khi lấp","Hồ sơ: biên bản + bản vẽ hoàn công bộ phận"], luu_y:"Không được lấp đất hoặc đổ BT che khuất trước khi có biên bản nghiệm thu ký." },
  { dieu:"Điều 19", tieu_de:"Sự cố công trình xây dựng", tags:["sự cố","tai nạn","báo cáo","xử lý"], tom_tat:["Sự cố: hư hỏng, ngừng hoạt động hoặc sụp đổ gây thiệt hại","Nhà thầu báo cáo ngay cho chủ đầu tư và cơ quan có thẩm quyền","Bảo vệ hiện trường, không tự ý tháo dỡ trước khi được phép","Chủ đầu tư lập hội đồng xác định nguyên nhân","Xử lý sự cố theo phương án được phê duyệt","Lưu hồ sơ: nguyên nhân, giải pháp khắc phục, bài học kinh nghiệm"], luu_y:"Che giấu sự cố công trình có thể bị truy cứu trách nhiệm hình sự." },
  { dieu:"Điều 21", tieu_de:"Bản vẽ hoàn công", tags:["hoàn công","bản vẽ","hồ sơ","as-built"], tom_tat:["Phản ánh đúng kích thước, vị trí thực tế đã thi công","Nhà thầu lập bản vẽ hoàn công cho từng công việc, hạng mục","Đúng thiết kế: đóng dấu 'Bản vẽ hoàn công' lên bản vẽ TK","Có thay đổi: vẽ lại và ghi rõ lý do thay đổi","Thay đổi TK phải được chủ đầu tư và đơn vị TK chấp thuận","Có chữ ký: người lập, người kiểm tra, đại diện nhà thầu"], luu_y:"Không có bản vẽ hoàn công hoặc hoàn công sai thực tế là vi phạm pháp luật." },
  { dieu:"Điều 22", tieu_de:"Bảo hành công trình xây dựng", tags:["bảo hành","khiếm khuyết","sửa chữa"], tom_tat:["CT cấp I trở lên ≥24 tháng; cấp III, IV ≥12 tháng","Nhà thầu chịu trách nhiệm bảo hành các khiếm khuyết do lỗi thi công","Chủ đầu tư thông báo bằng văn bản khi phát hiện khiếm khuyết","Nhà thầu sửa chữa trong thời hạn thỏa thuận","Tiền bảo hành giữ lại (thường 5%) đến hết thời hạn","Nếu không sửa, CĐT dùng tiền bảo hành thuê đơn vị khác"], luu_y:"Bảo hành không áp dụng cho hư hỏng do thiên tai, sử dụng sai mục đích." },
];

const loiInit = [
  { id:1, vitri:"Cột C3 - Tầng 2", mota:"Cốt đai cột sai bước, khoảng cách 250mm thay vì 150mm theo TK", mucdo:"Cao", trangthai:"Đang xử lý", ngay:"2025-06-10" },
  { id:2, vitri:"Sàn tầng 1 - Ô S5", mota:"Bê tông sàn bị rỗ mặt diện tích ~0.3m²", mucdo:"Trung bình", trangthai:"Mới", ngay:"2025-06-12" },
  { id:3, vitri:"Móng M1", mota:"Lớp BT lót dày 7cm, thiếu 3cm so với thiết kế", mucdo:"Thấp", trangthai:"Đã xong", ngay:"2025-06-08" },
];

// Emergency Guide data
const emergencyGuides = [
  {
    id:"rain", emoji:"🌧️", title:"Đổ bê tông gặp mưa",
    color:"#1e40af", urgency:"KHẨN CẤP",
    steps:[
      { icon:"1", text:"DỪNG ngay việc đổ bê tông nếu mưa to (>10mm/h)" },
      { icon:"2", text:"Che phủ bê tông vừa đổ bằng bạt không thấm nước ngay lập tức" },
      { icon:"3", text:"Nếu mưa nhẹ: tiếp tục đổ nhưng theo dõi Slump — giảm lượng nước phối trộn" },
      { icon:"4", text:"Không được thêm nước vào bê tông để bù hao hụt do mưa" },
      { icon:"5", text:"Ghi nhật ký thi công: thời điểm mưa, cường độ, biện pháp đã thực hiện" },
      { icon:"6", text:"Kiểm tra kỹ bề mặt sau khi mưa tạnh: loại bỏ bê tông bị rửa trôi xi măng" },
      { icon:"7", text:"Báo cáo chủ đầu tư / tư vấn giám sát để quyết định tiếp tục hoặc phá dỡ" },
    ],
    note:"Nếu mưa to trước khi BT đạt 50% cường độ (≈3 ngày) → lấy thêm mẫu kiểm tra, khoan lấy lõi nếu cần.",
  },
  {
    id:"fail", emoji:"❌", title:"Mẫu thí nghiệm không đạt",
    color:"#dc2626", urgency:"XỬ LÝ GẤP",
    steps:[
      { icon:"1", text:"Không tự ý phá dỡ hoặc sửa chữa kết cấu khi chưa có chỉ đạo" },
      { icon:"2", text:"Lập tức thông báo bằng văn bản cho Chủ đầu tư và Tư vấn giám sát" },
      { icon:"3", text:"Kiểm tra lại: mẫu thử có bị lỗi kỹ thuật không? (bảo dưỡng sai, mẫu bị nứt trước...)" },
      { icon:"4", text:"Yêu cầu thử lại tổ mẫu dự phòng (nếu có) tại phòng thí nghiệm độc lập" },
      { icon:"5", text:"Tổ chức khoan lấy lõi bê tông (core drilling) tại kết cấu nghi ngờ — TCVN 3985" },
      { icon:"6", text:"Nếu kết quả khoan lõi cũng không đạt: lập hội đồng đánh giá kỹ thuật" },
      { icon:"7", text:"Các phương án xử lý: gia cường kết cấu / giảm tải / phá dỡ thi công lại" },
    ],
    note:"Lưu toàn bộ hồ sơ phiếu thử, biên bản, thông báo — đây là tài liệu pháp lý quan trọng.",
  },
];

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size=22, color="currentColor" }) => {
  const p = { fill:"none", stroke:color, strokeWidth:2, strokeLinecap:"round", strokeLinejoin:"round" };
  const icons = {
    checklist: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
    book: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    log: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    flask: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M9 3h6v10l4 7H5l4-7V3z"/><line x1="9" y1="9" x2="15" y2="9"/></svg>,
    home: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    back: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><polyline points="15 18 9 12 15 6"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    chevron: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><polyline points="9 18 15 12 9 6"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    scale: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
    alert: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    save: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
    copy: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  };
  return icons[name] || null;
};

// ─── EMERGENCY GUIDE ─────────────────────────────────────────────────────────
const EmergencyGuide = ({ onClose }) => {
  const [active, setActive] = useState(null);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:500, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:"22px 22px 0 0", width:"100%", maxWidth:480, maxHeight:"88vh", overflowY:"auto", paddingBottom:32 }}>
        <div style={{ padding:"16px 20px 12px", borderBottom:"1.5px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"#fff", zIndex:1 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:"#dc2626", display:"flex", alignItems:"center", gap:6 }}>
              🚨 Emergency Guide
            </div>
            <div style={{ fontSize:11.5, color:"#64748b" }}>Quy trình xử lý sự cố tại hiện trường</div>
          </div>
          <button onClick={onClose} style={{ ...TOUCH, width:40, height:40, borderRadius:10, background:"#f1f5f9", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon name="x" size={18} color="#374151"/>
          </button>
        </div>

        {!active ? (
          <div style={{ padding:"16px 16px 0" }}>
            <div style={{ fontSize:13, color:"#64748b", marginBottom:14, textAlign:"center" }}>Chọn tình huống cần xử lý:</div>
            {emergencyGuides.map(g => (
              <button key={g.id} onClick={() => setActive(g.id)}
                style={{ width:"100%", background:"#fff", border:`2px solid ${g.color}33`, borderRadius:16, padding:"18px 16px", marginBottom:12, cursor:"pointer", display:"flex", alignItems:"center", gap:14, textAlign:"left" }}>
                <div style={{ width:56, height:56, borderRadius:14, background:g.color+"12", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0 }}>{g.emoji}</div>
                <div>
                  <div style={{ fontSize:15, fontWeight:800, color:g.color, marginBottom:3 }}>{g.title}</div>
                  <div style={{ display:"inline-block", background:g.color, color:"#fff", borderRadius:99, fontSize:10.5, fontWeight:700, padding:"2px 10px" }}>{g.urgency}</div>
                </div>
                <Icon name="chevron" size={18} color={g.color} />
              </button>
            ))}
            <div style={{ margin:"8px 0 4px", background:"#fffbeb", borderRadius:12, padding:"10px 14px", borderLeft:"3px solid #f59e0b" }}>
              <div style={{ fontSize:12, color:"#92400e" }}>⚠️ Trong mọi trường hợp sự cố: <strong>báo cáo ngay cho giám sát</strong> và <strong>ghi chép đầy đủ nhật ký thi công</strong>.</div>
            </div>
          </div>
        ) : (
          (() => {
            const g = emergencyGuides.find(x => x.id === active);
            return (
              <div>
                <button onClick={() => setActive(null)} style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 16px", background:"none", border:"none", cursor:"pointer", color:NAVY, fontSize:13, fontWeight:600 }}>
                  <Icon name="back" size={16} color={NAVY}/> Quay lại
                </button>
                <div style={{ margin:"0 16px 14px", background:g.color, borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:30 }}>{g.emoji}</span>
                  <div>
                    <div style={{ fontSize:15, fontWeight:800, color:"#fff" }}>{g.title}</div>
                    <div style={{ background:"rgba(255,255,255,0.25)", color:"#fff", borderRadius:99, fontSize:10.5, fontWeight:700, padding:"2px 10px", display:"inline-block", marginTop:3 }}>{g.urgency}</div>
                  </div>
                </div>
                <div style={{ padding:"0 16px" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"#64748b", marginBottom:10, letterSpacing:"0.04em" }}>CÁC BƯỚC XỬ LÝ THEO THỨ TỰ:</div>
                  {g.steps.map((s,i) => (
                    <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:10, background:"#f8fafc", borderRadius:12, padding:"12px 14px", borderLeft:`3px solid ${g.color}` }}>
                      <div style={{ width:26, height:26, borderRadius:99, background:g.color, color:"#fff", fontSize:12, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>{s.icon}</div>
                      <span style={{ fontSize:13, color:"#1e293b", lineHeight:1.6 }}>{s.text}</span>
                    </div>
                  ))}
                  <div style={{ background:"#fffbeb", borderRadius:12, padding:"12px 14px", borderLeft:"3px solid #f59e0b", marginTop:6, marginBottom:16 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#92400e", marginBottom:4 }}>📋 GHI CHÚ QUAN TRỌNG:</div>
                    <div style={{ fontSize:12.5, color:"#78350f", lineHeight:1.6 }}>{g.note}</div>
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};

// ─── GENERIC CHECKLIST SCREEN ────────────────────────────────────────────────
const GenericChecklistScreen = ({ items, title, tieuchuan, storeKey }) => {
  const initState = () => {
    try { const s = sessionStorage.getItem(storeKey); if(s) return JSON.parse(s); } catch{}
    return { results:{}, bienphap:{}, meta:{ congtrinh:"", vitri:"", ngay:new Date().toISOString().slice(0,10), ksce:"" } };
  };
  const [state, setStateRaw] = useState(initState);
  const [showReport, setShowReport] = useState(false);
  const [saved, setSaved] = useState(false);

  const setState = useCallback(updater => {
    setStateRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try { sessionStorage.setItem(storeKey, JSON.stringify(next)); } catch{}
      return next;
    });
  }, [storeKey]);

  const setResult = (id,val) => setState(p => ({ ...p, results:{ ...p.results, [id]:p.results[id]===val?undefined:val } }));
  const setBp = (id,v) => setState(p => ({ ...p, bienphap:{ ...p.bienphap, [id]:v } }));
  const setMeta = (k,v) => setState(p => ({ ...p, meta:{ ...p.meta, [k]:v } }));

  const { results, bienphap, meta } = state;
  const answered = Object.keys(results).length;
  const datCount = Object.values(results).filter(v=>v==="dat").length;
  const khongdatCount = Object.values(results).filter(v=>v==="khongdat").length;
  const naCount = Object.values(results).filter(v=>v==="na").length;
  const allDone = answered === items.length;
  const progress = Math.round((answered / items.length) * 100);

  const handleSave = () => {
    try { sessionStorage.setItem(storeKey, JSON.stringify(state)); setSaved(true); setTimeout(()=>setSaved(false), 2000); } catch{}
  };

  const btnStyle = (active, color) => ({
    flex:1, padding:"10px 4px", borderRadius:10, border:"none", cursor:"pointer",
    fontSize:12.5, fontWeight:700, ...TOUCH,
    background: active ? color : "#f1f5f9",
    color: active ? "#fff" : "#94a3b8",
    transition:"all 0.15s",
  });

  return (
    <div style={{ padding:"0 16px 16px" }}>
      {/* Progress + Save */}
      <div style={{ background:NAVY, borderRadius:16, padding:"14px 16px", marginBottom:16, color:"#fff" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
          <div>
            <div style={{ fontSize:12, opacity:0.8 }}>Tiến độ điền form</div>
            <div style={{ fontSize:24, fontWeight:800 }}>{progress}%</div>
          </div>
          <button onClick={handleSave} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:10, padding:"8px 14px", color:"#fff", fontSize:12.5, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, ...TOUCH }}>
            <Icon name="save" size={16} color="#fff"/>
            {saved ? "Đã lưu ✓" : "Lưu tạm"}
          </button>
        </div>
        <div style={{ background:"rgba(255,255,255,0.2)", borderRadius:99, height:8 }}>
          <div style={{ background:"#fff", width:`${progress}%`, height:8, borderRadius:99, transition:"width 0.3s" }}/>
        </div>
        <div style={{ display:"flex", gap:16, marginTop:10 }}>
          {[["✅",datCount,"Đạt"],["❌",khongdatCount,"Không đạt"],["—",naCount,"N/A"]].map(([ic,c,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:800 }}>{c}</div>
              <div style={{ fontSize:10, opacity:0.75 }}>{ic} {l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Meta fields */}
      <div style={{ background:"#fff", borderRadius:14, padding:"14px 16px", marginBottom:16, border:"1.5px solid #e2e8f0" }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#64748b", marginBottom:10 }}>THÔNG TIN CHUNG</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {[["Công trình","congtrinh","Tên CT..."],["Vị trí","vitri","Vd: Dầm D1-T2"],["Ngày kiểm tra","ngay",""],["KS Giám sát","ksce","Họ tên..."]].map(([label,key,ph]) => (
            <div key={key}>
              <div style={{ fontSize:11, color:"#94a3b8", marginBottom:3 }}>{label}</div>
              <input type={key==="ngay"?"date":"text"} value={meta[key]||""} onChange={e=>setMeta(key,e.target.value)} placeholder={ph}
                style={{ width:"100%", padding:"9px 10px", borderRadius:9, border:"1.5px solid #e2e8f0", fontSize:13, outline:"none", boxSizing:"border-box", ...TOUCH }} />
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      {items.map((item,idx) => {
        const res = results[item.id];
        const bp = bienphap[item.id]||"";
        const border = res==="dat"?"#22c55e":res==="khongdat"?"#ef4444":res==="na"?"#94a3b8":"#e2e8f0";
        return (
          <div key={item.id} style={{ background:"#fff", borderRadius:14, marginBottom:12, border:`2px solid ${border}`, overflow:"hidden", transition:"border-color 0.2s" }}>
            <div style={{ padding:"14px 16px" }}>
              <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:8 }}>
                <div style={{ width:28, height:28, borderRadius:99, background:NAVY, color:"#fff", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>{idx+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:"#1e293b", lineHeight:1.35, marginBottom:2 }}>{item.title}</div>
                  <div style={{ fontSize:11, color:"#3b82f6", fontWeight:600 }}>{item.tieuchuan}</div>
                </div>
              </div>
              <div style={{ background:"#f8fafc", borderRadius:9, padding:"8px 12px", marginBottom:12, borderLeft:"3px solid #cbd5e1" }}>
                <div style={{ fontSize:11.5, color:"#475569", lineHeight:1.6 }}>💡 {item.huongdan}</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button style={btnStyle(res==="dat","#22c55e")} onClick={()=>setResult(item.id,"dat")}>✅ Đạt</button>
                <button style={btnStyle(res==="khongdat","#ef4444")} onClick={()=>setResult(item.id,"khongdat")}>❌ Không đạt</button>
                <button style={btnStyle(res==="na","#64748b")} onClick={()=>setResult(item.id,"na")}>— N/A</button>
              </div>
            </div>
            {res==="khongdat" && (
              <div style={{ borderTop:"2px dashed #fecaca", background:"#fff5f5", padding:"12px 16px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#ef4444", marginBottom:6 }}>🔧 Biện pháp khắc phục</div>
                <textarea value={bp} onChange={e=>setBp(item.id,e.target.value)}
                  placeholder="Mô tả biện pháp xử lý, đơn vị thực hiện, thời hạn..."
                  rows={3} style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:"1.5px solid #fca5a5", fontSize:13, outline:"none", resize:"none", boxSizing:"border-box", background:"#fff", lineHeight:1.5 }}/>
              </div>
            )}
          </div>
        );
      })}

      <button onClick={()=>setShowReport(true)} disabled={!allDone}
        style={{ width:"100%", padding:"15px", borderRadius:14, background:allDone?NAVY:"#e2e8f0", color:allDone?"#fff":"#94a3b8", border:"none", fontSize:15, fontWeight:700, cursor:allDone?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:8, ...TOUCH }}>
        📄 Xuất Báo cáo Nháp {!allDone&&<span style={{ fontSize:12, fontWeight:400 }}>({items.length-answered} mục chưa điền)</span>}
      </button>

      {showReport && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={()=>setShowReport(false)}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:"20px 20px 0 0", width:"100%", maxWidth:480, maxHeight:"85vh", overflowY:"auto", padding:"20px 18px 32px" }}>
            <div style={{ width:40, height:4, background:"#e2e8f0", borderRadius:99, margin:"0 auto 18px" }}/>
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <div style={{ fontSize:16, fontWeight:800, color:NAVY }}>BIÊN BẢN NGHIỆM THU</div>
              <div style={{ fontSize:13, fontWeight:700, color:NAVY }}>{title.toUpperCase()}</div>
              <div style={{ fontSize:12, color:"#64748b" }}>Theo {tieuchuan} — Báo cáo nháp</div>
            </div>
            <div style={{ background:"#eff6ff", borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
              {[["Công trình",meta.congtrinh],["Vị trí",meta.vitri],["Ngày",meta.ngay],["KS Giám sát",meta.ksce]].map(([k,v])=>v?(
                <div key={k} style={{ display:"flex", gap:8, marginBottom:4, fontSize:12.5 }}>
                  <span style={{ color:"#64748b", minWidth:90 }}>{k}:</span>
                  <span style={{ fontWeight:600, color:"#1e293b" }}>{v}</span>
                </div>
              ):null)}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:16 }}>
              {[["Đạt",datCount,"#dcfce7","#16a34a"],["Không đạt",khongdatCount,"#fef2f2","#ef4444"],["N/A",naCount,"#f1f5f9","#64748b"]].map(([l,c,bg,col])=>(
                <div key={l} style={{ background:bg, borderRadius:10, padding:"10px", textAlign:"center" }}>
                  <div style={{ fontSize:22, fontWeight:800, color:col }}>{c}</div>
                  <div style={{ fontSize:11.5, color:col, fontWeight:600 }}>{l}</div>
                </div>
              ))}
            </div>
            {items.map((item,idx) => {
              const res=results[item.id], bp=bienphap[item.id];
              const lm={dat:"✅ Đạt",khongdat:"❌ Không đạt",na:"— N/A"}, cm={dat:"#16a34a",khongdat:"#ef4444",na:"#94a3b8"};
              return (
                <div key={item.id} style={{ borderBottom:idx<items.length-1?"1px solid #f1f5f9":"none", paddingBottom:10, marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"#1e293b", flex:1, paddingRight:8 }}>{idx+1}. {item.title}</div>
                    <span style={{ fontSize:12, fontWeight:700, color:cm[res], whiteSpace:"nowrap" }}>{lm[res]}</span>
                  </div>
                  {res==="khongdat"&&bp&&<div style={{ background:"#fff5f5", borderRadius:8, padding:"7px 10px", marginTop:6, borderLeft:"3px solid #fca5a5" }}><div style={{ fontSize:11, color:"#ef4444", fontWeight:600, marginBottom:2 }}>Biện pháp:</div><div style={{ fontSize:12, color:"#374151", lineHeight:1.5 }}>{bp}</div></div>}
                  {res==="khongdat"&&!bp&&<div style={{ fontSize:11.5, color:"#f59e0b", marginTop:4 }}>⚠ Chưa nhập biện pháp</div>}
                </div>
              );
            })}
            {khongdatCount===0&&<div style={{ background:"#f0fdf4", borderRadius:12, padding:"12px 16px", textAlign:"center", marginTop:8 }}><div style={{ fontSize:13, fontWeight:700, color:"#16a34a" }}>🎉 Tất cả hạng mục đạt yêu cầu!</div></div>}
            <div style={{ marginTop:16, fontSize:11, color:"#94a3b8", textAlign:"center" }}>ⓘ Báo cáo nháp — biên bản chính thức cần ký đầy đủ.</div>
            <button onClick={()=>setShowReport(false)} style={{ width:"100%", marginTop:14, padding:"14px", background:NAVY, color:"#fff", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", ...TOUCH }}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── CHECKLIST CHUNG ─────────────────────────────────────────────────────────
const ChecklistScreen = ({ setSubTab }) => {
  const STORE = "qcm_general";
  const initState = () => { try { const s=sessionStorage.getItem(STORE); if(s) return JSON.parse(s); } catch{} return {}; };
  const [checks, setChecksRaw] = useState(initState);
  const [openCat, setOpenCat] = useState(1);
  const [saved, setSaved] = useState(false);

  const setChecks = useCallback(updater => {
    setChecksRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try { sessionStorage.setItem(STORE, JSON.stringify(next)); } catch{}
      return next;
    });
  }, []);

  const total = checklistData.reduce((a,c)=>a+c.items.length,0);
  const done = Object.values(checks).filter(v=>v===true).length;
  const pct = Math.round((done/total)*100);
  const toggle = (key,val) => setChecks(prev=>({ ...prev, [key]:prev[key]===val?undefined:val }));
  const handleSave = () => { try { sessionStorage.setItem(STORE, JSON.stringify(checks)); setSaved(true); setTimeout(()=>setSaved(false), 2000); } catch{} };

  const subModules = [
    { id:"cotthep", emoji:"🔩", label:"Nghiệm thu Cốt thép", sub:"TCVN 4453:1995 — 5 hạng mục" },
    { id:"vankhuon", emoji:"🪵", label:"Nghiệm thu Ván khuôn", sub:"TCVN 4453:1995 — 7 hạng mục" },
    { id:"betong", emoji:"🏗️", label:"Chất lượng Bê tông", sub:"TCVN 4453:1995 — 8 hạng mục" },
  ];

  return (
    <div style={{ padding:"0 16px 16px" }}>
      <div style={{ fontSize:12, fontWeight:700, color:"#64748b", marginBottom:10, letterSpacing:"0.05em" }}>CHECKLIST THEO TCVN</div>
      {subModules.map(m => (
        <button key={m.id} onClick={()=>setSubTab(m.id)}
          style={{ width:"100%", background:`linear-gradient(135deg,${NAVY} 60%,#2d4fa3)`, borderRadius:14, padding:"14px 16px", marginBottom:10, border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:14, textAlign:"left", ...TOUCH }}>
          <div style={{ width:42, height:42, borderRadius:11, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:22 }}>{m.emoji}</div>
          <div style={{ flex:1 }}>
            <div style={{ color:"#fff", fontWeight:700, fontSize:13.5, marginBottom:2 }}>{m.label}</div>
            <div style={{ color:"rgba(255,255,255,0.65)", fontSize:11.5 }}>{m.sub}</div>
          </div>
          <Icon name="chevron" size={16} color="rgba(255,255,255,0.6)"/>
        </button>
      ))}

      <div style={{ fontSize:12, fontWeight:700, color:"#64748b", marginBottom:10, marginTop:6, letterSpacing:"0.05em" }}>DANH MỤC TỔNG HỢP</div>
      <div style={{ background:"#fff", borderRadius:14, padding:"12px 16px", marginBottom:14, border:"1.5px solid #e2e8f0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <div style={{ fontSize:12, color:"#64748b" }}>Tiến độ nghiệm thu chung</div>
          <button onClick={handleSave} style={{ background:"#eff6ff", border:"none", borderRadius:8, padding:"5px 12px", color:NAVY, fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:4, ...TOUCH }}>
            <Icon name="save" size={13} color={NAVY}/>{saved?"Đã lưu ✓":"Lưu"}
          </button>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ flex:1, background:"#e2e8f0", borderRadius:99, height:8 }}>
            <div style={{ background:NAVY, width:`${pct}%`, height:8, borderRadius:99, transition:"width 0.3s" }}/>
          </div>
          <span style={{ fontSize:14, fontWeight:700, color:NAVY, minWidth:38 }}>{pct}%</span>
        </div>
        <div style={{ fontSize:12, color:"#94a3b8", marginTop:4 }}>{done}/{total} hạng mục đã kiểm tra</div>
      </div>

      {checklistData.map(cat => (
        <div key={cat.id} style={{ background:"#fff", borderRadius:14, marginBottom:10, overflow:"hidden", border:"1.5px solid #e2e8f0" }}>
          <button onClick={()=>setOpenCat(openCat===cat.id?null:cat.id)}
            style={{ width:"100%", padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", background:openCat===cat.id?"#eff6ff":"#fff", border:"none", cursor:"pointer", ...TOUCH }}>
            <span style={{ fontSize:14, fontWeight:700, color:NAVY }}>{cat.category}</span>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:12, color:"#64748b" }}>{cat.items.filter((_,i)=>checks[`${cat.id}-${i}`]!==undefined).length}/{cat.items.length}</span>
              <span style={{ transform:openCat===cat.id?"rotate(90deg)":"none", transition:"0.2s", color:NAVY }}><Icon name="chevron" size={16}/></span>
            </div>
          </button>
          {openCat===cat.id && (
            <div style={{ borderTop:"1px solid #e2e8f0" }}>
              {cat.items.map((item,i) => {
                const key=`${cat.id}-${i}`, state=checks[key];
                return (
                  <div key={i} style={{ padding:"12px 16px", borderBottom:i<cat.items.length-1?"1px solid #f1f5f9":"none", display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:13, color:"#374151", flex:1, lineHeight:1.4 }}>{item}</span>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={()=>toggle(key,true)} style={{ width:42, height:42, borderRadius:10, border:"none", background:state===true?"#22c55e":"#f1f5f9", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Icon name="check" size={17} color={state===true?"#fff":"#94a3b8"}/>
                      </button>
                      <button onClick={()=>toggle(key,false)} style={{ width:42, height:42, borderRadius:10, border:"none", background:state===false?"#ef4444":"#f1f5f9", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Icon name="x" size={17} color={state===false?"#fff":"#94a3b8"}/>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── PHÁP LÝ ─────────────────────────────────────────────────────────────────
const PhapLyScreen = () => {
  const [q,setQ] = useState("");
  const [expanded,setExpanded] = useState(null);
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const qn = norm(q);
  const filtered = q.trim().length===0 ? phapLyData : phapLyData.filter(d=>
    norm(d.tieu_de).includes(qn)||norm(d.dieu).includes(qn)||d.tags.some(t=>norm(t).includes(qn))||d.tom_tat.some(t=>norm(t).includes(qn))
  );
  const highlights = ["nghiệm thu","hồ sơ hoàn công","bảo hành","giám sát","sự cố","bản vẽ hoàn công","lưu trữ","năng lực","nhà thầu"];
  return (
    <div style={{ padding:"0 16px 16px" }}>
      <div style={{ position:"relative", marginBottom:14 }}>
        <div style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)" }}><Icon name="search" size={18} color="#94a3b8"/></div>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm: 'nghiệm thu', 'hoàn công'..."
          style={{ width:"100%", padding:"13px 40px 13px 42px", borderRadius:14, border:`2px solid ${q?NAVY:"#e2e8f0"}`, fontSize:14, outline:"none", boxSizing:"border-box", ...TOUCH }}/>
        {q&&<button onClick={()=>setQ("")} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"#f1f5f9", border:"none", borderRadius:99, width:26, height:26, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name="x" size={13} color="#64748b"/></button>}
      </div>
      {!q&&<div style={{ marginBottom:14 }}><div style={{ fontSize:11.5, color:"#94a3b8", marginBottom:7, fontWeight:600 }}>TÌM NHANH:</div><div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{highlights.map(tag=><button key={tag} onClick={()=>setQ(tag)} style={{ padding:"7px 14px", borderRadius:99, background:"#eff6ff", border:"1.5px solid #bfdbfe", fontSize:12.5, color:NAVY, fontWeight:600, cursor:"pointer", ...TOUCH }}>{tag}</button>)}</div></div>}
      {q&&<div style={{ fontSize:12.5, color:"#64748b", marginBottom:10 }}>Tìm thấy <strong style={{ color:NAVY }}>{filtered.length}</strong> điều luật</div>}
      {filtered.length===0&&<div style={{ textAlign:"center", padding:"40px 16px" }}><div style={{ fontSize:36, marginBottom:10 }}>🔍</div><div style={{ fontSize:14, fontWeight:600, color:"#64748b" }}>Không tìm thấy kết quả</div></div>}
      {filtered.map(d => {
        const isOpen = expanded===d.dieu;
        return (
          <div key={d.dieu} style={{ background:"#fff", borderRadius:16, marginBottom:12, border:`2px solid ${isOpen?NAVY:"#e2e8f0"}`, overflow:"hidden", transition:"border-color 0.2s", boxShadow:isOpen?"0 4px 16px rgba(30,58,138,0.1)":"none" }}>
            <button onClick={()=>setExpanded(isOpen?null:d.dieu)} style={{ width:"100%", padding:"14px 16px", display:"flex", alignItems:"flex-start", gap:12, background:isOpen?"#eff6ff":"#fff", border:"none", cursor:"pointer", textAlign:"left", ...TOUCH }}>
              <div style={{ flexShrink:0, background:NAVY, borderRadius:10, padding:"5px 10px", textAlign:"center", minWidth:56 }}>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.75)", lineHeight:1 }}>NĐ 06</div>
                <div style={{ fontSize:13, fontWeight:800, color:"#fff", lineHeight:1.3 }}>{d.dieu}</div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13.5, fontWeight:700, color:NAVY, lineHeight:1.35, marginBottom:5 }}>{d.tieu_de}</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>{d.tags.slice(0,3).map(tag=><span key={tag} style={{ fontSize:10.5, background:"#f1f5f9", color:"#475569", padding:"2px 8px", borderRadius:99 }}>{tag}</span>)}</div>
              </div>
              <span style={{ flexShrink:0, transform:isOpen?"rotate(90deg)":"none", transition:"transform 0.2s", marginTop:2, color:NAVY }}><Icon name="chevron" size={18}/></span>
            </button>
            {!isOpen&&<div style={{ padding:"0 16px 12px 16px" }}>{d.tom_tat.slice(0,2).map((line,i)=><div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:4 }}><span style={{ color:NAVY, fontSize:12, flexShrink:0, marginTop:1 }}>•</span><span style={{ fontSize:12, color:"#475569", lineHeight:1.5 }}>{line}</span></div>)}<div style={{ fontSize:11.5, color:"#94a3b8", marginTop:4 }}>+{d.tom_tat.length-2} ý khác — nhấn để xem đầy đủ</div></div>}
            {isOpen&&<div style={{ borderTop:"1px solid #e2e8f0" }}>
              <div style={{ padding:"14px 16px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#64748b", marginBottom:8 }}>NỘI DUNG CHÍNH:</div>
                {d.tom_tat.map((line,i)=><div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:8 }}><span style={{ width:22, height:22, borderRadius:99, background:NAVY, color:"#fff", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>{i+1}</span><span style={{ fontSize:13, color:"#1e293b", lineHeight:1.6 }}>{line}</span></div>)}
              </div>
              <div style={{ background:"#fffbeb", borderTop:"1px solid #fde68a", padding:"10px 16px", display:"flex", gap:8, alignItems:"flex-start" }}>
                <span style={{ fontSize:16, flexShrink:0 }}>⚠️</span>
                <div><div style={{ fontSize:11, fontWeight:700, color:"#92400e", marginBottom:2 }}>LƯU Ý THỰC TẾ:</div><div style={{ fontSize:12.5, color:"#78350f", lineHeight:1.6 }}>{d.luu_y}</div></div>
              </div>
            </div>}
          </div>
        );
      })}
      {!q&&<div style={{ textAlign:"center", padding:"4px 0", fontSize:12, color:"#94a3b8" }}>Hiển thị {phapLyData.length} điều từ NĐ 06/2021/NĐ-CP</div>}
    </div>
  );
};

// ─── OTHER SCREENS ────────────────────────────────────────────────────────────
const LoiScreen = ({ loiList, setLoiList }) => {
  const [filter,setFilter]=useState("Tất cả");
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({ vitri:"",mota:"",mucdo:"Trung bình",trangthai:"Mới" });
  const shown = filter==="Tất cả" ? loiList : loiList.filter(l=>l.trangthai===filter);
  const addLoi = () => { if(!form.vitri||!form.mota) return; setLoiList(prev=>[{ ...form,id:Date.now(),ngay:new Date().toISOString().slice(0,10) },...prev]); setForm({ vitri:"",mota:"",mucdo:"Trung bình",trangthai:"Mới" }); setShowForm(false); };
  const mauMD = { "Cao":"#ef4444","Trung bình":"#f59e0b","Thấp":"#22c55e" };
  const mauTT = { "Mới":{ bg:"#fef2f2",text:"#ef4444" },"Đang xử lý":{ bg:"#fffbeb",text:"#d97706" },"Đã xong":{ bg:"#f0fdf4",text:"#16a34a" } };
  return (
    <div style={{ padding:"0 16px 16px" }}>
      <div style={{ display:"flex", gap:8, marginBottom:14, overflowX:"auto", paddingBottom:4 }}>
        {["Tất cả","Mới","Đang xử lý","Đã xong"].map(f=><button key={f} onClick={()=>setFilter(f)} style={{ whiteSpace:"nowrap", padding:"9px 18px", borderRadius:99, fontSize:13, fontWeight:600, border:"none", cursor:"pointer", background:filter===f?NAVY:"#f1f5f9", color:filter===f?"#fff":"#64748b", ...TOUCH }}>{f}</button>)}
      </div>
      <button onClick={()=>setShowForm(!showForm)} style={{ width:"100%", padding:"13px", borderRadius:12, background:showForm?"#f1f5f9":NAVY, color:showForm?NAVY:"#fff", border:"none", fontSize:14, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:14, ...TOUCH }}>
        <Icon name="plus" size={18} color={showForm?NAVY:"#fff"}/>{showForm?"Đóng form":"Ghi lỗi mới"}
      </button>
      {showForm&&<div style={{ background:"#fff", borderRadius:14, padding:"16px", marginBottom:14, border:"1.5px solid #e2e8f0" }}>
        <div style={{ fontSize:14, fontWeight:700, color:NAVY, marginBottom:12 }}>📝 Thêm lỗi mới</div>
        {[["Vị trí","vitri","Vd: Cột C3 - Tầng 2"],["Mô tả lỗi","mota","Mô tả chi tiết..."]].map(([label,key,ph])=>(
          <div key={key} style={{ marginBottom:10 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#374151", marginBottom:4 }}>{label}</div>
            {key==="mota"?<textarea value={form[key]} onChange={e=>setForm(p=>({ ...p,[key]:e.target.value }))} placeholder={ph} rows={3} style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:"1.5px solid #e2e8f0", fontSize:13, outline:"none", resize:"none", boxSizing:"border-box" }}/>:<input value={form[key]} onChange={e=>setForm(p=>({ ...p,[key]:e.target.value }))} placeholder={ph} style={{ width:"100%", padding:"11px 12px", borderRadius:10, border:"1.5px solid #e2e8f0", fontSize:13, outline:"none", boxSizing:"border-box", ...TOUCH }}/>}
          </div>
        ))}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
          {[["Mức độ","mucdo",["Cao","Trung bình","Thấp"]],["Trạng thái","trangthai",["Mới","Đang xử lý","Đã xong"]]].map(([label,key,opts])=>(
            <div key={key}><div style={{ fontSize:12, fontWeight:600, color:"#374151", marginBottom:4 }}>{label}</div><select value={form[key]} onChange={e=>setForm(p=>({ ...p,[key]:e.target.value }))} style={{ width:"100%", padding:"11px 12px", borderRadius:10, border:"1.5px solid #e2e8f0", fontSize:13, outline:"none", background:"#fff", ...TOUCH }}>{opts.map(o=><option key={o}>{o}</option>)}</select></div>
          ))}
        </div>
        <button onClick={addLoi} style={{ width:"100%", padding:"13px", background:NAVY, color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", ...TOUCH }}>Lưu lỗi</button>
      </div>}
      {shown.length===0&&<div style={{ textAlign:"center", color:"#94a3b8", marginTop:40, fontSize:14 }}>Không có lỗi nào</div>}
      {shown.map(loi=>(
        <div key={loi.id} style={{ background:"#fff", borderRadius:14, padding:"14px 16px", marginBottom:10, border:"1.5px solid #e2e8f0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
            <div style={{ fontSize:13.5, fontWeight:700, color:NAVY, flex:1 }}>{loi.vitri}</div>
            <div style={{ display:"flex", gap:8, marginLeft:8 }}>
              <button onClick={()=>{ const order=["Mới","Đang xử lý","Đã xong"]; setLoiList(prev=>prev.map(l=>l.id===loi.id?{ ...l,trangthai:order[(order.indexOf(l.trangthai)+1)%3] }:l)); }} style={{ width:42, height:42, borderRadius:9, background:"#eff6ff", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name="edit" size={15} color={NAVY}/></button>
              <button onClick={()=>setLoiList(prev=>prev.filter(l=>l.id!==loi.id))} style={{ width:42, height:42, borderRadius:9, background:"#fef2f2", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name="trash" size={15} color="#ef4444"/></button>
            </div>
          </div>
          <div style={{ fontSize:13, color:"#374151", lineHeight:1.5, marginBottom:10 }}>{loi.mota}</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
            <span style={{ fontSize:11.5, fontWeight:600, color:mauMD[loi.mucdo], background:mauMD[loi.mucdo]+"18", padding:"4px 12px", borderRadius:99 }}>⚠ {loi.mucdo}</span>
            <span style={{ fontSize:11.5, fontWeight:600, color:mauTT[loi.trangthai].text, background:mauTT[loi.trangthai].bg, padding:"4px 12px", borderRadius:99 }}>{loi.trangthai}</span>
            <span style={{ fontSize:11, color:"#94a3b8", marginLeft:"auto" }}>{loi.ngay}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const ThinghiemScreen = () => {
  const [mode,setMode]=useState("calculator");
  const [selectedMat,setSelectedMat]=useState("betong");
  const [inputVal,setInputVal]=useState("");
  const [q,setQ]=useState("");
  const rule=samplingRules[selectedMat];
  const result=inputVal?rule.calc(inputVal):null;
  const filtered=thinghiemData.filter(t=>t.vatlieu.toLowerCase().includes(q.toLowerCase())||t.tieuchuan.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ padding:"0 16px 16px" }}>
      <div style={{ display:"flex", background:"#f1f5f9", borderRadius:12, padding:4, marginBottom:16, gap:4 }}>
        {[["calculator","🧮 Máy tính Lấy mẫu"],["table","📋 Bảng tra tham khảo"]].map(([m,label])=>(
          <button key={m} onClick={()=>setMode(m)} style={{ flex:1, padding:"10px 8px", borderRadius:9, border:"none", cursor:"pointer", fontSize:12.5, fontWeight:700, background:mode===m?"#fff":"transparent", color:mode===m?NAVY:"#64748b", boxShadow:mode===m?"0 1px 4px rgba(0,0,0,0.1)":"none", ...TOUCH }}>{label}</button>
        ))}
      </div>
      {mode==="calculator"&&<>
        <div style={{ fontSize:12, fontWeight:700, color:"#64748b", marginBottom:8 }}>CHỌN LOẠI VẬT LIỆU</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
          {Object.entries(samplingRules).map(([key,r])=>(
            <button key={key} onClick={()=>{ setSelectedMat(key); setInputVal(""); }} style={{ padding:"12px 10px", borderRadius:12, border:`2px solid ${selectedMat===key?r.color:"#e2e8f0"}`, background:selectedMat===key?r.color+"12":"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:8, textAlign:"left", ...TOUCH }}>
              <span style={{ fontSize:22 }}>{r.emoji}</span>
              <span style={{ fontSize:12.5, fontWeight:selectedMat===key?700:500, color:selectedMat===key?r.color:"#374151", lineHeight:1.3 }}>{r.label}</span>
            </button>
          ))}
        </div>
        <div style={{ background:"#fff", borderRadius:16, padding:"16px", marginBottom:16, border:`2px solid ${rule.color}22` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <div style={{ width:42, height:42, borderRadius:10, background:rule.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{rule.emoji}</div>
            <div><div style={{ fontSize:14, fontWeight:700, color:rule.color }}>{rule.label}</div><div style={{ fontSize:11, color:"#64748b" }}>{rule.tieuchuan}</div></div>
          </div>
          <div style={{ fontSize:12, fontWeight:600, color:"#374151", marginBottom:6 }}>{rule.inputLabel}</div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <input type="number" min="0" value={inputVal} onChange={e=>setInputVal(e.target.value)} placeholder={rule.inputPlaceholder}
              style={{ flex:1, padding:"12px 14px", borderRadius:10, border:`1.5px solid ${inputVal?rule.color:"#e2e8f0"}`, fontSize:16, fontWeight:600, outline:"none", ...TOUCH }}/>
            <div style={{ fontSize:14, fontWeight:700, color:"#64748b", minWidth:30 }}>{rule.unit}</div>
          </div>
          {inputVal&&parseFloat(inputVal)>0&&result&&<div style={{ marginTop:8, fontSize:12, color:"#64748b", fontStyle:"italic" }}>📐 {result.lyDo}</div>}
        </div>
        {result ? (
          <div style={{ background:"#fff", borderRadius:16, border:`2px solid ${rule.color}`, overflow:"hidden" }}>
            <div style={{ background:rule.color, padding:"14px 16px", display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:52, height:52, borderRadius:12, background:"rgba(255,255,255,0.2)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                <div style={{ fontSize:22, fontWeight:800, color:"#fff", lineHeight:1 }}>{result.toMau}</div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.8)", fontWeight:600 }}>TỔ MẪU</div>
              </div>
              <div><div style={{ color:"#fff", fontSize:15, fontWeight:800 }}>Cần lấy {result.toMau} tổ mẫu</div><div style={{ color:"rgba(255,255,255,0.75)", fontSize:12 }}>cho {inputVal} {rule.unit} {rule.label.toLowerCase()}</div></div>
            </div>
            <div style={{ padding:"12px 16px" }}>
              {result.rows.map((row,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"9px 0", borderBottom:i<result.rows.length-1?"1px solid #f1f5f9":"none", gap:10 }}>
                  <span style={{ fontSize:12, color:"#64748b", minWidth:130 }}>{row.label}</span>
                  <span style={{ fontSize:12.5, fontWeight:row.highlight?700:600, color:row.highlight?rule.color:"#1e293b", textAlign:"right", flex:1 }}>{row.value}</span>
                </div>
              ))}
              {result.note&&<div style={{ marginTop:10, background:"#fffbeb", borderRadius:10, padding:"10px 12px", borderLeft:"3px solid #f59e0b" }}><div style={{ fontSize:11.5, color:"#92400e", lineHeight:1.6 }}>⚠️ {result.note}</div></div>}
            </div>
          </div>
        ) : inputVal&&parseFloat(inputVal)<=0 ? (
          <div style={{ textAlign:"center", color:"#ef4444", fontSize:13 }}>Vui lòng nhập giá trị lớn hơn 0</div>
        ) : (
          <div style={{ background:"#fff", borderRadius:14, padding:"28px 16px", textAlign:"center", border:"1.5px dashed #cbd5e1" }}>
            <div style={{ fontSize:36, marginBottom:8 }}>🧮</div>
            <div style={{ fontSize:14, fontWeight:600, color:"#64748b" }}>Nhập khối lượng để tính ngay</div>
          </div>
        )}
      </>}
      {mode==="table"&&<>
        <div style={{ position:"relative", marginBottom:16 }}>
          <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}><Icon name="search" size={18} color="#94a3b8"/></div>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm vật liệu, tiêu chuẩn..." style={{ width:"100%", padding:"12px 12px 12px 40px", borderRadius:12, border:"1.5px solid #e2e8f0", fontSize:14, outline:"none", boxSizing:"border-box", ...TOUCH }}/>
        </div>
        {filtered.map((t,i)=>(
          <div key={i} style={{ background:"#fff", borderRadius:14, padding:"14px 16px", marginBottom:10, border:"1.5px solid #e2e8f0" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ fontSize:14, fontWeight:700, color:NAVY }}>{t.vatlieu}</div>
              <span style={{ background:NAVY, color:"#fff", borderRadius:8, padding:"3px 9px", fontSize:11, fontWeight:700 }}>{t.tieuchuan}</span>
            </div>
            {[["🔁 Tần suất",t.tangsuat],["🧪 Số lượng mẫu",t.soluong],["📌 Ghi chú",t.ghichu]].map(([label,val])=>(
              <div key={label} style={{ background:"#f8fafc", borderRadius:8, padding:"8px 12px", marginBottom:6 }}>
                <span style={{ fontSize:11.5, fontWeight:600, color:"#64748b" }}>{label}: </span>
                <span style={{ fontSize:12.5, color:"#1e293b" }}>{val}</span>
              </div>
            ))}
          </div>
        ))}
      </>}
    </div>
  );
};

const Dashboard = ({ setTab, loiList }) => {
  const newCount = loiList.filter(l=>l.trangthai==="Mới").length;
  const cards = [
    { tab:"checklist", icon:"checklist", label:"Checklist Nghiệm thu", desc:"Kiểm tra & tick hạng mục thi công" },
    { tab:"phapLy", icon:"scale", label:"Pháp lý Bỏ túi", desc:"NĐ 06/2021 — tra cứu điều luật nhanh" },
    { tab:"loi", icon:"log", label:"Nhật ký Quản lý lỗi", desc:"Ghi và theo dõi sai sót hiện trường", badge:newCount>0?newCount:null },
    { tab:"thinghiem", icon:"flask", label:"Bảng tra Thí nghiệm", desc:"Máy tính lấy mẫu vật liệu" },
  ];
  return (
    <div style={{ padding:"0 16px 16px" }}>
      <div style={{ padding:"20px 0 16px", textAlign:"center" }}>
        <div style={{ fontSize:13, color:"#94a3b8", marginBottom:2 }}>Ứng dụng quản lý</div>
        <div style={{ fontSize:22, fontWeight:700, color:NAVY }}>QC Field Manager</div>
        <div style={{ fontSize:12, color:"#64748b", marginTop:4 }}>Kỹ sư Quản lý Chất lượng — Hiện trường</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginTop:4 }}>
        {cards.map(c=>(
          <button key={c.tab} onClick={()=>setTab(c.tab)} style={{ background:"#fff", border:"2px solid #e2e8f0", borderRadius:16, padding:"18px 14px", textAlign:"left", cursor:"pointer", position:"relative", boxShadow:"0 2px 8px rgba(30,58,138,0.07)", minHeight:120 }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=NAVY} onMouseLeave={e=>e.currentTarget.style.borderColor="#e2e8f0"}>
            {c.badge&&<span style={{ position:"absolute", top:10, right:10, background:"#ef4444", color:"#fff", borderRadius:99, fontSize:11, fontWeight:700, padding:"2px 8px" }}>{c.badge}</span>}
            <div style={{ width:46, height:46, borderRadius:12, background:NAVY, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}><Icon name={c.icon} size={22} color="#fff"/></div>
            <div style={{ fontSize:13.5, fontWeight:700, color:NAVY, lineHeight:1.3, marginBottom:4 }}>{c.label}</div>
            <div style={{ fontSize:11.5, color:"#64748b", lineHeight:1.4 }}>{c.desc}</div>
          </button>
        ))}
      </div>
      <div style={{ marginTop:20, background:"#eff6ff", borderRadius:12, padding:"12px 16px", borderLeft:`4px solid ${NAVY}` }}>
        <div style={{ fontSize:12, fontWeight:600, color:NAVY, marginBottom:2 }}>📌 Lưu ý hôm nay</div>
        <div style={{ fontSize:12, color:"#475569" }}>Kiểm tra tổ mẫu BT đã đến hạn thử 28 ngày chưa. Xem lại nhật ký lỗi còn tồn đọng.</div>
      </div>
    </div>
  );
};

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");
  const [subTab, setSubTab] = useState(null);
  const [loiList, setLoiList] = useState(loiInit);
  const [showEmergency, setShowEmergency] = useState(false);
  const newCount = loiList.filter(l=>l.trangthai==="Mới").length;

  const handleTabChange = t => { setTab(t); setSubTab(null); };

  const navItems = [
    { id:"home", icon:"home", label:"Trang chủ" },
    { id:"checklist", icon:"checklist", label:"Nghiệm thu" },
    { id:"phapLy", icon:"scale", label:"Pháp lý" },
    { id:"loi", icon:"log", label:"Nhật ký", badge:newCount>0?newCount:null },
    { id:"thinghiem", icon:"flask", label:"Thí nghiệm" },
  ];

  const subTitleMap = {
    cotthep:{ title:"Nghiệm thu Cốt thép", sub:"TCVN 4453:1995" },
    vankhuon:{ title:"Nghiệm thu Ván khuôn", sub:"TCVN 4453:1995" },
    betong:{ title:"Chất lượng Bê tông", sub:"TCVN 4453:1995" },
  };
  const pageTitles = { home:null, checklist:"Checklist Nghiệm thu", phapLy:"Pháp lý Bỏ túi", loi:"Nhật ký Quản lý lỗi", thinghiem:"Bảng tra Thí nghiệm" };
  const headerTitle = subTab ? subTitleMap[subTab]?.title : pageTitles[tab];
  const headerSub = subTab ? subTitleMap[subTab]?.sub : null;

  return (
    <div style={{ maxWidth:480, margin:"0 auto", background:"#f8fafc", minHeight:"100vh", display:"flex", flexDirection:"column", fontFamily:"'Segoe UI', system-ui, -apple-system, sans-serif", position:"relative" }}>

      {/* Header */}
      {(tab!=="home"||subTab) ? (
        <div style={{ background:NAVY, padding:"14px 16px", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:10, boxShadow:"0 2px 8px rgba(30,58,138,0.25)" }}>
          <button onClick={()=>subTab?setSubTab(null):handleTabChange("home")} style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:8, width:42, height:42, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
            <Icon name="back" size={20} color="#fff"/>
          </button>
          <div style={{ flex:1 }}>
            <div style={{ color:"#fff", fontSize:15, fontWeight:700, lineHeight:1.2 }}>{headerTitle}</div>
            {headerSub&&<div style={{ color:"rgba(255,255,255,0.65)", fontSize:11 }}>{headerSub}</div>}
          </div>
        </div>
      ) : (
        <div style={{ background:NAVY, padding:"14px 16px", boxShadow:"0 2px 8px rgba(30,58,138,0.25)" }}>
          <div style={{ color:"#fff", fontSize:16, fontWeight:700 }}>QC Field Manager</div>
          <div style={{ color:"rgba(255,255,255,0.65)", fontSize:12 }}>{new Date().toLocaleDateString("vi-VN",{ weekday:"long",year:"numeric",month:"long",day:"numeric" })}</div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", paddingBottom:90, paddingTop:12 }}>
        {tab==="home"&&!subTab&&<Dashboard setTab={handleTabChange} loiList={loiList}/>}
        {tab==="checklist"&&!subTab&&<ChecklistScreen setSubTab={setSubTab}/>}
        {tab==="checklist"&&subTab==="cotthep"&&<GenericChecklistScreen items={cotthepItems} title="Nghiệm thu Cốt thép" tieuchuan="TCVN 4453:1995" storeKey="qcm_cotthep"/>}
        {tab==="checklist"&&subTab==="vankhuon"&&<GenericChecklistScreen items={vanKhuonItems} title="Nghiệm thu Ván khuôn & Đà giáo" tieuchuan="TCVN 4453:1995" storeKey="qcm_vankhuon"/>}
        {tab==="checklist"&&subTab==="betong"&&<GenericChecklistScreen items={betonItems} title="Kiểm tra Chất lượng Bê tông" tieuchuan="TCVN 4453:1995" storeKey="qcm_betong"/>}
        {tab==="phapLy"&&<PhapLyScreen/>}
        {tab==="loi"&&<LoiScreen loiList={loiList} setLoiList={setLoiList}/>}
        {tab==="thinghiem"&&<ThinghiemScreen/>}
      </div>

      {/* 🚨 Emergency FAB */}
      <button onClick={()=>setShowEmergency(true)}
        style={{ position:"fixed", bottom:86, right:16, width:56, height:56, borderRadius:99, background:"#dc2626", border:"3px solid #fff", boxShadow:"0 4px 18px rgba(220,38,38,0.45)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, fontSize:24 }}>
        🚨
      </button>

      {/* Bottom Nav */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:"#fff", borderTop:"1.5px solid #e2e8f0", display:"flex", zIndex:100, boxShadow:"0 -4px 16px rgba(30,58,138,0.10)" }}>
        {navItems.map(n=>(
          <button key={n.id} onClick={()=>handleTabChange(n.id)}
            style={{ flex:1, paddingTop:10, paddingBottom:8, border:"none", background:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, position:"relative", minHeight:56 }}>
            {n.badge&&<span style={{ position:"absolute", top:6, right:"calc(50% - 18px)", background:"#ef4444", color:"#fff", borderRadius:99, fontSize:9, fontWeight:700, padding:"1px 5px", lineHeight:1.4 }}>{n.badge}</span>}
            <Icon name={n.icon} size={23} color={tab===n.id?NAVY:"#94a3b8"}/>
            <span style={{ fontSize:10.5, fontWeight:tab===n.id?700:500, color:tab===n.id?NAVY:"#94a3b8" }}>{n.label}</span>
            {tab===n.id&&<span style={{ position:"absolute", bottom:0, left:"25%", right:"25%", height:3, background:NAVY, borderRadius:"3px 3px 0 0" }}/>}
          </button>
        ))}
      </div>

      {/* Emergency Modal */}
      {showEmergency&&<EmergencyGuide onClose={()=>setShowEmergency(false)}/>}
    </div>
  );
}