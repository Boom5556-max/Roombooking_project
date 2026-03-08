import React, { useState } from "react";
import {
  Camera,
  Image as ImageIcon,
  QrCode,
  User,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button.jsx";
import { useQRScannerLogic } from "../hooks/useQRScannerLogic.js";
import {
  SuccessOverlay,
  LoadingOverlay,
  CameraErrorOverlay,
} from "../components/qrscan/ScannerOverlays.jsx";
import ActionModal from "../components/common/ActionModal"; // 1. Import Modal

const QrFirstpage = () => {
  const [activeTab, setActiveTab] = useState("camera");
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: "" });
  const navigate = useNavigate();

  // 2. สร้างฟังก์ชันแจ้งเตือน
  const showAlert = (title) => {
    setAlertConfig({ isOpen: true, title });
  };

  const {
    errorMsg,
    scanResult,
    isScanningFile,
    handleFileChange,
    setScanResult,
    setErrorMsg,
  } = useQRScannerLogic(activeTab, showAlert); // 3. ส่ง showAlert เข้า Hook

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-[#302782] text-white pt-12 pb-16 px-6 rounded-b-[40px] shadow-lg flex flex-col items-center justify-center relative z-10">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm shadow-inner">
          <QrCode size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-wide">Room Check</h1>
        <p className="text-white/70 text-sm mt-1 text-center">
          สแกน QR Code หน้าห้องเพื่อดูตารางการใช้งาน
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center p-6 -mt-8 relative z-20">
        <div className="bg-white w-full max-w-sm rounded-[40px] p-6 shadow-xl border border-gray-100 flex flex-col items-center">
          <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-6 w-full border border-gray-100">
            <TabButton
              active={activeTab === "camera"}
              onClick={() => {
                setActiveTab("camera");
                setScanResult("");
              }}
              icon={<Camera size={16} />}
              label="เปิดกล้องสแกน"
            />
            <TabButton
              active={activeTab === "file"}
              onClick={() => {
                setActiveTab("file");
                setScanResult("");
                setErrorMsg("");
              }}
              icon={<ImageIcon size={16} />}
              label="เลือกจากคลังภาพ"
            />
          </div>

          <div className="w-full aspect-square bg-gray-900 rounded-[32px] overflow-hidden shadow-2xl border-[6px] border-white relative">
            {activeTab === "camera" ? (
              <div className="w-full h-full relative flex items-center justify-center bg-black">
                <div id="reader" className="w-full h-full object-cover"></div>
                {errorMsg && <CameraErrorOverlay message={errorMsg} />}
                {!errorMsg && !scanResult && (
                  <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40 z-10">
                    <div className="w-full h-full border-2 border-[#B2BB1E]/50 relative">
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-[#B2BB1E] shadow-[0_0_10px_#B2BB1E] animate-[scan_2s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <GalleryUpload
                onFileChange={handleFileChange}
                disabled={isScanningFile}
              />
            )}
            {scanResult && <SuccessOverlay />}
            {isScanningFile && <LoadingOverlay />}
          </div>

          <p className="text-xs text-gray-400 font-medium mt-6 text-center">
            {activeTab === "camera"
              ? "เล็ง QR Code ให้อยู่ในกรอบ"
              : "อัปโหลดรูปภาพที่มี QR Code"}
          </p>
        </div>

        {/* ปุ่ม Login อื่นๆ ... (โค้ดเดิมของคุณ) */}
      </main>

      {/* 4. แสดงผล Modal แจ้งเตือน */}
      {alertConfig.isOpen && (
        <ActionModal
          icon={<XCircle size={50} className="text-red-500" />}
          title={alertConfig.title}
          variant="danger"
          autoClose={true}
          showButtons={false}
          onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
        />
      )}

      <main className="flex-1 flex flex-col items-center p-6 -mt-8 relative z-20">
        {/* ส่วนเนื้อหาหลัก (Scanner) */}

        {/* Footer / Login Buttons - ปรับให้จัดกึ่งกลางและมีระยะห่างสวยงาม */}
        {/* ส่วนปุ่มสำหรับบุคลากร (ปุ่มเดียวแบบเรียบง่าย) */}
        <div className="w-full max-w-sm mt-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              สำหรับบุคลากร
            </span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <button
            onClick={() => navigate("/login")} // กดแล้วเด้งไปหน้า login ทันที
            className="w-full bg-[#302782] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#251f66] transition-all active:scale-[0.98] shadow-lg shadow-indigo-900/20"
          >
            <User size={20} /> เข้าสู่ระบบสำหรับบุคลากร
          </button>
        </div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scan {
          0%, 100% { transform: translateY(0); opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { transform: translateY(220px); }
        }
      `,
        }}
      />
    </div>
  );
};

// --- UI Helpers ---
const TabButton = ({ active, onClick, icon, label }) => (
  <Button
    variant="none"
    size="none"
    onClick={onClick}
    className={`flex-1 py-3 rounded-xl text-xs font-bold flex justify-center items-center gap-2 transition-all duration-300 ${
      active
        ? "bg-white shadow-md text-[#302782] scale-100"
        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 scale-95"
    }`}
  >
    {icon} <span>{label}</span>
  </Button>
);

const GalleryUpload = ({ onFileChange, disabled }) => (
  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
    <div className="bg-[#B2BB1E]/20 p-6 rounded-full mb-4 group-hover:scale-110 transition-transform">
      <ImageIcon size={48} className="text-[#302782]" />
    </div>
    <p className="text-[#302782] font-bold text-sm mb-1">แตะเพื่อเลือกรูปภาพ</p>
    <p className="text-xs text-gray-400">รองรับ JPG, PNG</p>
    <input
      type="file"
      className="hidden"
      accept="image/*"
      onChange={onFileChange}
      disabled={disabled}
    />
  </label>
);

export default QrFirstpage;
