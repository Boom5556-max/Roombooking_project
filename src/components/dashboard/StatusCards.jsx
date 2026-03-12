import React from "react";

const StatusCard = ({ label, value }) => (
  /* 1. ปรับ Padding: มือถือ p-6, จอใหญ่ขึ้น p-8
    2. ปรับความสูง: ให้สมดุลในทุกอุปกรณ์
  */
  <div className="bg-[#FFFFFF] dark:bg-gray-800 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden group transition-all hover:shadow-lg">
    {/* Accent Element */}
    <div className="absolute top-0 inset-x-0 h-1 bg-[#B2BB1E] opacity-30 group-hover:opacity-100 transition-opacity" />
    
    <p className="text-gray-400 font-bold text-[10px] sm:text-xs mb-1 sm:mb-2 text-center uppercase tracking-wider">
      {label}
    </p>
    <span className="text-[#302782] dark:text-white text-4xl sm:text-5xl font-black leading-none">
      {value}
    </span>
  </div>
);

const StatusCards = ({ role, roomCount, pendingCount, approvedCount }) => {
  const isStaff = role === "staff" || role === "teacher";
  
  return (
    /* Logic การจัดวาง:
       - มือถือ (Default): 1 คอลัมน์ (เรียงลงมา)
       - แท็บเล็ต (sm): 2 คอลัมน์ (ถ้าเป็น Staff)
       - จอคอม (lg): 3 คอลัมน์ (เรียงหน้ากระดาน)
    */
    <div className={`grid gap-4 sm:gap-6 mb-8 w-full 
      ${isStaff 
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
        : "grid-cols-1"
      }`}>
      
      <StatusCard label="ห้องเรียนทั้งหมด" value={roomCount} />
      
      {isStaff && (
        <>
          {/* บนหน้าจอ Tablet (sm) รายการที่ 2 และ 3 จะอยู่บรรทัดเดียวกัน */}
          <StatusCard label="รายการที่รออนุมัติ" value={pendingCount} />
          <StatusCard label="รายการที่อนุมัติแล้ว" value={approvedCount} />
        </>
      )}
    </div>
  );
};

export default StatusCards;