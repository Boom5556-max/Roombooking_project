import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, Calendar as CalendarIcon, XCircle } from "lucide-react";

import { useRoomStatusLogic } from "../hooks/useRoomStatus.js";
import {
  ScheduleItem,
  CurrentBookingCard,
} from "../components/rooms/RoomStatus_component.jsx";
import ActionModal from "../components/common/ActionModal";
import PageReveal from "../components/common/PageReveal";

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
      navigate("/scanner", { replace: true });
    } else {
      navigate("/", { replace: true });
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

  if (error) {
    return (
      <div className="fixed inset-0 bg-[#302782]/20 dark:bg-gray-950/80 flex flex-col font-sans overflow-hidden backdrop-blur-sm z-50">
        <ActionModal
          icon={<XCircle size={50} className="text-red-500" />}
          title="เกิดข้อผิดพลาด"
          subTitle={typeof error === "string" ? error : "สแกนไม่สำเร็จ หรือไม่มี QR Code นี้ในระบบ กรุณาลองใหม่อีกครั้ง"}
          variant="danger"
          showCancel={false}
          confirmText="กลับไปหน้าสแกน"
          onConfirm={handleBack}
          onClose={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#302782] dark:bg-gray-950 flex flex-col font-sans overflow-hidden">
      <header className="px-4 sm:px-8 py-4 sm:py-6 text-white flex items-center justify-between z-20">
        <button 
          onClick={handleBack}
          className="p-2.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-xl backdrop-blur-md transition-all shadow-lg flex items-center justify-center group"
          aria-label="Back"
        >
          <ChevronLeft size={24} className="transition-transform group-hover:-translate-x-0.5" />
        </button>
        <h1 className="text-base sm:text-xl font-black tracking-widest uppercase">Room Status</h1>
        <div className="w-12"></div>
      </header>

      <PageReveal isLoading={isLoading} loadingText="กำลังดึงสถานะห้องเรียน...">
        <div className="h-full bg-[#FFFFFF] dark:bg-gray-800 rounded-t-[40px] sm:rounded-t-[60px] relative shadow-[0_-10px_50px_rgba(0,0,0,0.3)] border-t-[6px] border-[#B2BB1E] overflow-hidden">
          <div className="h-full overflow-y-auto px-6 py-8">
            <div className="max-w-2xl mx-auto space-y-8 pb-20">
              <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div className="space-y-1">
                  <h2 className="text-[#302782] dark:text-white text-5xl sm:text-7xl font-black leading-tight">
                    {id}
                  </h2>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 bg-gray-50 dark:bg-gray-700 sm:bg-transparent sm:dark:bg-transparent px-4 py-2 sm:p-0 rounded-2xl w-full sm:w-auto border border-gray-100 dark:border-gray-600 sm:border-0">
                  <p className="text-[10px] sm:text-xs font-black text-black dark:text-white uppercase tracking-widest">Update</p>
                  <span className="text-xs sm:text-sm font-bold text-black dark:text-white">
                    {roomData ? formatDate(roomData.date) : '-'}
                  </span>
                </div>
              </header>

              <div className="h-px bg-gray-100 dark:bg-gray-700 w-full" />

              <section className="transform transition-all duration-500 hover:scale-[1.01]">
                {roomData && (
                  <CurrentBookingCard
                    item={currentBooking}
                    isAvailable={isAvailable}
                    capacity={roomDetail?.capacity}
                  />
                )}
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                  <div className="h-0.5 flex-grow bg-gray-100 dark:bg-gray-700 rounded-full" />
                  <h4 className="text-[10px] sm:text-xs font-black text-black dark:text-white whitespace-nowrap uppercase tracking-[0.2em]">
                    {isAvailable ? "ตารางการใช้ห้องวันนี้" : "รายการจองถัดไป"}
                  </h4>
                  <div className="h-0.5 flex-grow bg-gray-100 dark:bg-gray-700 rounded-full" />
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
      </PageReveal>
    </div>
  );
};

// --- Sub-components ---
const EmptyScheduleState = ({ isAvailable }) => (
  <div className="py-16 text-center bg-gray-50 dark:bg-gray-700/50 rounded-[40px] border-2 border-dashed border-gray-100 dark:border-gray-600 flex flex-col items-center justify-center group">
    <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-sm transition-transform group-hover:rotate-12">
       <CalendarIcon size={32} className="text-black dark:text-white" />
    </div>
    <p className="text-black dark:text-white font-bold text-sm sm:text-base px-6">
      {isAvailable ? "วันนี้ไม่มีรายการจองเพิ่มเติม" : "ไม่มีรายการจองถัดไปต่อจากนี้"}
    </p>
  </div>
);

export default RoomStatus;