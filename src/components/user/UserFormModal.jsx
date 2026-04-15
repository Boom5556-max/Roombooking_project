import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Save,
  UserCheck,
  ChevronDown,
  Check,
  AlertCircle,
  Mail,
} from "lucide-react";
import Button from "../common/Button.jsx";

const UserFormModal = ({ user, onClose, onSave, showAlert }) => {
  const [formData, setFormData] = useState({
    user_id: user?.user_id || "", // เก็บไว้เพื่อใช้ตอนส่ง API อัปเดตข้อมูล
    title: user?.title || "",
    name: user?.name || "",
    surname: user?.surname || "",
    email: user?.email || "",
    role: user?.role || "teacher",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onSave(formData.user_id, formData);

    // ปิด Modal ตัวหลักก่อน
    onClose();

    // หน่วงเวลา 200ms
    setTimeout(() => {
      if (result.success) {
        showAlert(
          "บันทึกข้อมูลสำเร็จ", // 1. title
          <Check size={50} className="text-[#B2BB1E]" />, // 2. icon
          null,   // 3. onConfirmAction
          false,  // 4. showConfirm (ซ่อนปุ่มตกลง)
          false,  // 5. showButtons (ซ่อนปุ่มทั้งหมด)
          true,   // 6. autoClose (ให้ปิดตัวเองอัตโนมัติ)
          "primary", // 7. variant
          true    // 8. showBg
        );
      } else {
        showAlert(
          result.message || "เกิดข้อผิดพลาด", // เอาข้อความ error จาก Backend มาโชว์ได้ด้วยครับ
          <AlertCircle size={50} className="text-red-500" />,
          null,   // onConfirmAction
          false,  // showConfirm 
          false,  // showButtons 
          true,   // autoClose (ให้ปิดตัวเองอัตโนมัติ)
          "danger",  // variant
          true    // showBg
        );
      }
    }, 200);
  };

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-[#302782]/30 dark:bg-black/40 backdrop-blur-md p-0 sm:p-4 font-sans">
      <form
        onSubmit={handleSubmit}
        className="bg-[#FFFFFF] dark:bg-gray-800 w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] p-6 sm:p-8 md:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-white dark:border-gray-700 flex flex-col max-h-[92vh] animate-in slide-in-from-bottom sm:zoom-in duration-300"
      >
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#302782] dark:text-white tracking-tight">
              {user ? "แก้ไขข้อมูล" : "เพิ่มผู้ใช้งานใหม่"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-3 bg-gray-50 dark:bg-gray-700 hover:bg-red-50 hover:text-red-500 rounded-2xl text-black dark:text-white transition-all active:scale-[0.98]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Fields Space */}
        <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar flex-grow mb-8 px-1">
          
          {/* Title & Name Grid */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4 flex flex-col gap-2">
              <label className="text-[10px] sm:text-xs font-medium text-black dark:text-white ml-1">
                คำนำหน้า
              </label>
              <div className="relative">
                <select
                  className="w-full p-3.5 sm:p-4 bg-gray-50 dark:bg-gray-700 border-2 border-transparent rounded-[20px] outline-none focus:bg-white dark:focus:bg-gray-600 focus:border-[#B2BB1E] font-bold text-[#302782] dark:text-white cursor-pointer appearance-none transition-all text-sm sm:text-base"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                >
                  <option value="">เลือก</option>
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                  <option value="อาจารย์">อาจารย์</option>
                  <option value="ดร.">ดร.</option>
                  <option value="ผศ.ดร.">ผศ.ดร.</option>
                </select>
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black dark:text-white pointer-events-none"
                  size={18}
                />
              </div>
            </div>
            <div className="col-span-8 flex flex-col gap-2">
              <label className="text-[10px] sm:text-xs font-medium text-black dark:text-white ml-1">
                ชื่อจริง
              </label>
              <input
                className="w-full p-3.5 sm:p-4 bg-gray-50 dark:bg-gray-700 border-2 border-transparent rounded-[20px] outline-none focus:bg-white dark:focus:bg-gray-600 focus:border-[#B2BB1E] font-bold text-[#302782] dark:text-white transition-all text-sm sm:text-base"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="กรอกชื่อจริง"
                required
              />
            </div>
          </div>

          {/* Surname */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] sm:text-xs font-medium text-black dark:text-white ml-1">
              นามสกุล
            </label>
            <input
              className="w-full p-3.5 sm:p-4 bg-gray-50 dark:bg-gray-700 border-2 border-transparent rounded-[20px] outline-none focus:bg-white dark:focus:bg-gray-600 focus:border-[#B2BB1E] font-bold text-[#302782] dark:text-white transition-all text-sm sm:text-base"
              value={formData.surname}
              onChange={(e) =>
                setFormData({ ...formData, surname: e.target.value })
              }
              placeholder="กรอกนามสกุล"
              required
            />
          </div>

          {/* Email with Icon */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] sm:text-xs font-medium text-black dark:text-white ml-1">
              อีเมลติดต่อ (KU Mail)
            </label>
            <div className="relative group">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-white group-focus-within:text-[#B2BB1E] transition-colors"
              />
              <input
                type="email"
                className="w-full pl-11 sm:pl-12 pr-4 py-3.5 sm:py-4 bg-gray-50 dark:bg-gray-700 border-2 border-transparent rounded-[20px] outline-none focus:bg-white dark:focus:bg-gray-600 focus:border-[#B2BB1E] font-bold text-[#302782] dark:text-white transition-all text-sm sm:text-base"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="example@ku.th"
                required
              />
            </div>
          </div>

          {/* Role selection - ซ่อนเมื่ออยู่ในโหมดแก้ไข (!!user เป็น true) */}
          {!user && (
            <div className="flex flex-col gap-2 pb-2">
              <label className="text-[10px] sm:text-xs font-medium text-black dark:text-white ml-1">
                สิทธิ์การเข้าถึงระบบ
              </label>
              <div className="grid grid-cols-2 gap-3">
                <RoleOption
                  selected={formData.role === "teacher"}
                  label="บุคลากร"
                  onClick={() => setFormData({ ...formData, role: "teacher" })}
                />
                <RoleOption
                  selected={formData.role === "staff"}
                  label="ผู้ดูเเลระบบ"
                  onClick={() => setFormData({ ...formData, role: "staff" })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          <Button
            type="submit"
            variant="primary"
            className="w-full py-4 sm:py-5 rounded-[22px] text-base sm:text-lg shadow-xl shadow-[#302782]/20"
          >
            <Save size={20} />
            <span>
              {user ? "บันทึกการเเก้ไข" : "เพิ่มผู้ใช้งาน"}
            </span>
          </Button>
        </div>
      </form>
    </div>,
    document.body
  );
};

// Component เสริมสำหรับเลือก Role ให้ดูพรีเมียมขึ้น (เอา disabled ออกเพราะใช้เงื่อนไข !user ซ่อนไปแล้ว)
const RoleOption = ({ selected, label, onClick }) => (
  <div
    onClick={onClick}
    className={`p-3 sm:p-4 rounded-[20px] border-2 cursor-pointer transition-all flex items-center justify-center gap-2 font-black text-xs sm:text-sm hover:border-gray-300 dark:hover:border-gray-500
      ${
        selected
          ? "border-[#B2BB1E] bg-[#B2BB1E]/5 text-[#302782] dark:text-white"
          : "border-gray-50 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-black dark:text-white"
      }`}
  >
    <UserCheck
      size={16}
      className={selected ? "text-[#B2BB1E]" : "text-black dark:text-white"}
    />
    {label}
  </div>
);

export default UserFormModal;