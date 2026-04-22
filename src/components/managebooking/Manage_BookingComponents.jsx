import React from "react";
import { Clock, CheckCircle2, XCircle, ChevronRight, Hash } from "lucide-react";

// 1. BookingCard: การ์ดรายการแต่ละแถว
export const BookingCard = ({ req, variant, onClick, getFullName }) => {
  const styles = {
    pending: {
      borderColor: "border-gray-100 dark:border-gray-600",
      statusColor: "text-[#0EA5E9]",
      bgColor: "bg-[#0EA5E9]/10",
      Icon: Clock,
      label: "รออนุมัติ"
    },
    approved: {
      borderColor: "border-[#10B981]/20 dark:border-[#10B981]/40",
      statusColor: "text-[#10B981]",
      bgColor: "bg-[#10B981]/10",
      Icon: CheckCircle2,
      label: "อนุมัติแล้ว"
    },
    rejected: {
      borderColor: "border-[#EF4444]/20 dark:border-[#EF4444]/40",
      statusColor: "text-[#EF4444]",
      bgColor: "bg-[#EF4444]/10",
      Icon: XCircle,
      label: "ไม่อนุมัติ"
    },
    cancelled: {
      borderColor: "border-gray-100 dark:border-gray-600",
      statusColor: "text-black dark:text-white",
      bgColor: "bg-gray-100 dark:bg-gray-700/50",
      Icon: XCircle,
      label: "ยกเลิกแล้ว"
    },
    class_cancelled: {
      borderColor: "border-[#F59E0B]/20 dark:border-[#F59E0B]/40",
      statusColor: "text-[#F59E0B]",
      bgColor: "bg-[#F59E0B]/10",
      Icon: Hash,
      label: "ยกเลิกคลาส"
    },
    completed: {
      borderColor: "border-[#10B981]/20 dark:border-[#10B981]/40",
      statusColor: "text-[#10B981]",
      bgColor: "bg-[#10B981]/10",
      Icon: CheckCircle2,
      label: "สำเร็จแล้ว"
    },
  };

  const { borderColor, statusColor, bgColor, Icon, label } = styles[variant] || styles.pending;

  return (
    <div
      onClick={() => onClick(req)}
      className={`group p-4 sm:p-5 rounded-[24px] sm:rounded-[32px] bg-[#FFFFFF] dark:bg-gray-700 border ${borderColor} flex items-center gap-4 transition-all cursor-pointer mb-3 sm:mb-4 shadow-[0_4px_12px_-6px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.1)] active:scale-[0.98] w-full overflow-hidden`}
    >
      {/* Icon Area */}
      <div className={`w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center rounded-2xl ${bgColor} ${statusColor} transition-transform group-hover:scale-110`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      
      {/* Content Area */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between mb-0.5 sm:mb-1">
          <h3 className="font-black text-base sm:text-lg text-[#302782] dark:text-white truncate flex items-center gap-2">
            <span className="text-black dark:text-white"></span>{req.room_id || "---"}
          </h3>
          
          {/* Badge */}
          <span className={`text-[10px] font-black uppercase tracking-tighter py-1 px-3 rounded-lg ${bgColor} ${statusColor} border border-transparent`}>
            {label}
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          <p className="text-xs sm:text-sm font-bold text-black dark:text-white truncate">
            {getFullName(req)}
          </p>
          <span className="hidden sm:inline text-black dark:text-white">•</span>
          <p className="text-[10px] sm:text-xs font-medium text-black dark:text-white">
            {req.date ? new Date(req.date).toLocaleDateString('th-TH') : "ไม่ระบุวันที่"}
          </p>
        </div>
      </div>
      
      {/* Arrow Icon */}
      <div className="hidden sm:flex w-10 h-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-600 text-black dark:text-white group-hover:text-[#302782] dark:group-hover:text-[#B2BB1E] group-hover:bg-gray-100 dark:group-hover:bg-gray-500 transition-all">
        <ChevronRight size={20} strokeWidth={3} />
      </div>
    </div>
  );
};

// 2. SectionTitle: หัวข้อแบ่งกลุ่มรายการ
export const SectionTitle = ({ title, icon: Icon, colorClass }) => (
  <div className="flex items-center gap-3 mt-10 mb-6 px-1">
    {Icon && (
      <div className={`p-2 rounded-xl bg-white dark:bg-gray-700 shadow-sm border border-gray-50 dark:border-gray-600 ${colorClass || "text-[#302782]"}`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
    )}
    <h2 className={`text-xl font-black tracking-tight ${colorClass || "text-[#302782]"}`}>
      {title}
    </h2>
    <div className="flex-grow h-[1px] bg-gradient-to-r from-gray-100 dark:from-gray-600 to-transparent ml-2" />
  </div>
);

// 3. DetailItem: รายการข้อมูลใน Modal
export const DetailItem = ({ icon: Icon, label, value }) => (
  // 1. เปลี่ยน items-center เป็น items-start เพื่อให้ไอคอนอยู่ชิดบนเสมอเวลาข้อความมีหลายบรรทัด
  <div className="flex items-start gap-4 p-4 bg-[#FFFFFF] dark:bg-gray-700 rounded-[20px] border border-gray-50 dark:border-gray-600 shadow-sm transition-all hover:border-[#B2BB1E]/30">
    <div className="text-[#302782] dark:text-[#B2BB1E] bg-gray-50 dark:bg-gray-600 p-2.5 rounded-xl flex-shrink-0 mt-1">
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <div className="min-w-0 w-full">
      <p className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest mb-1">
        {label}
      </p>
      {/* 2. ลบ truncate ออก 
          3. เพิ่ม break-words และ whitespace-pre-wrap 
          4. ปรับ leading-tight เป็น leading-normal หรือ relaxed ให้อ่านง่ายขึ้นเวลาขึ้นบรรทัดใหม่ */}
      <p className="text-sm sm:text-base font-bold text-[#302782] dark:text-white leading-relaxed break-words whitespace-pre-wrap">
        {value || "-"}
      </p>
    </div>
  </div>
);

// 4. EditField: ฟิลด์กรอกข้อมูล (ใช้ร่วมกับ Input หลัก)
export const EditField = ({ label, value, onChange, type = "text", icon: Icon, ...props }) => (
  <div className="flex flex-col gap-2 w-full font-sans group">
    <label className="text-xs font-medium text-black dark:text-white ml-1">
      {label}
    </label>
    <div className="relative flex items-center">
      {Icon && <Icon size={18} className="absolute left-4 text-black dark:text-white group-focus-within:text-[#B2BB1E] transition-colors" />}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${Icon ? 'pl-11' : 'px-5'} py-4 rounded-[16px] border-2 border-gray-50 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700 outline-none focus:bg-white dark:focus:bg-gray-600 focus:border-[#B2BB1E] focus:ring-4 focus:ring-[#B2BB1E]/10 text-base font-bold text-[#302782] dark:text-white transition-all placeholder:text-black dark:placeholder:text-white/30`}
        {...props}
      />
    </div>
  </div>
);

// 5. TextAreaField: ฟิลด์กรอกข้อความแบบหลายบรรทัด (เพิ่มเข้ามาใหม่)
export const TextAreaField = ({ label, value, onChange, placeholder, icon: Icon, ...props }) => (
  <div className="flex flex-col gap-2 w-full font-sans group">
    {label && (
      <label className="text-xs font-medium text-black dark:text-white ml-1">
        {label}
      </label>
    )}
    <div className="relative flex">
      {/* ปรับตำแหน่งไอคอนให้อยู่ด้านบนซ้ายของกล่องข้อความ */}
      {Icon && <Icon size={18} className="absolute left-4 top-[18px] text-black dark:text-white group-focus-within:text-red-500 transition-colors" />}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        // เพิ่ม resize-none ไม่ให้ดึงยืดได้, กำหนดความสูงเริ่มต้น (min-h-[100px]) และการจัดการ Scrollbar
        className={`w-full ${Icon ? 'pl-11' : 'px-5'} py-4 rounded-[16px] border-2 border-gray-100 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 outline-none focus:bg-white dark:focus:bg-gray-600 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 text-base font-bold text-red-600 dark:text-red-400 transition-all placeholder:text-gray-400 dark:placeholder:text-white/30 resize-none min-h-[110px] custom-scrollbar`}
        {...props}
      />
    </div>
  </div>
);