import React from "react";
import {
  Loader2,
  AlertCircle,
  User,
  Clock,
  Users,
  FileText,
  ChevronLeft,
  CalendarDays
} from "lucide-react";
import Button from "../common/Button.jsx";
import LoadingSpinner from "../common/LoadingSpinner";

export const LoadingState = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-[#F8F9FA] dark:bg-gray-900 font-sans">
    <LoadingSpinner text="กำลังซิงค์ข้อมูล..." />
  </div>
);

// 2. ErrorState: หน้าแจ้งเตือนข้อผิดพลาด
export const ErrorState = ({ message, onBack }) => (
  <div className="h-screen flex flex-col items-center justify-center p-8 bg-[#FFFFFF] text-center font-sans">
    <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 rotate-3 shadow-lg shadow-red-100">
      <AlertCircle size={48} strokeWidth={2.5} />
    </div>
    <h2 className="text-3xl font-black text-[#302782] mb-3 tracking-tight">เกิดข้อผิดพลาด</h2>
    <p className="text-base sm:text-lg font-bold text-gray-400 mb-12 max-w-sm mx-auto leading-relaxed">
      {message || "สเเกนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"}
    </p>
    <Button
      onClick={onBack}
      variant="secondary"
      className="w-full max-w-xs py-5 rounded-[22px] text-lg font-black shadow-xl"
    >
      <ChevronLeft size={20} className="mr-2" />
      <span>กลับไปหน้าสแกน</span>
    </Button>
  </div>
);

// 3. CurrentBookingCard: การ์ดสถานะปัจจุบัน (เน้น Impact)
export const CurrentBookingCard = ({ item, isAvailable, capacity }) => (
  <div
    className={`rounded-[40px] p-6 sm:p-10 border-2 transition-all duration-500 shadow-[0_15px_45px_-15px_rgba(0,0,0,0.08)] ${
      !isAvailable
        ? "bg-[#FFFFFF] dark:bg-white/5 border-red-100 dark:border-white/10"
        : "bg-[#FFFFFF] dark:bg-white/5 border-[#B2BB1E]/20 dark:border-white/10"
    } animate-in fade-in zoom-in-95 duration-500`}
  >
    <div className="flex justify-between items-start mb-8 sm:mb-12">
      <div>
        <h3 className="font-black text-[10px] sm:text-xs text-gray-400 uppercase tracking-[0.2em] mb-1">
          Current Status
        </h3>
        <p className={`text-xl sm:text-2xl font-black ${!isAvailable ? "text-red-500" : "text-[#B2BB1E]"}`}>
          {!isAvailable ? "มีการใช้งานอยู่" : "พร้อมสำหรับการจอง"}
        </p>
      </div>
      <div
        className={`px-5 py-2.5 rounded-2xl text-[#FFFFFF] text-xs sm:text-xs font-black uppercase tracking-widest transition-all ${
          !isAvailable
            ? "bg-red-500 shadow-lg shadow-red-200"
            : "bg-[#B2BB1E] shadow-lg shadow-[#B2BB1E]/20"
        }`}
      >
        {!isAvailable ? "Occupied" : "Available"}
      </div>
    </div>

    {!isAvailable && item ? (
      <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-4 duration-700">
        {/* เวลา */}
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#302782]/5 dark:bg-white/5 rounded-[28px] flex items-center justify-center text-[#302782] dark:text-white border border-[#302782]/5 dark:border-white/10 flex-shrink-0">
            <Clock size={32} strokeWidth={2.5} className="sm:w-10 sm:h-10" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">ช่วงเวลาที่จอง</p>
            <p className="text-2xl sm:text-4xl font-black text-[#302782] tracking-tight">
              {item.start_time} - {item.end_time} <span className="text-lg text-gray-300 ml-1 font-bold">น.</span>
            </p>
          </div>
        </div>

        {/* ผู้จอง & จำนวนคน */}
        <div className="flex gap-3 sm:gap-6">
          <div className="flex-[2] min-w-0 bg-gray-50/70 dark:bg-white/5 p-5 rounded-[28px] border border-gray-100 dark:border-white/10 group transition-all">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">ผู้รับผิดชอบ</p>
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white dark:bg-white/10 rounded-lg shadow-sm">
                <User size={16} className="text-[#B2BB1E]" />
              </div>
              <p className="text-sm sm:text-lg font-black text-[#302782] dark:text-white truncate">
                {item.full_name}
              </p>
            </div>
          </div>

          <div className="flex-[1] min-w-0 bg-gray-50/70 dark:bg-white/5 p-5 rounded-[28px] border border-gray-100 dark:border-white/10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">จำนวนคน</p>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <Users size={16} className="text-[#B2BB1E]" />
              <p className="text-sm sm:text-lg font-black text-[#302782] dark:text-white">
                {item.student_count || capacity || 0}
              </p>
            </div>
          </div>
        </div>

        {/* วัตถุประสงค์ (ใช้พื้นหลังเข้มเพื่อความเด่น) */}
        <div className="bg-[#302782] p-6 sm:p-8 rounded-[32px] text-[#FFFFFF] shadow-[0_20px_40px_-15px_rgba(48,39,130,0.3)] relative overflow-hidden group">
          <FileText size={80} className="absolute -right-4 -bottom-4 text-white/5 rotate-12 transition-transform group-hover:scale-110" />
          <p className="text-[10px] font-black text-[#FFFFFF]/50 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
             วัตถุประสงค์การใช้งาน
          </p>
          <p className="text-base sm:text-xl font-bold leading-relaxed relative z-10">
            {item.purpose || "ไม่ระบุวัตถุประสงค์"}
          </p>
        </div>
      </div>
    ) : (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-[#B2BB1E]/10 dark:bg-[#B2BB1E]/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <CalendarDays size={40} className="text-[#B2BB1E]" />
        </div>
      </div>
    )}
  </div>
);

// 4. ScheduleItem: รายการ Timeline ตารางเวลา
export const ScheduleItem = ({ item, capacity }) => (
  <div className="flex items-center gap-4 sm:gap-8 p-5 sm:p-7 bg-[#FFFFFF] dark:bg-white/5 rounded-[32px] border border-gray-100 dark:border-white/10 transition-all hover:border-[#B2BB1E]/30 dark:hover:border-[#B2BB1E]/50 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)] group">
    {/* Time Slot */}
    <div className="flex flex-col items-center min-w-[85px] sm:min-w-[110px] border-r-2 border-dashed border-gray-100 dark:border-white/10 pr-5 sm:pr-8">
      <span className="text-lg sm:text-xl font-black text-[#302782] dark:text-white">
        {item.start_time}
      </span>
      <div className="h-4 w-[2px] bg-gray-100 dark:bg-white/10 my-1 rounded-full" />
      <span className="text-sm sm:text-base font-bold text-gray-400">
        {item.end_time}
      </span>
    </div>

    {/* Booking Info */}
    <div className="flex-grow min-w-0">
      <h4 className="text-base sm:text-xl font-black text-[#302782] dark:text-white mb-3 truncate group-hover:text-[#B2BB1E] transition-colors">
        {item.purpose || "รายการจองทั่วไป"}
      </h4>
      
      <div className="flex flex-wrap items-center gap-y-2 gap-x-5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 bg-gray-50 dark:bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-[#B2BB1E]" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 truncate max-w-[150px] sm:max-w-none">
            {item.full_name || `${item.first_name} ${item.last_name}`}
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-gray-100/50 dark:border-white/10">
          <Users size={14} className="text-[#302782] dark:text-[#B2BB1E]" />
          <span className="text-[10px] sm:text-xs font-black text-[#302782] dark:text-white uppercase">
            {capacity || 0} Seats
          </span>
        </div>
      </div>
    </div>
  </div>
);
