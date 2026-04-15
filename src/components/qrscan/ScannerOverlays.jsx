import React from 'react';
import { QrCode, Loader2, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import Button from "../common/Button.jsx";

// 1. SuccessOverlay: แสดงเมื่อสแกนสำเร็จ
export const SuccessOverlay = () => (
  <div className="absolute inset-0 bg-[#B2BB1E] flex flex-col items-center justify-center p-8 text-center z-[100] animate-in fade-in duration-500">
    {/* Icon Container with Glassmorphism effect instead of heavy shadow */}
    <div className="bg-white/20 backdrop-blur-md p-8 rounded-[40px] mb-10 text-white border border-white/30 animate-in zoom-in duration-700 delay-200">
      <CheckCircle2 size={80} strokeWidth={2.5} className="animate-pulse" />
    </div>
    
    <h3 className="text-white font-black text-4xl sm:text-5xl tracking-tight leading-tight drop-shadow-sm">
      ตรวจพบข้อมูลห้อง
    </h3>
    
    <p className="text-white/90 font-bold mt-5 text-xl tracking-wide opacity-90">
      กำลังนำคุณไปที่ปฏิทิน...
    </p>

    <style jsx>{`
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.8; }
      }
      .animate-pulse {
        animation: pulse 2s ease-in-out infinite;
      }
    `}</style>
  </div>
);

// 2. LoadingOverlay: แสดงขณะประมวลผล
export const LoadingOverlay = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#302782]/60 backdrop-blur-sm text-white z-[110] animate-in fade-in duration-200">
    <div className="relative flex items-center justify-center">
      {/* วงแหวน Loading สองชั้นให้ดูมีมิติ */}
      <div className="w-20 h-20 border-4 border-white/20 rounded-full"></div>
      <div className="absolute w-20 h-20 border-4 border-t-white border-transparent rounded-full animate-spin"></div>
      <Loader2 className="absolute text-white/40" size={24} />
    </div>
    <p className="mt-6 text-sm font-black tracking-[0.2em] uppercase opacity-90">
      Processing
    </p>
  </div>
);

// 3. CameraErrorOverlay: แสดงเมื่อกล้องมีปัญหา
export const CameraErrorOverlay = ({ message }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 backdrop-blur-lg p-10 text-center z-[150]">
    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-8 text-red-400 border border-white/10">
      <AlertCircle size={44} strokeWidth={2.5} />
    </div>
    
    <h3 className="text-white text-2xl font-black mb-3">เข้าถึงกล้องไม่ได้</h3>
    <p className="text-white text-base font-medium mb-10 leading-relaxed max-w-[260px] mx-auto">
      {message || "โปรดตรวจสอบสิทธิ์การเข้าถึงกล้องในการตั้งค่าเบราว์เซอร์ของคุณ"}
    </p>
    
    <Button 
      variant="primary" 
      size="lg" 
      onClick={() => window.location.reload()}
      className="w-full max-w-[220px] shadow-[0_15px_30px_-10px_rgba(178,187,30,0.4)]"
    >
      <RefreshCw size={20} />
      <span>รีเฟรชหน้าเว็บ</span>
    </Button>
    
    
  </div>
);