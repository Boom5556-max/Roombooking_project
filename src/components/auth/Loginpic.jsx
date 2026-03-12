import React from "react";
import Building_26 from "../../assets/image/picture1.jpeg";

const Loginpic = () => {
  return (
    <div className="hidden lg:block w-full h-[35vh] lg:h-auto lg:w-[55%] relative shrink-0 overflow-hidden">
      {/* 1. รูปภาพพื้นหลัง (รูปตึกเดิม) */}
      <img 
        src={Building_26} 
        alt="Building" 
        className="absolute inset-0 w-full h-full object-cover object-center" 
      />
      
      {/* 2. Overlay สีเข้มบางๆ เพื่อให้ตัวหนังสือและกรอบ PDF เด่นขึ้น */}
      <div className="absolute inset-0 bg-[#2D2D86]/20 dark:bg-black/40 backdrop-blur-[1px]"></div>

      {/* 3. กรอบกระจกใสแสดง PDF (Glassmorphism) */}
      <div className="absolute inset-0 flex items-center justify-center p-12 xl:p-20">
        <div className="w-full h-full bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm rounded-[32px] shadow-xl border border-white/20 dark:border-gray-700/30 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-700">
          
          {/* Header ของกรอบ PDF */}
          <div className="px-6 py-4 bg-white/40 dark:bg-gray-800/40 border-b border-white/10 flex items-center gap-3">
            <div className="p-2 bg-[#B2BB1E] rounded-lg shadow-sm">
              <span className="text-white text-lg">📄</span>
            </div>
            {/* 🟢 แก้ตรงนี้: เปลี่ยน text-xs เป็น text-base (เพื่อให้ตัวหนังสือใหญ่ขึ้น) */}
            <h2 className="font-black text-[#302782] dark:text-white text-base uppercase tracking-wider">
              ข่าวประชาสัมพันธ์ทั่วไป
            </h2>
          </div>

          {/* ตัวเรียกไฟล์ PDF */}
          <div className="flex-1 bg-gray-50/20">
            {/* ตรวจสอบว่ามีไฟล์ manual.pdf อยู่ในโฟลเดอร์ public นะครับ */}
            <iframe
              src="/manual.pdf#toolbar=0&navpanes=0" 
              className="w-full h-full border-none opacity-80"
              title="Manual PDF"
            />
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default Loginpic;