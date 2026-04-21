import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import {
  X,
  CheckCircle2,
  Loader2,
  FilePlus,
  AlertCircle,
  Trash2,
  Send,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import Button from "../common/Button.jsx";
import ActionModal from "../common/ActionModal.jsx";

const UploadModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState("upload"); // upload -> preview
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState(null);

  const [validData, setValidData] = useState([]);
  const [invalidData, setInvalidData] = useState([]);
  const [availableTerms, setAvailableTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [summary, setSummary] = useState({ total: 0 });
  const [importResult, setImportResult] = useState(null);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [expandedError, setExpandedError] = useState(null);
  const [criticalError, setCriticalError] = useState(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleClose = () => {
    setStep("upload");
    setFile(null);
    setValidData([]);
    setInvalidData([]);
    setIsProcessing(false);
    setImportResult(null);
    setExpandedSubject(null);
    setExpandedError(null);
    setCriticalError(null);
    setAvailableTerms([]);
    setSelectedTerm("");
    onClose();
  };

  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      handleProcessFile(selectedFile); // 👈 โยนไฟล์เข้าฟังก์ชันตรงๆ เพื่อเลี่ยงปัญหา State อัปเดตไม่ทัน
    }
  };

  const handleProcessFile = async (uploadedFile, term = null) => {
    // ใช้ uploadedFile ที่รับมาจาก onFileChange โดยตรง
    if (!uploadedFile) {
      alert("กรุณาเลือกไฟล์ Excel ก่อนครับ");
      return;
    }

    setIsProcessing(true);
    
    // 1. สร้าง FormData และแนบแค่ไฟล์
    const formData = new FormData();
    formData.append("file", uploadedFile);
    if (term) {
      formData.append("term", term);
    }

    try {
      // 2. ยิง API โยนไฟล์ไปให้ Backend (Axios จะจัดการ Header Multipart และ Boundary ให้เองอัตโนมัติ)
      const response = await api.post("/schedules/import", formData);
      const result = response.data;

      // 3. นำข้อมูลที่ Backend ตอบกลับมาใช้งานได้ทันที
      if (result.require_term_selection) {
        setAvailableTerms(result.available_terms || []);
        if (result.available_terms?.length > 0) {
          setSelectedTerm(result.available_terms[0].term);
        }
        setStep("select_term");
        return;
      }

      setValidData(result.previewData || []);
      setInvalidData(result.errors || []);
      setSummary({ total: result.total_rows_excel || 0 });
      setStep("preview");

    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      if (
        errorMsg.includes("ข้อมูลวันเปิด-ปิดเทอมในระบบไม่ครบถ้วน") ||
        errorMsg.includes("วันที่ปัจจุบัน ไม่อยู่ในช่วงเทอมในระบบ")
      ) {
        setCriticalError(errorMsg);
      } else {
        console.error("Upload Error:", error.response?.data || error.message); 
        setImportResult("error");
      }
    } finally {
      setIsProcessing(false);
      // ✅ เคลียร์ input file เพื่อให้เลือกไฟล์เดิมซ้ำได้ในครั้งต่อไปตามคำแนะนำ
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (validData.length === 0) return;
    setIsProcessing(true);
    try {
      await api.post("/schedules/confirm", { schedules: validData });
      setImportResult("success");
    } catch (error) {
      setImportResult("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const removeRow = (index) => {
    setValidData(validData.filter((_, i) => i !== index));
  };

  return (
    <>
      {!importResult && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-4 bg-gray-900/60 backdrop-blur-sm font-sans">
          <div
            className={`bg-white dark:bg-gray-800 shadow-2xl relative rounded-[32px] sm:rounded-[40px] p-5 sm:p-8 mx-auto border border-white/20 dark:border-gray-700 transition-all duration-300 flex flex-col max-h-[95vh] ${
              step === "preview" ? "w-full max-w-5xl" : "w-full max-w-md"
            }`}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full text-black dark:text-white z-10"
            >
              <X size={18} />
            </button>

            <header className="mb-4 sm:mb-6 pr-8">
              <h2 className="text-lg sm:text-xl font-bold text-[#302782] dark:text-white">
                {step === "upload" && "นำเข้าตารางเรียน"}
                {step === "select_term" && "เลือกเทอมการศึกษา"}
                {step === "preview" && "ตรวจสอบความถูกต้อง"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className={`h-1.5 w-12 rounded-full ${step === 'upload' ? 'bg-[#302782]' : 'bg-gray-200'}`} />
                <div className={`h-1.5 w-12 rounded-full ${step === 'select_term' ? 'bg-[#302782]' : 'bg-gray-200'}`} />
                <div className={`h-1.5 w-12 rounded-full ${step === 'preview' ? 'bg-[#302782]' : 'bg-gray-200'}`} />
              </div>
            </header>

            {/* STEP 1: Upload File */}
            {step === "upload" && (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-600 rounded-[24px] p-8 sm:p-12 bg-gray-50/50 dark:bg-gray-700/50">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-[#302782] dark:text-white" size={48} />
                    <p className="text-sm font-bold text-[#302782] dark:text-white">กำลังประมวลผลไฟล์...</p>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={onFileChange}
                      accept=".xlsx, .xls"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer bg-[#302782] text-white px-8 py-3.5 rounded-[16px] font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg hover:-translate-y-px active:scale-[0.98] transition-all"
                    >
                      <FilePlus size={20} /> เลือกไฟล์ Excel
                    </label>
                    <p className="mt-4 text-[10px] text-black dark:text-white text-center uppercase tracking-widest font-bold">
                      รองรับเฉพาะ .xlsx หรือ .xls
                    </p>
                  </>
                )}
              </div>
            )}

            {/* STEP 1.5: Select Term */}
            {step === "select_term" && (
              <div className="flex flex-col items-center justify-center p-4 sm:p-8">
                <AlertCircle size={48} className="text-[#302782] dark:text-[#B2BB1E] mb-4" />
                <p className="text-sm font-bold text-center text-gray-800 dark:text-white mb-6">
                  กรุณาเลือกเทอมที่ต้องการนำเข้าข้อมูลตารางเรียน
                </p>
                <div className="w-full max-w-xs relative mb-6">
                  <select
                    className="w-full appearance-none bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-[14px] px-4 py-3 pr-10 text-black dark:text-white font-bold outline-none focus:border-[#302782] dark:focus:border-[#B2BB1E] transition-colors"
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                  >
                    {availableTerms.map((t) => (
                      <option key={t.term} value={t.term}>
                        เทอม {t.term} ({t.start_date} ถึง {t.end_date})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
                <div className="flex gap-3 w-full max-w-xs">
                  <Button onClick={() => setStep("upload")} variant="danger" className="flex-1 py-3 rounded-[14px]">
                    ยกเลิก
                  </Button>
                  <Button 
                    onClick={() => handleProcessFile(file, selectedTerm)} 
                    className="flex-1 bg-[#B2BB1E] text-white py-3 rounded-[14px] font-bold shadow-md"
                  >
                    ยืนยัน
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Preview */}
            {step === "preview" && (() => {
              // Group validData by subject and section
              const groupedValidData = validData.reduce((acc, item, index) => {
                const subject = item.subject_name || "ไม่ระบุชื่อวิชา";
                const sec = item.sec ? ` (Sec ${item.sec})` : "";
                const groupKey = `${subject}${sec}`;
                
                if (!acc[groupKey]) {
                  acc[groupKey] = [];
                }
                acc[groupKey].push({ ...item, originalIndex: index });
                return acc;
              }, {});

              // Group invalidData by row and reason
              const groupedInvalidData = invalidData.reduce((acc, item) => {
                const match = item.message.match(/^\((Week \d+: [^)]+)\)\s*(.*)$/);
                let weekDate = "";
                let reason = item.message;
                
                if (match) {
                  weekDate = match[1];
                  reason = match[2];
                }
                
                const rowNum = item.row ? item.row - 1 : '-';
                const groupKey = `${rowNum}_${reason}`;
                
                if (!acc[groupKey]) {
                  acc[groupKey] = {
                    row: rowNum,
                    reason: reason,
                    items: []
                  };
                }
                
                if (weekDate) {
                  acc[groupKey].items.push(weekDate);
                }
                
                return acc;
              }, {});

              return (
              <div className="flex flex-col overflow-hidden">
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                  <StatCard label="ในไฟล์" value={summary.total} color="text-[#302782]" />
                  <StatCard label="ผ่าน" value={validData.length} color="text-[#B2BB1E]" />
                  <StatCard label="ปัญหา" value={invalidData.length} color="text-red-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pr-1 custom-scrollbar mb-4">
                  {/* รายการที่ถูกต้อง */}
                  <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-[#B2BB1E] text-xs sm:text-xs flex items-center gap-1.5 px-1 sticky top-0 bg-white dark:bg-gray-800 py-1 z-10">
                      <CheckCircle2 size={16} /> รายการที่ถูกต้อง ({validData.length})
                    </h3>
                    
                    <div className="border border-gray-100 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                      <table className="w-full text-xs sm:text-xs text-left border-collapse">
                        <thead className="bg-[#302782] text-white font-bold border-b dark:border-gray-600">
                          <tr>
                            <th className="p-2 sm:p-3">วิชา</th>
                            <th className="p-2 sm:p-3 text-center w-24">จำนวนรายการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {Object.keys(groupedValidData).length === 0 ? (
                            <tr>
                              <td colSpan="2" className="p-4 text-center text-gray-400">ไม่มีข้อมูลที่ถูกต้อง</td>
                            </tr>
                          ) : (
                            Object.entries(groupedValidData).sort(([a], [b]) => a.localeCompare(b)).map(([subjectName, items]) => {
                              const isExpanded = expandedSubject === subjectName;
                              return (
                                <React.Fragment key={subjectName}>
                                  <tr 
                                    onClick={() => setExpandedSubject(isExpanded ? null : subjectName)}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                                  >
                                    <td className="p-2 sm:p-3">
                                      <div className="flex items-center gap-2">
                                        <span className={`transition-transform duration-200 text-black dark:text-white ${isExpanded ? "rotate-0" : "-rotate-90"}`}>
                                          <ChevronDown size={16} />
                                        </span>
                                        <BookOpen size={14} className="text-[#302782] dark:text-[#B2BB1E] shrink-0" />
                                        <span className="font-bold text-[#302782] dark:text-white truncate max-w-[180px] sm:max-w-xs">{subjectName}</span>
                                      </div>
                                    </td>
                                    <td className="p-2 sm:p-3 text-center font-bold text-[#B2BB1E]">{items.length}</td>
                                  </tr>
                                  
                                  {isExpanded && (
                                    <tr>
                                      <td colSpan="2" className="px-0 py-0 bg-indigo-50/60 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900">
                                        <div className="p-3 sm:p-4">
                                          <table className="w-full text-[10px] sm:text-xs text-left border-collapse bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
                                            <thead className="bg-[#302782] text-white font-bold">
                                              <tr>
                                                <th className="p-2">วันที่ / เวลา</th>
                                                <th className="p-2">ห้อง</th>
                                                <th className="p-2 text-center w-12">ลบ</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                              {items.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                  <td className="p-2">
                                                    <span className="block font-bold text-[#302782] dark:text-white">{item.date}</span>
                                                    <span className="text-gray-500">({item.start_time}-{item.end_time})</span>
                                                  </td>
                                                  <td className="p-2 font-bold text-black dark:text-white">{item.room_id}</td>
                                                  <td className="p-2 text-center">
                                                    <button 
                                                      onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        removeRow(item.originalIndex); 
                                                        // ถ้าลบจนหมดแล้ว ให้ปิด accordion
                                                        if (items.length === 1) setExpandedSubject(null);
                                                      }} 
                                                      className="p-1.5 text-black dark:text-white hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    >
                                                      <Trash2 size={14} />
                                                    </button>
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* รายการที่มีปัญหา */}
                  <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-red-500 text-xs sm:text-xs flex items-center gap-1.5 px-1 sticky top-0 bg-white dark:bg-gray-800 py-1 z-10">
                      <AlertCircle size={16} /> รายการที่มีปัญหา ({invalidData.length})
                    </h3>
                    <div className="border border-red-50 dark:border-gray-700 rounded-2xl bg-red-50/10 dark:bg-gray-800 shadow-sm overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold border-b dark:border-gray-600">
                          <tr>
                            <th className="p-2 w-16 text-center">วิชาที่</th>
                            <th className="p-2">สาเหตุ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {Object.keys(groupedInvalidData).length === 0 ? (
                            <tr>
                              <td colSpan="2" className="p-4 text-center text-gray-400">ไม่มีรายการที่มีปัญหา</td>
                            </tr>
                          ) : (
                            Object.entries(groupedInvalidData).map(([key, group], idx) => {
                              const hasItems = group.items.length > 0;
                              const isExpanded = expandedError === key;
                              
                              return (
                                <React.Fragment key={idx}>
                                  <tr 
                                    onClick={() => hasItems && setExpandedError(isExpanded ? null : key)}
                                    className={`${hasItems ? "hover:bg-red-50/50 dark:hover:bg-red-900/10 cursor-pointer" : ""} transition-colors`}
                                  >
                                    <td className="p-3 sm:p-4 text-center text-black dark:text-white font-medium align-top pt-3.5 sm:pt-4">{group.row}</td>
                                    <td className="p-3 sm:p-4">
                                      <div className="flex items-start gap-2">
                                        {hasItems && (
                                          <span className={`mt-0.5 transition-transform duration-200 text-red-500 shrink-0 ${isExpanded ? "rotate-0" : "-rotate-90"}`}>
                                            <ChevronDown size={16} />
                                          </span>
                                        )}
                                        <div>
                                          <span className="font-bold text-red-600 dark:text-red-400 text-xs sm:text-sm block leading-relaxed">{group.reason}</span>
                                          {hasItems && (
                                            <span className="text-[10px] text-red-500/70 block mt-1.5 font-medium">{group.items.length} รายการที่พบปัญหาเดียวกัน</span>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                  
                                  {isExpanded && hasItems && (
                                    <tr>
                                      <td colSpan="2" className="px-0 py-0 bg-red-50/30 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/30">
                                        <div className="pl-16 pr-4 py-4 sm:pl-20 sm:py-5">
                                          <ul className="list-disc text-red-500 dark:text-red-400 text-xs space-y-2.5 ml-2">
                                            {group.items.map((weekDate, i) => (
                                              <li key={i}><span className="font-semibold text-red-700 dark:text-red-300">{weekDate}</span></li>
                                            ))}
                                          </ul>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <Button onClick={() => setStep("upload")} variant="danger" className="order-2 sm:order-1 flex-1 py-3 rounded-[14px]">
                    ย้อนกลับ
                  </Button>
                  <Button
                    onClick={handleConfirmImport}
                    disabled={isProcessing || validData.length === 0}
                    className="order-1 sm:order-2 flex-[2] bg-[#B2BB1E] text-white py-3 rounded-[14px] flex items-center justify-center gap-2 font-bold shadow-md transition-all"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    บันทึก {validData.length} รายการ
                  </Button>
                </div>
              </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Success/Error Modals */}
      {importResult === "success" && (
        <ActionModal
          icon={<CheckCircle2 size={56} className="text-[#B2BB1E]" />}
          title="อัปโหลดสำเร็จ!"
          autoClose={true}
          showButtons={false}
          onClose={() => { handleClose(); window.location.reload(); }}
        />
      )}
      {importResult === "error" && (
        <ActionModal
          icon={<AlertCircle size={56} className="text-red-500" />}
          title="อัปโหลดไม่สำเร็จ"
          autoClose={true}
          showButtons={false}
          onClose={() => setImportResult(null)}
        />
      )}

      {/* Critical Error Modal */}
      {criticalError && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-[32px] max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in duration-300">
            <AlertCircle size={64} className="text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-[#302782] dark:text-white mb-2">
              ไม่สามารถนำเข้าข้อมูลได้
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-8 leading-relaxed px-2">
              {criticalError}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={() => setCriticalError(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white font-bold rounded-xl transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  setCriticalError(null);
                  handleClose();
                  navigate("/export-log");
                }}
                className="flex-1 py-3 bg-[#B2BB1E] hover:bg-[#9fa719] text-white font-bold rounded-xl shadow-md transition-colors"
              >
                ตรวจสอบวันที่เทอม
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="bg-gray-50/50 dark:bg-gray-700/50 p-2 sm:p-4 rounded-[16px] border border-gray-100 dark:border-gray-600 text-center shadow-sm">
    <p className="text-[7px] sm:text-[8px] uppercase tracking-wider font-bold text-black dark:text-white mb-1">{label}</p>
    <p className={`text-lg sm:text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

export default UploadModal;