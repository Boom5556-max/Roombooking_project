import React, { useState, useEffect } from 'react';
import { Lock, Wrench, ChevronRight, Settings, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const RoomCard = ({ room }) => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded?.role?.toLowerCase().trim() || "student");
      } catch (err) {
        console.error("Token Decode Error:", err);
      }
    }
  }, []);

  const isCurrentlyInRepair = room.repair === true;
  const isDisabledForUser = isCurrentlyInRepair && userRole !== "staff";

  const handleCardClick = () => {
    if (isDisabledForUser) return;
    navigate(`/room-detail/${room.room_id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-[#FFFFFF] rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 flex justify-between items-center border transition-all duration-300 mb-4 font-sans
        ${isDisabledForUser 
          ? "opacity-60 grayscale cursor-not-allowed border-gray-100 bg-gray-50/50 shadow-none" 
          : "hover:border-[#B2BB1E] hover:shadow-[0_15px_40px_-12px_rgba(48,39,130,0.12)] cursor-pointer border-gray-100 shadow-[0_4px_15px_-4px_rgba(0,0,0,0.03)] active:scale-[0.98]"
        }
        ${isCurrentlyInRepair && userRole === "staff" ? "border-amber-200 bg-amber-50/20" : ""} `}
    >
      <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0">
        {/* ชื่อห้องและประเภท */}
        <div className="flex items-center gap-2 sm:gap-3">
          <h3 className={`text-xl sm:text-2xl font-black leading-none tracking-tight ${isDisabledForUser ? "text-gray-400" : "text-[#302782]"}`}>
            {room.room_id}
          </h3>
          <span className="text-gray-200 text-lg sm:text-xl font-light">|</span>
          <p className={`text-sm sm:text-base font-black truncate ${isDisabledForUser ? "text-gray-400" : "text-gray-500"}`}>
            {room.room_type}
          </p>
        </div>
        
        {/* สถานที่ */}
        <p className="text-gray-400 text-[12px] sm:text-sm font-bold ml-0.5 opacity-80 uppercase tracking-wide">
          {room.location}
        </p>

        {/* Badges Area */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className={`text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 rounded-xl font-black flex items-center gap-1.5 ${
            isDisabledForUser ? "bg-gray-200 text-gray-400" : "bg-gray-50 text-[#302782] border border-gray-100"
          }`}>
            <Users size={12} strokeWidth={3} /> {room.capacity} ที่นั่ง
          </span>

          {isCurrentlyInRepair && (
            <span className="text-[10px] sm:text-xs bg-red-800 px-3 sm:px-4 py-1.5 rounded-xl text-white font-black flex items-center gap-2 shadow-sm animate-pulse-subtle">
              <Wrench size={12} strokeWidth={3} /> กำลังปรับปรุง
            </span>
          )}
        </div>
      </div>

      {/* Right Action Area */}
      <div className="flex items-center gap-3 sm:gap-4 ml-4">
        {!isDisabledForUser && isCurrentlyInRepair && (
          <span className="hidden lg:block text-[10px] font-black tracking-widest text-amber-600 bg-amber-100 px-3 py-1.5 rounded-lg uppercase">
            Admin Mode
          </span>
        )}

        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0 ${
          isDisabledForUser 
            ? "bg-gray-100 text-gray-300" 
            : "bg-gray-50 text-gray-300 group-hover:bg-[#302782] group-hover:text-[#FFFFFF] group-hover:shadow-lg group-hover:shadow-[#302782]/20"
        }`}>
          {isDisabledForUser ? (
            <Lock size={24} sm:size={28} strokeWidth={2.5} />
          ) : isCurrentlyInRepair ? (
            <Settings size={24} sm:size={28} strokeWidth={2.5} className="group-hover:rotate-180 transition-transform duration-700" />
          ) : (
            <ChevronRight size={24} sm:size={28} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default RoomCard;