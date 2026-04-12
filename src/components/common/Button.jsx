import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  onClick, 
  type = "button", 
  variant = "primary", 
  size = "md", 
  isLoading = false, 
  disabled = false, 
  className = "", 
  ...props 
}) => {

  // 1. Base Styles: เพิ่มการป้องกันการเลือกข้อความ (select-none) 
  // และเพิ่ม active:scale เพื่อให้ผู้ใช้ Mobile รู้สึกว่าปุ่มถูกกดจริง
  const baseStyles = "relative flex items-center justify-center gap-2 transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden font-sans font-bold select-none hover:-translate-y-px active:translate-y-0 active:scale-[0.98]";

  // 2. Variants: คุมโทนสีตาม Brand Identity
  const variants = {
    // ปุ่มเขียว (KU Green)
    primary: "bg-[#B2BB1E] text-[#FFFFFF] shadow-[0_8px_20px_-8px_rgba(178,187,30,0.5)] hover:shadow-[0_12px_24px_-10px_rgba(178,187,30,0.6)]",
    
    // ปุ่มน้ำเงิน (Deep Navy)
    secondary: "bg-[#302782] text-[#FFFFFF] shadow-[0_8px_20px_-8px_rgba(48,39,130,0.4)] hover:shadow-[0_12px_24px_-10px_rgba(48,39,130,0.5)]",
    
    // ปุ่มอันตราย (KU Red)
    danger: "bg-[#EF4444] text-[#FFFFFF] shadow-[0_8px_20px_-8px_rgba(239,68,68,0.4)] hover:bg-[#DC2626] hover:text-[#FFFFFF] hover:shadow-[0_12px_24px_-10px_rgba(239,68,68,0.5)]",
    
    // ปุ่มขอบขาว (เดิมคือ danger)
    dangerOutline: "bg-[#FFFFFF] dark:bg-gray-700 text-black dark:text-white border border-gray-200 dark:border-gray-600 shadow-sm hover:border-[#302782] hover:text-[#302782] dark:hover:text-white",
    
    // ปุ่มพื้นเทาอ่อน
    dangerLight: "bg-gray-50 dark:bg-gray-700 text-black dark:text-white border border-transparent hover:bg-gray-100 dark:hover:bg-gray-600",
    
    // ปุ่ม Ghost (มักใช้กับปุ่มปิดหรือเมนูย่อย)
    ghost: "bg-transparent hover:bg-gray-50 text-black dark:text-white hover:text-[#302782]",
    
    // ปุ่มสถานะ Disable/Wait
    gray: "bg-gray-100 text-black dark:text-white cursor-not-allowed"
  };

  // 3. Sizes: ปรับขนาดให้เป็น Adaptive 
  // บนจอมือถือปุ่มจะเล็กลงเล็กน้อยแต่ยังกดง่าย (Touch target อย่างน้อย 44px)
  const sizes = {
    sm: "px-4 py-2 sm:px-5 sm:py-2.5 rounded-[12px] sm:rounded-[14px] text-xs sm:text-sm",
    md: "px-5 py-3 sm:px-6 sm:py-4 rounded-[14px] sm:rounded-[16px] text-sm sm:text-base",
    lg: "px-6 py-4 sm:px-8 sm:py-5 rounded-[16px] sm:rounded-[20px] text-base sm:text-lg",
    icon: "p-2.5 sm:p-3 rounded-full flex items-center justify-center aspect-square min-w-[40px] min-h-[40px]", 
    none: "" 
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {/* Loading Overlay: เพื่อไม่ให้ขนาดปุ่มขยับตอน Loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit">
          <Loader2 className="animate-spin" size={size === 'icon' ? 18 : 22} />
        </div>
      )}

      {/* Content Layer: ซ่อนเนื้อหาเมื่อ Loading แต่ยังรักษารูปทรงปุ่มไว้ */}
      <div className={`flex items-center justify-center gap-2 transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </div>
    </button>
  );
};

export default Button;