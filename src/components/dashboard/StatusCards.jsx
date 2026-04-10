import React from "react";
import { Building2, Clock, CheckCircle2 } from "lucide-react";

const StatusCards = ({ role, roomCount, pendingCount, approvedCount }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
      
      {/* Card 1: ห้องเรียนทั้งหมด (สีน้ำเงิน) */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-all hover:shadow-md">
        <div>
          <p className="text-gray-500 text-xs font-bold mb-1">ห้องเรียนทั้งหมด</p>
          {/* 🚩 สีน้ำเงิน #302782 */}
          <h3 className="text-4xl font-black text-[#302782] dark:text-blue-400">
            {roomCount || 0}
          </h3>
        </div>
        <div className="bg-[#302782]/10 p-4 rounded-[20px]">
          <Building2 size={26} className="text-[#302782] dark:text-blue-400" />
        </div>
      </div>

      {/* Card 2: รออนุมัติ (สีส้ม) - เฉพาะ Staff / Teacher */}
      {(role === "staff" || role === "teacher") && (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-gray-500 text-xs font-bold mb-1">คำขอรออนุมัติ</p>
            {/* 🚩 สีส้ม (Warning) */}
            <h3 className="text-4xl font-black text-orange-500 dark:text-orange-400">
              {pendingCount || 0}
            </h3>
          </div>
          <div className="bg-orange-50 dark:bg-orange-500/10 p-4 rounded-[20px]">
            <Clock size={26} className="text-orange-500 dark:text-orange-400" />
          </div>
        </div>
      )}

      {/* Card 3: อนุมัติแล้ว (สีเขียว) - เฉพาะ Staff / Teacher */}
      {(role === "staff" || role === "teacher") && (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-gray-500 text-xs font-bold mb-1">อนุมัติแล้ว</p>
            {/* 🚩 สีเขียว #B2BB1E */}
            <h3 className="text-4xl font-black text-[#B2BB1E] dark:text-[#c5cf23]">
              {approvedCount || 0}
            </h3>
          </div>
          <div className="bg-[#B2BB1E]/10 p-4 rounded-[20px]">
            <CheckCircle2 size={26} className="text-[#B2BB1E] dark:text-[#c5cf23]" />
          </div>
        </div>
      )}

    </div>
  );
};

export default StatusCards;