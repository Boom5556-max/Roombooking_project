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
} from "lucide-react";
import Button from "../common/Button.jsx";
import ActionModal from "../common/ActionModal.jsx";

const UploadModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [validData, setValidData] = useState([]);
  const [invalidData, setInvalidData] = useState([]);
  const [summary, setSummary] = useState({ total: 0 });
  const [importResult, setImportResult] = useState(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep("upload");
    setValidData([]);
    setInvalidData([]);
    setIsProcessing(false);
    setImportResult(null);
    onClose();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/schedules/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const result = response.data;
      setValidData(result.previewData || []);
      setInvalidData(result.errors || []);
      setSummary({ total: result.total_rows_excel || 0 });
      setStep("preview");
    } catch (error) {
      setImportResult("error");
    } finally {
      setIsProcessing(false);
      e.target.value = null;
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
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full text-gray-400 z-10"
            >
              <X size={18} />
            </button>

            <header className="mb-4 sm:mb-6 pr-8">
              <h2 className="text-lg sm:text-xl font-bold text-[#302782] dark:text-white">
                {step === "preview" ? "ตรวจสอบตารางเรียน" : "นำเข้าตารางเรียน"}
              </h2>
              <p className="text-[10px] sm:text-xs font-medium text-gray-400">
                อัปโหลดไฟล์ Excel เข้าสู่ระบบ
              </p>
            </header>

            {step === "upload" ? (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-600 rounded-[24px] p-8 sm:p-12 bg-gray-50/50 dark:bg-gray-700/50">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  accept=".xlsx, .xls"
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer bg-[#302782] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-[16px] font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg transition-all ${
                    isProcessing
                      ? "opacity-50"
                      : "hover:scale-105 active:scale-95 text-center"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />{" "}
                      กำลังตรวจสอบ...
                    </>
                  ) : (
                    <>
                      <FilePlus size={20} /> เลือกไฟล์ Excel
                    </>
                  )}
                </label>
                <p className="mt-4 text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
                  รองรับเฉพาะ .xlsx หรือ .xls
                </p>
              </div>
            ) : (
              <div className="flex flex-col overflow-hidden">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <StatCard
                    label="ในไฟล์"
                    value={summary.total}
                    color="text-[#302782]"
                  />
                  <StatCard
                    label="ผ่าน"
                    value={validData.length}
                    color="text-[#B2BB1E]"
                  />
                  <StatCard
                    label="ปัญหา"
                    value={invalidData.length}
                    color="text-red-500"
                  />
                </div>

                {/* Table Section - Scrollable on mobile */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pr-1 custom-scrollbar mb-4">
                  {/* Valid Data Table */}
                  <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-[#B2BB1E] text-[11px] sm:text-xs flex items-center gap-1.5 px-1 sticky top-0 bg-white dark:bg-gray-800 py-1 z-10">
                      <CheckCircle2 size={16} /> รายการที่ถูกต้อง (
                      {validData.length})
                    </h3>
                    <div className="border border-gray-100 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                      <table className="w-full text-[11px] sm:text-xs text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold border-b dark:border-gray-600">
                          <tr>
                            <th className="p-2 sm:p-3">วิชา/เวลา</th>
                            <th className="p-2 sm:p-3">ห้อง</th>
                            <th className="p-2 sm:p-3 text-center">ลบ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                          {validData.length > 0 ? (
                            validData.map((item, idx) => (
                              <tr
                                key={idx}
                                className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
                              >
                                <td className="p-2 sm:p-3">
                                  <span className="font-bold text-[#302782] dark:text-white block truncate max-w-[120px] sm:max-w-[180px]">
                                    {item.subject_name}
                                  </span>
                                  <span className="text-[9px] text-gray-500 block">
                                    {item.date} ({item.start_time}-
                                    {item.end_time})
                                  </span>
                                </td>
                                <td className="p-2 sm:p-3 font-bold text-gray-600 dark:text-gray-300">
                                  {item.room_id}
                                </td>
                                <td className="p-2 sm:p-3 text-center">
                                  <button
                                    onClick={() => removeRow(idx)}
                                    className="p-1.5 text-gray-300 hover:text-red-500"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="3"
                                className="p-8 text-center text-gray-400 italic"
                              >
                                ไม่มีข้อมูลที่ถูกต้อง
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Invalid Data Table */}
                  <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-red-500 text-[11px] sm:text-xs flex items-center gap-1.5 px-1 sticky top-0 bg-white dark:bg-gray-800 py-1 z-10">
                      <AlertCircle size={16} /> รายการที่มีปัญหา (
                      {invalidData.length})
                    </h3>
                    <div className="border border-red-50 dark:border-gray-700 rounded-2xl bg-red-50/10 dark:bg-gray-800 shadow-sm overflow-hidden">
                      <table className="w-full text-[11px] sm:text-xs text-left border-collapse">
                        <thead className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold border-b dark:border-gray-600">
                          <tr>
                            <th className="p-2 sm:p-3 w-10 text-center">แถว</th>
                            <th className="p-2 sm:p-3">
                              สาเหตุที่บันทึกไม่ได้
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {invalidData.length > 0 ? (
                            invalidData.map((item, idx) => (
                              <tr key={idx} className="bg-white/60 dark:bg-gray-800/60">
                                <td className="p-2 sm:p-3 font-bold text-gray-400 text-center">
                                  {item.row}
                                </td>
                                <td className="p-2 sm:p-3">
                                  <span className="font-bold text-[#302782] dark:text-white block text-[10px] sm:text-[11px]">
                                    {item.room || "ข้อมูลไม่ครบ"}
                                  </span>
                                  <span className="text-red-600 leading-tight block text-[9px] sm:text-[10px]">
                                    {item.message}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="2"
                                className="p-8 text-center text-gray-400 italic"
                              >
                                ไม่มีรายการที่ผิดพลาด
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <Button
                    onClick={() => setStep("upload")}
                    variant="danger"
                    className="order-2 sm:order-1 flex-1 py-3 rounded-[14px] text-sm sm:text-base font-bold"
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    onClick={handleConfirmImport}
                    disabled={isProcessing || validData.length === 0}
                    className="order-1 sm:order-2 flex-[2] bg-[#B2BB1E] text-white py-3 rounded-[14px] flex items-center justify-center gap-2 font-bold shadow-md active:scale-95 transition-all text-sm sm:text-base"
                  >
                    {isProcessing ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Send size={18} />
                    )}{" "}
                    บันทึก {validData.length} รายการ
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success/Error Action Modals */}
      {importResult === "success" && (
        <ActionModal
          icon={<CheckCircle2 size={56} className="text-[#B2BB1E]" />}
          title="อัปโหลดสำเร็จ!"
          autoClose={true} // เพิ่มตัวนี้
          showButtons={false} // เพิ่มตัวนี้
          onClose={() => {
            handleClose();
            window.location.reload();
          }}
        />
      )}

      {importResult === "error" && (
        <ActionModal
          icon={<AlertCircle size={56} className="text-red-500" />}
          title="อัปโหลดไม่สำเร็จ"
          autoClose={true} // เพิ่มตัวนี้
          showButtons={false} // เพิ่มตัวนี้
          onClose={() => setImportResult(null)}
        />
      )}
    </>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="bg-gray-50/50 dark:bg-gray-700/50 p-2 sm:p-4 rounded-[16px] sm:rounded-[20px] border border-gray-100 dark:border-gray-600 text-center shadow-sm">
    <p className="text-[7px] sm:text-[8px] uppercase tracking-wider font-bold text-gray-400 mb-1">
      {label}
    </p>
    <p className={`text-lg sm:text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

export default UploadModal;
