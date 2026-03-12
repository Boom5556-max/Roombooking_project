import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  SearchX,
  MapPin,
  Users,
  Calendar,
  Clock,
  ArrowRight,
  FileText,
  Send,
  Bookmark,
  Check,
  AlertCircle,
} from "lucide-react";
import { useRoomResults } from "../hooks/useRoomResults";
import Navbar from "../components/layout/Navbar";

const RoomResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchQuery = location.state;
  const [bookingStatus, setBookingStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    rooms,
    loading,
    error,
    selectedRoom,
    setSelectedRoom,
    purpose,
    setPurpose,
    isSubmitting,
    handleConfirmBooking,
  } = useRoomResults(searchQuery);

  const onBookingClick = async () => {
    const result = await handleConfirmBooking();
    if (result && result.success) {
      setBookingStatus("success");
      setSelectedRoom(null);
    } else {
      setBookingStatus("error");
      setErrorMessage(result?.message || "ขออภัย ห้องนี้อาจถูกจองไปแล้วในช่วงเวลานี้");
    }
  };

  // Error State Handling
  if (!searchQuery) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6 text-center font-sans">
      <div className="bg-white dark:bg-gray-800 p-8 sm:p-12 rounded-[32px] sm:rounded-[40px] shadow-xl border border-gray-100 dark:border-gray-700 max-w-md w-full">
        <AlertCircle size={64} className="text-red-400 mx-auto mb-6" />
        <p className="text-gray-500 mb-8 font-bold text-lg leading-relaxed">
          ไม่พบข้อมูลการค้นหา <br className="hidden sm:block" /> กรุณาเริ่มค้นหาใหม่
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full bg-[#302782] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#B2BB1E] transition-all shadow-lg active:scale-95"
        >
          กลับหน้าหลัก
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans">
      <Navbar />

      <div className="p-4 sm:p-6 md:p-10 flex-grow max-w-7xl mx-auto w-full">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div className="space-y-4">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-gray-400 hover:text-[#302782] dark:hover:text-[#B2BB1E] font-bold text-xs sm:text-sm transition-colors"
            >
              <ChevronLeft size={24} className="bg-white dark:bg-gray-700 rounded-xl shadow-sm p-1.5 group-hover:bg-gray-50 dark:group-hover:bg-gray-600" />
              แก้ไขการค้นหา
            </button>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#302782] dark:text-white leading-tight">
              ห้องที่ว่าง <span className="text-[#B2BB1E]">สำหรับคุณ</span>
            </h1>
          </div>
          
          {/* Query Badges - Responsive Flex */}
          <div className="flex flex-wrap gap-2 sm:gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-2 sm:p-3 rounded-2xl sm:rounded-3xl border border-white dark:border-gray-700 shadow-sm self-start lg:self-end">
            <Badge icon={<Calendar size={14} />} text={searchQuery.date} />
            <Badge icon={<Clock size={14} />} text={`${searchQuery.start_time} - ${searchQuery.end_time} น.`} />
          </div>
        </div>

        {/* Room List Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-[#302782]">
            <div className="w-12 h-12 border-4 border-[#B2BB1E] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-bold text-lg animate-pulse">กำลังตรวจสอบตารางห้องว่าง...</p>
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {rooms.map((room) => (
              <div
                key={room.room_id}
                className="bg-white dark:bg-gray-800 rounded-[32px] sm:rounded-[45px] p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="flex justify-start mb-6">
                  <span className="bg-[#B2BB1E] text-white text-[10px] sm:text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider">ว่าง</span>
                </div>
                
                <h3 className="text-3xl sm:text-4xl font-black text-[#302782] dark:text-white mb-2">{room.room_id}</h3>
                
                <p className="text-gray-400 text-xs sm:text-sm flex items-center gap-2 mb-8 font-bold">
                  <MapPin size={16} className="text-[#B2BB1E] shrink-0" />
                  <span className="truncate">{room.location || "คณะวิทยาศาสตร์ ศรีราชา"}</span>
                </p>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
                  <InfoBox label="ความจุ" value={room.capacity} icon={<Users size={16} />} />
                  <InfoBox label="ประเภทห้อง" value={room.room_type || "ห้องบรรยาย"} />
                </div>

                <button
                  onClick={() => setSelectedRoom(room)}
                  className="w-full bg-[#302782] text-white py-4 sm:py-5 rounded-2xl sm:rounded-[28px] font-bold flex items-center justify-center gap-3 hover:bg-[#B2BB1E] transition-all shadow-md active:scale-95"
                >
                  เลือกจองห้องนี้ <ArrowRight size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* 🚩 Booking Modal - ปรับเป็น Full Screen ในมือถือ */}
      {selectedRoom && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#302782]/20 dark:bg-black/60 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg max-h-[90vh] rounded-[40px] md:rounded-[50px] p-6 sm:p-10 shadow-2xl flex flex-col relative border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex justify-between items-center mb-6 sm:mb-8 flex-shrink-0">
              <h3 className="text-xl sm:text-2xl font-black text-[#302782] dark:text-white flex items-center gap-3">
                <FileText className="text-[#B2BB1E]" /> รายละเอียดการจอง
              </h3>
              <button
                onClick={() => { setSelectedRoom(null); setPurpose(""); }}
                className="p-2 text-gray-400 hover:text-red-500 font-bold text-3xl transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-6 sm:space-y-8">
              <div className="bg-gray-50 dark:bg-white/5 p-5 sm:p-6 rounded-3xl border border-gray-100 dark:border-white/10 grid grid-cols-2 gap-4">
                <div className="col-span-2 border-b border-gray-200 dark:border-white/10 pb-3 mb-1">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase">ห้องที่เลือก</p>
                  <p className="text-xl sm:text-2xl font-black text-[#302782] dark:text-white">{selectedRoom.room_id}</p>
                </div>
                <InfoDetail label="วันที่" value={searchQuery.date} />
                <InfoDetail label="เวลา" value={`${searchQuery.start_time} - ${searchQuery.end_time}`} />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 ml-2 uppercase tracking-widest">วัตถุประสงค์ในการเข้าใช้งาน</label>
                <textarea
                  rows="4"
                  className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent dark:border-white/10 focus:border-[#B2BB1E] focus:bg-white dark:focus:bg-white/10 rounded-2xl sm:rounded-[30px] p-5 sm:p-6 outline-none transition-all font-medium text-[#302782] dark:text-white text-sm sm:text-base resize-none"
                  placeholder="ระบุชื่อวิชา หรือกิจกรรม..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-6 sm:pt-10 flex-shrink-0">
              <button
                disabled={isSubmitting}
                onClick={onBookingClick}
                className={`w-full py-4 sm:py-5 rounded-2xl sm:rounded-[30px] font-black text-base sm:text-lg flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 ${
                  isSubmitting ? "bg-gray-100 dark:bg-gray-700 text-gray-400" : "bg-[#B2BB1E] text-white hover:bg-[#302782]"
                }`}
              >
                {isSubmitting ? "กำลังบันทึก..." : "ยืนยันการจอง"} <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      <StatusModal 
        isOpen={bookingStatus !== null} 
        status={bookingStatus} 
        errorMessage={errorMessage}
        onClose={() => {
          if (bookingStatus === "success") navigate("/dashboard");
          setBookingStatus(null);
        }} 
      />
    </div>
  );
};

// --- Sub-components for better Clean Code & Responsibility ---

const Badge = ({ icon, text }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-50 dark:bg-white/5 text-[#302782] dark:text-white rounded-xl text-[10px] sm:text-xs font-black border border-gray-100 dark:border-white/10">
    {icon} {text}
  </div>
);

const InfoBox = ({ label, value, icon }) => (
  <div className="bg-gray-50 dark:bg-white/5 p-3 sm:p-4 rounded-2xl sm:rounded-[28px] border border-gray-100 dark:border-white/10">
    <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 font-black mb-1 uppercase tracking-tighter">{label}</p>
    <p className="text-[#302782] dark:text-white font-black text-sm sm:text-lg flex items-center gap-2 truncate">
      {icon} {value}
    </p>
  </div>
);

const InfoDetail = ({ label, value }) => (
  <div>
    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase">{label}</p>
    <p className="text-xs sm:text-sm font-black text-[#302782] dark:text-white">{value}</p>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-[40px] sm:rounded-[60px] border-2 border-dashed border-gray-200 dark:border-gray-700 px-6 text-center">
    <SearchX size={56} className="text-gray-200 mb-6" />
    <h2 className="text-2xl sm:text-3xl font-black text-[#302782] dark:text-white mb-2">ไม่พบห้องว่างตามเงื่อนไข</h2>
    <p className="text-gray-400 font-bold text-sm sm:text-base">ลองปรับเปลี่ยนเวลาหรือวันที่ค้นหาดูอีกครั้ง</p>
  </div>
);

const StatusModal = ({ isOpen, status, errorMessage, onClose }) => {
  if (!isOpen) return null;
  const isSuccess = status === "success";
  const user = JSON.parse(localStorage.getItem("user"));
  const isTeacher = user?.role === "teacher";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-[40px] p-8 w-full max-w-sm shadow-2xl text-center animate-in zoom-in duration-300 border border-white/50">
        <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isSuccess ? 'bg-[#B2BB1E]/10 text-[#B2BB1E]' : 'bg-red-50 dark:bg-red-500/10 text-red-500'}`}>
          {isSuccess ? <Check size={40} strokeWidth={3} /> : <AlertCircle size={40} strokeWidth={3} />}
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-[#302782] dark:text-white mb-3">{isSuccess ? "จองสำเร็จ!" : "การจองไม่สำเร็จ"}</h3>
        <p className="text-gray-500 dark:text-gray-400 font-bold text-sm sm:text-base mb-8">
          {isSuccess 
            ? (isTeacher ? "คำขอจองถูกส่งแล้ว กรุณารอการอนุมัติ" : "การจองของคุณเสร็จสมบูรณ์") 
            : (errorMessage || "ขออภัย ห้องนี้อาจถูกจองไปแล้วในช่วงเวลานี้")}
        </p>
        <button
          onClick={onClose}
          className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all ${isSuccess ? 'bg-[#302782] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}
        >
          {isSuccess ? "ตกลง" : "ลองใหม่อีกครั้ง"}
        </button>
      </div>
    </div>
  );
};

export default RoomResults;