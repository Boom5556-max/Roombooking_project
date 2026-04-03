import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useCalendarData } from "../hooks/useCalendarData";
import {
  Check,
  CheckCircle,
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
import LoadingSpinner from "../components/common/LoadingSpinner";
import { jwtDecode } from "jwt-decode";

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
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        return {
          id: String(decoded?.user_id || decoded?.id || ""),
          role: String(decoded?.role || "").toLowerCase().trim(),
        };
      }
    } catch (err) {
      console.error("Token Decode Error:", err);
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
    type: "error", // 'error' | 'success'
  });

  if (isLoading) return <LoadingSpinner fullPage text="กำลังจัดเตรียมตารางเรียน..." />;

  const checkPermission = (event) => {
    const props = event.extendedProps;
    
    if (!props?.isSchedule) {
      setAlertConfig({
        show: true,
        title: "ดำเนินการไม่ได้",
        msg: "เมนูนี้จัดการได้เฉพาะ 'ตารางเรียนหลัก' เท่านั้นครับ หากต้องการยกเลิกการจองทั่วไป กรุณาทำที่หน้าประวัติการจอง",
        type: "error",
      });
      return false;
    }

    const ownerId = String(props?.teacher_id || props?.user_id || "");
    const myId = String(userData.id || "");
    
    const isOwner = ownerId === myId;
    const isStaff = userData.role === "staff";

    if (isOwner || isStaff) return true;

    setAlertConfig({
      show: true,
      title: "สิทธิ์ไม่เพียงพอ",
      msg: `เฉพาะเจ้าหน้าที่หรืออาจารย์เจ้าของวิชาเท่านั้น (ผู้สอน: ${ownerId || "ไม่พบ ID"} / คุณ: ${myId})`,
      type: "error",
    });
    return false;
  };

  return (
    <div className="h-screen bg-[#FDFDFF] dark:bg-gray-900 flex flex-col overflow-hidden font-sans">
      <Navbar />

      <main className="flex-grow flex flex-col overflow-hidden p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1800px] mx-auto w-full">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 flex-shrink-0">
          <div className="w-full sm:w-auto flex-grow max-w-md">
            <RoomSelector
              rooms={rooms}
              selectedRoom={selectedRoom}
              onSelect={setSelectedRoom}
              disabled={isCancelMode}
            />
          </div>

          {selectedRoom && (
            <button
              onClick={() => setIsCancelMode(!isCancelMode)}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 h-12 rounded-2xl font-bold text-sm transition-all shadow-sm active:scale-[0.98] ${
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
            if (res.success) {
              setShowConfirmCancel(null);
              setAlertConfig({
                show: true,
                title: "สำเร็จ",
                msg: "ตั้งสถานะงดใช้ห้องเรียนเรียบร้อยแล้ว",
                type: "success"
              });
            }
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
            if (res.success) {
              setShowConfirmRestore(null);
              setAlertConfig({
                show: true,
                title: "สำเร็จ",
                msg: "เปิดการใช้งานห้องเรียนเรียบร้อยแล้ว",
                type: "success"
              });
            }
          }}
        />
      )}

      {/* Alert Modal: ปรับสีและดีไซน์ให้เหมือนหน้าอื่นๆ */}
      {alertConfig.show && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-[#302782]/30 dark:bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 w-full max-w-xs sm:max-w-sm shadow-2xl text-center border border-white dark:border-gray-700 scale-in flex flex-col items-center">
            
            {/* ไอคอนจะเปลี่ยนไปตาม type */}
            {alertConfig.type === 'success' ? (
              <CheckCircle size={64} className="text-[#B2BB1E] mb-5" strokeWidth={2} />
            ) : (
              <div className="text-red-500 mb-5">
                <AlertCircle size={64} strokeWidth={2} />
              </div>
            )}

            <h3 className="text-2xl font-black text-[#302782] dark:text-white mb-2">
              {alertConfig.title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed font-medium">
              {alertConfig.msg}
            </p>
            
            {/* ปุ่มกดยืนยัน ใช้สีน้ำเงินเข้มเหมือนหน้าอื่นๆ เสมอ */}
            <button
              onClick={() => setAlertConfig({ ...alertConfig, show: false })}
              className="w-full py-4 bg-[#302782] text-white rounded-2xl font-bold text-base active:scale-[0.98] transition-all hover:bg-[#201a57]"
            >
              {alertConfig.type === 'success' ? 'ตกลง' : 'รับทราบ'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;