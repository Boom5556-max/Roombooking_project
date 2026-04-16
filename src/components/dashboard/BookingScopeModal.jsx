import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, Clock, Timer, CalendarClock, ArrowRightCircle, Loader2, CheckCircle2, AlertCircle, ChevronDown, Check } from "lucide-react";
import { getBookingScope, updateBookingScope } from "../../api/bookingScope";
import { minsToTime, timeToMins, getAllDay30MinSlots } from "../../utils/timeUtils";

const BookingScopeModal = ({ isOpen, onClose, onUpdate }) => {
  const [bookingScope, setBookingScope] = useState({
    opening_time: "08:00",
    closing_time: "20:00",
    max_duration_hours: 2,
    max_advance_days: 10,
    min_advance_hours: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchScope();
    }
  }, [isOpen]);

  const fetchScope = async () => {
    setIsLoading(true);
    try {
      const result = await getBookingScope();
      if (result.success && result.data) {
        setBookingScope({
          opening_time: minsToTime(result.data.opening_mins),
          closing_time: minsToTime(result.data.closing_mins),
          max_duration_hours: result.data.max_duration_hours,
          max_advance_days: result.data.max_advance_days,
          min_advance_hours: result.data.min_advance_hours,
        });
      }
    } catch (err) {
      console.error("Fetch scope error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);

    const payload = {
      opening_mins: timeToMins(bookingScope.opening_time),
      closing_mins: timeToMins(bookingScope.closing_time),
      max_duration_hours: Number(bookingScope.max_duration_hours),
      max_advance_days: Number(bookingScope.max_advance_days),
      min_advance_hours: Number(bookingScope.min_advance_hours),
    };

    try {
      const result = await updateBookingScope(payload);
      if (result.success) {
        setFeedback({ type: "success", message: "บันทึกข้อมูลสำเร็จ" });
        if (onUpdate) onUpdate();
        setTimeout(() => {
          setFeedback(null);
          onClose();
        }, 1500);
      } else {
        setFeedback({ type: "error", message: result.message || "เกิดข้อผิดพลาด" });
      }
    } catch (err) {
      setFeedback({ type: "error", message: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้" });
    } finally {
      setIsSaving(false);
    }
  };

  const ALL_DAY_TIMES = getAllDay30MinSlots();

  const renderTimeSelect = (key, label) => {
    const currentValue = bookingScope[key];
    
    return (
      <div className="space-y-2">
        <label className="text-[11px] font-black text-[#302782] dark:text-[#B2BB1E] ml-1 flex items-center gap-2">
          <Clock size={12} /> {label}
        </label>
        <details className="group relative" id={`scope-time-${key}`}>
          <summary className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-500 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-[#302782] dark:text-white outline-none transition-all cursor-pointer list-none">
            <span>{currentValue} น.</span>
            <ChevronDown size={16} className="text-gray-400 group-open:rotate-180 transition-transform" />
          </summary>
          <ul className="absolute left-0 top-full mt-2 w-full max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-[4000] py-1">
            {ALL_DAY_TIMES.map((t) => (
              <li 
                key={t}
                onClick={() => {
                  setBookingScope({ ...bookingScope, [key]: t });
                  document.getElementById(`scope-time-${key}`).removeAttribute("open");
                }}
                className={`px-4 py-2.5 text-sm font-bold flex items-center justify-between cursor-pointer transition-colors ${
                  currentValue === t 
                    ? "bg-[#B2BB1E] text-white" 
                    : "text-[#302782] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {t} น.
                {currentValue === t && <Check size={14} />}
              </li>
            ))}
          </ul>
        </details>
      </div>
    );
  };

  const currentMaxLimit = Math.max(1, Math.floor((timeToMins(bookingScope.closing_time) - timeToMins(bookingScope.opening_time)) / 60));

  const handleMaxDurationChange = (val) => {
    if (val === "") {
      setBookingScope({ ...bookingScope, max_duration_hours: "" });
      return;
    }
    const num = Number(val);
    const sanctioned = Math.max(1, Math.min(currentMaxLimit, num));
    setBookingScope({ ...bookingScope, max_duration_hours: sanctioned });
  };

  const handleMaxAdvanceDaysChange = (val) => {
    if (val === "") {
      setBookingScope({ ...bookingScope, max_advance_days: "" });
      return;
    }
    const num = Math.max(2, Number(val));
    const maxPossibleMinHours = (num - 1) * 24;
    
    setBookingScope(prev => ({
      ...prev,
      max_advance_days: num,
      min_advance_hours: Math.min(prev.min_advance_hours, maxPossibleMinHours)
    }));
  };

  const handleMinAdvanceHoursChange = (val) => {
    if (val === "") {
      setBookingScope({ ...bookingScope, min_advance_hours: "" });
      return;
    }
    const num = Number(val);
    const maxLimit = (Number(bookingScope.max_advance_days) - 1) * 24;
    const sanctioned = Math.max(0, Math.min(maxLimit, num));
    setBookingScope({ ...bookingScope, min_advance_hours: sanctioned });
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-[#302782]/20 dark:bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-gray-800 rounded-[32px] w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#B2BB1E]/10 rounded-xl text-[#B2BB1E]">
              <CalendarClock size={24} />
            </div>
            <h2 className="text-xl font-black text-[#302782] dark:text-white">ตั้งค่าเงื่อนไขการจอง</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="animate-spin text-[#B2BB1E]" size={32} />
              <p className="text-sm font-bold text-gray-500">กำลังโหลดการตั้งค่า...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-6">
                {renderTimeSelect("opening_time", "เวลาเปิดระบบ")}
                {renderTimeSelect("closing_time", "เวลาปิดระบบ")}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#302782] dark:text-[#B2BB1E] ml-1 flex items-center gap-2">
                    <Timer size={12} /> ระยะเวลาสูงสุด (ชม.)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={currentMaxLimit}
                    value={bookingScope.max_duration_hours}
                    onChange={(e) => handleMaxDurationChange(e.target.value)}
                    onBlur={(e) => handleMaxDurationChange(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-[#B2BB1E] rounded-xl px-4 py-3 text-sm font-bold text-[#302782] dark:text-white outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#302782] dark:text-[#B2BB1E] ml-1 flex items-center gap-2">
                    <CalendarClock size={12} /> จองล่วงหน้าสูงสุด (วัน) สำหรับบุคลากร
                  </label>
                  <input
                    type="number"
                    min="2"
                    value={bookingScope.max_advance_days}
                    onChange={(e) => handleMaxAdvanceDaysChange(e.target.value)}
                    onBlur={(e) => handleMaxAdvanceDaysChange(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-[#B2BB1E] rounded-xl px-4 py-3 text-sm font-bold text-[#302782] dark:text-white outline-none transition-all"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[11px] font-black text-[#302782] dark:text-[#B2BB1E] ml-1 flex items-center gap-2">
                    <ArrowRightCircle size={12} /> ระยะที่จองล่วงหน้าขั้นต่ำ (ชม.) สำหรับบุคลากร
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={(Number(bookingScope.max_advance_days) - 1) * 24}
                    value={bookingScope.min_advance_hours}
                    onChange={(e) => handleMinAdvanceHoursChange(e.target.value)}
                    onBlur={(e) => handleMinAdvanceHoursChange(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-[#B2BB1E] rounded-xl px-4 py-3 text-sm font-bold text-[#302782] dark:text-white outline-none transition-all"
                  />
                </div>
              </div>

              {feedback && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in slide-in-from-top-1 ${
                  feedback.type === "success" ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                }`}>
                  {feedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  {feedback.message}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-white font-black rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-[5] py-4 bg-[#B2BB1E] hover:bg-[#302782] text-white font-black rounded-2xl shadow-lg shadow-[#B2BB1E]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  บันทึก
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BookingScopeModal;
