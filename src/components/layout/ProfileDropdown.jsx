import React, { useState, useEffect, useRef } from 'react';
import { UserCircle, Mail, User, Shield } from 'lucide-react';

const ProfileDropdown = ({ isMobile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Load current user data from localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUserData(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }

    // Close click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!userData) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center transition-all duration-300 ${
          isMobile 
            ? "w-12 h-12 sm:w-14 sm:h-14 hover:text-[#B2BB1E] text-[#FFFFFF]/60 mt-1" 
            : "w-10 h-10 text-[#FFFFFF]/80 hover:text-[#B2BB1E] bg-[#FFFFFF]/10 rounded-full hover:bg-[#FFFFFF]/20"
        } ${isOpen ? "text-[#B2BB1E]" : ""}`}
        title="โปรไฟล์ของฉัน"
      >
        <UserCircle size={isMobile ? 24 : 24} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute ${isMobile ? "bottom-16 right-0" : "top-14 right-0"} w-[280px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-100 p-5 z-[1100] animate-in fade-in slide-in-from-[${isMobile ? "bottom" : "top"}]-2 duration-200`}>
          
          <div className="flex flex-col items-center justify-center pb-4 border-b border-gray-100">
            <div className="w-16 h-16 bg-[#302782]/10 rounded-full flex items-center justify-center text-[#302782] mb-3">
              <UserCircle size={40} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg text-center leading-tight">
              {userData.title ? `${userData.title} ` : ""}{userData.name} {userData.surname}
            </h3>
            <span className="bg-[#B2BB1E]/20 text-[#302782] text-xs font-bold px-3 py-1 rounded-full mt-2 flex items-center gap-1">
              <Shield size={12} />
              {userData.role?.toUpperCase()}
            </span>
          </div>

          <div className="pt-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                <Mail size={16} />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">อีเมล</span>
                <span className="text-sm font-medium text-gray-700 truncate">{userData.email}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                <User size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">รหัสผู้ใช้</span>
                <span className="text-sm font-medium text-gray-700">{userData.user_id || "-"}</span>
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
