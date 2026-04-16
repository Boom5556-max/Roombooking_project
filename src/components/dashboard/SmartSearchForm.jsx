import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users, ArrowRight, Search, Settings } from "lucide-react";
import { getBookingScope } from "../../api/bookingScope";

const SmartSearchForm = ({ searchQuery, setSearchQuery, onSubmit, role, onOpenScope, scope }) => {
  // Use a fallback scope while loading or if not provided
  const currentScope = scope || {
    opening_mins: 480,
    closing_mins: 1200,
    max_advance_days: 10,
    min_advance_hours: 1
  };

  // คำนวณขอบเขตวันที่ (Min/Max)
  const now = new Date();
  
  const formatDateForInput = (date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const d = date.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const minDate = new Date(now.getTime() + (currentScope.min_advance_hours || 0) * 60 * 60 * 1000);
  const minDateStr = formatDateForInput(minDate);
  
  const maxDate = new Date(now.getTime() + (currentScope.max_advance_days || 0) * 24 * 60 * 60 * 1000);
  const maxDateStr = formatDateForInput(maxDate);

  const isStaffExempt = role === "staff";

  const effectiveMinDateStr = isStaffExempt ? formatDateForInput(now) : minDateStr;
  const effectiveMaxDateStr = isStaffExempt ? "" : maxDateStr;

  // ตรวจสอบว่าวันที่เลือกอยู่ยัง Valid หรือไม่ ถ้าไม่ให้เลื่อนไปวันที่เร็วที่สุดที่เลือกได้
  useEffect(() => {
    if (!isStaffExempt) {
      if (searchQuery.date && searchQuery.date < minDateStr) {
        setSearchQuery(prev => ({ ...prev, date: minDateStr }));
      } else if (searchQuery.date && searchQuery.date > maxDateStr) {
        setSearchQuery(prev => ({ ...prev, date: maxDateStr }));
      }
    }
  }, [minDateStr, maxDateStr, searchQuery.date, isStaffExempt]);

  const baseTimes = [];
  const startHour = Math.floor(currentScope.opening_mins / 60);
  const endHour = Math.floor(currentScope.closing_mins / 60);
  const startMin = currentScope.opening_mins % 60;

  for (let i = startHour; i <= endHour; i++) {
    const h = i.toString().padStart(2, "0");
    if (i === startHour) {
      if (startMin === 0) {
        baseTimes.push(`${h}:00`);
        baseTimes.push(`${h}:30`);
      } else if (startMin <= 30) {
        baseTimes.push(`${h}:30`);
      }
    } else if (i === endHour) {
      baseTimes.push(`${h}:00`);
      if (currentScope.closing_mins % 60 >= 30) {
        baseTimes.push(`${h}:30`);
      }
    } else {
      baseTimes.push(`${h}:00`);
      baseTimes.push(`${h}:30`);
    }
  }
  

  const renderTimeDropdown = (key) => {
    const label = key === "start_time" ? "เวลาเริ่ม" : "เวลาสิ้นสุด";
    const availableTimes = baseTimes.filter((t) => {
      // Basic boundaries
      if (key === "end_time" && t === baseTimes[0]) return false;
      if (key === "start_time" && t === baseTimes[baseTimes.length - 1]) return false;

      // กรองตาม min_advance_hours (เช็คทุกวัน ไม่ใช่แค่ Today) - ยกเว้นเฉพาะระดับ Staff/Admin
      if (!isStaffExempt && searchQuery.date) {
        const [h, m] = t.split(":").map(Number);
        const bookingDateTime = new Date(searchQuery.date);
        bookingDateTime.setHours(h, m, 0, 0);
        
        const diffMs = bookingDateTime - now;
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < (currentScope.min_advance_hours || 0)) return false;
      }

      // Range validation
      if (key === "end_time" && searchQuery.start_time) return t > searchQuery.start_time;
      if (key === "start_time" && searchQuery.end_time) return t < searchQuery.end_time;
      return true;
    });

    return (
      <div className="relative flex-1 min-w-0">
        <details className="group" id={`time-dropdown-${key}`}>
          <summary className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-500 rounded-[16px] h-[56px] pl-12 pr-5 flex items-center justify-between text-[#302782] dark:text-white outline-none text-sm font-bold cursor-pointer list-none focus:bg-white dark:focus:bg-gray-800 focus:border-[#302782]/20 dark:focus:border-gray-500 transition-all">
            <Clock className="absolute left-4 text-black dark:text-white" size={20} />
            <span className="truncate">{searchQuery[key] || label}</span>
            <ArrowRight size={16} className="rotate-90 text-black dark:text-white group-open:-rotate-90 transition-transform flex-shrink-0" />
          </summary>
          <ul className="absolute left-0 top-[calc(100%+8px)] w-full max-h-[220px] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 py-2 border border-gray-200 dark:border-gray-700">
            {availableTimes.map((t) => (
              <li 
                key={t} 
                className="px-5 py-3 text-[#302782] dark:text-white text-sm font-bold hover:bg-[#B2BB1E] hover:text-white cursor-pointer transition-colors"
                onClick={() => {
                  setSearchQuery({ ...searchQuery, [key]: t });
                  document.getElementById(`time-dropdown-${key}`).removeAttribute("open");
                }}
              >
                {t} น.
              </li>
            ))}
          </ul>
        </details>
      </div>
    );
  };



  return (
    <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col justify-between transition-colors">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-[#302782]/10 dark:bg-[#B2BB1E]/20 rounded-2xl text-[#302782] dark:text-[#B2BB1E]">
            <Search size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#302782] dark:text-white leading-tight">ค้นหาห้องว่าง</h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-black dark:text-white text-xs font-medium">ระบุเวลาและจำนวนคนเพื่อกรองห้อง</p>
              
              {/* Settings Button for Admin/Staff */}
              {role === "staff" && (
                <button 
                  type="button"
                  onClick={onOpenScope}
                  className="flex items-center px-4 py-2 bg-[#B2BB1E]/10 dark:bg-[#B2BB1E]/20 hover:bg-[#B2BB1E] text-[#302782] dark:text-[#B2BB1E] hover:text-white dark:hover:text-white rounded-xl text-xs font-black transition-all active:scale-95 border border-[#B2BB1E]/30 shadow-sm ml-2"
                  title="ตั้งค่าเงื่อนไขการจอง"
                >
                  ตั้งค่าเงื่อนไขการจอง
                </button>
              )}
            </div>
          </div>
        </div>
        
        <form onSubmit={onSubmit} className="flex flex-col gap-5 h-full">
          
          {/* แถวที่ 1: วันที่ & จำนวนนิสิต */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-black dark:text-white ml-2 uppercase tracking-wide">วันที่เข้าใช้งาน</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-white" size={20} />
                <input 
                  type="date"
                  min={effectiveMinDateStr}
                  max={effectiveMaxDateStr}
                  value={searchQuery.date}
                  onChange={(e) => setSearchQuery({ ...searchQuery, date: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-500 rounded-[16px] h-[56px] pl-12 pr-5 text-[#302782] dark:text-white outline-none text-sm font-bold focus:bg-white dark:focus:bg-gray-800 focus:border-[#302782]/20 dark:focus:border-gray-500 transition-all [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-black dark:text-white ml-2 uppercase tracking-wide">จำนวนนิสิต</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-white" size={18} />
                <input 
                  type="number" 
                  min="1" 
                  max="200" 
                  value={searchQuery.capacity}
                  placeholder="เช่น 50" 
                  className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-500 focus:bg-white dark:focus:bg-gray-800 focus:border-[#302782]/20 dark:focus:border-gray-500 rounded-[16px] h-[56px] pl-12 pr-4 text-[#302782] dark:text-white outline-none font-bold transition-all placeholder:text-gray-400 dark:placeholder:text-white/30"
                  onKeyDown={(e) => {
                    if (["-", "+", "e", "E", "."].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    let sanitizedValue = e.target.value.replace(/[^0-9]/g, "");
                    if (sanitizedValue !== "" && parseInt(sanitizedValue, 10) > 200) {
                      sanitizedValue = "200";
                    }
                    setSearchQuery({ ...searchQuery, capacity: sanitizedValue });
                    e.target.value = sanitizedValue;
                  }}
                />
              </div>
            </div>
          </div>

          {/* แถวที่ 2: ช่วงเวลา */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-black dark:text-white ml-2 uppercase tracking-wide">ช่วงเวลา (เวลาเริ่ม - สิ้นสุด)</label>
            <div className="flex flex-col sm:flex-row gap-3">
              {renderTimeDropdown("start_time")}
              {/* ขีดกลางคั่นเวลา */}
              <div className="hidden sm:flex items-center justify-center text-black dark:text-white font-black">
                -
              </div>
              {renderTimeDropdown("end_time")}
            </div>
          </div>

          {/* แถวที่ 3: ปุ่มค้นหา */}
          <div className="pt-2 mt-auto">
            <button type="submit" className="w-full bg-[#B2BB1E] hover:bg-[#302782] dark:hover:bg-white dark:hover:text-[#302782] text-white font-black h-[60px] text-lg rounded-[16px] flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]">
              เริ่มค้นหาห้องว่าง <ArrowRight size={22} />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SmartSearchForm;