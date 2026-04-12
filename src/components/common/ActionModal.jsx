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
        className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-xl text-center border border-gray-100 dark:border-gray-700" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`mx-auto mb-5 flex items-center justify-center w-16 h-16 rounded-2xl ${
          showBg ? (
            variant === "danger" 
              ? "bg-[#EF4444]/10 text-[#EF4444]" 
              : variant === "warning"
                ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                : "bg-gray-50 dark:bg-gray-700 text-[#302782] dark:text-[#B2BB1E]"
          ) : "text-[#302782] dark:text-[#B2BB1E]"
        }`}>
          {icon}
        </div>
        
        <h3 className="text-lg font-semibold text-[#302782] dark:text-white mb-6 leading-snug">
          {title}
        </h3>

        {isButtonsVisible && (
          <div className="flex gap-3">
            {showCloseButton && (
              <button 
                onClick={onClose} 
                className="flex-1 py-3 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all font-medium text-sm"
              >
                <X size={16} />
                ยกเลิก
              </button>
            )}
            {showConfirm !== null && (
              <button 
                onClick={onConfirm} 
                className={`flex-1 py-3 flex items-center justify-center gap-2 text-white rounded-xl active:scale-95 transition-all font-medium text-sm ${
                  variant === "danger" 
                    ? "bg-[#EF4444] hover:opacity-90" 
                    : variant === "warning"
                      ? "bg-[#F59E0B] hover:opacity-90"
                      : "bg-[#302782] hover:bg-[#4338ca]"
                }`}
              >
                <Check size={16} />
                ยืนยัน
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