import React from "react";
import mascot from "../../assets/image/mascot.png";

/**
 * LoadingSpinner — ใช้รูปมาสคอต SCI KU หมุนแทน spinner ทุกที่ในแอป
 * Props:
 *  - text: ข้อความใต้รูป (ไม่ใส่ = ไม่แสดง)
 *  - fullPage: true = ครอบทั้งหน้าจอ (flex center)
 */
const LoadingSpinner = ({ text = "กำลังโหลด...", fullPage = false }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-5">
      <img
        src={mascot}
        alt="loading"
        className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain drop-shadow-lg"
        style={{ animation: "mascot-spin 1.2s linear infinite" }}
      />
      {text && (
        <p className="text-sm sm:text-base font-medium text-gray-400 dark:text-gray-500">
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;

