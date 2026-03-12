import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useCalendarData } from "../hooks/useCalendarData";
import {
  Check,
  X,
  Power,
  RotateCcw,
  AlertCircle,
  Settings2,
} from "lucide-react";
import Navbar from "../components/layout/Navbar.jsx";
import RoomSelector from "../components/calendar/RoomSelector";
import CalendarView from "../components/calendar/CalendarView";
import EventModal from "../components/calendar/EventModal";
import ActionModal from "../components/common/ActionModal.jsx";

const Calendar = () => {
  const { id } = useParams();
  const {
    rooms,
    selectedRoom,
    setSelectedRoom,
    events,
    isLoading,
    isCancelMode,
    setIsCancelMode,
    handleCancelSchedule,
    handleRestoreSchedule,
  } = useCalendarData(id);

  const userData = useMemo(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return {
          id: parsed?.user_id || parsed?.id,
          role: String(parsed?.role || "").toLowerCase().trim(),
        };
      }
    } catch (err) {
      console.error("User Parse Error", err);
    }
    return { id: null, role: "student" };
  }, []);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(null);
  const [showConfirmRestore, setShowConfirmRestore] = useState(null);

  const [alertConfig, setAlertConfig] = useState({
    show: false,
    title: "",
    msg: "",
  });

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center font-sans bg-[#FFFFFF] dark:bg-gray-900">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-100 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-t-[#302782] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-lg font-bold text-[#302782] dark:text-white mt-6 tracking-tight">กำลังจัดเตรียมตารางเรียน...</p>
      </div>
    );
  }

  const checkPermission = (event) => {
    const props = event.extendedProps;
    if (!props?.isSchedule) {
      setAlertConfig({
        show: true,
        title: "ดำเนินการไม่ได้",
        msg: "จัดการได้เฉพาะ 'ตารางเรียนหลัก' เท่านั้น",
      });
      return false;
    }

    const isOwner = String(props?.teacher_id || "") === String(userData.id || "");
    const isStaff = userData.role === "staff";

    if (isOwner || isStaff) return true;

    setAlertConfig({
      show: true,
      title: "สิทธิ์ไม่เพียงพอ",
      msg: "เฉพาะเจ้าหน้าที่หรืออาจารย์เจ้าของวิชาเท่านั้นที่จัดการได้",
    });
    return false;
  };

  return (
    <div className="h-screen bg-[#FDFDFF] dark:bg-gray-900 flex flex-col overflow-hidden font-sans">
      <Navbar />

      {/* Main Container: จำกัดความสูงเท่าพื้นที่ที่เหลือ */}
      <main className="flex-grow flex flex-col overflow-hidden p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1800px] mx-auto w-full">
        
        {/* Top Controls: ยืดหยุ่นตามหน้าจอ */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 flex-shrink-0">
          <div className="w-full sm:w-auto flex-grow max-w-md">
            <RoomSelector
              rooms={rooms}
              selectedRoom={selectedRoom}
              onSelect={setSelectedRoom}
            />
          </div>

          {selectedRoom && (
            <button
              onClick={() => setIsCancelMode(!isCancelMode)}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 h-12 rounded-2xl font-bold text-sm transition-all shadow-sm active:scale-95 ${
                isCancelMode
                  ? "bg-[#B2BB1E] text-white ring-4 ring-[#B2BB1E]/20"
                  : "bg-white dark:bg-gray-800 text-[#302782] dark:text-white border border-gray-200 dark:border-gray-700 hover:border-[#302782]"
              }`}
            >
              {isCancelMode ? <X size={18} /> : <Settings2 size={18} />}
              <span>{isCancelMode ? "เสร็จสิ้นการจัดการ" : "จัดการงดใช้ห้อง"}</span>
            </button>
          )}
        </div>

        {/* Calendar Box: พื้นที่นี้จะขยายใหญ่ที่สุด */}
        <div className="flex-grow bg-white dark:bg-gray-800 rounded-[24px] sm:rounded-[32px] shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
          <CalendarView
            events={events}
            isCancelMode={isCancelMode}
            currentUserId={userData.id}
            currentUserRole={userData.role}
            onEventClick={(info) => {
              if (isCancelMode) {
                if (checkPermission(info.event)) {
                  const isClosed = info.event.extendedProps.temporarily_closed;
                  if (isClosed) setShowConfirmRestore(info.event);
                  else setShowConfirmCancel(info.event);
                }
                return;
              }
              setSelectedEvent(info.event);
              setShowModal(true);
            }}
          />
        </div>
      </main>

      {/* --- Modals Section --- */}
      <EventModal
        event={selectedEvent}
        onClose={() => {
          setShowModal(false);
          setSelectedEvent(null);
        }}
      />

      {showConfirmCancel && (
        <ActionModal
          icon={<Power size={32} />}
          title="ยืนยันการงดใช้ห้อง"
          message={`วิชา "${showConfirmCancel.title}" จะแสดงสถานะงดการใช้ห้องเรียน`}
          onClose={() => setShowConfirmCancel(null)}
          onConfirm={async () => {
            const res = await handleCancelSchedule(showConfirmCancel.id);
            if (res.success) setShowConfirmCancel(null);
          }}
        />
      )}

      {showConfirmRestore && (
        <ActionModal
          icon={<RotateCcw size={32} />}
          title="เปิดการใช้งานห้อง"
          message={`ต้องการยกเลิกสถานะ "งดใช้ห้อง" สำหรับวิชานี้ใช่หรือไม่?`}
          onClose={() => setShowConfirmRestore(null)}
          onConfirm={async () => {
            const res = await handleRestoreSchedule(showConfirmRestore.id);
            if (res.success) setShowConfirmRestore(null);
          }}
        />
      )}

      {/* Alert Modal: Responsive Size */}
      {alertConfig.show && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-[#302782]/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 w-full max-w-xs sm:max-w-sm shadow-2xl text-center border border-white dark:border-gray-700 scale-in">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-12">
              <AlertCircle size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-[#302782] dark:text-white mb-2">{alertConfig.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed font-medium">{alertConfig.msg}</p>
            <button
              onClick={() => setAlertConfig({ ...alertConfig, show: false })}
              className="w-full py-4 bg-[#302782] text-white rounded-xl font-bold text-base active:scale-95 transition-all"
            >
              รับทราบ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;