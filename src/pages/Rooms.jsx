import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Building2,
  PieChart,
  LayoutGrid,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRooms } from "../hooks/useRooms";
import LoadingSpinner from "../components/common/LoadingSpinner";
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

  const closeAlert = () =>
    setAlertConfig((prev) => ({ ...prev, isOpen: false }));

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

  // 🚩 สรุปข้อมูลสำหรับ Sidebar
  const stats = useMemo(() => {
    const total = rooms.length;
    const ready = rooms.filter(
      (r) => r.repair === false && r.is_active === true,
    ).length;
    return { total, ready, maintenance: total - ready };
  }, [rooms]);

  // 🚩 จัดกลุ่มและเรียงลำดับ
  const groupedAndSortedRooms = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];
    const groups = rooms.reduce((acc, room) => {
      const building = room.location
        ? String(room.location).trim()
        : "ไม่ระบุอาคาร/สถานที่";
      if (!acc[building]) acc[building] = [];
      acc[building].push(room);
      return acc;
    }, {});

    return Object.entries(groups).map(([building, buildingRooms]) => {
      const sorted = [...buildingRooms].sort((a, b) => {
        const isReadyA = a.repair === false && a.is_active === true;
        const isReadyB = b.repair === false && b.is_active === true;
        if (isReadyA && !isReadyB) return -1;
        if (!isReadyA && isReadyB) return 1;
        return String(a.room_id).localeCompare(String(b.room_id));
      });
      return { building, rooms: sorted };
    });
  }, [rooms]);

  const openModal = (room = null) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

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

  const showAlert = (
    title,
    icon,
    onConfirm = null,
    showConfirm = true,
    singleButton = false,
    variant = "primary",
    showBg = true,
    autoClose = false,
    showButtons = null,
  ) => {
    setAlertConfig({
      isOpen: true,
      title,
      icon,
      showConfirm,
      singleButton,
      variant,
      showBg,
      autoClose,
      showButtons,
      onConfirm: onConfirm || closeAlert,
    });
  };

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
        closeAlert();
        try {
          const result = await deleteRoom(roomId);
          showResultAlert(
            result?.success !== false,
            "ลบห้องเรียนสำเร็จ",
            result?.message || "เกิดข้อผิดพลาด",
          );
        } catch (error) {
          showResultAlert(false, "", "เกิดข้อผิดพลาด");
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FE] dark:bg-gray-900 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="p-4 sm:p-6 lg:p-10 flex-grow w-full max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 🚩 SIDEBAR (ด้านข้างที่เคยโล่ง) */}
          {/* 🚩 SIDEBAR (ด้านข้างที่เคยโล่ง) */}
          <aside className="w-full lg:w-80 flex flex-col gap-6">
            {/* 🚩 ปุ่มย้อนกลับ (ย้ายออกมาข้างนอกแล้ว) */}
            <div className="px-2">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-[#302782] dark:text-gray-400 dark:hover:text-white transition-colors p-0 font-bold"
              >
                <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <ChevronLeft size={32} />
                </div>
              </Button>
            </div>

            {/* Header Mini (Card สีขาว) */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700">
              <h1 className="text-2xl font-black text-[#302782] dark:text-white leading-tight">
                จัดการห้องเรียน
              </h1>

              {userRole === "staff" && (
                <Button
                  onClick={() => openModal()}
                  className="w-full mt-6 bg-[#B2BB1E] text-white rounded-2xl py-4 flex items-center justify-center gap-2 font-bold shadow-lg shadow-[#B2BB1E]/20 hover:bg-[#302782] transition-all"
                >
                  <Plus size={20} /> เพิ่มห้องเรียน
                </Button>
              )}
            </div>

            {/* Stats Card */}
            <div className="bg-[#302782] text-white p-6 rounded-[32px] shadow-xl">
              <div className="flex items-center gap-2 mb-6 opacity-80">
                <PieChart size={20} />
                <span className="font-bold uppercase tracking-wider text-xs">
                  ภาพรวมสถานะ
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-sm opacity-70">ห้องทั้งหมด</span>
                  <span className="text-3xl font-black">{stats.total}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#B2BB1E]"
                    style={{ width: `${(stats.ready / stats.total) * 100}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <p className="text-[10px] uppercase opacity-50 font-bold">
                      พร้อมใช้
                    </p>
                    <p className="text-lg font-bold text-[#B2BB1E]">
                      {stats.ready}
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <p className="text-[10px] uppercase opacity-50 font-bold">
                      กำลังปรับปรุง
                    </p>
                    <p className="text-lg font-bold text-red-400">
                      {stats.maintenance}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* 🚩 MAIN CONTENT (พื้นที่แสดงรายการห้อง) */}
          <div className="flex-1">
            {isLoading ? (
              <div className="h-96 flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-10">
                {groupedAndSortedRooms.length > 0 ? (
                  groupedAndSortedRooms.map(
                    ({ building, rooms: buildingRooms }) => (
                      <section key={building} className="relative">
                        {/* Building Sticky Header */}
                        <div className="flex items-center gap-4 mb-6 sticky top-0 bg-[#F8F9FE]/80 dark:bg-gray-900/80 backdrop-blur-md py-2 z-10">
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-[#302782] dark:text-[#B2BB1E]">
                            <Building2 size={24} />
                          </div>
                          <div>
                            <h2 className="text-xl font-black text-[#302782] dark:text-white">
                              {building}
                            </h2>
                            <p className="text-sm text-gray-400 font-medium">
                              {buildingRooms.length} รายการห้องเรียน
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                          {buildingRooms.map((room) => (
                            <RoomCard
                              key={room.room_id}
                              room={room}
                              onEdit={openModal}
                              onDelete={confirmDelete}
                            />
                          ))}
                        </div>
                      </section>
                    ),
                  )
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-[40px] p-20 text-center border-2 border-dashed border-gray-100">
                    <LayoutGrid
                      size={64}
                      className="mx-auto text-gray-200 mb-4"
                    />
                    <p className="text-gray-400 font-bold">
                      ไม่พบข้อมูลห้องเรียนในระบบ
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals (Keep same) */}
      {isModalOpen && (
        <RoomFormModal
          room={editingRoom}
          onClose={() => setIsModalOpen(false)}
          onSave={editingRoom ? updateRoom : addRoom}
          showAlert={showAlert}
          showResultAlert={showResultAlert}
        />
      )}
      {alertConfig.isOpen && (
        <ActionModal {...alertConfig} onClose={closeAlert} />
      )}
    </div>
  );
};

export default Rooms;
