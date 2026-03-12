import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, Calendar as CalendarIcon } from "lucide-react"; 

import { useRoomStatusLogic } from "../hooks/useRoomStatus.js";
import {
  LoadingState,
  ErrorState,
  ScheduleItem,
  CurrentBookingCard,
} from "../components/rooms/RoomStatus_component.jsx";

const RoomStatus = () => {
  const { id } = useParams();
  const {
    roomData,
    roomDetail,
    isLoading,
    error,
    isAvailable,
    formatDate,
    navigate,
  } = useRoomStatusLogic(id);

  const handleBack = () => {
    const isLoggedIn = localStorage.getItem("token"); 
    if (isLoggedIn) {
      navigate("/scanner");
    } else {
      navigate("/");
    }
  };

  const { currentBooking, filteredSchedule } = useMemo(() => {
    if (!roomData?.schedule)
      return { currentBooking: null, filteredSchedule: [] };

    const todayStr = new Date().toISOString().split("T")[0];
    const now = new Date().getTime();

    const current = roomData.schedule.find((item) => {
      const startTimeStr = item.start_time.includes("T")
        ? item.start_time
        : `${todayStr}T${item.start_time}`;
      const endTimeStr = item.end_time.includes("T")
        ? item.end_time
        : `${todayStr}T${item.end_time}`;
      const start = new Date(startTimeStr).getTime();
      const end = new Date(endTimeStr).getTime();
      return now >= start && now < end;
    });

    const filtered = roomData.schedule.filter((item) => {
      return item.booking_id !== current?.booking_id;
    });

    return { currentBooking: current, filteredSchedule: filtered };
  }, [roomData, isAvailable]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onBack={handleBack} />;
  if (!roomData) return null;

  return (
    // ใช้ fixed inset-0 เพื่อล็อกหน้าจอให้ไม่เลื่อนไปมาบน Mobile Browser
    <div className="fixed inset-0 bg-[#302782] dark:bg-gray-950 flex flex-col font-sans overflow-hidden">
      
      {/* --- Adaptive Header --- */}
      <header className="px-4 sm:px-8 py-4 sm:py-6 text-white flex items-center justify-between z-20">
        <button 
          onClick={handleBack}
          className="p-3 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full backdrop-blur-md transition-all shadow-lg"
          aria-label="Back"
        >
          <ChevronLeft size={24} className="sm:w-7 sm:h-7 text-white" />
        </button>
        <h1 className="text-base sm:text-xl font-black tracking-widest uppercase">Room Status</h1>
        <div className="w-12"></div> {/* Spacer balance */}
      </header>

      {/* --- Content Area --- */}
      <div className="flex-grow bg-[#FFFFFF] dark:bg-gray-800 rounded-t-[40px] sm:rounded-t-[60px] relative shadow-[0_-10px_50px_rgba(0,0,0,0.3)] border-t-[6px] border-[#B2BB1E] overflow-hidden">
        
        {/* Scroll Container: จำกัดความกว้างเพื่อความสวยงามบนจอใหญ่ */}
        <div className="h-full overflow-y-auto px-6 py-8">
          <div className="max-w-2xl mx-auto space-y-8 pb-20">
            
            {/* Header Section: ข้อมูลชื่อห้องและวันที่ */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div className="space-y-1">
                <p className="text-[#B2BB1E] font-black text-xs sm:text-sm uppercase tracking-tighter">
                  {roomDetail?.room_type || "ประเภทห้องเรียน"}
                </p>
                <h2 className="text-[#302782] dark:text-white text-5xl sm:text-7xl font-black leading-tight drop-shadow-sm">
                  {id}
                </h2>
              </div>
              
              <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 bg-gray-50 sm:bg-transparent px-4 py-2 sm:p-0 rounded-2xl w-full sm:w-auto border border-gray-100 sm:border-0">
                <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">
                  Update
                </p>
                <span className="text-xs sm:text-sm font-bold text-gray-700">
                  {formatDate(roomData.date)}
                </span>
              </div>
            </header>

            <div className="h-px bg-gray-100 w-full" />

            {/* ส่วนที่ 1: สถานะปัจจุบัน (Hero Section) */}
            <section className="transform transition-all duration-500 hover:scale-[1.01]">
              <CurrentBookingCard
                item={currentBooking}
                isAvailable={isAvailable}
                capacity={roomDetail?.capacity}
              />
            </section>

            {/* ส่วนที่ 2: ตารางเวลา (Schedule Section) */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 px-2">
                <div className="h-0.5 flex-grow bg-gray-100 rounded-full" />
                <h4 className="text-[10px] sm:text-xs font-black text-gray-400 whitespace-nowrap uppercase tracking-[0.2em]">
                  {isAvailable ? "ตารางการใช้ห้องวันนี้" : "รายการจองถัดไป"}
                </h4>
                <div className="h-0.5 flex-grow bg-gray-100 rounded-full" />
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredSchedule.length > 0 ? (
                  filteredSchedule.map((item, index) => (
                    <div key={item.booking_id || `schedule-${index}`} className="group transition-all">
                      <ScheduleItem
                        item={item}
                        capacity={roomDetail?.capacity}
                      />
                    </div>
                  ))
                ) : (
                  <EmptyScheduleState isAvailable={isAvailable} />
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components (Responsive & Styled) ---

const EmptyScheduleState = ({ isAvailable }) => (
  <div className="py-16 text-center bg-gray-50 dark:bg-gray-700/50 rounded-[40px] border-2 border-dashed border-gray-100 dark:border-gray-600 flex flex-col items-center justify-center group">
    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm transition-transform group-hover:rotate-12">
       <CalendarIcon size={32} className="text-gray-300" />
    </div>
    <p className="text-gray-400 font-bold text-sm sm:text-base px-6">
      {isAvailable ? "วันนี้ไม่มีรายการจองเพิ่มเติม" : "ไม่มีรายการจองถัดไปต่อจากนี้"}
    </p>
    <p className="text-gray-300 text-[10px] mt-2 font-medium uppercase tracking-widest">Everything is Clear</p>
  </div>
);

export default RoomStatus;