import React, { useState } from "react";
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
} from "lucide-react";
import Navbar from "../components/layout/Navbar.jsx";
import { API_BASE_URL } from "../api/config.js";

const ExportLog = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // คำนวณช่วงวันของเทอมปัจจุบัน ตาม logic เดียวกับ backend cron
  const fillCurrentTerm = () => {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();

    let termStart, termEnd;

    if (month >= 5 && month <= 10) {
      // ภาคเรียนที่ 1: พ.ค. – ต.ค.
      termStart = `${year}-05-01`;
      termEnd   = `${year}-10-31`;
    } else if (month >= 11) {
      // ภาคเรียนที่ 2 (ช่วงปลายปี): พ.ย. – เม.ย. ปีหน้า
      termStart = `${year}-11-01`;
      termEnd   = `${year + 1}-04-30`;
    } else {
      // ภาคเรียนที่ 2 (ช่วงต้นปี): พ.ย. ปีที่แล้ว – เม.ย. ปีนี้
      termStart = `${year - 1}-11-01`;
      termEnd   = `${year}-04-30`;
    }

    setStartDate(termStart);
    setEndDate(termEnd);
    setFeedback(null);
  };
  const [feedback, setFeedback] = useState(null); // { type: 'error'|'success', message }

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    if (type === "success") {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleDownload = async () => {
    setFeedback(null);

    // Validation
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

      // Trigger file download via blob
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
            ดาวน์โหลด Log รายงาน
          </h1>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
          {/* Icon + Description */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-[#302782]/8 dark:bg-[#302782]/30 rounded-3xl flex items-center justify-center mb-4">
              <FileSpreadsheet size={40} className="text-[#302782] dark:text-[#B2BB1E]" />
            </div>
            <h2 className="text-lg font-black text-[#302782] dark:text-white mb-1">
              ส่งออกรายงาน Excel
            </h2>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              เลือกช่วงวันที่เพื่อสร้างรายงานสรุปการจองห้อง ตารางเรียน และสถิติการใช้งาน
            </p>
          </div>

          {/* Quick-fill: วันเทอมปัจจุบัน */}
          <button
            onClick={fillCurrentTerm}
            disabled={isLoading}
            className="w-full mb-4 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-dashed border-[#B2BB1E]/60 hover:border-[#B2BB1E] bg-[#B2BB1E]/5 hover:bg-[#B2BB1E]/10 text-[#302782] dark:text-[#B2BB1E] font-black text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap size={15} className="shrink-0" />
            กรอกวันที่ของเทอมปัจจุบันอัตโนมัติ
          </button>

          {/* Date Inputs */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <CalendarRange size={13} />
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-3.5 text-base font-bold text-[#302782] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#302782]/30 dark:focus:ring-[#B2BB1E]/30 focus:border-[#302782] dark:focus:border-[#B2BB1E] transition-all disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <CalendarRange size={13} />
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-3.5 text-base font-bold text-[#302782] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#302782]/30 dark:focus:ring-[#B2BB1E]/30 focus:border-[#302782] dark:focus:border-[#B2BB1E] transition-all disabled:opacity-50"
              />
            </div>
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

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={isLoading}
            className="w-full bg-[#302782] hover:bg-[#B2BB1E] disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2.5 text-base transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                กำลังสร้างรายงาน...
              </>
            ) : (
              <>
                <Download size={20} />
                ดาวน์โหลด Excel
              </>
            )}
          </button>
        </div>

        {/* Info Card */}
        <div className="mt-4 bg-[#302782]/5 dark:bg-[#302782]/20 rounded-[24px] border border-[#302782]/10 dark:border-[#302782]/30 p-5">
          <p className="text-xs font-semibold text-[#302782] dark:text-[#B2BB1E] mb-2">
            ไฟล์ที่สร้างจะประกอบด้วย
          </p>
          <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 font-semibold">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B2BB1E] shrink-0" />
              Sheet 1: สรุปข้อมูล Dashboard (สถิติห้อง / อาจารย์ / สถานะ)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B2BB1E] shrink-0" />
              Sheet 2: ประวัติการจองห้อง (Bookings)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B2BB1E] shrink-0" />
              Sheet 3+: ตารางเรียน แยกตามสาขาวิชา
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExportLog;
