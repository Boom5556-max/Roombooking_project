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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      // 1. ถอดรหัส Token
      const decoded = jwtDecode(token);
      setUser({
        name: decoded.name || decoded.username || "User",
        role: decoded.role ? decoded.role.toLowerCase() : "student",
      });

      // 2. ฟังก์ชันดึงข้อมูลแบบ Axios
      const fetchData = async () => {
        setIsLoading(true);
        const currentRole = decoded.role ? decoded.role.toLowerCase().trim() : "student";
        
        try {
          if (currentRole === "staff") {
            // ดึงข้อมูลภาพรวมทั้งระบบ (เฉพาะ Staff)
            const [roomRes, pendingRes, approvedRes] = await Promise.all([
              api.get("/rooms"),
              api.get("/bookings/pending"),
              api.get("/bookings/approved"),
            ]);

            const getCount = (res) => {
              const result = res.data;
              return Array.isArray(result) ? result.length : result.data?.length || 0;
            };

            setData({
              roomCount: getCount(roomRes),
              pendingCount: getCount(pendingRes),
              approvedCount: getCount(approvedRes),
            });
          } else {
            // ดึงข้อมูลเฉพาะของตัวเอง (Teacher/Student)
            const [roomRes, activeRes] = await Promise.all([
              api.get("/rooms"),
              api.get("/bookings/my-bookings/active"),
            ]);

            const active = activeRes.data || [];
            
            setData({
              roomCount: roomRes.data?.length || 0,
              pendingCount: active.filter(i => i.status === 'pending').length,
              approvedCount: active.filter(i => i.status === 'approved').length,
            });
          }
        } catch (err) {
          if (err.response?.status !== 401 && err.response?.status !== 403) {
            console.error("Dashboard Fetch Error:", err);
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    } catch (err) {
      console.error("Token/Logic Error:", err);
      setIsLoading(false);
    }
  }, []);

  return { ...data, ...user, isLoading };
};