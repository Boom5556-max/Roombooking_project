import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Check } from "lucide-react";

const ActionModal = ({
  icon,
  title,
  onClose,
  onConfirm,
  showConfirm = true,
  showCloseButton = true,
  showButtons = null, // เปลี่ยน default เป็น null
  variant = "primary",
  showBg = true,
  autoClose = false,
}) => {
  
  // Logic: ปุ่มจะแสดงก็ต่อเมื่อ showButtons เป็น true 
  // หรือถ้า showButtons เป็น null (ไม่ได้กำหนด) ให้ซ่อนปุ่มอัตโนมัติถ้า autoClose เป็น true
  const isButtonsVisible = showButtons !== null ? showButtons : !autoClose;

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, 2000); // ปิดเองใน 2 วินาที
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  return createPortal(
    <div 
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-[#302782]/20 dark:bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-[40px] p-8 w-full max-w-sm shadow-xl text-center border border-white dark:border-gray-700" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`mx-auto mb-6 flex items-center justify-center w-24 h-24 rounded-full ${showBg ? (variant === "danger" ? "bg-red-50 dark:bg-red-500/10 text-red-500" : "bg-gray-50 dark:bg-gray-700 text-[#302782] dark:text-[#B2BB1E]") : "text-[#302782] dark:text-[#B2BB1E]"}`}>
          {icon}
        </div>
        
        <h3 className="text-2xl font-black text-[#302782] dark:text-white mb-8 leading-tight">
          {title}
        </h3>

        {/* ถ้าสั่ง autoClose ปุ่มจะหายไปทันที ไม่ต้องมีตรรกะซับซ้อนที่ Notification */}
        {isButtonsVisible && (
          <div className="flex gap-4 justify-center">
            {showCloseButton && (
              <button 
                onClick={onClose} 
                className="h-[72px] w-full max-w-[200px] flex items-center justify-center bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-300 rounded-[24px] hover:bg-gray-100 dark:hover:bg-gray-600 active:scale-95 transition-all"
              >
                <X size={32} />
              </button>
            )}
            {showConfirm !== null && (
              <button 
                onClick={onConfirm} 
                className={`h-[72px] w-full max-w-[200px] flex items-center justify-center text-white rounded-[24px] active:scale-95 transition-all font-bold ${variant === "danger" ? "bg-red-500 hover:bg-red-600" : "bg-[#B2BB1E] hover:bg-opacity-90"}`}
              >
                <Check size={32} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ActionModal;