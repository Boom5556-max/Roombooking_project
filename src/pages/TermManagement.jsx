import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  CalendarRange,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
  GraduationCap,
  Sun,
  BookOpen,
  BookMarked,
  Settings,
  Clock,
  Timer,
  CalendarClock,
  ArrowRightCircle,
  ChevronDown,
  Check
} from "lucide-react";
import Navbar from "../components/layout/Navbar.jsx";
import { API_BASE_URL } from "../api/config.js";
import { getBookingScope, updateBookingScope } from "../api/bookingScope.js";
import { minsToTime, timeToMins, getAllDay30MinSlots } from "../utils/timeUtils.js";

// ข้อมูลเทอมแบบ Static ทั้ง 3 ชนิด
const TERM_CONFIG = [
  {
    key: "first",
    label: "เทอมต้น",
    icon: BookOpen,
    gradient: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-900/20",
    borderLight: "border-blue-100",
    borderDark: "dark:border-blue-800",
    textColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
  },
  {
    key: "end",
    label: "เทอมปลาย",
    icon: BookMarked,
    gradient: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-900/20",
    borderLight: "border-emerald-100",
    borderDark: "dark:border-emerald-800",
    textColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
  },
  {
    key: "summer",
    label: "เทอมฤดูร้อน",
    icon: Sun,
    gradient: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-amber-900/20",
    borderLight: "border-amber-100",
    borderDark: "dark:border-amber-800",
    textColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
  },
];

const TermManagement = () => {
  const navigate = useNavigate();

  // State สำหรับวันที่ของแต่ละเทอม
  const [termDates, setTermDates] = useState({
    first: "",
    end: "",
    summer: "",
  });

  // State สำหรับ Booking Scope
  const [bookingScope, setBookingScope] = useState({
    opening_time: "08:00",
    closing_time: "20:00",
    max_duration_hours: 2,
    max_advance_days: 10,
    min_advance_hours: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSavingScope, setIsSavingScope] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [scopeFeedback, setScopeFeedback] = useState(null);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    if (type === "success") {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // ดึงข้อมูลเทอมที่มีอยู่แล้วจาก Backend
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await api.get("/terms/showTerm");
        const result = response.data;
        const dates = { first: "", end: "", summer: "" };
        if (result.data && Array.isArray(result.data)) {
          result.data.forEach((item) => {
            if (dates.hasOwnProperty(item.term)) {
              dates[item.term] = item.date || "";
            }
          });
        }
        setTermDates(dates);
      } catch (err) {
        console.error("Fetch terms error:", err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchTerms();

    const fetchScope = async () => {
      try {
        const result = await getBookingScope();
        if (result.success && result.data) {
          const { 
            opening_mins, 
            closing_mins, 
            max_duration_hours, 
            max_advance_days, 
            min_advance_hours 
          } = result.data;
          
          setBookingScope({
            opening_time: minsToTime(opening_mins),
            closing_time: minsToTime(closing_mins),
            max_duration_hours: max_duration_hours,
            max_advance_days: max_advance_days,
            min_advance_hours: min_advance_hours,
          });
        }
      } catch (err) {
        console.error("Fetch scope error:", err);
      }
    };

    fetchScope();
  }, []);

  // อัปเดตวันที่ของเทอมใดเทอมหนึ่ง
  const handleDateChange = (termKey, value) => {
    setTermDates((prev) => ({ ...prev, [termKey]: value }));
    setFeedback(null);
  };

  // บันทึกข้อมูลทั้งหมด
  const handleSave = async () => {
    setFeedback(null);

    // Validate: ต้องกรอกอย่างน้อย 1 เทอม
    const filledTerms = TERM_CONFIG.filter((t) => termDates[t.key]);
    if (filledTerms.length === 0) {
      showFeedback("error", "กรุณาระบุวันที่อย่างน้อย 1 เทอม");
      return;
    }

    // สร้าง payload เฉพาะเทอมที่มีวันที่
    const terms = filledTerms.map((t) => ({
      term: t.key,
      date: termDates[t.key],
    }));

    setIsLoading(true);
    try {
      const response = await api.post("/terms/fillInTerm", { terms });
      const result = response.data;
      showFeedback("success", result.message || "บันทึกข้อมูลเทอมสำเร็จ!");
    } catch (err) {
      if (err.response) {
        showFeedback("error", err.response.data?.message || "เกิดข้อผิดพลาดในการบันทึก");
      } else {
        showFeedback("error", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // บันทึกการตั้งค่าระบบจอง
  const handleSaveScope = async () => {
    setScopeFeedback(null);
    setIsSavingScope(true);

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
        setScopeFeedback({ type: "success", message: "บันทึกการตั้งค่าระบบจองสำเร็จ!" });
        setTimeout(() => setScopeFeedback(null), 4000);
      } else {
        setScopeFeedback({ type: "error", message: result.message || "เกิดข้อผิดพลาดในการบันทึก" });
      }
    } catch (err) {
      setScopeFeedback({ type: "error", message: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้" });
    } finally {
      setIsSavingScope(false);
    }
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

  const ALL_DAY_TIMES = getAllDay30MinSlots();

  const renderTimeSelect = (key, label) => {
    const currentValue = bookingScope[key];
    
    return (
      <div className="space-y-2">
        <label className="text-xs font-black text-[#302782] dark:text-[#B2BB1E] ml-1 flex items-center gap-2">
          <Clock size={14} /> {label}
        </label>
        <details className="group relative" id={`term-scope-time-${key}`}>
          <summary className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-bold text-[#302782] dark:text-white outline-none transition-all cursor-pointer list-none flex items-center justify-between">
            <span>{currentValue} น.</span>
            <ChevronDown size={16} className="text-gray-400 group-open:rotate-180 transition-transform" />
          </summary>
          <ul className="absolute left-0 top-full mt-2 w-full max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 py-1">
            {ALL_DAY_TIMES.map((t) => (
              <li 
                key={t}
                onClick={() => {
                  setBookingScope({ ...bookingScope, [key]: t });
                  document.getElementById(`term-scope-time-${key}`).removeAttribute("open");
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans">
      <Navbar />

      <div className="p-4 sm:p-6 md:p-10 pb-28 flex-grow max-w-2xl mx-auto w-full">
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl text-[#302782] dark:text-[#B2BB1E] transition-all active:scale-90 shadow-sm flex items-center justify-center group"
              title="ย้อนกลับ"
            >
              <ChevronLeft size={24} className="transition-transform group-hover:-translate-x-0.5" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-[#302782] dark:text-white">
              จัดการวันที่เทอม
            </h1>
          </div>
          
          {/* Academic Year (B.E.) Display */}
          {termDates.first && !isNaN(new Date(termDates.first).getFullYear()) && (
            <div className="flex flex-col items-end">
              <div className="text-lg sm:text-xl font-black text-[#302782] dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B2BB1E]"></span>
                ปีการศึกษา {new Date(termDates.first).getFullYear() + 543}
              </div>
            </div>
          )}
        </div>
          {/* Icon + Description */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-[#302782]/8 dark:bg-[#302782]/30 rounded-3xl flex items-center justify-center mb-4">
              <GraduationCap
                size={40}
                className="text-[#302782] dark:text-[#B2BB1E]"
              />
            </div>
            <h2 className="text-lg font-black text-[#302782] dark:text-white mb-1">
              กำหนดวันที่ของแต่ละเทอม
            </h2>
            <p className="text-sm text-black max-w-xs leading-relaxed">
              ระบุวันที่เริ่มต้นของแต่ละภาคเรียน
              เพื่อใช้ในการจัดตารางเรียนและการจองห้อง
            </p>
          </div>

          {/* Loading Skeleton */}
          {isFetching ? (
            <div className="space-y-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-2xl h-[120px]"
                />
              ))}
            </div>
          ) : (
            <>
              {/* Term Cards */}
              <div className="space-y-4 mb-6">
                {TERM_CONFIG.map((term) => {
                  const IconComponent = term.icon;
                  return (
                    <div
                      key={term.key}
                      className={`relative overflow-hidden rounded-2xl border ${term.borderLight} ${term.borderDark} ${term.bgLight} ${term.bgDark} p-5 transition-all duration-200 hover:shadow-md`}
                    >
                      {/* Decorative gradient bar */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${term.gradient}`}
                      />

                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={`w-12 h-12 ${term.iconBg} rounded-2xl flex items-center justify-center shrink-0`}
                        >
                          <IconComponent size={22} className={term.textColor} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`text-sm font-black ${term.textColor} mb-3`}
                          >
                            {term.label}
                          </h3>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-black dark:text-white flex items-center gap-1.5">
                              <CalendarRange size={12} />
                              วันที่
                            </label>
                            <input
                              type="date"
                              value={termDates[term.key]}
                              onChange={(e) =>
                                handleDateChange(term.key, e.target.value)
                              }
                              disabled={isLoading}
                              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-bold text-[#302782] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#302782]/30 dark:focus:ring-[#B2BB1E]/30 focus:border-[#302782] dark:focus:border-[#B2BB1E] transition-all disabled:opacity-50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`flex items-start gap-3 rounded-2xl p-4 mb-5 text-sm font-bold transition-all ${feedback.type === "error"
                      ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800"
                      : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800"
                    }`}
                >
                  {feedback.type === "error" ? (
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full bg-[#302782] hover:bg-[#B2BB1E] disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2.5 text-base transition-all duration-300 active:scale-[0.98] shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    บันทึกข้อมูลเทอม
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Booking Rule Settings Card */}
        <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mt-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#B2BB1E]/10 dark:bg-[#B2BB1E]/20 rounded-2xl flex items-center justify-center">
              <Settings size={28} className="text-[#B2BB1E]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#302782] dark:text-white">
                ตั้งค่าเงื่อนไขการจอง
              </h2>
              <p className="text-xs font-semibold text-black/60 dark:text-white/60">
                กำหนดเวลาเปิด-ปิด และข้อกำหนดการจองล่วงหน้า
              </p>
            </div>
          </div>

          {!isFetching && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {renderTimeSelect("opening_time", "เวลาเปิดระบบ")}
                {renderTimeSelect("closing_time", "เวลาปิดระบบ")}

                {/* Max Duration */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#302782] dark:text-[#B2BB1E] ml-1 flex items-center gap-2">
                    <Timer size={14} /> ระยะเวลาจองสูงสุด (ชม.)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={currentMaxLimit}
                    value={bookingScope.max_duration_hours}
                    onChange={(e) => handleMaxDurationChange(e.target.value)}
                    onBlur={(e) => handleMaxDurationChange(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-bold text-[#302782] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B2BB1E]/30 transition-all"
                  />
                </div>

                {/* Max Advance Days */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#302782] dark:text-[#B2BB1E] ml-1 flex items-center gap-2">
                    <CalendarClock size={14} /> จองล่วงหน้าได้ไม่เกิน (วัน) สำหรับบุคลากร
                  </label>
                  <input
                    type="number"
                    min="2"
                    value={bookingScope.max_advance_days}
                    onChange={(e) => handleMaxAdvanceDaysChange(e.target.value)}
                    onBlur={(e) => handleMaxAdvanceDaysChange(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-bold text-[#302782] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B2BB1E]/30 transition-all"
                  />
                </div>

                {/* Min Advance Hours */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-black text-[#302782] dark:text-[#B2BB1E] ml-1 flex items-center gap-2">
                    <ArrowRightCircle size={14} /> ระยะที่จองล่วงหน้าขั้นต่ำ (ชม.) สำหรับบุคลากร
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={(Number(bookingScope.max_advance_days) - 1) * 24}
                    value={bookingScope.min_advance_hours}
                    onChange={(e) => handleMinAdvanceHoursChange(e.target.value)}
                    onBlur={(e) => handleMinAdvanceHoursChange(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-bold text-[#302782] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B2BB1E]/30 transition-all"
                  />
                  <p className="text-[10px] text-gray-500 font-semibold ml-1 mt-1">
                    * เช่น ถ้าตั้งเป็น 1 ชม. และปัจจุบันคือ 10:00 จะจองได้ตั้งแต่ 11:00 เป็นต้นไป
                  </p>
                </div>
              </div>

              {/* Scope Feedback Alert */}
              {scopeFeedback && (
                <div
                  className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-bold transition-all ${scopeFeedback.type === "error"
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800"
                    : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800"
                    }`}
                >
                  {scopeFeedback.type === "error" ? (
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                  )}
                  <span>{scopeFeedback.message}</span>
                </div>
              )}

              <button
                onClick={handleSaveScope}
                disabled={isSavingScope}
                className="w-full px-12 bg-[#B2BB1E] hover:bg-[#302782] disabled:bg-gray-300 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2.5 text-base transition-all duration-300 active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                {isSavingScope ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    บันทึกเงื่อนไขการจอง
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-4 bg-[#302782]/5 dark:bg-[#302782]/20 rounded-[24px] border border-[#302782]/10 dark:border-[#302782]/30 p-5">
          <p className="text-xs font-semibold text-[#302782] dark:text-[#B2BB1E] mb-2">
            หมายเหตุ
          </p>
          <ul className="text-xs text-black dark:text-white space-y-1 font-semibold">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B2BB1E] shrink-0" />
              วันที่ที่กำหนดจะถูกใช้สำหรับระบบจัดตารางเรียนอัตโนมัติ
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B2BB1E] shrink-0" />
              สามารถแก้ไขวันที่ได้ตลอดเวลา ระบบจะอัปเดตอัตโนมัติ
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B2BB1E] shrink-0" />
              เฉพาะเทอมที่ระบุวันที่เท่านั้นที่จะถูกบันทึก
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TermManagement;
