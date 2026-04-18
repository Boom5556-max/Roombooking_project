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
import PageReveal from "../components/common/PageReveal";

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

const ExportLog = () => {
  const navigate = useNavigate();

  // ===== Export Section State =====
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // ===== Term Management State =====
  const [termDates, setTermDates] = useState({
    first: { start_date: "", end_date: "" },
    end: { start_date: "", end_date: "" },
    summer: { start_date: "", end_date: "" },
  });
  const [isTermLoading, setIsTermLoading] = useState(false);
  const [isFetchingTerms, setIsFetchingTerms] = useState(true);
  const [termFeedback, setTermFeedback] = useState(null);

  // คำนวณช่วงวันของเทอมปัจจุบัน โดยดึงข้อมูลอ้างอิงจาก Database
  const fillCurrentTerm = async () => {
    try {
      const response = await api.get(`${API_BASE_URL}/terms/showTerm`);
      const termData = response.data.data;

      if (!termData || termData.length === 0) {
        showFeedback('error', 'ไม่พบข้อมูลเทอมในระบบ กรุณาตั้งค่าปีการศึกษาก่อน');
        return;
      }

      const sortedTerms = termData.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let currentTermIndex = -1;
      for (let i = sortedTerms.length - 1; i >= 0; i--) {
        const termDate = new Date(sortedTerms[i].start_date);
        if (termDate <= today) {
          currentTermIndex = i;
          break;
        }
      }

      if (currentTermIndex === -1) currentTermIndex = 0;

      const currentTerm = sortedTerms[currentTermIndex];
      setStartDate(currentTerm.start_date);
      setEndDate(currentTerm.end_date || '');
      setFeedback(null);

    } catch (error) {
      console.error('Error fetching terms:', error);
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
        const response = await api.get("/terms/showTerm");
        const result = response.data;
        const dates = {
          first: { start_date: "", end_date: "" },
          end: { start_date: "", end_date: "" },
          summer: { start_date: "", end_date: "" },
        };
        if (result.data && Array.isArray(result.data)) {
          result.data.forEach((item) => {
            if (dates.hasOwnProperty(item.term)) {
              dates[item.term] = {
                start_date: item.start_date || "",
                end_date: item.end_date || "",
              };
            }
          });
        }
        setTermDates(dates);
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
      const response = await api.get(
        `/schedules/export-excel?startDate=${startDate}&endDate=${endDate}`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
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
      if (err.response) {
        // จัดการกรณี Error ที่ส่งมาจาก Server
        showFeedback("error", err.response.data?.message || `เกิดข้อผิดพลาด (${err.response.status})`);
      } else {
        showFeedback("error", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Term Handlers =====
  const handleTermDateChange = (termKey, field, value) => {
    setTermDates((prev) => ({
      ...prev,
      [termKey]: { ...prev[termKey], [field]: value }
    }));
    setTermFeedback(null);
  };

  const handleSaveTerms = async () => {
    setTermFeedback(null);
    const filledTerms = TERM_CONFIG.filter((t) => termDates[t.key].start_date || termDates[t.key].end_date);
    if (filledTerms.length === 0) {
      showTermFeedback("error", "กรุณาระบุวันที่อย่างน้อย 1 เทอม");
      return;
    }

    const incompleteTerm = filledTerms.find(t => !termDates[t.key].start_date || !termDates[t.key].end_date);
    if (incompleteTerm) {
      showTermFeedback("error", `กรุณาระบุวันที่ให้ครบทั้งเริ่มต้นและสิ้นสุดสำหรับ ${incompleteTerm.label}`);
      return;
    }

    const terms = filledTerms.map((t) => ({
      term: t.key,
      start_date: termDates[t.key].start_date,
      end_date: termDates[t.key].end_date,
    }));

    setIsTermLoading(true);
    try {
      const response = await api.post("/terms/fillInTerm", { terms });
      const result = response.data;
      showTermFeedback("success", result.message || "บันทึกข้อมูลเทอมสำเร็จ!");
    } catch (err) {
      if (err.response) {
        showTermFeedback("error", err.response.data?.message || "เกิดข้อผิดพลาดในการบันทึก");
      } else {
        showTermFeedback("error", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      }
    } finally {
      setIsTermLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans">
      <Navbar />

      <PageReveal isLoading={isFetchingTerms} loadingText="กำลังเตรียมข้อมูลรายงานและภาคเรียน...">
        <div className="p-4 sm:p-6 md:p-8 pb-28 flex-grow w-full max-w-[1600px] mx-auto">
          {/* Header Section */}
          <div className="flex items-center gap-4 mb-6 text-black dark:text-white">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-[#302782] dark:text-[#B2BB1E] transition-all active:scale-90 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center group"
              title="ฮ้อนกลับ"
            >
              <ChevronLeft size={24} className="transition-transform group-hover:-translate-x-0.5" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-[#302782] dark:text-white">
              ดาวน์โหลด Log รายงาน
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            {/* LEFT: Export Excel */}
            <div className="bg-white dark:bg-gray-800 rounded-[28px] shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#302782]/8 dark:bg-[#302782]/30 rounded-2xl flex items-center justify-center shrink-0">
                  <FileSpreadsheet size={28} className="text-[#302782] dark:text-[#B2BB1E]" />
                </div>
                <div>
                  <h2 className="text-base font-black text-[#302782] dark:text-white">ส่งออกรายงาน Excel</h2>
                  <p className="text-xs text-black dark:text-white leading-relaxed mt-0.5">เลือกช่วงวันที่เพื่อสร้างรายงานสรุปการจอง</p>
                </div>
              </div>

              <button
                onClick={fillCurrentTerm}
                disabled={isLoading}
                className="w-full mb-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-dashed border-[#B2BB1E]/60 hover:border-[#B2BB1E] bg-[#B2BB1E]/5 hover:bg-[#B2BB1E]/10 text-[#302782] dark:text-[#B2BB1E] font-black text-xs transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Zap size={14} className="shrink-0" />
                กรอกวันที่เทอมปัจจุบันอัตโนมัติ
              </button>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-black dark:text-white flex items-center gap-1"><CalendarRange size={12} /> วันที่เริ่มต้น</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={isLoading} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-3 text-sm font-bold text-[#302782] dark:text-white focus:outline-none focus:border-[#302782] transition-all" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-black dark:text-white flex items-center gap-1"><CalendarRange size={12} /> วันที่สิ้นสุด</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={isLoading} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-3 text-sm font-bold text-[#302782] dark:text-white focus:outline-none focus:border-[#302782] transition-all" />
                </div>
              </div>

              {feedback && (
                <div className={`flex items-start gap-3 rounded-xl p-3 mb-4 text-sm font-bold ${feedback.type === "error" ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"} border`}>
                  {feedback.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                  <span className="text-xs">{feedback.message}</span>
                </div>
              )}

              <button onClick={handleDownload} disabled={isLoading} className="w-full bg-[#302782] hover:bg-[#B2BB1E] text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98] shadow-lg">
                {isLoading ? <><Loader2 size={18} className="animate-spin" /> กำลังสร้างรายงาน...</> : <><Download size={18} /> ดาวน์โหลด Excel</>}
              </button>
            </div>

            {/* RIGHT: Term Management */}
            <div className="bg-white dark:bg-gray-800 rounded-[28px] shadow-sm border border-gray-100 dark:border-gray-700 p-6 text-black dark:text-white">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#302782]/8 dark:bg-[#302782]/30 rounded-2xl flex items-center justify-center shrink-0">
                    <GraduationCap size={28} className="text-[#302782] dark:text-[#B2BB1E]" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-[#302782] dark:text-white">กำหนดวันที่ของแต่ละเทอม</h2>
                    <p className="text-xs text-black dark:text-white leading-relaxed mt-0.5">ระบุวันที่เริ่มต้นและสิ้นสุดของแต่ละภาคเรียน</p>
                  </div>
                </div>

                {/* Academic Year (B.E.) Display */}
                {termDates.first.start_date && !isNaN(new Date(termDates.first.start_date).getFullYear()) && (
                  <div className="flex flex-col items-end">
                    <div className="text-base sm:text-lg font-black text-[#302782] dark:text-white flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#B2BB1E]"></span>
                      ปีการศึกษา {new Date(termDates.first.start_date).getFullYear() + 543}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-5">
                {TERM_CONFIG.map((term) => {
                  const Icon = term.icon;
                  return (
                    <div key={term.key} className={`relative overflow-hidden rounded-xl border ${term.borderLight} ${term.borderDark} ${term.bgLight} ${term.bgDark} px-4 py-3 hover:shadow-md transition-all`}>
                      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${term.gradient}`} />
                      <div className="flex flex-col 2xl:flex-row 2xl:items-center gap-3">
                        <div className="flex items-center gap-3 shrink-0">
                          <div className={`w-10 h-10 ${term.iconBg} rounded-xl flex items-center justify-center`}><Icon size={18} className={term.textColor} /></div>
                          <h3 className={`text-sm font-black ${term.textColor}`}>{term.label}</h3>
                        </div>
                        <div className="2xl:ml-auto flex flex-col sm:flex-row items-center gap-2 w-full 2xl:w-auto">
                          <input type="date" value={termDates[term.key].start_date} onChange={(e) => handleTermDateChange(term.key, 'start_date', e.target.value)} className="w-full sm:flex-1 bg-white dark:bg-gray-700 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold" />
                          <span className="text-gray-400 font-bold hidden sm:block">-</span>
                          <input type="date" value={termDates[term.key].end_date} onChange={(e) => handleTermDateChange(term.key, 'end_date', e.target.value)} className="w-full sm:flex-1 bg-white dark:bg-gray-700 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {termFeedback && (
                <div className={`flex items-start gap-3 rounded-xl p-3 mb-4 text-sm font-bold ${termFeedback.type === "error" ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"} border`}>
                  {termFeedback.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                  <span className="text-xs">{termFeedback.message}</span>
                </div>
              )}

              <button onClick={handleSaveTerms} disabled={isTermLoading} className="w-full bg-[#302782] hover:bg-[#B2BB1E] text-white font-black py-3.5 rounded-xl flex justify-center items-center gap-2 text-sm transiton-all active:scale-[0.98]">
                {isTermLoading ? <><Loader2 size={18} className="animate-spin" /> กำลังบันทึก...</> : <><Save size={18} /> บันทึกข้อมูลเทอม</>}
              </button>
            </div>
          </div>
        </div>
      </PageReveal>
    </div>
  );
};

export default ExportLog;
