import React from "react";
import { Users, FileText, MapPin } from "lucide-react";

// 1. InfoRow: ปรับให้แบ่งสัดส่วนพื้นที่ (Grid-like) และมีเส้นคั่นเมื่อจอใหญ่
const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex flex-col md:flex-row md:items-center p-4 sm:p-5 rounded-2xl sm:rounded-[24px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300 group w-full">
    
    {/* Label Section: ใช้ % แทนความกว้างตายตัว เพื่อให้ยืดหยุ่นตามจอ */}
    <div className="flex items-center gap-4 w-full md:w-1/3 lg:w-1/4 shrink-0 mb-3 md:mb-0">
      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 text-[#302782] dark:text-[#B2BB1E] group-hover:bg-[#302782] dark:group-hover:bg-[#B2BB1E] group-hover:text-white dark:group-hover:text-black group-hover:scale-110 transition-all duration-300 shadow-sm">
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <span className="text-xs sm:text-sm font-black text-black dark:text-white uppercase tracking-wider">
        {label}
      </span>
    </div>

    {/* Value Section: ขยายเต็มพื้นที่ที่เหลือ และเพิ่มเส้นกั้น (border-l) บนจอคอม */}
    <div className="flex-grow pl-1 md:pl-8 md:border-l-2 md:border-gray-50 dark:md:border-gray-700 flex items-center min-h-[40px]">
      <p className="text-sm sm:text-base lg:text-lg font-black text-[#302782] dark:text-white leading-relaxed">
        {value || "ไม่ระบุข้อมูล"}
      </p>
    </div>
    
  </div>
);

const RoomInfo = ({ room }) => {
  if (!room) return null;

  return (
    <div className="w-full font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header ของ Section */}
      <div className="flex items-center gap-3 mb-4 ml-1">
        <div className="w-1.5 h-6 bg-[#B2BB1E] rounded-full shadow-sm" />
        <h2 className="text-lg sm:text-xl font-black text-[#302782] dark:text-white tracking-tight">
          รายละเอียดห้องเรียน
        </h2>
      </div>

      {/* กล่องข้อมูล เรียงแนวตั้ง */}
      <div className="flex flex-col gap-3 w-full">
        <InfoRow 
          label="ความจุห้องเรียน" 
          value={`${room.capacity} ที่นั่ง`} 
          icon={Users} 
        />
        <InfoRow 
          label="ลักษณะการใช้งาน" 
          value={room.description || room.room_characteristics} 
          icon={FileText} 
        />
        <InfoRow 
          label="สถานที่ตั้ง" 
          value={room.location} 
          icon={MapPin} 
        />
      </div>
      
    </div>
  );
};

export default RoomInfo;