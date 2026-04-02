import { useState, useEffect } from "react";
import api from "../api/axios"; // Import ตัว instance ที่เราสร้างไว้

export const useAuth = () => {
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const requestOTP = async (email) => {
    if (!email) {
      setStatusMsg("กรุณากรอกอีเมล");
      return;
    }
    setIsLoading(true);
    setStatusMsg("กำลังส่งรหัส...");

    try {
      // Axios ไม่ต้องมี method: "POST" และไม่ต้อง JSON.stringify
      const res = await api.post("/auth/request-otp", { email });
      
      // Axios เก็บข้อมูลไว้ใน .data ทันที
      setIsSent(true);
      setTimer(60); // ปรับเป็น 60 วินาทีตามมาตรฐาน
      setStatusMsg("ส่งรหัสเรียบร้อยแล้ว");
    } catch (err) {
      // Axios จะโยน Error มาที่ catch เลยถ้า status ไม่ใช่ 2xx
      const message = err.response?.data?.message || "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้";
      setStatusMsg(`❌ ${message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  const verifyOTP = async (email, otp) => {
    setIsLoading(true);
    setStatusMsg("");

    try {
      const res = await api.post("/auth/verify-otp", {
        email: email.trim(),
        otp_code: otp.trim(),
      });

      const data = res.data; // ข้อมูลจาก Backend
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      return { success: true };
    } catch (err) {
      console.error("Verify Error:", err);
      const message = err.response?.data?.message || "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้";
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  return { timer, isSent, isLoading, statusMsg, setStatusMsg, requestOTP, verifyOTP };
};