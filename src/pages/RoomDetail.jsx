import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { useRoomDetail } from "../hooks/useRoomDetail"; 
import Navbar from "../components/layout/Navbar.jsx";
import Button from "../components/common/Button.jsx";
import RoomInfo from "../components/rooms/RoomInfo";
import PageReveal from "../components/common/PageReveal";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { room, isLoading, error } = useRoomDetail();

  // 1. หน้า Error
  if (error || (!isLoading && !room)) return (
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

      <PageReveal isLoading={isLoading} loadingText="กำลังโหลดข้อมูลห้องเรียน...">
        <div className="flex-grow bg-[#FFFFFF] dark:bg-gray-800 rounded-t-[32px] sm:rounded-t-[48px] p-3 sm:p-5 lg:p-8 relative shadow-2xl overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-5">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl text-[#302782] dark:text-[#B2BB1E] transition-all active:scale-90 shadow-sm flex items-center justify-center group"
                title="ย้อนกลับ"
              >
                <ChevronLeft size={20} className="transition-transform group-hover:-translate-x-0.5" />
              </button>
              <h1 className="text-xl sm:text-2xl font-black text-[#302782] dark:text-white">
                รายละเอียดห้อง
              </h1>
            </div>
            
            {room && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 lg:p-10 mt-1 flex flex-col items-center min-h-[400px] sm:min-h-[450px] border border-gray-100 dark:border-gray-600 shadow-sm transition-all duration-300">
              
                <h2 className="text-black dark:text-white text-lg sm:text-2xl font-black mb-6 sm:mb-10 text-center leading-tight">
                  {room.name || "ไม่ระบุชื่อห้อง"} <span className="text-black dark:text-white hidden sm:inline mx-2">|</span> <br className="sm:hidden" /> <span className="text-[#302782] dark:text-[#B2BB1E]">{room.id || id}</span>
                </h2>

                <div className="w-full mb-8">
                  <RoomInfo room={room} />
                </div>

                <div className="w-full mb-12">
                  <p className="text-[#B2BB1E] text-sm sm:text-base font-black mb-5 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#B2BB1E] rounded-full"></span>
                    สิ่งอำนวยความสะดวก:
                  </p>
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {room.facilities && room.facilities.length > 0 ? (
                      room.facilities.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 text-black dark:text-white font-bold text-xs sm:text-sm bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                          <CheckCircle2 size={18} className="text-[#B2BB1E] shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-black dark:text-white text-xs">ไม่มีข้อมูลสิ่งอำนวยความสะดวก</p>
                    )}
                  </div>
                </div>

                <div className="w-full max-w-xl mx-auto space-y-3 mt-auto pt-6 border-t border-gray-200/60">
                  {room.repair === true || room.repair === 1 ? (
                    <div className="w-full p-6 bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-900/30 rounded-[25px] sm:rounded-[30px] flex flex-col items-center gap-2 shadow-sm animate-pulse">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="text-red-500" size={24} />
                        <span className="text-red-600 dark:text-red-400 font-black text-base sm:text-lg">ห้องนี้ปิดปรับปรุง</span>
                      </div>
                      <p className="text-red-400 dark:text-red-500 text-[10px] sm:text-xs font-bold text-center">ขออภัย ไม่สามารถตรวจสอบตารางหรือจองได้ในขณะนี้</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button variant="secondary" onClick={() => navigate(`/calendar/${room.id || id}`)} className="w-full text-sm sm:text-base font-bold py-4 rounded-[20px] shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-black dark:text-white">ตรวจสอบตาราง</Button>
                      <Button variant="primary" onClick={() => navigate(`/BookingRoom/${room.id || id}`)} className="w-full text-sm sm:text-base font-bold py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all bg-[#302782] text-white hover:bg-[#B2BB1E]">จองห้องเรียน</Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="h-8 sm:hidden"></div>
          </div>
        </div>
      </PageReveal>
    </div>
  );
};

export default RoomDetail;