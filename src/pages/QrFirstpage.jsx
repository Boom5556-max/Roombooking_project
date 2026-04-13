import React, { useState } from "react";
import {
  Camera,
  Image as ImageIcon,
  QrCode,
  User,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button.jsx";
import { useQRScanner } from "../hooks/useQRScanner.js";
import {
  SuccessOverlay,
  LoadingOverlay,
  CameraErrorOverlay,
} from "../components/qrscan/ScannerOverlays.jsx";
import ActionModal from "../components/common/ActionModal";

const QrFirstpage = () => {
  const [activeTab, setActiveTab] = useState("camera");
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: "" });
  const navigate = useNavigate();

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
    isCameraActive,
    startCamera,
    stopCamera
  } = useQRScanner(activeTab, showAlert);

  return (
    <div className="fixed inset-0 bg-[#302782] dark:bg-gray-950 flex flex-col font-sans overflow-hidden">
      
      {/* 👇 1. ปรับขอบบนให้แคบลง: เปลี่ยน pt-10 เป็น pt-4 (มือถือ) และ pt-12 เป็น pt-6 (จอใหญ่) */}
      <header className="text-white pt-4 sm:pt-6 pb-4 px-6 flex flex-col items-center justify-center relative z-10 flex-shrink-0">
        {/* ปรับขนาดไอคอนให้เล็กลงนิดหน่อยในจอมือถือ จะได้ดูไม่เบียด */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 sm:mb-3 backdrop-blur-sm shadow-inner">
          <QrCode size={28} className="text-white sm:w-8 sm:h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-wide">Room Check</h1>
        <p className="text-white/70 text-xs sm:text-sm mt-1 text-center">
          สแกน QR Code หน้าห้องเพื่อดูตารางการใช้งาน
        </p>
      </header>

      {/* 2. Main Content */}
      <main className="flex-grow bg-[#FFFFFF] dark:bg-gray-800 rounded-t-[40px] sm:rounded-t-[50px] p-6 sm:p-8 flex flex-col items-center shadow-[0_-10px_40px_rgba(0,0,0,0.15)] relative transition-all duration-500 overflow-y-auto">
        
        {/* Tab Selection */}
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-2xl w-full max-w-[300px] mb-6 sm:mb-8 shadow-sm">
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
              stopCamera();
            }}
            icon={<ImageIcon size={16} />}
            label="คลังภาพ"
          />
        </div>

        {/* Scanner Box */}
        <div className="w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-[280px] xs:max-w-[320px] sm:max-w-sm">
            <div className="relative w-full aspect-square bg-black rounded-[40px] sm:rounded-[50px] overflow-hidden shadow-2xl border-[4px] sm:border-[6px] border-[#FFFFFF] dark:border-gray-600">
              
              {activeTab === "camera" ? (
                <div className="w-full h-full relative flex items-center justify-center bg-black">
                  {!isCameraActive ? (
                    <div className="flex flex-col items-center justify-center h-full w-full z-10 absolute inset-0 bg-black">
                      <Camera size={48} className="text-black dark:text-white mb-4" />
                      <button 
                        onClick={startCamera} 
                        className="bg-[#302782] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[#251f66] transition-colors active:scale-[0.98] flex items-center gap-2"
                      >
                        <Camera size={20} /> แตะเพื่อเปิดกล้อง
                      </button>
                    </div>
                  ) : (
                    <>
                      <div id="reader" className="w-full h-full object-cover"></div>
                      {errorMsg && <CameraErrorOverlay message={errorMsg} />}
                      {!errorMsg && !scanResult && (
                        <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40 z-10">
                          <div className="w-full h-full border-2 border-[#B2BB1E]/50 relative">
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-[#B2BB1E] shadow-[0_0_10px_#B2BB1E] animate-[scan_2s_ease-in-out_infinite]"></div>
                          </div>
                        </div>
                      )}
                    </>
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

            <p className="text-center mt-6 text-black dark:text-white text-xs sm:text-sm font-medium animate-pulse">
              {activeTab === "camera"
                ? "เล็ง QR Code ให้อยู่ในกรอบ"
                : "อัปโหลดรูปภาพที่มี QR Code"}
            </p>
          </div>
        </div>

        {/* ปุ่ม Login สำหรับบุคลากร */}
        <div className="w-full max-w-[280px] xs:max-w-[320px] sm:max-w-sm mt-8 pb-4">
          <div className="h-[1px] w-full bg-gray-200 dark:bg-gray-700 mb-6"></div>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-[#302782] dark:bg-[#3d31a3] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#251f66] dark:hover:bg-[#4b3ec2] transition-all active:scale-[0.98] shadow-lg shadow-indigo-900/20"
          >
            <User size={20} /> เข้าสู่ระบบสำหรับบุคลากร
          </button>
        </div>

      </main>

      {/* Modal แจ้งเตือน */}
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

      {/* อนิเมชันเส้นสแกน */}
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
    className={`flex-1 flex justify-center items-center py-3 sm:py-3.5 rounded-xl text-xs font-bold gap-2 transition-all duration-200 ${
      active 
        ? "bg-[#302782] shadow-md text-white scale-100" 
        : "text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 scale-95"
    }`}
  >
    {icon} <span>{label}</span>
  </Button>
);

const GalleryUpload = ({ onFileChange, disabled }) => (
  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group">
    <div className="bg-[#B2BB1E]/10 group-hover:bg-[#B2BB1E]/20 p-6 sm:p-8 rounded-full mb-4 transition-all transform group-active:scale-95">
      <ImageIcon size={48} className="text-[#302782] dark:text-white sm:w-[56px] sm:h-[56px]" />
    </div>
    <div className="text-center px-4">
      <p className="text-[#302782] dark:text-white font-bold text-sm sm:text-base mb-1">แตะเพื่อเลือกรูปภาพ</p>
      <p className="text-black dark:text-white text-[10px] sm:text-xs">รองรับ JPG, PNG</p>
    </div>
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