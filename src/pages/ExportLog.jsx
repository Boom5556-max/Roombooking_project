import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Download,
  FileSpreadsheet,
  CalendarRange,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Zap,
  Save,
  GraduationCap,
  Sun,
  BookOpen,
  BookMarked,
} from "lucide-react";
import Navbar from "../components/layout/Navbar.jsx";
import { API_BASE_URL } from "../api/config.js";
import api from "../api/axios.js";

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

const ExportLog = () => {
  const navigate = useNavigate();

  // ===== Export Section State =====
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // ===== Term Management State =====
  const [termDates, setTermDates] = useState({
    first: "",
    end: "",
    summer: "",
  });
  const [isTermLoading, setIsTermLoading] = useState(false);
  const [isFetchingTerms, setIsFetchingTerms] = useState(true);
  const [termFeedback, setTermFeedback] = useState(null);

  // คำนวณช่วงวันของเทอมปัจจุบัน โดยดึงข้อมูลอ้างอิงจาก Database
  const fillCurrentTerm = async () => {
    try {
      // 1. ดึงข้อมูลจาก Backend (เปลี่ยน api.get เป็นตัวแปรที่คุณใช้เรียก axios ได้เลย)
      const response = await api.get(`${API_BASE_URL}/terms/showTerm`);
      const termData = response.data.data;

      if (!termData || termData.length === 0) {
        showFeedback('error', 'ไม่พบข้อมูลเทอมในระบบ กรุณาตั้งค่าปีการศึกษาก่อน');
        return;
      }

      // 2. เรียงลำดับวันที่จากอดีต -> อนาคต 
      const sortedTerms = termData.sort((a, b) => new Date(a.date) - new Date(b.date));

      // 3. เตรียมวันที่ปัจจุบันสำหรับเปรียบเทียบ
      const today = new Date();
      today.setHours(0, 0, 0, 0); // ตัดเวลาทิ้งเพื่อเทียบแค่วันที่

      let currentTermIndex = -1;

      // 4. หา "เทอมปัจจุบัน" (เทอมที่วันที่เริ่ม <= วันนี้ โดยดึงอันที่ใกล้ปัจจุบันที่สุด)
      for (let i = sortedTerms.length - 1; i >= 0; i--) {
        const termDate = new Date(sortedTerms[i].date);
        if (termDate <= today) {
          currentTermIndex = i;
          break;
        }
      }

      // กรณีที่เพิ่งเริ่มใช้ระบบ และวันนี้ยังไม่ถึงวันเริ่มเทอมแรกสุดเลย ให้ถือว่าเทอมแรกสุดคือเทอมปัจจุบัน
      if (currentTermIndex === -1) {
        currentTermIndex = 0;
      }

      const currentTerm = sortedTerms[currentTermIndex];
      const termStart = currentTerm.date; // รูปแบบ YYYY-MM-DD จาก API
      let termEnd = '';

      // 5. คำนวณวันสิ้นสุด (termEnd)
      if (currentTermIndex + 1 < sortedTerms.length) {
        // ถ้ามีเทอมถัดไป ให้เอาวันที่ของเทอมถัดไป ลบออก 1 วัน
        const nextTermDate = new Date(sortedTerms[currentTermIndex + 1].date);
        nextTermDate.setDate(nextTermDate.getDate() - 1);
        termEnd = nextTermDate.toISOString().split('T')[0];
      } else {
        // ถ้าไม่มีเทอมถัดไป (เป็นเทอมสุดท้ายของปีการศึกษานั้น) ให้บวกไป 4 เดือนแบบคร่าวๆ
        const fallbackEndDate = new Date(currentTerm.date);
        fallbackEndDate.setMonth(fallbackEndDate.getMonth() + 4);
        termEnd = fallbackEndDate.toISOString().split('T')[0];
      }

      // 6. อัปเดต State ให้หน้าเว็บ
      setStartDate(termStart);
      setEndDate(termEnd);
      setFeedback(null);

    } catch (error) {
      console.error('Error fetching terms for current term calculation:', error);
      showFeedback('error', 'เกิดข้อผิดพลาดในการดึงข้อมูลเทอมจากระบบ');
    }
  };

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    if (type === "success") {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const showTermFeedback = (type, message) => {
    setTermFeedback({ type, message });
    if (type === "success") {
      setTimeout(() => setTermFeedback(null), 4000);
    }
  };

  // ===== Fetch existing term data =====
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
        setIsFetchingTerms(false);
      }
    };

    fetchTerms();
  }, []);

  // ===== Export Download Handler =====
  const handleDownload = async () => {
    setFeedback(null);

    if (!startDate || !endDate) {
      showFeedback("error", "กรุณาระบุวันที่เริ่มต้นและวันที่สิ้นสุด");
      return;
    }
    if (startDate > endDate) {
      showFeedback("error", "วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/schedules/export-excel?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        showFeedback(
          "error",
          errData.message || `เกิดข้อผิดพลาด (${response.status})`
        );
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Room_Usage_Report_${startDate}_to_${endDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showFeedback("success", "ดาวน์โหลดรายงานสำเร็จ!");
    } catch (err) {
      showFeedback("error", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Term Handlers =====
  const handleTermDateChange = (termKey, value) => {
    setTermDates((prev) => ({ ...prev, [termKey]: value }));
    setTermFeedback(null);
  };

  const handleSaveTerms = async () => {
    setTermFeedback(null);

    const filledTerms = TERM_CONFIG.filter((t) => termDates[t.key]);
    if (filledTerms.length === 0) {
      showTermFeedback("error", "กรุณาระบุวันที่อย่างน้อย 1 เทอม");
      return;
    }

    const terms = filledTerms.map((t) => ({
      term: t.key,
      date: termDates[t.key],
    }));

    setIsTermLoading(true);
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
        showTermFeedback("success", result.message || "บันทึกข้อมูลเทอมสำเร็จ!");
      } else {
        showTermFeedback("error", result.message || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (err) {
      showTermFeedback("error", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsTermLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans">
      <Navbar />

      <div className="p-4 sm:p-6 md:p-8 pb-28 flex-grow w-full max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-[#302782] dark:text-[#B2BB1E] transition-all active:scale-90 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center group"
            title="ย้อนกลับ"
          >
            <ChevronLeft size={24} className="transition-transform group-hover:-translate-x-0.5" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-[#302782] dark:text-white">
            ดาวน์โหลด Log รายงาน
          </h1>
        </div>

        {/* ===== Two Column Layout ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

          {/* ============================== */}
          {/* LEFT: Export Excel             */}
          {/* ============================== */}
          <div className="bg-white dark:bg-gray-800 rounded-[28px] shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            {/* Compact Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-[#302782]/8 dark:bg-[#302782]/30 rounded-2xl flex items-center justify-center shrink-0">
                <FileSpreadsheet size={28} className="text-[#302782] dark:text-[#B2BB1E]" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#302782] dark:text-white">
                  ส่งออกรายงาน Excel
                </h2>
                <p className="text-xs text-black leading-relaxed mt-0.5">
                  เลือกช่วงวันที่เพื่อสร้างรายงานสรุปการจอง
                </p>
              </div>
            </div>

            {/* Quick-fill */}
            <button
              onClick={fillCurrentTerm}
              disabled={isLoading}
              className="w-full mb-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-dashed border-[#B2BB1E]/60 hover:border-[#B2BB1E] bg-[#B2BB1E]/5 hover:bg-[#B2BB1E]/10 text-[#302782] dark:text-[#B2BB1E] font-black text-xs transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap size={14} className="shrink-0" />
              กรอกวันที่เทอมปัจจุบันอัตโนมัติ
            </button>

            {/* Date Inputs — side by side */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-black dark:text-white flex items-center gap-1">
                  <CalendarRange size={12} />
                  วันที่เริ่มต้น
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-3 text-sm font-bold text-[#302782] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#302782]/30 dark:focus:ring-[#B2BB1E]/30 focus:border-[#302782] dark:focus:border-[#B2BB1E] transition-all disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-black dark:text-white flex items-center gap-1">
                  <CalendarRange size={12} />
                  วันที่สิ้นสุด
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-3 text-sm font-bold text-[#302782] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#302782]/30 dark:focus:ring-[#B2BB1E]/30 focus:border-[#302782] dark:focus:border-[#B2BB1E] transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div
                className={`flex items-start gap-3 rounded-xl p-3 mb-4 text-sm font-bold transition-all ${feedback.type === "error"
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800"
                  : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800"
                  }`}
              >
                {feedback.type === "error" ? (
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                )}
                <span className="text-xs">{feedback.message}</span>
              </div>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="w-full bg-[#302782] hover:bg-[#B2BB1E] disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-300 active:scale-[0.98] shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  กำลังสร้างรายงาน...
                </>
              ) : (
                <>
                  <Download size={18} />
                  ดาวน์โหลด Excel
                </>
              )}
            </button>

            {/* Info — inline */}
            <div className="mt-4 bg-[#302782]/5 dark:bg-[#302782]/20 rounded-xl border border-[#302782]/10 dark:border-[#302782]/30 p-4">
              <p className="text-xs font-semibold text-[#302782] dark:text-[#B2BB1E] mb-1.5">
                ไฟล์ที่สร้างจะประกอบด้วย
              </p>
              <ul className="text-xs text-black dark:text-white space-y-1 font-semibold">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#B2BB1E] shrink-0" />
                  Sheet 1: สรุปข้อมูล Dashboard
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#B2BB1E] shrink-0" />
                  Sheet 2: ประวัติการจองห้อง
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#B2BB1E] shrink-0" />
                  Sheet 3+: ตารางเรียน แยกตามสาขาวิชา
                </li>
              </ul>
            </div>
          </div>

          {/* ============================== */}
          {/* RIGHT: Term Management          */}
          {/* ============================== */}
          <div className="bg-white dark:bg-gray-800 rounded-[28px] shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            {/* Compact Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-[#302782]/8 dark:bg-[#302782]/30 rounded-2xl flex items-center justify-center shrink-0">
                <GraduationCap size={28} className="text-[#302782] dark:text-[#B2BB1E]" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#302782] dark:text-white">
                  กำหนดวันที่ของแต่ละเทอม
                </h2>
                <p className="text-xs text-black leading-relaxed mt-0.5">
                  ระบุวันที่เริ่มต้นของแต่ละภาคเรียน
                </p>
              </div>
            </div>

            {/* Loading Skeleton */}
            {isFetchingTerms ? (
              <div className="space-y-3 mb-5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-xl h-[60px]"
                  />
                ))}
              </div>
            ) : (
              <>
                {/* Term Cards — compact horizontal rows */}
                <div className="space-y-3 mb-5">
                  {TERM_CONFIG.map((term) => {
                    const IconComponent = term.icon;
                    return (
                      <div
                        key={term.key}
                        className={`relative overflow-hidden rounded-xl border ${term.borderLight} ${term.borderDark} ${term.bgLight} ${term.bgDark} px-4 py-3 transition-all duration-200 hover:shadow-md`}
                      >
                        {/* Decorative gradient bar */}
                        <div
                          className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${term.gradient}`}
                        />

                        {/* Single horizontal row: icon + label + date picker */}
                        <div className="flex items-center gap-3">
                          {/* Icon */}
                          <div
                            className={`w-10 h-10 ${term.iconBg} rounded-xl flex items-center justify-center shrink-0`}
                          >
                            <IconComponent size={18} className={term.textColor} />
                          </div>

                          {/* Label */}
                          <h3
                            className={`text-sm font-black ${term.textColor} whitespace-nowrap shrink-0`}
                          >
                            {term.label}
                          </h3>

                          {/* Date picker — pushed to the right */}
                          <input
                            type="date"
                            value={termDates[term.key]}
                            onChange={(e) =>
                              handleTermDateChange(term.key, e.target.value)
                            }
                            disabled={isTermLoading}
                            className="ml-auto w-auto min-w-[160px] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-bold text-[#302782] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#302782]/30 dark:focus:ring-[#B2BB1E]/30 focus:border-[#302782] dark:focus:border-[#B2BB1E] transition-all disabled:opacity-50"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Term Feedback */}
                {termFeedback && (
                  <div
                    className={`flex items-start gap-3 rounded-xl p-3 mb-4 text-sm font-bold transition-all ${termFeedback.type === "error"
                      ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800"
                      : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800"
                      }`}
                  >
                    {termFeedback.type === "error" ? (
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                    )}
                    <span className="text-xs">{termFeedback.message}</span>
                  </div>
                )}

                {/* Save Button */}
                <button
                  onClick={handleSaveTerms}
                  disabled={isTermLoading}
                  className="w-full bg-[#302782] hover:bg-[#B2BB1E] disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-300 active:scale-[0.98] shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {isTermLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      บันทึกข้อมูลเทอม
                    </>
                  )}
                </button>

                {/* Term Info — inline */}
                <div className="mt-4 bg-[#302782]/5 dark:bg-[#302782]/20 rounded-xl border border-[#302782]/10 dark:border-[#302782]/30 p-4">
                  <p className="text-xs font-semibold text-[#302782] dark:text-[#B2BB1E] mb-1.5">
                    หมายเหตุ
                  </p>
                  <ul className="text-xs text-black dark:text-white space-y-1 font-semibold">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#B2BB1E] shrink-0" />
                      วันที่จะถูกใช้สำหรับระบบจัดตารางเรียนอัตโนมัติ
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#B2BB1E] shrink-0" />
                      สามารถแก้ไขวันที่ได้ตลอดเวลา
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#B2BB1E] shrink-0" />
                      เฉพาะเทอมที่ระบุวันที่เท่านั้นที่จะถูกบันทึก
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExportLog;
