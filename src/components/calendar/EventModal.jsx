import React from "react";
import { X, Info, User, Clock, MapPin, AlertCircle } from "lucide-react";

const EventModal = ({ event, onClose }) => {
  if (!event) return null;

  const title = event.title || event._def?.title || "ไม่มีหัวข้อ";
  const props = event.extendedProps || event._def?.extendedProps || {};

  // รวมชื่อ-นามสกุลอาจารย์
  const teacherFullname = props.teacher_name 
    ? `${props.teacher_name} ${props.teacher_surname && props.teacher_surname !== '-' ? props.teacher_surname : ""}` 
    : "ไม่ระบุอาจารย์";

  // 🚩 ฟังก์ชันแปลงวันที่ YYYY-MM-DD เป็นรูปแบบภาษาไทย (เช่น 6 เม.ย. 2569)
  const getThaiDate = (dateString) => {
    if (!dateString) return "ไม่ระบุวันที่";
    try {
      const parts = dateString.split('T')[0].split('-');
      if (parts.length !== 3) return dateString;
      const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      return `${parseInt(parts[2])} ${months[parseInt(parts[1]) - 1]} ${parseInt(parts[0]) + 543}`;
    } catch (e) {
      return dateString;
    }
  };

  // 🚩 ดึง displayDate ที่เราแก้ปัญหา Timezone แล้วมาใช้เป็นหลัก ถ้าไม่มีค่อยใช้ date
  const rawDateStr = props.displayDate || props.date;
  const formattedDate = rawDateStr ? getThaiDate(rawDateStr) : "ไม่ระบุวันที่";

  // จัดรูปแบบเวลา
  const formatTime = (time) => {
    if (!time) return "--:--";
    return time.length > 5 ? time.substring(0, 5) : time;
  };

  // เช็คเงื่อนไขการงดใช้ห้องหรือยกเลิก
  const isClosed = props.temporarily_closed === true || props.status === 'cancelled';

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#302782]/30 dark:bg-black/40 backdrop-blur-md font-sans transition-all"
      onClick={onClose}
    >
      <div
        className="bg-[#FFFFFF] dark:bg-gray-800 w-full sm:max-w-sm rounded-t-[40px] sm:rounded-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.2)] overflow-hidden border-t sm:border border-white dark:border-gray-700 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mt-4 mb-2 sm:hidden" />

        {/* Header */}
        <div className="px-6 sm:px-8 pt-4 sm:pt-8 pb-4 flex justify-between items-center border-b border-gray-50 dark:border-gray-700">
          <h3 className="font-bold text-lg sm:text-xl text-[#302782] dark:text-white flex items-center gap-3">
            <div className="p-2 bg-[#B2BB1E]/10 rounded-xl">
               <Info size={22} className="text-[#B2BB1E]" />
            </div>
            รายละเอียด
          </h3>
          <button onClick={onClose} className="p-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full text-gray-400 transition-colors active:scale-90">
            <X size={20} />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="mb-8">
            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              {props.booking_id ? "รายการจองห้อง" : "วิชา / วัตถุประสงค์"}
            </p>
            <h4 className="text-[#302782] dark:text-white font-extrabold text-xl sm:text-2xl leading-tight">
              {title}
            </h4>
          </div>

          <div className="space-y-6">
            <InfoRow 
                icon={<MapPin size={20} />} 
                label="สถานที่ / ห้องเรียน" 
                value={props.room_id || "ไม่ระบุเลขห้อง"} 
                color="text-[#B2BB1E]"
            />

            <InfoRow 
                icon={<User size={20} />} 
                label="ผู้สอน / ผู้จอง" 
                value={teacherFullname} 
            />

            <div className="flex items-start gap-4 group">
              <div className="bg-gray-50 dark:bg-gray-700 p-3.5 rounded-2xl text-[#302782] dark:text-white border border-gray-100 shrink-0">
                <Clock size={20} />
              </div>
              <div className="pt-0.5">
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase mb-1">วันและเวลา</p>
                <p className="text-sm sm:text-base font-bold text-[#302782] dark:text-white">
                  {formattedDate}
                </p>
                <div className="inline-block bg-[#B2BB1E]/10 px-3 py-1 rounded-lg mt-2">
                    <p className="text-sm font-black text-[#B2BB1E]">
                      {formatTime(props.start_time)} - {formatTime(props.end_time)} น.
                    </p>
                </div>
              </div>
            </div>

            {/* ส่วนแจ้งเตือน: แสดงเฉพาะเมื่อมีการงดใช้ห้องหรือยกเลิกเท่านั้น */}
            {isClosed && (
              <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 animate-pulse">
                <div className="bg-red-500 p-2 rounded-full text-white shrink-0">
                    <AlertCircle size={18} />
                </div>
                <p className="text-red-600 text-xs sm:text-sm font-bold">
                  {props.status === 'cancelled' ? 'รายการนี้ถูกแจ้งงดใช้ห้อง' : 'รายการนี้ถูกแจ้งงดใช้ห้อง'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-gray-50/50 dark:bg-gray-700/50 sm:hidden">
            <button onClick={onClose} className="w-full bg-[#302782] text-white font-bold py-4 rounded-2xl shadow-lg">
                ปิดหน้าต่าง
            </button>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value, color = "text-[#302782]" }) => {
  const defaultSyncedColor = "text-[#302782] dark:text-blue-300";
  const isSpecialColor = color === 'text-[#B2BB1E]';

  return (
    <div className="flex items-start gap-4 group">
      <div className={`bg-gray-50 dark:bg-gray-700 p-3.5 rounded-2xl ${isSpecialColor ? color : defaultSyncedColor} border border-gray-100 dark:border-gray-600 shrink-0`}>
        {icon}
      </div>
      <div className="pt-0.5">
        <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase mb-1">{label}</p>
        <p className={`text-sm sm:text-base font-bold ${isSpecialColor ? 'text-[#302782] dark:text-white' : defaultSyncedColor}`}>
          {value}
        </p>
      </div>
    </div>
);
};

export default EventModal;