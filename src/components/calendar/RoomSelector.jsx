import React from "react";
import { ChevronDown, DoorOpen } from "lucide-react";

const RoomSelector = ({ rooms, selectedRoom, onSelect, disabled }) => {
  return (
    <div className="flex flex-col flex-none font-sans w-full md:w-auto">
      {/* Label: ปรับขนาดฟอนต์ให้เข้ากับอุปกรณ์ */}
      <label className="text-[10px] sm:text-xs font-bold text-gray-400 mb-2 ml-1 flex items-center gap-2 uppercase tracking-wider">
        <DoorOpen size={14} className={`transition-colors ${disabled ? 'text-gray-400' : 'text-[#B2BB1E]'}`} />
        เลือกห้องเรียน
      </label>

      <div className="relative w-full md:max-w-[280px]">
        <select
          value={selectedRoom || ""}
          onChange={(e) => onSelect(e.target.value)}
          // 🚩 2. ใส่ attribute disabled
          disabled={disabled}
          // 🚩 3. ปรับ ClassName แบบมีเงื่อนไข (ถ้า disabled ให้เป็นสีเทาและกดไม่ได้)
          className={`w-full text-sm sm:text-base font-bold rounded-[16px] sm:rounded-[20px] py-3.5 sm:py-4 px-4 sm:px-5 appearance-none outline-none transition-all ${
            disabled
              ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600 cursor-not-allowed opacity-70"
              : "bg-[#FFFFFF] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#302782] dark:text-white cursor-pointer focus:border-[#B2BB1E] focus:ring-4 focus:ring-[#B2BB1E]/10 shadow-sm hover:border-gray-300 active:scale-[0.99]"
          }`}
        >
          <option value="" className="text-gray-400">
            ห้องเรียนทั้งหมด 
          </option>

          {rooms &&
            rooms
              .filter((room) => room.repair !== true)
              .sort((a, b) => a.room_id.localeCompare(b.room_id))
              .map((room) => (
                <option 
                  key={room.room_id} 
                  value={room.room_id}
                  className="py-2"
                >
                  ห้อง {room.room_id}
                </option>
              ))}
        </select>

        {/* Custom Arrow: ปรับตำแหน่งให้เหมาะสม */}
        <div className={`absolute inset-y-0 right-4 flex items-center pointer-events-none transition-colors ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-[#302782]/40 dark:text-[#B2BB1E]'}`}>
          <ChevronDown size={18} strokeWidth={3} />
        </div>
      </div>

      {/* Helper Text สำหรับมือถือ */}
      <p className="text-[9px] text-gray-400 mt-1.5 ml-1 md:hidden">
        * เลือกเลขห้องเพื่อกรองตารางเรียน
      </p>
    </div>
  );
};

export default RoomSelector;