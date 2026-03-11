import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios"; // ใช้ axios instance ที่เราเซ็ตไว้

export const useDashboard = () => {
  const [data, setData] = useState({
    roomCount: 0,
    pendingCount: 0,
    approvedCount: 0,
  });
  const [user, setUser] = useState({ name: "", role: "student" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // 1. ถอดรหัส Token
      const decoded = jwtDecode(token);
      setUser({
        name: decoded.name || decoded.username || "User",
        role: decoded.role ? decoded.role.toLowerCase() : "student",
      });

      // 2. ฟังก์ชันดึงข้อมูลแบบ Axios
      const fetchData = async () => {
        try {
          // ใช้ Promise.all ยิงพร้อมกัน 3 API เพื่อความเร็ว
          const [roomRes, pendingRes, approvedRes] = await Promise.all([
            api.get("/rooms"),
            api.get("/bookings/pending"),
            api.get("/bookings/approved"),
          ]);

          // Helper ในการนับจำนวน (Axios จะเก็บข้อมูลไว้ใน res.data)
          const getCount = (res) => {
            const result = res.data;
            return Array.isArray(result) ? result.length : result.data?.length || 0;
          };

          setData({
            roomCount: getCount(roomRes),
            pendingCount: getCount(pendingRes),
            approvedCount: getCount(approvedRes),
          });
        } catch (err) {
          console.error("Dashboard Fetch Error:", err);
          // จัดการกรณี Token หมดอายุ (401)
          if (err.response?.status === 401) {
            // ปล่อยให้ axios interceptor จัดการแจ้งเตือนและ redirect ถ้าเป็น SESSION_SUPERSEDED
            if (err.response?.data?.code !== 'SESSION_SUPERSEDED') {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }
          }
        }
      };

      fetchData();
    } catch (err) {
      console.error("Token/Logic Error:", err);
    }
  }, []);

  return { ...data, ...user };
};