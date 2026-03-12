import React from "react";
import { X, Info, User, Clock, MapPin, AlertCircle } from "lucide-react";

const EventModal = ({ event, onClose }) => {
  if (!event) return null;

  const title = event.title || event._def?.title || "ไม่มีหัวข้อ";
  const props = event.extendedProps || event._def?.extendedProps || {};

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#302782]/30 dark:bg-black/40 backdrop-blur-md font-sans transition-all"
      onClick={onClose}
    >
      <div
        className="bg-[#FFFFFF] dark:bg-gray-800 w-full sm:max-w-sm rounded-t-[40px] sm:rounded-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.2)] overflow-hidden border-t sm:border border-white dark:border-gray-700 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Handle Bar (แถบเล็กๆ ด้านบนให้ความรู้สึกเหมือนแอป iOS/Android) */}
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mt-4 mb-2 sm:hidden" />

        {/* Header */}
        <div className="px-6 sm:px-8 pt-4 sm:pt-8 pb-4 flex justify-between items-center border-b border-gray-50 dark:border-gray-700">
          <h3 className="font-bold text-lg sm:text-xl text-[#302782] dark:text-white flex items-center gap-3">
            <div className="p-2 bg-[#B2BB1E]/10 rounded-xl">
               <Info size={22} className="text-[#B2BB1E]" />
            </div>
            รายละเอียด
          </h3>
          <button
            onClick={onClose}
            className="p-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full text-gray-400 transition-colors active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Section: เพิ่มการจัดการ Scroll กรณีเนื้อหายาว */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="mb-8">
            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              วิชา / วัตถุประสงค์
            </p>
            <h4 className="text-[#302782] dark:text-white font-extrabold text-xl sm:text-2xl leading-tight">
              {title}
            </h4>
          </div>

          <div className="space-y-6">
            {/* รายการข้อมูลแบบ Grid-like list */}
            <InfoRow 
                icon={<MapPin size={20} />} 
                label="สถานที่ / ห้องเรียน" 
                value={props.room_id || "ไม่ระบุเลขห้อง"} 
                color="text-[#B2BB1E]"
            />

            <InfoRow 
                icon={<User size={20} />} 
                label="ผู้สอน / ผู้จอง" 
                value={props.teacher || "ไม่ระบุอาจารย์"} 
            />

            <div className="flex items-start gap-4 group">
              <div className="bg-gray-50 dark:bg-gray-700 p-3.5 rounded-2xl text-[#302782] dark:text-white border border-gray-100 dark:border-gray-600 shrink-0 group-hover:bg-[#302782] group-hover:text-white transition-colors">
                <Clock size={20} />
              </div>
              <div className="pt-0.5">
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase mb-1">วันและเวลา</p>
                <p className="text-sm sm:text-base font-bold text-[#302782] dark:text-white">
                  {props.fullDate || "ไม่ระบุวันที่"}
                </p>
                <div className="inline-block bg-[#B2BB1E]/10 px-3 py-1 rounded-lg mt-2">
                    <p className="text-sm font-black text-[#B2BB1E]">
                      {props.startTime || "--:--"} - {props.endTime || "--:--"} น.
                    </p>
                </div>
              </div>
            </div>

            {/* สถานะงดใช้ห้อง (Alert Box) */}
            {props.temporarily_closed && (
              <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 animate-pulse">
                <div className="bg-red-500 p-2 rounded-full text-white shrink-0">
                    <AlertCircle size={18} />
                </div>
                <p className="text-red-600 text-xs sm:text-sm font-bold">
                  ขออภัย คาบเรียนนี้ถูกแจ้งงดใช้ห้องชั่วคราว
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Button (เฉพาะมือถือจะแสดงเด่นขึ้น) */}
        <div className="p-6 bg-gray-50/50 dark:bg-gray-700/50 sm:hidden">
            <button 
                onClick={onClose}
                className="w-full bg-[#302782] text-white font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all"
            >
                ปิดหน้าต่าง
            </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 10px;
        }
        @keyframes slide-in-bottom {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-in {
          animation: slide-in-bottom 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Helper Component สำหรับแสดงแถวข้อมูล
const InfoRow = ({ icon, label, value, color = "text-[#302782]" }) => (
    <div className="flex items-start gap-4 group">
      <div className={`bg-gray-50 dark:bg-gray-700 p-3.5 rounded-2xl ${color} border border-gray-100 dark:border-gray-600 shrink-0 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="pt-0.5">
        <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase mb-1">{label}</p>
        <p className={`text-sm sm:text-base font-bold ${color === 'text-[#B2BB1E]' ? 'text-[#302782] dark:text-white' : color}`}>
          {value}
        </p>
      </div>
    </div>
);

export default EventModal;