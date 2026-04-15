import React, { useState, useMemo } from "react";
import {
  Camera,
  Image as ImageIcon,
  QrCode,
  User,
  XCircle,
  List,
  ChevronRight,
  Loader2,
  Building2,
  Lock,
  Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button.jsx";
import { useQRScanner } from "../hooks/useQRScanner.js";
import { useRooms } from "../hooks/useRooms.js";
import {
  SuccessOverlay,
  LoadingOverlay,
  CameraErrorOverlay,
} from "../components/qrscan/ScannerOverlays.jsx";
import ActionModal from "../components/common/ActionModal";
import PageReveal from "../components/common/PageReveal";

const QrFirstpage = () => {
  const [activeTab, setActiveTab] = useState("camera");
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: "" });
  
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  const [qrImageData, setQrImageData] = useState(null);
  const [isFetchingQR, setIsFetchingQR] = useState(false);

  const navigate = useNavigate();

  const showAlert = (title) => setAlertConfig({ isOpen: true, title });

  const {
    errorMsg,
    scanResult,
    isScanningFile,
    handleFileChange,
    setScanResult,
    setErrorMsg,
    isCameraActive,
    startCamera,
    stopCamera,
    handleProcessScan
  } = useQRScanner(activeTab, showAlert);

  const { rooms, isLoading: isRoomsLoading, getRoomQRCode } = useRooms();

  const isRoomAvailable = (room) => {
    return room.repair === false && room.is_active === true; 
  };

  const groupedAndSortedRooms = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];
    const groups = rooms.reduce((acc, room) => {
      const building = room.location ? String(room.location).trim() : "ไม่ระบุอาคาร/สถานที่";
      if (!acc[building]) acc[building] = [];
      acc[building].push(room);
      return acc;
    }, {});

    return Object.entries(groups).map(([building, buildingRooms]) => {
      const sortedRooms = [...buildingRooms].sort((a, b) => {
        const isReadyA = isRoomAvailable(a);
        const isReadyB = isRoomAvailable(b);
        if (isReadyA && !isReadyB) return -1;
        if (!isReadyA && isReadyB) return 1;
        return String(a.room_id || a.name || "").localeCompare(String(b.room_id || b.name || ""));
      });
      return { building, rooms: sortedRooms };
    });
  }, [rooms]);

  const handleSelectRoom = async (room) => {
    setSelectedRoom(room);
    setQrImageData(null);
    setIsFetchingQR(true);
    
    const roomId = room.id || room.room_id; 
    const qrBase64 = await getRoomQRCode(roomId);
    if (qrBase64) {
      const formattedQr = qrBase64.startsWith("data:image") 
        ? qrBase64 
        : `data:image/png;base64,${qrBase64}`;
      setQrImageData(formattedQr);
    }
    setIsFetchingQR(false);
  };

  const handleSimulateScan = (roomId) => {
    setShowRoomModal(false); 
    setSelectedRoom(null);
    handleProcessScan(roomId); 
  };

  return (
    <div className="fixed inset-0 bg-[#302782] dark:bg-gray-950 flex flex-col font-sans overflow-hidden">
      <header className="text-white pt-4 sm:pt-6 pb-4 px-6 flex flex-col items-center justify-center relative z-10 flex-shrink-0">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 sm:mb-3 backdrop-blur-sm shadow-inner">
          <QrCode size={28} className="text-white sm:w-8 sm:h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-wide">Room Check</h1>
        <p className="text-white/70 text-xs sm:text-sm mt-1 text-center font-bold">สแกน QR หรือเลือกห้องจากรายการ</p>
      </header>

      <PageReveal isLoading={false}>
        <main className="h-full bg-[#FFFFFF] dark:bg-gray-800 rounded-t-[40px] sm:rounded-t-[50px] p-6 sm:p-8 flex flex-col items-center shadow-[0_-10px_40px_rgba(0,0,0,0.15)] relative transition-all duration-500 overflow-y-auto w-full">
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-2xl w-full max-w-[300px] mb-6 sm:mb-8 shadow-sm">
            <TabButton active={activeTab === "camera"} onClick={() => { setActiveTab("camera"); setScanResult(""); }} icon={<Camera size={16} />} label="เปิดกล้อง" />
            <TabButton active={activeTab === "file"} onClick={() => { setActiveTab("file"); setScanResult(""); setErrorMsg(""); stopCamera(); }} icon={<ImageIcon size={16} />} label="คลังภาพ" />
          </div>

          <div className="w-full flex flex-col items-center justify-center">
            <div className="w-full max-w-[280px] xs:max-w-[320px] sm:max-w-sm">
              <div className="relative w-full aspect-square bg-black rounded-[40px] sm:rounded-[50px] overflow-hidden shadow-2xl border-[4px] sm:border-[6px] border-[#FFFFFF] dark:border-gray-600">
                {activeTab === "camera" ? (
                  <div className="w-full h-full relative flex items-center justify-center bg-black">
                    {!isCameraActive ? (
                      <div className="flex flex-col items-center justify-center h-full w-full z-10 absolute inset-0 bg-black">
                        <Camera size={48} className="text-gray-700 mb-4" />
                        <button onClick={startCamera} className="bg-[#302782] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[#251f66] transition-all active:scale-[0.98] flex items-center gap-2">
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
                  <GalleryUpload onFileChange={handleFileChange} disabled={isScanningFile} />
                )}
                {scanResult && <SuccessOverlay />}
                {isScanningFile && <LoadingOverlay />}
              </div>
              
              <button onClick={() => { stopCamera(); setShowRoomModal(true); }} className="w-full mt-6 bg-indigo-50 dark:bg-gray-700 text-[#302782] dark:text-[#B2BB1E] py-4 rounded-xl font-bold border-2 border-indigo-100 dark:border-gray-600 flex items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-gray-600 transition-all active:scale-95 shadow-sm">
                <List size={20} /> เลือก QR code จากรายการห้อง
              </button>
            </div>
          </div>

          <div className="w-full max-w-[280px] xs:max-w-[320px] sm:max-w-sm mt-8 pb-4">
            <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-700 mb-6"></div>
            <button onClick={() => navigate("/login")} className="w-full bg-[#302782] dark:bg-[#3d31a3] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#251f66] dark:hover:bg-[#4b3ec2] transition-all active:scale-[0.98] shadow-lg shadow-indigo-900/20">
              <User size={20} /> เข้าสู่ระบบสำหรับบุคลากร
            </button>
          </div>
        </main>
      </PageReveal>

      {showRoomModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 w-full sm:max-w-xl rounded-t-[30px] sm:rounded-[30px] p-6 sm:p-8 shadow-2xl flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh]">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <h2 className="text-2xl font-black text-[#302782] dark:text-white">{selectedRoom ? "ข้อมูลห้องเรียน" : "เลือกห้องที่ต้องการดูข้อมูล"}</h2>
              <button onClick={() => { if (selectedRoom) setSelectedRoom(null); else setShowRoomModal(false); }} className="text-gray-400 hover:text-gray-600 bg-gray-100 dark:bg-gray-700 p-2.5 rounded-full transition-colors"><XCircle size={28} /></button>
            </div>
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow">
              {!selectedRoom ? (
                <RoomList isLoading={isRoomsLoading} groupedRooms={groupedAndSortedRooms} isRoomAvailable={isRoomAvailable} onSelectRoom={handleSelectRoom} />
              ) : (
                <RoomDetailView room={selectedRoom} isFetchingQR={isFetchingQR} qrImageData={qrImageData} onSimulateScan={handleSimulateScan} onBack={() => setSelectedRoom(null)} />
              )}
            </div>
          </div>
        </div>
      )}

      {alertConfig.isOpen && (
        <ActionModal icon={<XCircle size={50} className="text-red-500" />} title={alertConfig.title} variant="danger" autoClose={true} showButtons={false} onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))} />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan { 0%, 100% { transform: translateY(0); opacity: 0; } 10%, 90% { opacity: 1; } 50% { transform: translateY(220px); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
      ` }} />
    </div>
  );
};

const RoomList = ({ isLoading, groupedRooms, isRoomAvailable, onSelectRoom }) => {
  if (isLoading) return <div className="flex flex-col items-center justify-center py-20"><Loader2 size={40} className="animate-spin text-[#302782] mb-4" /><p className="text-gray-500 font-medium text-lg">กำลังโหลดข้อมูลห้อง...</p></div>;
  if (groupedRooms.length === 0) return <p className="text-center text-gray-500 py-20 text-lg">ไม่มีข้อมูลห้องในระบบ</p>;
  return (
    <div className="space-y-8 pb-6">
      {groupedRooms.map(({ building, rooms: buildingRooms }) => (
        <div key={building} className="space-y-4">
          <div className="sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md py-3 z-10 flex items-center gap-3 border-b-2 border-gray-100 dark:border-gray-700">
            <div className="bg-indigo-50 dark:bg-gray-700 p-2 rounded-xl text-[#302782] dark:text-[#B2BB1E] flex-shrink-0"><Building2 size={20} /></div>
            <h3 className="font-bold text-gray-800 dark:text-white text-base sm:text-lg flex-1 pr-2">{building}</h3>
            <span className="text-sm font-bold text-[#302782] dark:text-[#B2BB1E] bg-indigo-100/50 dark:bg-gray-700 px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0">{buildingRooms.length} ห้อง</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {buildingRooms.map((room) => {
              const available = isRoomAvailable(room);
              return (
                <button key={room.id || room.room_id} onClick={() => available && onSelectRoom(room)} disabled={!available} className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center justify-between group shadow-sm ${available ? "bg-gray-50 dark:bg-gray-700 hover:bg-indigo-50 border-transparent hover:border-indigo-100 cursor-pointer" : "bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed"}`}>
                  <h4 className={`text-lg sm:text-xl font-extrabold ${available ? "text-gray-800 dark:text-white group-hover:text-[#302782]" : "text-gray-400 dark:text-gray-500"}`}>ห้อง {room.room_id || room.room_name || room.name}</h4>
                  {available ? <div className="bg-white dark:bg-gray-600 p-2 rounded-full shadow-sm group-hover:bg-[#302782] transition-colors"><ChevronRight size={20} className="text-gray-400 group-hover:text-white" /></div> : <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-xl"><Lock size={14} /><span className="text-xs font-bold">ปิดปรับปรุง</span></div>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// 2. Component แสดงรายละเอียดห้องตอนกดเลือก
const RoomDetailView = ({
  room,
  isFetchingQR,
  qrImageData,
  onSimulateScan,
  onBack,
}) => {
  // ฟังก์ชันสำหรับดาวน์โหลดรูปภาพ
  const handleDownloadQR = () => {
    if (!qrImageData) return;

    const link = document.createElement("a");
    link.href = qrImageData;
    // ตั้งชื่อไฟล์: QR_Room_1501.png
    link.download = `QR_Room_${room.room_number || room.room_id || "code"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center animate-in slide-in-from-right-4 duration-300 py-6">
      {/* ส่วนแสดงรูปภาพ */}
      <div className="relative group">
        <div className="w-56 h-56 bg-white p-4 rounded-[32px] shadow-xl border border-gray-100 mb-8 flex items-center justify-center overflow-hidden relative">
          {isFetchingQR ? (
            <Loader2 size={40} className="animate-spin text-[#302782]" />
          ) : qrImageData ? (
            <img
              src={qrImageData}
              alt="QR Code"
              className="w-full h-full object-contain"
            />
          ) : (
            <p className="text-sm text-gray-400">ไม่พบ QR Code</p>
          )}
        </div>

        {/* ปุ่มดาวน์โหลดแบบลอยบนรูป (แสดงเมื่อมีรูปภาพ) */}
        {!isFetchingQR && qrImageData && (
          <button
            onClick={handleDownloadQR}
            className="absolute -top-2 -right-2 bg-[#302782] text-white p-3 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all z-20"
            title="ดาวน์โหลด QR Code"
          >
            <Download size={20} />
          </button>
        )}
      </div>

      <h3 className="text-3xl font-black text-gray-800 dark:text-white text-center mb-2">
        ห้อง {room.room_number || room.room_id || room.name}
      </h3>

      <p className="text-lg text-gray-500 dark:text-gray-400 text-center mb-10 flex items-center justify-center gap-2">
        <Building2 size={20} />
        {room.location || room.building || "ไม่ระบุอาคาร"}
      </p>

      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => onSimulateScan(room.id || room.room_id)}
          className="w-full bg-[#B2BB1E] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[#9ca31a] transition-all shadow-lg shadow-[#B2BB1E]/20 active:scale-95 text-lg"
        >
          <QrCode size={24} /> เข้าดูตารางการใช้ห้องเรียน
        </button>

        {/* ปุ่มดาวน์โหลดแบบเต็มความกว้าง (ทางเลือกเพิ่มเติม) */}
        <button
          onClick={handleDownloadQR}
          disabled={!qrImageData}
          className="w-full bg-white dark:bg-gray-700 text-[#302782] dark:text-[#B2BB1E] py-3 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
        >
          <Download size={20} /> ดาวน์โหลดรูป QR
        </button>

        {/* <button
          onClick={onBack}
          className="w-full text-[#302782] dark:text-gray-300 font-bold py-3 mt-2 
             hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all 
             active:scale-95 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
        >
          ย้อนกลับ
        </button> */}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex-1 flex justify-center items-center py-3.5 rounded-xl text-xs font-bold gap-2 transition-all ${ active ? "bg-[#302782] shadow-md text-white scale-100" : "text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-600 scale-95"}`}>
    {icon} <span>{label}</span>
  </button>
);

const GalleryUpload = ({ onFileChange, disabled }) => (
  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 transition-colors group">
    <div className="bg-[#B2BB1E]/10 group-hover:bg-[#B2BB1E]/20 p-8 rounded-full mb-4 transition-all transform group-active:scale-95"><ImageIcon size={50} className="text-[#302782] dark:text-white" /></div>
    <div className="text-center"><p className="text-[#302782] dark:text-white font-black text-base mb-1">เลือกรูปภาพจากคลัง</p><p className="text-gray-400 text-xs text-center px-4">ระบบจะสแกน QR Code จากรูปที่คุณเลือก</p></div>
    <input type="file" className="hidden" accept="image/*" onChange={onFileChange} disabled={disabled} />
  </label>
);

export default QrFirstpage;