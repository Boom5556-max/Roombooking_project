import React from "react";
import { Clock, CheckCircle2, XCircle, ChevronRight, Hash } from "lucide-react";

// 1. BookingCard: การ์ดรายการแต่ละแถว
export const BookingCard = ({ req, variant, onClick, getFullName }) => {
  const styles = {
    pending: {
      borderColor: "border-gray-100 dark:border-gray-600",
      statusColor: "text-[#302782] dark:text-[#B2BB1E]",
      bgColor: "bg-[#302782]/5 dark:bg-[#302782]/20",
      Icon: Clock,
      label: "รออนุมัติ"
    },
    approved: {
      borderColor: "border-[#B2BB1E]/20 dark:border-[#B2BB1E]/40",
      statusColor: "text-[#B2BB1E]",
      bgColor: "bg-[#B2BB1E]/5 dark:bg-[#B2BB1E]/10",
      Icon: CheckCircle2,
      label: "อนุมัติแล้ว"
    },
    rejected: {
      borderColor: "border-red-100 dark:border-red-900/30",
      statusColor: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      Icon: XCircle,
      label: "ไม่อนุมัติ"
    },
    cancelled: {
      borderColor: "border-gray-100 dark:border-gray-600",
      statusColor: "text-gray-400 dark:text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-700/50",
      Icon: XCircle,
      label: "ยกเลิกแล้ว"
    },
    class_cancelled: {
      borderColor: "border-orange-100 dark:border-orange-900/30",
      statusColor: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      Icon: Hash,
      label: "ยกเลิกคลาส"
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
            <span className="text-gray-300"></span>{req.room_id || "---"}
          </h3>
          
          {/* Badge */}
          <span className={`text-[10px] font-black uppercase tracking-tighter py-1 px-3 rounded-lg ${bgColor} ${statusColor} border border-transparent`}>
            {label}
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          <p className="text-xs sm:text-sm font-bold text-gray-500 truncate">
            {getFullName(req)}
          </p>
          <span className="hidden sm:inline text-gray-200">•</span>
          <p className="text-[10px] sm:text-xs font-medium text-gray-400">
            {req.date ? new Date(req.date).toLocaleDateString('th-TH') : "ไม่ระบุวันที่"}
          </p>
        </div>
      </div>
      
      {/* Arrow Icon */}
      <div className="hidden sm:flex w-10 h-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-600 text-gray-300 group-hover:text-[#302782] dark:group-hover:text-[#B2BB1E] group-hover:bg-gray-100 dark:group-hover:bg-gray-500 transition-all">
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
  <div className="flex items-center gap-4 p-4 bg-[#FFFFFF] dark:bg-gray-700 rounded-[20px] border border-gray-50 dark:border-gray-600 shadow-sm transition-all hover:border-[#B2BB1E]/30">
    <div className="text-[#302782] dark:text-[#B2BB1E] bg-gray-50 dark:bg-gray-600 p-2.5 rounded-xl flex-shrink-0">
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
        {label}
      </p>
      <p className="text-sm sm:text-base font-bold text-[#302782] dark:text-white leading-tight truncate">
        {value || "-"}
      </p>
    </div>
  </div>
);

// 4. EditField: ฟิลด์กรอกข้อมูล (ใช้ร่วมกับ Input หลัก)
export const EditField = ({ label, value, onChange, type = "text", icon: Icon, ...props }) => (
  <div className="flex flex-col gap-2 w-full font-sans group">
    <label className="text-xs font-medium text-gray-400 ml-1">
      {label}
    </label>
    <div className="relative flex items-center">
      {Icon && <Icon size={18} className="absolute left-4 text-gray-400 group-focus-within:text-[#B2BB1E] transition-colors" />}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${Icon ? 'pl-11' : 'px-5'} py-4 rounded-[16px] border-2 border-gray-50 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700 outline-none focus:bg-white dark:focus:bg-gray-600 focus:border-[#B2BB1E] focus:ring-4 focus:ring-[#B2BB1E]/10 text-base font-bold text-[#302782] dark:text-white transition-all placeholder:text-gray-300`}
        {...props}
      />
    </div>
  </div>
);

// 5. TextAreaField: ฟิลด์กรอกข้อความแบบหลายบรรทัด (เพิ่มเข้ามาใหม่)
export const TextAreaField = ({ label, value, onChange, placeholder, icon: Icon, ...props }) => (
  <div className="flex flex-col gap-2 w-full font-sans group">
    {label && (
      <label className="text-xs font-medium text-gray-400 ml-1">
        {label}
      </label>
    )}
    <div className="relative flex">
      {/* ปรับตำแหน่งไอคอนให้อยู่ด้านบนซ้ายของกล่องข้อความ */}
      {Icon && <Icon size={18} className="absolute left-4 top-[18px] text-gray-400 group-focus-within:text-[#B2BB1E] transition-colors" />}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        // เพิ่ม resize-none ไม่ให้ดึงยืดได้, กำหนดความสูงเริ่มต้น (min-h-[100px]) และการจัดการ Scrollbar
        className={`w-full ${Icon ? 'pl-11' : 'px-5'} py-4 rounded-[16px] border-2 border-gray-50 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700 outline-none focus:bg-white dark:focus:bg-gray-600 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 text-base font-bold text-[#302782] dark:text-white transition-all placeholder:text-gray-300 resize-none min-h-[110px] custom-scrollbar`}
        {...props}
      />
    </div>
  </div>
);