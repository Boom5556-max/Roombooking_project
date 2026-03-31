import React from "react";

export const FormField = ({ 
  label, 
  children, 
  error, 
  required = false, 
  description,
  className = "" 
}) => {
  return (
    <div className={`flex flex-col gap-1.5 sm:gap-2 font-sans w-full ${className}`}>
      {/* Label Section */}
      <div className="flex items-center justify-between px-1">
        <label className="text-[13px] sm:text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500 font-black text-lg leading-none">*</span>}
        </label>
        
        {/* Optional Description (Small hint) */}
        {description && !error && (
          <span className="text-[10px] sm:text-xs text-gray-400 font-medium">
            {description}
          </span>
        )}
      </div>

      {/* Input / Children Area */}
      <div className="relative group">
        {children}
      </div>

      {/* Error Message: แสดงผลแบบ Smooth */}
      {error && (
        <p className="text-xs sm:text-xs font-bold text-red-500 ml-1 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
};

export default FormField;