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
      <div className="absolute inset-0 bg-[#2D2D86]/30 dark:bg-black/50 backdrop-blur-[2px]"></div>

      {/* 3. กรอบกระจกใสแสดง PDF (Glassmorphism) */}
      {/* 🟢 แก้ตรงนี้: ลด padding จาก p-12 xl:p-20 เป็น p-6 xl:p-8 เพื่อให้พื้นที่ PDF ใหญ่ขึ้น */}
      <div className="absolute inset-0 flex items-center justify-center p-6 xl:p-8">
        <div className="w-full h-full bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-[32px] shadow-2xl border border-white/30 dark:border-gray-700/50 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-700">
          
          {/* Header ของกรอบ PDF */}
          <div className="px-6 py-4 bg-white/80 dark:bg-gray-800/80 border-b border-white/20 dark:border-gray-600 flex items-center gap-3 shadow-sm z-10">
            <div className="p-2 bg-[#B2BB1E] rounded-lg shadow-sm">
              <span className="text-white text-lg">📄</span>
            </div>
            {/* ปรับให้ตัวหนังสือใน Header ใหญ่ขึ้นเล็กน้อยในจอใหญ่ */}
            <h2 className="font-black text-[#302782] dark:text-white text-base xl:text-lg uppercase tracking-wider">
              คู่มือการใช้งาน
            </h2>
          </div>

          {/* ตัวเรียกไฟล์ PDF */}
          {/* 🟢 แก้ตรงนี้: เปลี่ยนพื้นหลังให้สว่างขึ้นเพื่อให้ PDF อ่านง่าย */}
          <div className="flex-1 bg-white dark:bg-gray-800">
            {/* 🟢 แก้ตรงนี้: 
                1. เอา opacity-80 ออก เพื่อให้สี PDF ชัด 100% 
                2. เพิ่ม &view=FitH ต่อท้าย URL เพื่อบังคับให้ PDF ขยายเต็มความกว้าง (อ่านง่ายขึ้นมาก) 
            */}
            <iframe
              src="/Manual1.pdf#toolbar=0&navpanes=0&view=FitH" 
              className="w-full h-full border-none rounded-b-[32px]"
              title="Manual PDF"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loginpic;