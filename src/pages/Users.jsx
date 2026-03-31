import React, { useState } from "react";
import {
  ChevronLeft,
  Plus,
  Edit3,
  Trash2,
  UserCog,
  Mail,
  SearchX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../hooks/useUsers";
import Navbar from "../components/layout/Navbar.jsx";
import Button from "../components/common/Button.jsx";
import UserFormModal from "../components/user/UserFormModal.jsx";

const Users = () => {
  const navigate = useNavigate();
  const { users, isLoading, addUser, updateUser, deleteUser } = useUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // 1. เปลี่ยน State ของ Alert ให้เรียบง่ายขึ้น เก็บแค่ข้อความพอ
  const [simpleAlert, setSimpleAlert] = useState({
    isOpen: false,
    message: "",
    isConfirm: false,
    onConfirm: null,
  });

  const openModal = (user = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  // 2. ปรับ Function showAlert ใหม่ ให้รับค่าแค่ข้อความและฟังก์ชันยืนยัน
  // (พารามิเตอร์อื่นๆ ที่ส่งมาจากหน้า UserFormModal จะถูกละเว้นอัตโนมัติ)
  const showAlert = (title, icon, onConfirmAction = null) => {
    setSimpleAlert({
      isOpen: true,
      message: title,
      isConfirm: !!onConfirmAction, // ถ้ามี onConfirmAction แปลว่าเป็น Popup ยืนยัน (เช่น ลบ)
      onConfirm: onConfirmAction,
    });

    // ถ้าเป็นแค่แจ้งเตือนเฉยๆ (ไม่มีปุ่มยืนยัน) ให้ปิดเองอัตโนมัติใน 2 วินาที
    if (!onConfirmAction) {
      setTimeout(() => {
        setSimpleAlert((prev) => ({ ...prev, isOpen: false }));
      }, 2000);
    }
  };

  // 3. ปรับฟังก์ชันการลบให้ใช้ showAlert แบบใหม่
  const handleDelete = async (userId) => {
    showAlert("คุณแน่ใจหรือไม่ที่จะลบผู้ใช้รายนี้?", null, async () => {
      const result = await deleteUser(userId);
      if (!result.success) {
        showAlert("ลบไม่สำเร็จ: " + (result.message || "เกิดข้อผิดพลาด"));
      } else {
        showAlert("ลบผู้ใช้งานสำเร็จ");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans">
      <Navbar />

      <div className="p-4 sm:p-6 md:p-10 pb-24 flex-grow max-w-5xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="none"
              onClick={() => navigate(-1)}
              className="text-[#B2BB1E] bg-transparent p-1 hover:scale-110 transition-transform"
            >
              <ChevronLeft size={32} />
            </Button>
            <h1 className="text-2xl sm:text-3xl font-black text-[#302782] dark:text-white">
              จัดการผู้ใช้งาน
            </h1>
          </div>

          <Button
            onClick={() => openModal()}
            className="w-full sm:w-auto bg-[#B2BB1E] text-white rounded-2xl px-6 py-3.5 flex items-center justify-center gap-2 font-black shadow-lg hover:bg-[#302782] transition-all active:scale-95"
          >
            <Plus size={20} /> เพิ่มผู้ใช้ใหม่
          </Button>
        </div>

        {/* Content Section */}
        <div className="w-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-12 h-12 border-4 border-[#302782] border-t-[#B2BB1E] rounded-full animate-spin"></div>
              <p className="text-gray-400 font-bold animate-pulse">
                กำลังดึงข้อมูลผู้ใช้งาน...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {users.length > 0 ? (
                users.map((u) => (
                  <div
                    key={u.user_id}
                    className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-[30px] sm:rounded-[35px] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4 sm:gap-5 w-full">
                      <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 dark:bg-gray-700 rounded-2xl sm:rounded-[24px] flex items-center justify-center text-[#302782] dark:text-[#B2BB1E] border border-gray-100 dark:border-gray-600">
                        <UserCog size={28} className="sm:w-8 sm:h-8" />
                      </div>

                      <div className="flex-grow min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2">
                          <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-tighter">
                            {u.title}
                          </span>
                          <h3 className="text-lg sm:text-xl font-black text-[#302782] dark:text-white truncate">
                            {u.name} {u.surname}
                          </h3>
                        </div>

                        <p className="text-gray-400 font-bold text-xs flex items-center gap-1.5 mt-1 truncate">
                          <Mail size={14} className="shrink-0 text-[#B2BB1E]" />
                          <span className="truncate">{u.email}</span>
                        </p>

                        <div className="mt-2.5">
                          <span className="inline-block px-3 py-1 rounded-full text-[10px] bg-[#302782]/5 dark:bg-[#302782]/20 text-[#302782] dark:text-[#B2BB1E] font-black uppercase tracking-widest border border-[#302782]/10 dark:border-[#302782]/30">
                            {u.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto justify-end sm:justify-start pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-50 dark:border-gray-700 mt-1 sm:mt-0">
                      <button
                        onClick={() => openModal(u)}
                        className="flex-1 sm:flex-none p-3 bg-gray-50 dark:bg-gray-700 sm:bg-white sm:dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl sm:rounded-2xl text-gray-400 hover:text-[#302782] dark:hover:text-[#B2BB1E] hover:border-[#302782]/20 transition-all active:scale-90 flex justify-center items-center"
                        title="แก้ไข"
                      >
                        <Edit3 size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(u.user_id)}
                        className="flex-1 sm:flex-none p-3 bg-gray-50 dark:bg-gray-700 sm:bg-white sm:dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl sm:rounded-2xl text-gray-400 hover:text-red-500 hover:border-red-100 transition-all active:scale-90 flex justify-center items-center"
                        title="ลบ"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-[40px] border-2 border-dashed border-gray-100 dark:border-gray-700">
                  <UserCog size={48} className="text-gray-200 mb-4" />
                  <p className="text-gray-400 font-bold">
                    ไม่พบข้อมูลผู้ใช้งานในระบบ
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <UserFormModal
          user={editingUser}
          onClose={() => setIsModalOpen(false)}
          onSave={editingUser ? updateUser : addUser}
          showAlert={showAlert} // ส่งฟังก์ชัน showAlert ใหม่เข้าไป
        />
      )}

      {/* 4. กล่อง Alert แจ้งเตือนแบบเน้นข้อความ คลีนๆ ไม่รก */}
      {/* 4. กล่อง Alert แจ้งเตือนแบบเน้นข้อความ คลีนๆ ไม่รก (ปรับขนาดให้ใหญ่ขึ้น) */}
      {simpleAlert.isOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-sans">
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-sm text-center">
            <p className="text-base sm:text-lg font-semibold text-[#302782] dark:text-white leading-snug">
              {simpleAlert.message}
            </p>

            {simpleAlert.isConfirm && (
              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={() =>
                    setSimpleAlert((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="flex-1 py-3 text-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-medium rounded-2xl hover:bg-gray-200 transition-colors active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => {
                    if (simpleAlert.onConfirm) simpleAlert.onConfirm();
                    setSimpleAlert((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="flex-1 py-3 text-sm bg-[#302782] hover:bg-[#B2BB1E] text-white font-medium rounded-2xl transition-all shadow-sm active:scale-95"
                >
                  ยืนยัน
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
