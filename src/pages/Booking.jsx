import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, ChevronDown, Calendar, Clock, Edit3 } from "lucide-react";
import Button from "../components/common/Button.jsx";
import { useBookingLogic } from "../hooks/useBooking.js";
import { FormField } from "../components/common/FormField.jsx";

const BookingRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    rooms,
    formData,
    setFormData,
    handleSubmit,
    isLoading,
    showStatus,
    isRoomBusy,
    serverMessage,
    setShowStatus,
  } = useBookingLogic(id);

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-gray-900 flex items-center justify-center p-0 sm:p-4 md:p-8 font-sans">
      {/* Container: เต็มจอในมือถือ, เป็น Card ในจอใหญ่ */}
      <div className="bg-white dark:bg-gray-800 w-full max-w-xl min-h-screen sm:min-h-0 sm:rounded-[32px] shadow-2xl overflow-hidden relative border border-gray-100 dark:border-gray-700 transition-all">
        
        {/* Header Section */}
        <div className="px-6 py-8 sm:px-10 sm:pt-10 sm:pb-6 flex justify-between items-center border-b border-gray-50 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#302782] dark:text-white tracking-tight">
              จองห้องเรียน
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-400 mt-1">
              กรุณาระบุรายละเอียดการเข้าใช้งาน
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-red-50 hover:text-red-500 rounded-full text-gray-400 transition-all duration-200"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6 sm:space-y-8">
          
          {/* 1. เลือกห้อง */}
          <FormField label="ห้องที่ต้องการจอง" icon={<Edit3 size={16} />}>
            <div className="relative group">
              <select
                required
                value={formData.room_id}
                onChange={(e) => {
                  setFormData({ ...formData, room_id: e.target.value });
                  setShowStatus(false);
                }}
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#B2BB1E] focus:ring-4 focus:ring-[#B2BB1E]/5 appearance-none text-[#302782] font-bold transition-all cursor-pointer text-base"
              >
                <option value="" disabled>เลือกห้องเรียน</option>
                {rooms.map((r) => (
                  <option key={r.room_id} value={r.room_id}>
                    {r.room_type} — {r.room_id}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-[#B2BB1E] transition-colors" size={20} />
            </div>
          </FormField>

          {/* 2. วันที่ */}
          <FormField label="วันที่เข้าใช้งาน" icon={<Calendar size={16} />}>
            <input
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#B2BB1E] focus:ring-4 focus:ring-[#B2BB1E]/5 text-[#302782] font-semibold transition-all text-base"
              value={formData.date}
              onChange={(e) => {
                setFormData({ ...formData, date: e.target.value });
                setShowStatus(false);
              }}
            />
          </FormField>

          {/* 3. เวลา (Responsive Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="เวลาเริ่ม" icon={<Clock size={16} />}>
              <input
                type="time"
                required
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#B2BB1E] text-[#302782] font-semibold transition-all"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </FormField>
            <FormField label="เวลาสิ้นสุด" icon={<Clock size={16} />}>
              <input
                type="time"
                required
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#B2BB1E] text-[#302782] font-semibold transition-all"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </FormField>
          </div>

          {/* 4. วัตถุประสงค์ */}
          <FormField label="วัตถุประสงค์การใช้งาน">
            <textarea
              rows="3"
              placeholder="เช่น ติวสอบ, ประชุมโปรเจกต์..."
              required
              className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#B2BB1E] focus:ring-4 focus:ring-[#B2BB1E]/5 text-[#302782] resize-none font-medium transition-all leading-relaxed"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            ></textarea>
          </FormField>

          {/* Action Button */}
          <div className="pt-4 pb-8 sm:pb-0">
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full py-4.5 sm:py-5 text-lg font-bold rounded-2xl shadow-lg bg-[#302782] text-white hover:bg-[#3b3199] active:scale-[0.98] transition-all duration-200"
            >
              ยืนยันการจองห้อง
            </Button>
          </div>

          {/* Status Feedback */}
          {showStatus && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              {isRoomBusy ? (
                <div className="p-5 rounded-2xl border-2 border-red-50 bg-red-50/50 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-red-700">ผลการตรวจสอบ</span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-red-500 text-white uppercase tracking-wider">Occupied</span>
                  </div>
                  <p className="text-sm font-bold text-red-600 leading-relaxed">{serverMessage}</p>
                </div>
              ) : (
                <div className={`p-5 rounded-2xl text-center font-bold text-lg ${serverMessage.includes("✅") ? "bg-[#B2BB1E]/10 text-[#B2BB1E]" : "bg-red-50 text-red-600"}`}>
                  {serverMessage}
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookingRoom;