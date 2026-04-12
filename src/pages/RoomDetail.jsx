import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useRoomDetail } from "../hooks/useRoomDetail"; 
import Navbar from "../components/layout/Navbar.jsx";
import Button from "../components/common/Button.jsx";
import RoomInfo from "../components/rooms/RoomInfo";
import LoadingSpinner from "../components/common/LoadingSpinner";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { room, isLoading, error } = useRoomDetail();

  // 1. หน้า Loading
  if (isLoading) return <LoadingSpinner fullPage text="กำลังโหลดข้อมูลห้อง..." />;

  // 2. หน้า Error
  if (error || !room) return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-gray-900 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="bg-red-50 p-8 rounded-[40px] max-w-md mx-auto">
        <AlertTriangle className="text-red-500 mx-auto mb-4" size={64} />
        <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-6">
          {error || "ไม่พบข้อมูลห้องเรียนนี้"}
        </h2>
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="text-[#302782] dark:text-[#B2BB1E] underline font-extrabold hover:text-[#B2BB1E] dark:hover:text-white transition-colors"
        >
          กลับไปหน้าหลัก
        </Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#302782] dark:bg-gray-950 flex flex-col font-sans overflow-hidden">
      <Navbar />
      
      {/* Header Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-6 flex flex-none items-center gap-2 sm:gap-4">
        <Button 
          variant="ghost" 
          size="none" 
          onClick={() => navigate(-1)} 
          className="text-[#B2BB1E] bg-transparent p-1 hover:scale-110 transition-transform"
        >
          <ChevronLeft size={32} className="sm:w-10 sm:h-10" />
        </Button>
        <h1 className="text-[#B2BB1E] text-2xl sm:text-4xl font-black truncate">รายละเอียดห้อง</h1>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow bg-[#FFFFFF] dark:bg-gray-800 rounded-t-[40px] sm:rounded-t-[60px] p-4 sm:p-6 lg:p-10 xl:p-12 relative shadow-2xl overflow-y-auto">
        {/* 🟢 แก้ตรงนี้: เปลี่ยนจาก max-w-4xl เป็น max-w-6xl ให้รับกับจอโน้ตบุ๊ก และเพิ่ม w-full */}
        <div className="w-full max-w-6xl mx-auto">
          
          {/* Room Card */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-[30px] sm:rounded-[40px] p-6 sm:p-10 lg:p-12 mt-2 flex flex-col items-center min-h-[450px] sm:min-h-[500px] border border-gray-100 dark:border-gray-600 shadow-sm">
            
            <h2 className="text-black dark:text-white text-xl sm:text-3xl font-black mb-8 sm:mb-12 text-center leading-tight">
              {room.name || "ไม่ระบุชื่อห้อง"} <span className="text-black dark:text-white hidden sm:inline mx-2">|</span> <br className="sm:hidden" /> <span className="text-[#302782] dark:text-[#B2BB1E]">{room.id || id}</span>
            </h2>

            {/* ส่วนข้อมูลห้อง */}
            <div className="w-full mb-10">
              <RoomInfo room={room} />
            </div>

            {/* ส่วนสิ่งอำนวยความสะดวก */}
            <div className="w-full mb-12">
              <p className="text-[#B2BB1E] text-base sm:text-lg font-black mb-5 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#B2BB1E] rounded-full"></span>
                สิ่งอำนวยความสะดวก:
              </p>
              {/* 🟢 แก้ตรงนี้: เพิ่ม lg:grid-cols-3 และ xl:grid-cols-4 ให้เรียงการ์ดสวยขึ้นบนจอใหญ่ */}
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {room.facilities && room.facilities.length > 0 ? (
                  room.facilities.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-black dark:text-white font-bold text-sm sm:text-base bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                      <CheckCircle2 size={20} className="text-[#B2BB1E] shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-black dark:text-white text-sm">ไม่มีข้อมูลสิ่งอำนวยความสะดวก</p>
                )}
              </div>
            </div>

            {/* --- Action Buttons --- */}
            {/* 🟢 แก้ตรงนี้: จำกัดความกว้างของปุ่มบนจอใหญ่ ไม่ให้ปุ่มยืดกว้างเกินไปจนดูตลก (max-w-2xl) */}
            <div className="w-full max-w-2xl mx-auto space-y-4 mt-auto pt-8 border-t border-gray-200/60">
              {room.repair === true || room.repair === 1 ? (
                /* 🚩 กรณีห้องซ่อม */
                <div className="w-full p-6 bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-900/30 rounded-[25px] sm:rounded-[30px] flex flex-col items-center gap-2 shadow-sm animate-pulse">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-red-500" size={24} />
                    <span className="text-red-600 dark:text-red-400 font-black text-lg sm:text-xl">
                      ห้องนี้ปิดปรับปรุง
                    </span>
                  </div>
                  <p className="text-red-400 dark:text-red-500 text-xs sm:text-sm font-bold text-center">
                    ขออภัย ไม่สามารถตรวจสอบตารางหรือจองได้ในขณะนี้
                  </p>
                </div>
              ) : (
                /* ✅ กรณีห้องปกติ */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate(`/calendar/${room.id || id}`)} 
                    className="w-full text-base sm:text-lg font-bold py-4 rounded-[20px] shadow-sm hover:shadow-md active:scale-95 transition-all bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-black dark:text-white"
                  >
                    ตรวจสอบตาราง
                  </Button>
                  
                  <Button 
                    variant="primary" 
                    onClick={() => navigate(`/BookingRoom/${room.id || id}`)} 
                    className="w-full text-base sm:text-lg font-bold py-4 rounded-[20px] shadow-sm hover:shadow-md active:scale-95 transition-all bg-[#302782] text-white hover:bg-[#B2BB1E]"
                  >
                    จองห้องเรียน
                  </Button>
                </div>
              )}
            </div>

          </div>
          {/* Spacer สำหรับ Mobile */}
          <div className="h-8 sm:hidden"></div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;