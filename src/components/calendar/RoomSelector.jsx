import React from "react";
import { ChevronDown, DoorOpen } from "lucide-react";

const RoomSelector = ({ rooms, selectedRoom, onSelect }) => {
  return (
    <div className="flex flex-col flex-none font-sans w-full md:w-auto">
      {/* Label: ปรับขนาดฟอนต์ให้เข้ากับอุปกรณ์ */}
      <label className="text-[10px] sm:text-xs font-bold text-gray-400 mb-2 ml-1 flex items-center gap-2 uppercase tracking-wider">
        <DoorOpen size={14} className="text-[#B2BB1E]" />
        เลือกห้องเรียน
      </label>

      <div className="relative w-full md:max-w-[280px]">
        <select
          value={selectedRoom || ""}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full bg-[#FFFFFF] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#302782] dark:text-white text-sm sm:text-base font-bold rounded-[16px] sm:rounded-[20px] py-3.5 sm:py-4 px-4 sm:px-5 appearance-none cursor-pointer focus:border-[#B2BB1E] focus:ring-4 focus:ring-[#B2BB1E]/10 outline-none shadow-sm hover:border-gray-300 transition-all active:scale-[0.99]"
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
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#302782]/40 dark:text-[#B2BB1E]">
          <ChevronDown size={18} strokeWidth={3} />
        </div>
      </div>

      {/* Helper Text สำหรับมือถือ (Optional: บอกใบ้ให้ผู้ใช้รู้ว่าเลือกได้) */}
      <p className="text-[9px] text-gray-400 mt-1.5 ml-1 md:hidden">
        * เลือกเลขห้องเพื่อกรองตารางเรียน
      </p>
    </div>
  );
};

export default RoomSelector;