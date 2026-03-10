import React from "react";
import { Mail, Lock, RefreshCw, Send, AlertCircle } from "lucide-react"; 
import InputField from "../common/InputField";
import Button from "../common/Button";

const LoginForm = ({ 
  email, 
  setEmail, 
  otp, 
  setOtp, 
  onSubmit, 
  requestOTP, 
  authData,
  errorMsg 
}) => {
  const { timer, isSent, isLoading, statusMsg } = authData;

  return (
    // เพิ่ม w-full เพื่อความแน่นอนใน Layout
    <div className="w-full mx-auto transition-all duration-300">
      
      {/* Message Status */}
      <div className={`min-h-[24px] mb-4 text-xs sm:text-sm font-bold transition-all duration-200 ${statusMsg && !errorMsg ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}>
        <p className={statusMsg?.includes("❌") ? "text-red-500" : "text-green-500"}>
          {statusMsg}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
        {/* Email Field - เพิ่ม inputMode และ autoComplete เพื่อช่วยคีย์บอร์ดมือถือ */}
        <InputField
          label="กรอกอีเมล์ ku เพื่อขอรหัส OTP"
          icon={Mail}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="student.n@ku.th"
        />

        {/* ปุ่มขอ OTP */}
        <Button
          type="button"
          onClick={() => requestOTP(email)}
          isLoading={isLoading}
          disabled={timer > 0 || isLoading}
          variant={timer > 0 ? "gray" : "secondary"}
          className="w-full py-3 sm:py-4 transition-all active:scale-[0.98]"
        >
          {!isLoading && (
            <div className="flex items-center justify-center gap-2">
              {isSent ? <RefreshCw size={18} className={timer > 0 ? "animate-spin" : ""} /> : <Send size={18} />}
              <span className="text-sm sm:text-base font-bold">
                {timer > 0 ? `ขอรหัสใหม่ใน (${timer}s)` : isSent ? "ส่งรหัสอีกครั้ง" : "ขอรหัส OTP"}
              </span>
            </div>
          )}
        </Button>

        {/* ส่วน Verification Code - เพิ่ม inputMode เป็น numeric เพื่อให้เด้งแป้นตัวเลข */}
        <div className="relative">
          <InputField
            label="กรอก OTP"
            icon={Lock}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // กันพิมพ์ตัวอักษรอื่น
            placeholder="000000"
            className={`text-center text-2xl sm:text-3xl tracking-[0.2em] sm:tracking-[0.3em] font-black transition-colors ${errorMsg ? 'text-red-500 border-red-500' : 'text-[#2D2D86]'}`}
          />
          
          {errorMsg && (
            <div className="flex items-center justify-center gap-1.5 text-red-500 mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle size={14} className="sm:w-[16px]" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wide">{errorMsg}</span>
            </div>
          )}
        </div>

        {/* ปุ่ม Submit */}
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={otp.length < 6 || isLoading}
          className="w-full mt-2 py-3 sm:py-4 text-lg sm:text-xl shadow-lg shadow-blue-900/10 active:scale-[0.98] transition-transform"
        >
          เข้าสู่ระบบ
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;