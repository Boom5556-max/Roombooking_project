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
} from "lucide-react";
import Navbar from "../components/layout/Navbar.jsx";
import { API_BASE_URL } from "../api/config.js";

// ข้อมูลเทอมแบบ Static ทั้ง 3 ชนิด
const TERM_CONFIG = [
  {
    key: "first",
    label: "ภาคเรียนที่ 1 (First Term)",
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
    label: "ภาคเรียนที่ 2 (End Term)",
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
    label: "ภาคฤดูร้อน (Summer Term)",
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

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [feedback, setFeedback] = useState(null);

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
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/terms/showTerm`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (response.ok) {
          const result = await response.json();
          const dates = { first: "", end: "", summer: "" };
          if (result.data && Array.isArray(result.data)) {
            result.data.forEach((item) => {
              if (dates.hasOwnProperty(item.term)) {
                dates[item.term] = item.date || "";
              }
            });
          }
          setTermDates(dates);
        }
      } catch (err) {
        console.error("Fetch terms error:", err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchTerms();
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
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/terms/fillInTerm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ terms }),
      });

      const result = await response.json();

      if (response.ok) {
        showFeedback("success", result.message || "บันทึกข้อมูลเทอมสำเร็จ!");
      } else {
        showFeedback("error", result.message || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (err) {
      showFeedback("error", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans">
      <Navbar />

      <div className="p-4 sm:p-6 md:p-10 pb-28 flex-grow max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-[#B2BB1E] hover:scale-110 transition-transform p-1"
          >
            <ChevronLeft size={32} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-[#302782] dark:text-white">
            จัดการวันที่เทอม
          </h1>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
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
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
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
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
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
                  className={`flex items-start gap-3 rounded-2xl p-4 mb-5 text-sm font-bold transition-all ${
                    feedback.type === "error"
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

        {/* Info Card */}
        <div className="mt-4 bg-[#302782]/5 dark:bg-[#302782]/20 rounded-[24px] border border-[#302782]/10 dark:border-[#302782]/30 p-5">
          <p className="text-xs font-semibold text-[#302782] dark:text-[#B2BB1E] mb-2">
            หมายเหตุ
          </p>
          <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 font-semibold">
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
