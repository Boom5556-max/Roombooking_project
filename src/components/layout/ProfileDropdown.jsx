import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { UserCircle, Mail, User, Shield, Edit3, Trash2, Check, AlertCircle } from 'lucide-react';
import UserFormModal from '../user/UserFormModal';
import ActionModal from '../common/ActionModal';
import api from '../../api/axios';

const ProfileDropdown = ({ isMobile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    icon: null,
    onConfirm: null,
    showConfirm: true,
    showButtons: null,
    autoClose: false,
    variant: "primary",
    showBg: true,
  });

  const toggleDropdown = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      
      // Calculate right position
      let rightPos = window.innerWidth - rect.right;
      // If the dropdown width (up to 280px) plus the right position exceeds screen width,
      // force it to snap to the right edge with a small margin (16px).
      if (rightPos + 280 > window.innerWidth) {
        rightPos = 16;
      }
      
      // Calculate position relative to trigger button for both mobile and desktop.
      // Top navbar location is the same, so it always drops down.
      setDropdownPosition({
        top: rect.bottom + scrollY + 10,
        right: rightPos
      });
    }
    setIsOpen(!isOpen);
  };

  // เพิ่ม title เป็นพารามิเตอร์ตัวแรก
  const showAlert = (
    title, 
    icon,
    onConfirmAction = null,
    showConfirm = true,
    showButtons = null,
    autoClose = false,
    variant = "primary",
    showBg = true
  ) => {
    setAlertConfig({
      isOpen: true,
      title, // จะได้ใช้งานได้ถูกต้อง
      icon,
      onConfirm: () => {
        setAlertConfig((prev) => ({ ...prev, isOpen: false }));
        if (onConfirmAction) {
          onConfirmAction();
        }
      },
      showConfirm,
      showButtons,
      autoClose,
      variant,
      showBg,
    });
  };

  const updateUser = async (userId, data) => {
    try {
      const res = await api.put(`/users/edit/${userId}`, data);
      const newUserData = { ...userData, ...data };
      setUserData(newUserData);
      localStorage.setItem("user", JSON.stringify(newUserData));
      
      // 1. สั่งปิด Modal ฟอร์มแก้ไขก่อน
      setIsEditModalOpen(false);
      
      // 2. หน่วงเวลา 150ms ให้ฟอร์มปิดสนิท แล้วค่อยเรียกกล่องแจ้งเตือน (ป้องกันการทับกัน)
      setTimeout(() => {
        showAlert(
          res.data?.message || "แก้ไขโปรไฟล์สำเร็จ", 
          <Check size={50} className="text-[#B2BB1E]" />,
          null, // onConfirmAction
          false, // showConfirm 
          false, // showButtons 
          true, // autoClose 
          "primary",
          true
        );
      }, 150);

      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล";
      
      // 1. สั่งปิด Modal ฟอร์มแก้ไขก่อนเช่นกัน (หรือถ้าไม่อยากให้ฟอร์มปิดตอน error ก็เอาบรรทัดนี้ออกได้ครับ)
      setIsEditModalOpen(false);
      
      // 2. หน่วงเวลาโชว์แจ้งเตือน Error
      setTimeout(() => {
        showAlert(
          errorMsg,
          <AlertCircle size={50} className="text-red-500" />,
          null, 
          false, 
          false, 
          true, 
          "danger",
          true
        );
      }, 150);

      return { success: false, message: errorMsg };
    }
  };

  const handleDeleteAccount = () => {
    setIsOpen(false);
    showAlert(
      `คุณแน่ใจหรือไม่ที่จะลบบัญชีนี้?`,
      <Trash2 size={50} className="text-red-500" />,
      async () => {
        try {
          await api.patch(`/users/delete/${userData.user_id}`);
          setAlertConfig((prev) => ({ ...prev, isOpen: false }));
          
          setTimeout(() => {
             showAlert(
               "ลบบัญชีสำเร็จ", 
               <Check size={50} className="text-[#B2BB1E]" />,
               () => {
                 localStorage.removeItem("token");
                 localStorage.removeItem("user");
                 window.location.replace("/");
               },
               true, // showConfirm
               true, // showButtons
               false, // autoClose
               "primary",
               true
             );
          }, 150);
        } catch (err) {
          setAlertConfig((prev) => ({ ...prev, isOpen: false }));
          setTimeout(() => {
            showAlert("ลบไม่สำเร็จ", <AlertCircle size={50} className="text-red-500" />, null, null, null, true, "danger", false);
          }, 150);
        }
      },
      true, // showConfirm
      true, // showButtons
      false, // autoClose
      "danger",
      true
    );
  };

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
      // ตรวจสอบว่าคลิกนอกทั้งตัวปุ่มกด (trigger) และตัวกล่องเมนู (dropdown)
      if (
        isOpen && 
        triggerRef.current && 
        !triggerRef.current.contains(event.target) &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    
    // Resize window handle
    const handleResize = () => {
      if (isOpen) setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  if (!userData) return null;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button 
        ref={triggerRef}
        onClick={toggleDropdown}
        className={`flex items-center justify-center transition-all duration-300 ${
          isMobile
            ? "w-12 h-12 sm:w-14 sm:h-14 hover:text-[#B2BB1E] text-[#FFFFFF]/60 mt-1"
            : "w-10 h-10 text-[#FFFFFF]/80 hover:text-[#B2BB1E] bg-[#FFFFFF]/10 rounded-full hover:bg-[#FFFFFF]/20"
        } ${isOpen ? "text-[#B2BB1E]" : ""}`}
        title="โปรไฟล์ของฉัน"
      >
        <UserCircle size={isMobile ? 24 : 24} />
      </button>

      {/* Dropdown Menu - rendered via Portal to avoid clipping issues */}
      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`,
          }}
          className="w-[calc(100vw-32px)] max-w-[280px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-100 p-5 z-[2500] animate-in fade-in duration-200"
        >
          
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
          
          <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col gap-2">
            <button 
              onClick={() => { setIsOpen(false); setIsEditModalOpen(true); }} 
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-[#302782] hover:bg-[#302782]/5 rounded-xl transition-all"
            >
              <Edit3 size={18} />
              แก้ไขโปรไฟล์
            </button>
            <button 
              onClick={handleDeleteAccount} 
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 size={18} />
              ลบบัญชีผู้ใช้
            </button>
          </div>
          
        </div>,
        document.body
      )}

      {/* Modals */}
      {isEditModalOpen && (
        <UserFormModal
          user={userData}
          onClose={() => setIsEditModalOpen(false)}
          onSave={updateUser}
          showAlert={showAlert}
        />
      )}

      {alertConfig.isOpen && (
        <ActionModal
          icon={alertConfig.icon}
          title={alertConfig.title}
          onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={alertConfig.onConfirm}
          showConfirm={alertConfig.showConfirm}
          showButtons={alertConfig.showButtons}
          autoClose={alertConfig.autoClose}
          variant={alertConfig.variant}
          showBg={alertConfig.showBg}
        />
      )}
    </div>
  );
};

export default ProfileDropdown;
