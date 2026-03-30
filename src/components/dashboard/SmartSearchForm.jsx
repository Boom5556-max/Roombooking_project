import React from "react";
import { Calendar, Clock, Users, ArrowRight, Search } from "lucide-react";

const SmartSearchForm = ({ searchQuery, setSearchQuery, onSubmit }) => {
  const baseTimes = [];
  for (let i = 8; i <= 20; i++) {
    const h = i.toString().padStart(2, "0");
    baseTimes.push(`${h}:00`);
    if (i !== 20) baseTimes.push(`${h}:30`);
  }

  const renderTimeDropdown = (key) => {
    const label = key === "start_time" ? "เวลาเริ่ม" : "เวลาสิ้นสุด";
    const availableTimes = baseTimes.filter((t) => {
      if (key === "end_time" && t === "08:00") return false;
      if (key === "start_time" && t === "20:00") return false;
      if (key === "end_time" && searchQuery.start_time) return t > searchQuery.start_time;
      if (key === "start_time" && searchQuery.end_time) return t < searchQuery.end_time;
      return true;
    });

    return (
      <div className="relative flex-1 min-w-0">
        <details className="group" id={`time-dropdown-${key}`}>
          <summary className="w-full bg-[#FFFFFF]/10 border border-[#FFFFFF]/10 rounded-xl h-[48px] pl-10 pr-4 flex items-center justify-between text-[#FFFFFF] outline-none text-xs font-bold cursor-pointer list-none hover:bg-white hover:text-[#302782]">
            <Clock className="absolute left-3 opacity-70" size={18} />
            <span>{searchQuery[key] || label}</span>
            <ArrowRight size={14} className="rotate-90 opacity-70 group-open:-rotate-90 transition-transform" />
          </summary>
          <ul className="absolute left-0 top-[calc(100%+8px)] w-full max-h-[200px] overflow-y-auto bg-white rounded-xl shadow-2xl z-50 py-2 border border-gray-100">
            {availableTimes.map((t) => (
              <li 
                key={t} 
                className="px-4 py-2 text-[#302782] text-sm font-bold hover:bg-[#B2BB1E] hover:text-white cursor-pointer"
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
    <div className="bg-[#302782] dark:bg-gray-800 rounded-[30px] p-6 sm:p-8 mb-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#B2BB1E] rounded-xl text-white"><Search size={18} /></div>
        <h3 className="text-lg font-bold text-white">จองห้องเรียน</h3>
      </div>
      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-[11px] text-gray-300 font-bold uppercase ml-2">วันที่เข้าใช้งาน</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" size={20} />
            <input 
              type="date" 
              required 
              className="w-full bg-white/10 border-white/10 rounded-xl h-[48px] pl-12 pr-4 text-white focus:bg-white focus:text-[#302782] outline-none font-bold"
              onChange={(e) => setSearchQuery({ ...searchQuery, date: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2 col-span-1">
          <label className="text-[11px] text-gray-300 font-bold uppercase ml-2">ช่วงเวลา</label>
          <div className="flex gap-2">
            {renderTimeDropdown("start_time")}
            {renderTimeDropdown("end_time")}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[11px] text-gray-300 font-bold uppercase ml-2">จำนวนนิสิต</label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="number" 
              placeholder="เช่น 50" 
              className="w-full bg-white/10 border-white/10 rounded-xl h-[48px] pl-11 text-white focus:bg-white focus:text-[#302782] outline-none font-bold"
              onChange={(e) => setSearchQuery({ ...searchQuery, capacity: e.target.value })}
            />
          </div>
        </div>
        <div className="flex items-end">
          <button type="submit" className="w-full bg-[#B2BB1E] hover:bg-white text-[#302782] font-bold h-[48px] rounded-xl flex items-center justify-center gap-2 transition-all">
            ค้นหาห้องว่าง <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default SmartSearchForm;