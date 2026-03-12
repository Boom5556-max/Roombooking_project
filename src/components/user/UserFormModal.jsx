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
  User,
} from "lucide-react";
import Button from "../common/Button.jsx";

const UserFormModal = ({ user, onClose, onSave, showAlert }) => {
  const [formData, setFormData] = useState({
    user_id: user?.user_id || "",
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
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-[#302782]/30 backdrop-blur-md p-0 sm:p-4 font-sans">
      <form
        onSubmit={handleSubmit}
        className="bg-[#FFFFFF] w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] p-8 md:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-white flex flex-col max-h-[92vh] animate-in slide-in-from-bottom sm:zoom-in duration-300"
      >
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#302782] tracking-tight">
              {user ? "แก้ไขโปรไฟล์" : "เพิ่มผู้ใช้งานใหม่"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-3 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-2xl text-gray-400 transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Fields Space */}
        <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar flex-grow mb-8 px-1">
          {/* User ID - High Priority Field */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
              รหัสประจำตัว (User ID)
            </label>
            <div className="relative group">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#B2BB1E] transition-colors"
              />
              <input
                disabled={!!user}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-[#B2BB1E] font-bold text-[#302782] transition-all disabled:opacity-60 text-base"
                value={formData.user_id}
                onChange={(e) =>
                  setFormData({ ...formData, user_id: e.target.value })
                }
                placeholder="T001 หรือ S001"
                required
              />
            </div>
          </div>

          {/* Title & Name Grid */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4 flex flex-col gap-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                คำนำหน้า
              </label>
              <div className="relative">
                <select
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-[#B2BB1E] font-bold text-[#302782] cursor-pointer appearance-none transition-all text-base"
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
                  <option value="ดร.">ดร.</option>
                  <option value="ผศ.ดร.">ผศ.ดร.</option>
                </select>
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                  size={18}
                />
              </div>
            </div>
            <div className="col-span-8 flex flex-col gap-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                ชื่อจริง
              </label>
              <input
                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-[#B2BB1E] font-bold text-[#302782] transition-all text-base"
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
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
              นามสกุล
            </label>
            <input
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-[#B2BB1E] font-bold text-[#302782] transition-all text-base"
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
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
              อีเมลติดต่อ (KU Mail)
            </label>
            <div className="relative group">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#B2BB1E] transition-colors"
              />
              <input
                type="email"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-[#B2BB1E] font-bold text-[#302782] transition-all text-base"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="example@ku.th"
                required
              />
            </div>
          </div>

          {/* Role selection with Custom Card Style */}
          <div className="flex flex-col gap-2 pb-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
              สิทธิ์การเข้าถึงระบบ
            </label>
            <div className="grid grid-cols-2 gap-3">
              <RoleOption
                selected={formData.role === "teacher"}
                label="อาจารย์"
                value="teacher"
                onClick={() => setFormData({ ...formData, role: "teacher" })}
              />
              <RoleOption
                selected={formData.role === "staff"}
                label="เจ้าหน้าที่"
                value="staff"
                onClick={() => setFormData({ ...formData, role: "staff" })}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          <Button
            type="submit"
            variant="primary"
            className="w-full py-5 rounded-[22px] text-lg shadow-xl shadow-[#302782]/20"
          >
            <Save size={20} />
            <span>
              {user ? "บันทึกการเปลี่ยนแปลง" : "ยืนยันเพิ่มผู้ใช้งาน"}
            </span>
          </Button>
        </div>
      </form>
    </div>,
    document.body
  );
};

// Component เสริมสำหรับเลือก Role ให้ดูพรีเมียมขึ้น
const RoleOption = ({ selected, label, onClick }) => (
  <div
    onClick={onClick}
    className={`p-4 rounded-[20px] border-2 cursor-pointer transition-all flex items-center justify-center gap-2 font-black text-sm
      ${
        selected
          ? "border-[#B2BB1E] bg-[#B2BB1E]/5 text-[#302782]"
          : "border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200"
      }`}
  >
    <UserCheck
      size={16}
      className={selected ? "text-[#B2BB1E]" : "text-gray-300"}
    />
    {label}
  </div>
);

export default UserFormModal;
