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
  
  // ✨ เพิ่ม State สำหรับเก็บข้อความเหตุผล
  const [cancelReason, setCancelReason] = useState("");

  const [alertConfig, setAlertConfig] = useState({
    show: false,
    title: "",
    msg: "",
    type: "error",
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
    if (ownerId === myId || userData.role === "staff") return true;

    setAlertConfig({
      show: true,
      title: "สิทธิ์ไม่เพียงพอ",
      msg: `เฉพาะเจ้าหน้าที่หรืออาจารย์เจ้าของวิชาเท่านั้น (ผู้สอน: ${ownerId || "ไม่พบ ID"} / คุณ: ${myId})`,
      type: "error",
    });
    return false;
  };

  return (
    <div className="h-screen bg-[#FDFDFF] dark:bg-gray-900 flex flex-col overflow-hidden font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-grow flex flex-col overflow-hidden p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1800px] mx-auto w-full">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4 flex-shrink-0">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full lg:w-auto flex-grow">
            <div className="w-full md:w-80">
              <RoomSelector
                rooms={rooms}
                selectedRoom={selectedRoom}
                onSelect={setSelectedRoom}
                disabled={isCancelMode}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 px-1 text-[11px] sm:text-xs text-black dark:text-white font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-sm"></span>
                <span>อัปโหลดตารางเรียน</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-sm"></span>
                <span>การจองผ่านระบบ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9CA3AF] shadow-sm"></span>
                <span>งดใช้ห้อง</span>
              </div>
            </div>
          </div>

          {selectedRoom && (
            <button
              onClick={() => setIsCancelMode(!isCancelMode)}
              className={`w-full lg:w-auto flex items-center justify-center gap-2 px-6 h-12 rounded-2xl font-bold text-sm transition-all shadow-sm active:scale-[0.98] ${
                isCancelMode
                  ? "bg-[#B2BB1E] text-white ring-4 ring-[#B2BB1E]/20"
                  : "bg-white dark:bg-gray-800 text-[#302782] dark:text-white border border-gray-200 dark:border-gray-700 hover:border-[#302782]"
              }`}
            >
              {isCancelMode ? <X size={18} /> : <Settings2 size={18} />}
              <span>{isCancelMode ? "เสร็จสิ้น" : "จัดการงดใช้ห้อง"}</span>
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

      <EventModal
        event={selectedEvent}
        onClose={() => {
          setShowModal(false);
          setSelectedEvent(null);
        }}
      />

      {/* ✨ Modal ยืนยันการงดใช้ห้อง (เปลี่ยนเป็น Custom Modal เพื่อใส่ Textarea) */}
      {/* ✨ Modal ยืนยันการงดใช้ห้อง (บังคับกรอกเหตุผล) */}
      {showConfirmCancel && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-[#302782]/30 dark:bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 sm:p-8 w-full max-w-md shadow-2xl flex flex-col border border-white dark:border-gray-700 scale-in">
            <div className="flex justify-center mb-4">
               <Power size={48} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-center text-[#302782] dark:text-white mb-2">ยืนยันการงดใช้ห้อง</h3>
            <p className="text-center text-black dark:text-white text-sm mb-6 font-medium">
              วิชา "{showConfirmCancel.title}" จะแสดงสถานะงดการใช้ห้องเรียน
            </p>

            {/* ช่องกรอกเหตุผล */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-black dark:text-white mb-2">
                เหตุผลการงดใช้ห้อง <span className="text-red-500 font-bold">*</span>
              </label>
              <textarea
                className="w-full p-4 rounded-[16px] bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent text-sm text-black dark:text-white resize-none transition-all placeholder:text-black dark:placeholder:text-white/30"
                rows="3"
                placeholder="จำเป็นต้องระบุเหตุผล (เช่น อาจารย์ติดภารกิจ, ห้องปรับปรุง)..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmCancel(null);
                  setCancelReason("");
                }}
                className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-[16px] font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                // ✨ ตรวจสอบว่าถ้าไม่ได้พิมพ์ข้อความ หรือพิมพ์แค่ Spacebar จะให้ปุ่มถูก Disabled
                disabled={!cancelReason.trim()} 
                onClick={async () => {
                  const res = await handleCancelSchedule(showConfirmCancel.id, cancelReason);
                  if (res.success) {
                    setShowConfirmCancel(null);
                    setCancelReason(""); 
                    setAlertConfig({
                      show: true,
                      title: "สำเร็จ",
                      msg: "ตั้งสถานะงดใช้ห้องเรียนเรียบร้อยแล้ว",
                      type: "success"
                    });
                  }
                }}
                // ✨ เปลี่ยนสีปุ่มให้จางลงเมื่อกดยืนยันไม่ได้
                className={`flex-1 py-3.5 rounded-[16px] font-bold text-sm transition-all ${
                  cancelReason.trim()
                    ? "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30"
                    : "bg-red-300 text-white/70 cursor-not-allowed"
                }`}
              >
                ยืนยันงดใช้ห้อง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal เปิดการใช้งานห้องกลับมาปกติ (ใช้ ActionModal เดิมได้เลยเพราะไม่ต้องระบุเหตุผล) */}
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

      {/* Alert Modal */}
      {alertConfig.show && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-6 bg-[#302782]/30 dark:bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 w-full max-w-xs sm:max-w-sm shadow-2xl text-center border border-white dark:border-gray-700 scale-in flex flex-col items-center">
            {alertConfig.type === 'success' ? (
              <CheckCircle size={64} className="text-[#B2BB1E] mb-5" strokeWidth={2} />
            ) : (
              <div className="text-red-500 mb-5">
                <AlertCircle size={64} strokeWidth={2} />
              </div>
            )}
            <h3 className="text-2xl font-black text-[#302782] dark:text-white mb-2">{alertConfig.title}</h3>
            <p className="text-black dark:text-white text-sm mb-8 leading-relaxed font-medium">{alertConfig.msg}</p>
            <button
              onClick={() => setAlertConfig({ ...alertConfig, show: false })}
              className="w-full py-4 bg-[#302782] text-white rounded-[16px] font-bold text-base active:scale-[0.98] transition-all hover:bg-[#201a57]"
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