import React from "react";
import { useParams, useNavigate } from "react-router-dom";
// 🌟 เพิ่ม FileText เข้ามาสำหรับไอคอนหมายเหตุ
import { X, ChevronDown, ChevronLeft, Calendar, Clock, Edit3, FileText } from "lucide-react";
import Button from "../components/common/Button.jsx";
import { useBookingLogic } from "../hooks/useBooking.js";
import { FormField } from "../components/common/FormField.jsx";

// 👇 1. สร้างช่วงเวลา 08:00 - 20:00 (ห่างกันทุก 30 นาที) ไว้ด้านนอก Component 👇
const baseTimes = [];
for (let i = 8; i <= 20; i++) {
  const h = i.toString().padStart(2, "0");
  baseTimes.push(`${h}:00`);
  if (i !== 20) baseTimes.push(`${h}:30`);
}

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

  // 👇 2. ฟังก์ชันสร้าง Dropdown เลือกเวลา 👇
  const renderTimeDropdown = (key, label) => {
    const availableTimes = baseTimes.filter((t) => {
      if (key === "end_time" && t === "08:00") return false;
      if (key === "start_time" && t === "20:00") return false;
      // กรองเวลาไม่ให้เลือกขัดแย้งกัน
      if (key === "end_time" && formData.start_time) return t > formData.start_time;
      if (key === "start_time" && formData.end_time) return t < formData.end_time;
      return true;
    });

    return (
      <FormField label={label} icon={<Clock size={16} />}>
        <details className="group/dropdown w-full relative" id={`dropdown-${key}`}>
          <summary className="list-none outline-none cursor-pointer">
            <div className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent dark:border-white/10 rounded-2xl py-4 px-5 flex justify-between items-center group-hover/dropdown:border-[#B2BB1E]/50 focus-within:border-[#B2BB1E] transition-all">
              <span className={`font-semibold text-base ${formData[key] ? "text-[#302782] dark:text-white" : "text-black dark:text-white"}`}>
                {formData[key] ? `${formData[key]} น.` : "เลือกเวลา"}
              </span>
              <ChevronDown className="text-black dark:text-white group-open/dropdown:rotate-180 transition-transform pointer-events-none" size={20} />
            </div>
          </summary>

          {/* รายการเวลาที่ลอยออกมา */}
          <div className="absolute left-0 top-[calc(100%+8px)] w-full z-[100] animate-in fade-in zoom-in duration-200">
            <ul className="bg-white dark:bg-gray-800 rounded-[20px] shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="max-h-[200px] overflow-y-auto py-2 custom-scrollbar">
                {availableTimes.map((t) => (
                  <li 
                    key={t} 
                    className="px-6 py-3 text-[#302782] dark:text-white text-base font-bold hover:bg-[#B2BB1E] hover:text-white cursor-pointer transition-colors"
                    onClick={() => {
                      setFormData({ ...formData, [key]: t });
                      document.getElementById(`dropdown-${key}`).removeAttribute("open");
                      setShowStatus(false);
                    }}
                  >
                    {t} น.
                  </li>
                ))}
              </div>
            </ul>
          </div>
        </details>
      </FormField>
    );
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-gray-900 flex items-center justify-center p-0 sm:p-4 md:p-8 font-sans">
      {/* Container: เต็มจอในมือถือ, เป็น Card ในจอใหญ่ */}
      <div className="bg-white dark:bg-gray-800 w-full max-w-xl min-h-screen sm:min-h-0 rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden relative border border-gray-100 dark:border-gray-700 transition-all">
        
        {/* Header Section */}
        <div className="px-6 py-8 sm:px-10 sm:pt-10 sm:pb-6 flex items-center gap-6 bg-white dark:bg-gray-800 sticky top-0 z-10 border-b border-gray-50 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl text-[#302782] dark:text-[#B2BB1E] transition-all active:scale-90 shadow-sm flex items-center justify-center group"
            title="ย้อนกลับ"
          >
            <ChevronLeft size={24} className="transition-transform group-hover:-translate-x-0.5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#302782] dark:text-white tracking-tight">
              จองห้องเรียน
            </h1>
            <p className="text-xs sm:text-sm font-medium text-black dark:text-white mt-1">
              กรุณาระบุรายละเอียดการเข้าใช้งาน
            </p>
          </div>
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
                className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent dark:border-white/10 rounded-2xl py-4 px-5 outline-none focus:bg-white dark:focus:bg-white/10 focus:border-[#B2BB1E] focus:ring-4 focus:ring-[#B2BB1E]/5 appearance-none text-[#302782] dark:text-white font-bold transition-all cursor-pointer text-base"
              >
                <option value="" disabled className="dark:bg-gray-800 dark:text-white">
                  เลือกห้องเรียน
                </option>
                {rooms.map((r) => (
                  <option 
                    key={r.room_id} 
                    value={r.room_id} 
                    className="dark:bg-gray-800 dark:text-white text-black" 
                  >
                    {r.room_type} — {r.room_id}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-black dark:text-white group-focus-within:text-[#B2BB1E] transition-colors" size={20} />
            </div>
          </FormField>

          {/* 2. วันที่ */}
          <FormField label="วันที่เข้าใช้งาน" icon={<Calendar size={16} />}>
            <input
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent dark:border-white/10 rounded-2xl py-4 px-5 outline-none focus:bg-white dark:focus:bg-white/10 focus:border-[#B2BB1E] focus:ring-4 focus:ring-[#B2BB1E]/5 text-[#302782] dark:text-white font-semibold transition-all text-base cursor-pointer"
              value={formData.date}
              onChange={(e) => {
                setFormData({ ...formData, date: e.target.value });
                setShowStatus(false);
              }}
            />
          </FormField>

          {/* 👇 3. เวลา (เรียกใช้ฟังก์ชัน Custom Dropdown) 👇 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative">
            {renderTimeDropdown("start_time", "เวลาเริ่ม")}
            {renderTimeDropdown("end_time", "เวลาสิ้นสุด")}
          </div>

          {/* 4. วัตถุประสงค์ */}
          <FormField label="วัตถุประสงค์การใช้งาน" icon={<Edit3 size={16} />}>
            <textarea
              rows="3"
              placeholder="เช่น ติวสอบ, ประชุมโปรเจกต์..."
              required
              className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent dark:border-white/10 rounded-2xl py-4 px-5 outline-none focus:bg-white dark:focus:bg-white/10 focus:border-[#B2BB1E] focus:ring-4 focus:ring-[#B2BB1E]/5 text-[#302782] dark:text-white resize-none font-medium transition-all leading-relaxed"
              value={formData.purpose || ""}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            ></textarea>
          </FormField>

          {/* 🌟 5. หมายเหตุเพิ่มเติม (ไม่บังคับ) */}
          <FormField label="หมายเหตุเพิ่มเติม (ถ้ามี)" icon={<FileText size={16} />}>
            <textarea
              rows="2"
              placeholder="เช่น ขอไมค์เพิ่ม, ขอเปิดแอร์ก่อนเวลา..."
              className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent dark:border-white/10 rounded-2xl py-4 px-5 outline-none focus:bg-white dark:focus:bg-white/10 focus:border-[#B2BB1E] focus:ring-4 focus:ring-[#B2BB1E]/5 text-[#302782] dark:text-white resize-none font-medium transition-all leading-relaxed"
              value={formData.additional_notes || ""}
              onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
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
                <div className={`p-5 rounded-2xl text-center font-bold text-lg ${serverMessage.includes("✅") ? "bg-[#B2BB1E]/10 text-[#B2BB1E]" : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"}`}>
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