import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Wrench, 
  Settings, 
  Users as UsersIcon, 
  DoorOpen, 
  Edit3, 
  Trash2,
  Building
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const RoomCard = ({ room, onEdit, onDelete }) => {
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
  const isStaff = userRole === "staff";
  const isDisabledForUser = isCurrentlyInRepair && !isStaff;

  const handleCardClick = (e) => {
    // If clicking a button, don't navigate
    if (e.target.closest('button')) return;
    if (isDisabledForUser) return;
    navigate(`/room-detail/${room.room_id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-[30px] sm:rounded-[35px] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group ${
        isDisabledForUser ? "opacity-60 grayscale cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-4 sm:gap-5 w-full">
        {/* Left Icon Section */}
        <div className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[24px] flex items-center justify-center border transition-all duration-300 
          ${isDisabledForUser 
            ? "bg-gray-100 text-black dark:text-white border-gray-100 dark:border-gray-600" 
            : "bg-gray-50 dark:bg-gray-700 text-[#302782] dark:text-[#B2BB1E] border-gray-100 dark:border-gray-600 group-hover:bg-[#302782] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#302782]/20"
          } text-black dark:text-white`}
        >
          {isDisabledForUser ? (
            <Lock size={28} className="sm:w-8 sm:h-8" />
          ) : isCurrentlyInRepair ? (
            <Settings size={28} className="sm:w-8 sm:h-8 group-hover:rotate-180 transition-transform duration-700" />
          ) : (
            <DoorOpen size={28} className="sm:w-8 sm:h-8" />
          )}
        </div>

        {/* Info Section */}
        <div className="flex-grow min-w-0">
          <div className="flex flex-wrap items-center gap-x-2">
            <h3 className={`text-lg sm:text-xl font-black truncate ${isDisabledForUser ? "text-black dark:text-white" : "text-[#302782] dark:text-white"}`}>
              {room.room_id}
            </h3>
            <span className="text-black dark:text-white text-sm font-light">|</span>
            <p className={`text-sm sm:text-base font-bold truncate ${isDisabledForUser ? "text-black dark:text-white" : "text-black dark:text-white"}`}>
              {room.room_type}
            </p>
          </div>


          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`text-[10px] px-3 py-1 rounded-full font-black flex items-center gap-1.5 border ${
              isDisabledForUser 
                ? "bg-gray-100 text-black border-gray-200 dark:bg-gray-700 dark:text-white dark:border-gray-600" 
                : "bg-[#302782]/5 dark:bg-[#302782]/20 text-[#302782] dark:text-[#B2BB1E] border-[#302782]/10 dark:border-[#302782]/30"
            }`}>
              <UsersIcon size={12} strokeWidth={3} /> {room.capacity} ที่นั่ง
            </span>

            {isCurrentlyInRepair && (
              <span className="text-[10px] bg-red-800 px-3 py-1 rounded-full text-white font-black flex items-center gap-1.5 shadow-sm animate-pulse-subtle">
                <Wrench size={12} strokeWidth={3} /> กำลังปรับปรุง
              </span>
            )}

          </div>
        </div>
      </div>

      {/* Actions Section */}
      {isStaff && (
        <div className="flex gap-2 w-full sm:w-auto justify-end sm:justify-start pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-50 dark:border-gray-700 mt-1 sm:mt-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(room);
            }}
            className="flex-1 sm:flex-none p-3 bg-gray-50 dark:bg-gray-700 sm:bg-white sm:dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl sm:rounded-2xl text-black dark:text-white hover:text-[#302782] dark:hover:text-[#B2BB1E] hover:border-[#302782]/20 transition-all active:scale-[0.98] flex justify-center items-center"
            title="แก้ไข"
          >
            <Edit3 size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(room.room_id);
            }}
            className="flex-1 sm:flex-none p-3 bg-gray-50 dark:bg-gray-700 sm:bg-white sm:dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl sm:rounded-2xl text-black dark:text-white hover:text-red-500 hover:border-red-100 transition-all active:scale-[0.98] flex justify-center items-center"
            title="ลบ"
          >
            <Trash2 size={20} />
          </button>
        </div>
      )}

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
