import React from "react";

const GuideItem = ({ num, text, color = "bg-[#B2BB1E]" }) => (
  <div className="flex gap-3 text-xs sm:text-sm text-black dark:text-white font-medium items-start">
    <span className={`flex-none w-5 h-5 ${color} text-white text-[10px] font-bold rounded-full flex items-center justify-center mt-0.5`}>
      {num}
    </span>
    <p className="leading-relaxed">{text}</p>
  </div>
);

const DashboardFooter = () => (
  <footer className="mt-8 sm:mt-12 mb-24 md:mb-8 px-4 w-full max-w-7xl mx-auto">
    <div className="bg-white dark:bg-gray-800 rounded-[24px] sm:rounded-[30px] p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
      <h2 className="text-lg font-bold mb-6 text-[#302782] dark:text-white">ระเบียบการให้บริการ</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div className="space-y-4">
          <GuideItem num="01" text={<>ให้บริการ <span className="text-[#B2BB1E] font-bold">จันทร์ – ศุกร์ (08.30 - 16.30 น.)</span></>} />
          <GuideItem num="02" text={<>ทำรายการล่วงหน้าอย่างน้อย <span className="text-[#B2BB1E] font-bold underline">3 วันทำการ</span></>} />
        </div>
        <div className="space-y-4 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-12">
          <GuideItem num="03" text="ยกเลิกการจองล่วงหน้าอย่างน้อย 1 วัน" />
          <GuideItem num="04" text="สำหรับอาจารย์และเจ้าหน้าที่ คณะวิทยาศาสตร์ ศรีราชา" />
        </div>
      </div>
    </div>
    
  </footer>
);

export default DashboardFooter;