import React, { useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

const DeleteAccountModal = ({ userData, onConfirmDelete, onClose }) => {
  const [inputValue, setInputValue] = useState("");

  // สร้างคำที่ต้องพิมพ์ให้ตรง: "ชื่อ นามสกุล/ต้องการลบบัญชี"
  const fullName = `${userData.name} ${userData.surname}`;
  const confirmText = `${fullName}/ต้องการลบบัญชี`;
  const isMatch = inputValue === confirmText;

  return createPortal(
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-[#302782]/20 dark:bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-[28px] w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-xl font-black text-[#302782] dark:text-white">ลบบัญชีผู้ใช้</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-black dark:text-white hover:bg-gray-100 hover:text-gray-600 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Warning Section */}
        <div className="mx-6 mb-5 p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-[#EF4444]/10 flex items-center justify-center">
              <AlertTriangle size={20} className="text-[#EF4444]" />
            </div>
            <div>
              <h4 className="font-bold text-[#EF4444] text-sm mb-2">คำเตือน: การดำเนินการนี้ไม่สามารถย้อนกลับได้</h4>
              <ul className="space-y-1.5 text-xs text-[#EF4444]/80">
                <li className="flex items-start gap-2">
                  <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-[#EF4444]/40"></span>
                  ข้อมูลส่วนตัวของคุณจะถูกลบออกจากระบบ
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-[#EF4444]/40"></span>
                  คุณจะไม่สามารถเข้าสู่ระบบด้วยบัญชีนี้ได้อีก
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-[#EF4444]/40"></span>
                  การดำเนินการนี้ไม่สามารถกู้คืนได้
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Confirmation Input Section */}
        <div className="px-6 pb-6">
          <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">
            พิมพ์{" "}
            <span className="font-black text-[#302782] dark:text-[#B2BB1E] bg-[#302782]/5 dark:bg-[#B2BB1E]/10 px-2 py-0.5 rounded-lg text-xs tracking-wide select-all">
              {confirmText}
            </span>{" "}
            เพื่อยืนยัน
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={confirmText}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/10 dark:focus:ring-[#EF4444]/20 transition-all"
            autoFocus
          />

          {/* Buttons */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-black dark:text-white bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
            >
              ยกเลิก
            </button>
            <button
              onClick={() => {
                if (isMatch) onConfirmDelete();
              }}
              disabled={!isMatch}
              className={`flex-1 py-3 rounded-xl font-bold transition-all active:scale-95 ${
                isMatch
                  ? "bg-[#EF4444] text-white hover:opacity-90 shadow-lg shadow-[#EF4444]/20"
                  : "bg-gray-100 text-black dark:text-white cursor-not-allowed"
              }`}
            >
              ลบบัญชี
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteAccountModal;
