import React from "react";
import { } from "lucide-react";

const RoomSelector = ({ rooms, selectedRoom, onSelect, disabled }) => {
  return (
    <div className="flex flex-none font-sans w-full md:w-auto self-center">

      <div className="relative w-full">
        <select
          value={selectedRoom || ""}
          onChange={(e) => onSelect(e.target.value)}
          // 🚩 2. ใส่ attribute disabled
          disabled={disabled}
          // 🚩 3. ปรับ ClassName แบบมีเงื่อนไข (ถ้า disabled ให้เป็นสีเทาและกดไม่ได้)
          className={`w-full text-xs md:text-base font-bold rounded-[12px] md:rounded-[20px] py-2.5 md:py-4 px-3 md:px-5 appearance-none outline-none transition-all ${
            disabled
              ? "bg-gray-100 dark:bg-gray-700 text-black dark:text-white border border-gray-200 dark:border-gray-600 cursor-not-allowed opacity-70"
              : "bg-[#FFFFFF] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#302782] dark:text-white cursor-pointer focus:border-[#B2BB1E] focus:ring-4 focus:ring-[#B2BB1E]/10 shadow-sm hover:border-gray-300 active:scale-[0.99]"
          }`}
        >
          <option value="" className="text-black dark:text-white">
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


      </div>

      {/* Helper Text สำหรับมือถือ */}
      <p className="text-[9px] text-black dark:text-white mt-1.5 ml-1 md:hidden">
        * เลือกเลขห้องเพื่อกรองตารางเรียน
      </p>
    </div>
  );
};

export default RoomSelector;