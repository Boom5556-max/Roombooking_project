import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Plus,
  Edit3,
  Trash2,
  CheckCircle, // 🚩 นำเข้า CheckCircle
  AlertCircle,
  X // 🚩 นำเข้า X สำหรับปุ่ม Error
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRooms } from "../hooks/useRooms";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/layout/Navbar.jsx";
import Button from "../components/common/Button.jsx";
import RoomCard from "../components/rooms/RoomCard";
import ActionModal from "../components/common/ActionModal";
import RoomFormModal from "../components/rooms/RoomFormModal";

const Rooms = () => {
  const navigate = useNavigate();
  const { rooms, isLoading, addRoom, updateRoom, deleteRoom } = useRooms();

  const [userRole, setUserRole] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // 🚩 1. ปรับ State Alert ให้รองรับแพทเทิร์นใหม่
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    icon: null,
    variant: "primary",
    showConfirm: true,
    showButtons: null,
    autoClose: false,
    showBg: true,
    onConfirm: null,
  });

  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, isOpen: false }));

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

  const openModal = (room = null) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  // 🚩 2. ฟังก์ชันช่วยแสดงผลลัพธ์ สำเร็จ/ล้มเหลว (ปิดเองอัตโนมัติ)
  const showResultAlert = (success, successMsg, errorMsg) => {
    setAlertConfig({
      isOpen: true,
      title: success ? successMsg : errorMsg,
      icon: success ? <CheckCircle size={50} /> : <X size={50} />,
      variant: success ? "primary" : "danger",
      showConfirm: false,
      showButtons: false, 
      autoClose: true, 
      showBg: true,
      onConfirm: null,
    });
  };

  // ฟังก์ชันเดิม เก็บไว้เผื่อ RoomFormModal ยังต้องใช้แบบเก่า
  const showAlert = (
    title, icon, onConfirm = null, showConfirm = true,
    singleButton = false, variant = "primary", showBg = true,
    autoClose = false, showButtons = null
  ) => {
    setAlertConfig({
      isOpen: true, title, icon, showConfirm, singleButton, variant, showBg, autoClose, showButtons,
      onConfirm: onConfirm || closeAlert,
    });
  };

  // 🚩 3. ฟังก์ชันครอบสำหรับการลบ ที่คลีนและอ่านง่ายขึ้น
  const confirmDelete = (roomId) => {
    setAlertConfig({
      isOpen: true,
      title: `ยืนยันการลบห้อง ${roomId}?`,
      icon: <Trash2 size={50} />,
      variant: "danger",
      showConfirm: true,
      showButtons: true,
      autoClose: false,
      showBg: true,
      onConfirm: async () => {
        closeAlert(); // ปิด Modal ยืนยันก่อน
        try {
          const result = await deleteRoom(roomId);
          // ประเมินผลลัพธ์จากการลบ
          const isSuccess = result?.success !== false;
          showResultAlert(isSuccess, "ลบห้องเรียนสำเร็จ", result?.message || "เกิดข้อผิดพลาดในการลบข้อมูล");
        } catch (error) {
          showResultAlert(false, "", "เกิดข้อผิดพลาด ไม่สามารถลบข้อมูลได้");
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans">
      <Navbar />

      <div className="p-4 sm:p-6 md:p-10 pb-24 flex-grow max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="none"
              onClick={() => navigate(-1)}
              className="text-[#B2BB1E] p-1 bg-transparent hover:scale-110 transition-transform"
            >
              <ChevronLeft size={32} />
            </Button>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#302782] dark:text-white">
              ห้องเรียน
            </h1>
          </div>

          {userRole === "staff" && (
            <Button
              onClick={() => openModal()}
              className="w-full sm:w-auto bg-[#B2BB1E] text-white rounded-2xl px-6 py-3.5 flex items-center justify-center gap-2 font-black shadow-lg hover:bg-[#302782] transition-all active:scale-95"
            >
              <Plus size={20} /> เพิ่มห้องเรียน
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 border-4 border-[#302782] border-t-[#B2BB1E] rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold animate-pulse">
              กำลังดึงข้อมูลห้อง...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 sm:gap-8">
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <div
                  key={room.room_id}
                  className="relative group bg-white dark:bg-gray-800 rounded-[35px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 pb-16 hover:border-[#B2BB1E] hover:ring-2 hover:ring-[#B2BB1E]"
                >
                  <RoomCard room={room} />

                  {/* Staff Actions Overlay */}
                  {userRole === "staff" && (
                    <div className="absolute bottom-3 left-5 flex gap-2 z-10">
                      <button
                        onClick={() => openModal(room)}
                        className="p-3 rounded-2xl text-gray-400 hover:text-[#302782] hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                        title="แก้ไข"
                      >
                        <Edit3 size={24} />
                      </button>

                      <button
                        // 🚩 เปลี่ยนไปใช้ confirmDelete แทน handleDelete เดิม
                        onClick={() => confirmDelete(room.room_id)}
                        className="p-3 rounded-2xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                        title="ลบ"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-700">
                <AlertCircle size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-400 font-bold">
                  ไม่พบข้อมูลห้องตามที่ท่านต้องการ
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {isModalOpen && (
        <RoomFormModal
          room={editingRoom}
          onClose={() => setIsModalOpen(false)}
          onSave={editingRoom ? updateRoom : addRoom}
          // ส่งไปทั้งคู่ เผื่อไฟล์ RoomFormModal อยากอัปเกรดมาใช้โชว์ Alert แบบใหม่
          showAlert={showAlert} 
          showResultAlert={showResultAlert} 
        />
      )}

      {/* 🚩 โครงสร้าง ActionModal ที่สอดคล้องกับ AlertConfig */}
      {alertConfig.isOpen && (
        <ActionModal
          icon={alertConfig.icon}
          title={alertConfig.title}
          showConfirm={alertConfig.showConfirm}
          singleButton={alertConfig.singleButton}
          variant={alertConfig.variant}
          buttonText="ตกลง"
          onClose={closeAlert}
          onConfirm={alertConfig.onConfirm}
          showBg={alertConfig.showBg}
          autoClose={alertConfig.autoClose}
          showButtons={alertConfig.showButtons}
        />
      )}
    </div>
  );
};

export default Rooms;