import React, { useState } from "react";
import api from "../../api/axios.js";
import {
  X,
  CheckCircle2,
  Loader2,
  FilePlus,
  AlertCircle,
  Trash2,
  Send,
  Info,
  ChevronRight,
} from "lucide-react";
import Button from "../common/Button.jsx";
import ActionModal from "../common/ActionModal.jsx";

const UploadModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState("upload"); // upload -> info -> preview
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState(null);
  
  // ฟอร์มสำหรับข้อมูลส่วนกลาง
  const [globalInfo, setGlobalInfo] = useState({
    department: "",
    study_year: "1",
    program_type: "ปกติ",
  });

  const [validData, setValidData] = useState([]);
  const [invalidData, setInvalidData] = useState([]);
  const [summary, setSummary] = useState({ total: 0 });
  const [importResult, setImportResult] = useState(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep("upload");
    setFile(null);
    setValidData([]);
    setInvalidData([]);
    setIsProcessing(false);
    setImportResult(null);
    setGlobalInfo({ department: "", study_year: "1", program_type: "ปกติ" });
    onClose();
  };

  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStep("info"); // เมื่อเลือกไฟล์เสร็จ ให้ไปหน้ากรอกข้อมูล
    }
  };

  const handleProcessFile = async () => {
    if (!file || !globalInfo.department) {
      alert("กรุณากรอกสาขาวิชา");
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", file);
    // ส่งข้อมูลฟอร์มพ่วงไปด้วย
    formData.append("department", globalInfo.department);
    formData.append("study_year", globalInfo.study_year);
    formData.append("program_type", globalInfo.program_type);

    try {
      const response = await api.post("/schedules/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const result = response.data;
      
      // นำข้อมูล department, study_year, program_type ไปรวมใน previewData (ถ้า Backend ยังไม่รวมมาให้)
      const augmentedData = (result.previewData || []).map(item => ({
        ...item,
        department: globalInfo.department,
        study_year: globalInfo.study_year,
        program_type: globalInfo.program_type
      }));

      setValidData(augmentedData);
      setInvalidData(result.errors || []);
      setSummary({ total: result.total_rows_excel || 0 });
      setStep("preview");
    } catch (error) {
      setImportResult("error");
    } finally {
      setIsProcessing(false);
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
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full text-gray-400 z-10"
            >
              <X size={18} />
            </button>

            <header className="mb-4 sm:mb-6 pr-8">
              <h2 className="text-lg sm:text-xl font-bold text-[#302782] dark:text-white">
                {step === "upload" && "นำเข้าตารางเรียน"}
                {step === "info" && "ระบุรายละเอียดหลักสูตร"}
                {step === "preview" && "ตรวจสอบความถูกต้อง"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className={`h-1.5 w-8 rounded-full ${step === 'upload' ? 'bg-[#302782]' : 'bg-gray-200'}`} />
                <div className={`h-1.5 w-8 rounded-full ${step === 'info' ? 'bg-[#302782]' : 'bg-gray-200'}`} />
                <div className={`h-1.5 w-8 rounded-full ${step === 'preview' ? 'bg-[#302782]' : 'bg-gray-200'}`} />
              </div>
            </header>

            {/* STEP 1: Upload File */}
            {step === "upload" && (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-600 rounded-[24px] p-8 sm:p-12 bg-gray-50/50 dark:bg-gray-700/50">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={onFileChange}
                  accept=".xlsx, .xls"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-[#302782] text-white px-8 py-3.5 rounded-[16px] font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <FilePlus size={20} /> เลือกไฟล์ Excel
                </label>
                <p className="mt-4 text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
                  รองรับเฉพาะ .xlsx หรือ .xls
                </p>
              </div>
            )}

            {/* STEP 2: Fill Global Info */}
            {step === "info" && (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex gap-3 mb-2">
                  <Info className="text-blue-500 shrink-0" size={20} />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    ระบุข้อมูลของตารางเรียนชุดนี้ ข้อมูลจะถูกบันทึกลงในทุกรายการที่คุณอัปโหลด
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">สาขาวิชา</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-[#302782] outline-none text-sm transition-all"
                      value={globalInfo.department}
                      onChange={(e) => setGlobalInfo({...globalInfo, department: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">ชั้นปี</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none text-sm"
                        value={globalInfo.study_year}
                        onChange={(e) => setGlobalInfo({...globalInfo, study_year: e.target.value})}
                      >
                        {[1,2,3,4].map(y => <option key={y} value={y}>ชั้นปีที่ {y}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">ภาคการศึกษา</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none text-sm"
                        value={globalInfo.program_type}
                        onChange={(e) => setGlobalInfo({...globalInfo, program_type: e.target.value})}
                      >
                        <option value="ปกติ">ภาคปกติ</option>
                        <option value="พิเศษ">ภาคพิเศษ</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  <Button variant="danger" className="flex-1 rounded-xl py-3" onClick={() => setStep("upload")}>
                    ย้อนกลับ
                  </Button>
                  <Button 
                    className="flex-[2] rounded-xl py-3 bg-[#302782] text-white flex items-center justify-center gap-2 font-bold"
                    onClick={handleProcessFile}
                    disabled={isProcessing || !globalInfo.department}
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={20} /> : "ดำเนินการต่อ"}
                    {!isProcessing && <ChevronRight size={18} />}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Preview */}
            {step === "preview" && (
              <div className="flex flex-col overflow-hidden">
                {/* Stats & Global Info Badge */}
                <div className="flex flex-wrap items-center gap-2 mb-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl">
                    <span className="text-[10px] font-bold px-2 py-1 bg-[#302782] text-white rounded-lg">{globalInfo.department}</span>
                    <span className="text-[10px] font-bold px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-lg">ปี {globalInfo.study_year}</span>
                    <span className="text-[10px] font-bold px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-lg">ภาค{globalInfo.program_type}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                  <StatCard label="ในไฟล์" value={summary.total} color="text-[#302782]" />
                  <StatCard label="ผ่าน" value={validData.length} color="text-[#B2BB1E]" />
                  <StatCard label="ปัญหา" value={invalidData.length} color="text-red-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pr-1 custom-scrollbar mb-4">
                  {/* Valid Data Table */}
                  <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-[#B2BB1E] text-xs sm:text-xs flex items-center gap-1.5 px-1 sticky top-0 bg-white dark:bg-gray-800 py-1 z-10">
                      <CheckCircle2 size={16} /> รายการที่ถูกต้อง ({validData.length})
                    </h3>
                    <div className="border border-gray-100 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                      <table className="w-full text-xs sm:text-xs text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold border-b dark:border-gray-600">
                          <tr>
                            <th className="p-2 sm:p-3">วิชา/เวลา</th>
                            <th className="p-2 sm:p-3">ห้อง</th>
                            <th className="p-2 sm:p-3 text-center">ลบ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                          {validData.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                              <td className="p-2 sm:p-3">
                                <span className="font-bold text-[#302782] dark:text-white block truncate max-w-[120px]">{item.subject_name}</span>
                                <span className="text-[9px] text-gray-500 block">{item.date} ({item.start_time}-{item.end_time})</span>
                              </td>
                              <td className="p-2 sm:p-3 font-bold text-gray-600 dark:text-gray-300">{item.room_id}</td>
                              <td className="p-2 sm:p-3 text-center">
                                <button onClick={() => removeRow(idx)} className="p-1.5 text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Invalid Data Table */}
                  <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-red-500 text-xs sm:text-xs flex items-center gap-1.5 px-1 sticky top-0 bg-white dark:bg-gray-800 py-1 z-10">
                      <AlertCircle size={16} /> รายการที่มีปัญหา ({invalidData.length})
                    </h3>
                    <div className="border border-red-50 dark:border-gray-700 rounded-2xl bg-red-50/10 dark:bg-gray-800 shadow-sm overflow-hidden text-xs">
                         {/* ... (ตาราง Error เหมือนเดิม) ... */}
                         <table className="w-full text-left">
                            <thead className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold border-b dark:border-gray-600">
                                <tr>
                                    <th className="p-2 w-10 text-center">แถว</th>
                                    <th className="p-2">สาเหตุ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {invalidData.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="p-2 text-center text-gray-400">{item.row}</td>
                                        <td className="p-2">
                                            <span className="font-bold text-red-600 text-[10px] block">{item.message}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                         </table>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <Button onClick={() => setStep("info")} variant="danger" className="order-2 sm:order-1 flex-1 py-3 rounded-[14px]">
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
            )}
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
    </>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="bg-gray-50/50 dark:bg-gray-700/50 p-2 sm:p-4 rounded-[16px] border border-gray-100 dark:border-gray-600 text-center shadow-sm">
    <p className="text-[7px] sm:text-[8px] uppercase tracking-wider font-bold text-gray-400 mb-1">{label}</p>
    <p className={`text-lg sm:text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

export default UploadModal;