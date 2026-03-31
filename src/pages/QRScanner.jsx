import React, { useState } from "react";
import { Camera, Image as ImageIcon, XCircle } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Button from "../components/common/Button.jsx";
import { useQRScannerLogic } from "../hooks/useQRScannerLogic.js";
import { SuccessOverlay, LoadingOverlay, CameraErrorOverlay } from "../components/qrscan/ScannerOverlays.jsx";
import ActionModal from "../components/common/ActionModal";

const QRScanner = () => {
  const [activeTab, setActiveTab] = useState("camera");
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: "" });

  const showAlert = (title) => {
    setAlertConfig({ isOpen: true, title });
  };

  const { 
    errorMsg, scanResult, isScanningFile, 
    handleFileChange, setScanResult, setErrorMsg,
    isCameraActive, startCamera, stopCamera
  } = useQRScannerLogic(activeTab, showAlert); // ส่ง showAlert ไปให้ Hook ใช้ด้วย
  
  return (
    <div className="fixed inset-0 bg-[#302782] dark:bg-gray-950 flex flex-col font-sans overflow-hidden">
      <Navbar />
      
      <div className="flex-grow bg-[#FFFFFF] dark:bg-gray-800 rounded-t-[40px] sm:rounded-t-[50px] p-4 sm:p-8 flex flex-col items-center shadow-2xl relative transition-all duration-500">
        
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-2xl mb-6 sm:mb-10 w-full max-w-[300px] shadow-sm">
          <TabButton 
            active={activeTab === "camera"} 
            onClick={() => { setActiveTab("camera"); setScanResult(""); }}
            icon={<Camera size={16} />}
            label="กล้องถ่ายรูป"
          />
          <TabButton 
            active={activeTab === "file"} 
            onClick={() => { setActiveTab("file"); setScanResult(""); setErrorMsg(""); stopCamera(); }}
            icon={<ImageIcon size={16} />}
            label="คลังภาพ"
          />
        </div>

        <div className="w-full flex flex-col items-center justify-center flex-grow">
          <div className="w-full max-w-[280px] xs:max-w-[320px] sm:max-w-sm">
            <div className="relative w-full aspect-square bg-black rounded-[40px] sm:rounded-[50px] overflow-hidden shadow-2xl border-[4px] sm:border-[6px] border-[#FFFFFF] dark:border-gray-600">
              
              {activeTab === "camera" ? (
                <div className="w-full h-full relative">
                  {!isCameraActive ? (
                    <div className="flex flex-col items-center justify-center h-full w-full bg-black z-10 absolute inset-0">
                      <Camera size={48} className="text-gray-500 mb-4" />
                      <button 
                        onClick={startCamera} 
                        className="bg-[#302782] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[#251f66] transition-colors active:scale-95 flex items-center gap-2"
                      >
                        <Camera size={20} /> แตะเพื่อเปิดกล้อง
                      </button>
                    </div>
                  ) : (
                    <>
                      <div id="reader" className="w-full h-full object-cover"></div>
                      {errorMsg && <CameraErrorOverlay message={errorMsg} />}
                    </>
                  )}
                </div>
              ) : (
                <GalleryUpload onFileChange={handleFileChange} disabled={isScanningFile} />
              )}

              {scanResult && <SuccessOverlay />}
              {isScanningFile && <LoadingOverlay />}
            </div>
            
            <p className="text-center mt-6 text-gray-400 text-xs sm:text-sm font-medium animate-pulse">
              {activeTab === "camera" ? "วาง QR Code ให้อยู่ในกรอบ" : "เลือกรูปภาพที่มี QR Code"}
            </p>
          </div>
        </div>
        
        <div className="h-6 sm:h-0"></div>
      </div>

      {/* Modal แจ้งเตือนเมื่อสแกนไม่ติด */}
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
      active ? "bg-[#302782] shadow-md text-white scale-100" : "text-gray-500 hover:bg-gray-50 scale-95"
    }`}
  >
    {icon}
    <span>{label}</span>
  </Button>
);

const GalleryUpload = ({ onFileChange, disabled }) => (
  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group">
    <div className="bg-[#B2BB1E]/10 group-hover:bg-[#B2BB1E]/20 p-6 sm:p-8 rounded-full mb-4 transition-all transform group-active:scale-95">
      <ImageIcon size={48} className="text-[#302782] sm:w-[56px] sm:h-[56px]" />
    </div>
    <div className="text-center px-4">
      <p className="text-[#302782] dark:text-white font-bold text-sm sm:text-base">อัปโหลดรูปภาพ</p>
      <p className="text-gray-400 text-[10px] sm:text-xs mt-1">รองรับ JPG, PNG</p>
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

export default QRScanner;