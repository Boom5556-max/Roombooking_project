import React from "react";

const InputField = ({ label, icon: Icon, error, ...props }) => {
  return (
    <div className="flex flex-col gap-2 font-sans w-full group">
      {/* Label: ปรับให้ดูสะอาดตาขึ้น */}
      {label && (
        <label className="text-xs font-medium text-black dark:text-white ml-1 flex items-center gap-2">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {/* Icon: ย้ายเข้ามาด้านใน Input เพื่อความ Modern */}
        {Icon && (
          <div
            className={`absolute left-5 transition-colors duration-300 ${error ? "text-red-400" : "text-black dark:text-white group-focus-within:text-[#B2BB1E]"}`}
          >
            <Icon size={20} strokeWidth={2.5} />
          </div>
        )}

        <input
          {...props}
          className={`
          w-full bg-white dark:bg-gray-700 text-[#302782] dark:text-white text-sm sm:text-base md:text-lg 
          font-bold rounded-[16px] sm:rounded-[20px] 
          py-4 sm:py-5 min-h-[56px] /* เพิ่ม min-h เพื่อความชัวร์บน Tablet */
          outline-none transition-all duration-300
          placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:font-medium
          border-2 scroll-margin-top-[120px] /* เพิ่มส่วนนี้เพื่อช่วยเรื่องคีย์บอร์ดบัง */
          ${Icon ? "pl-14 pr-6" : "px-6"}
          ${
          error
          ? "border-red-100 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
          : "border-gray-100 dark:border-gray-600 focus:border-[#B2BB1E] focus:ring-4 focus:ring-[#B2BB1E]/10 focus:bg-white dark:focus:bg-gray-600"
          }
          ${props.disabled ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-60" : ""}
          ${props.className || ""}`}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs sm:text-xs font-bold text-red-500 ml-2 animate-in fade-in slide-in-from-left-2">
          * {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
