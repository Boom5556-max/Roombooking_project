import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; 
import { useAuth } from "../hooks/useAuth";
import LoginForm from "../components/auth/LoginForm";
import Loginpic from "../components/auth/Loginpic.jsx";

const Login = () => {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const { timer, isSent, isLoading, statusMsg, requestOTP, verifyOTP } = useAuth();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    const result = await verifyOTP(email, otp);

    if (result && result.success) {
      navigate("/dashboard"); 
    } else {
      setErrorMsg(result?.message || "รหัส OTP ไม่ถูกต้อง หรือหมดอายุ กรุณาลองใหม่อีกครั้ง");
    }
  };

return (
    // เพิ่ม h-auto เพื่อให้ scroll ได้ดีเวลาคีย์บอร์ดบัง
    <div className="min-h-[100dvh] flex flex-col lg:flex-row font-sans bg-[#FFFFFF] overflow-y-auto text-[#302782]">
      
      <Loginpic />

      {/* เพิ่ม md:flex-grow-0 เพื่อคุมความกว้างบนแท็บเล็ตไม่ให้กว้างเกินไป */}
      <div className="w-full lg:w-[45%] bg-[#FFFFFF] flex flex-col relative flex-grow md:justify-center">
        
        {/* Header ย่อขนาดลงบนแท็บเล็ต */}
        <div className="h-16 flex items-center px-6 md:px-10 flex-shrink-0">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 text-gray-400 hover:text-[#302782] transition-all font-bold text-sm group">
            <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-[#302782]/10 transition-all">
              <ArrowLeft size={18} />
            </div>
            <span>กลับไปหน้าสแกน</span>
          </button>
        </div>

        {/* ปรับ Padding ของหัวข้อให้สมดุลบน Tablet (md) และจอใหญ่ (lg/xl) */}
        <div className="px-8 md:px-16 lg:px-20 pt-4 pb-4 lg:pt-8 lg:pb-8 text-center mt-4">
          <h1 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-[#302782] tracking-tight">
            เข้าสู่<span className="text-[#B2BB1E]">ระบบ</span>
          </h1>
        </div>

        {/* ส่วน Form: ใช้ items-center และเปลี่ยนจาก justify-center เป็น flex-grow-0 บนจอใหญ่ */}
        <div className="flex-grow flex flex-col md:justify-center px-8 md:px-16 lg:px-20 pb-12">
          {/* ปรับ max-w เพื่อไม่ให้ฟอร์มกว้างเกินไปบนแท็บเล็ต */}
          <div className="max-w-md mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <LoginForm 
              email={email}
              setEmail={setEmail}
              otp={otp}
              setOtp={(value) => { setOtp(value); if (errorMsg) setErrorMsg(""); }}
              onSubmit={handleLoginSubmit}
              requestOTP={requestOTP}
              authData={{ timer, isSent, isLoading, statusMsg }}
              errorMsg={errorMsg}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;