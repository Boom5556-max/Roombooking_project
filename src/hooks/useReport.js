import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";

export const useReport = () => {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    // ตรวจสอบ Role ก่อนดึงข้อมูล (เพราะ API อนุญาตแค่ staff, teacher)
    const token = localStorage.getItem("token");
    if (!token) return;

    let userRole = "";
    try {
      const decoded = jwtDecode(token);
      userRole = decoded?.role?.toLowerCase().trim();
      if (userRole !== "staff" && userRole !== "teacher") {
        return; // ไม่ใช่ staff หรือ teacher ไม่ต้องดึงข้อมูล
      }
    } catch (e) {
      console.error("Token parse error in useReport", e);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // 1. ดึงข้อมูลเทอมปัจจุบันเพื่อเอา start_date, end_date
      const termRes = await api.get("/terms/showTerm");
      const termData = termRes.data?.data;
      
      let queryParams = "";
      
      if (termData && termData.length > 0) {
        // เรียงลำดับจากอดีต -> อนาคต
        const sortedTerms = termData.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let currentTermIndex = -1;
        
        // หา "เทอมปัจจุบัน"
        for (let i = sortedTerms.length - 1; i >= 0; i--) {
          const termDate = new Date(sortedTerms[i].start_date);
          if (termDate <= today) {
            currentTermIndex = i;
            break;
          }
        }
        
        if (currentTermIndex === -1) {
          currentTermIndex = 0;
        }
        
        const currentTerm = sortedTerms[currentTermIndex];
        const startDate = currentTerm.start_date;
        const endDate = currentTerm.end_date || ''; 
        
        // แนบ params ถ้ามีครบ
        if (startDate && endDate) {
          queryParams = `?startDate=${startDate}&endDate=${endDate}`;
        }
      }

      // ดึงรายงานโดยส่ง startDate, endDate ไปถ้ามี
      if (userRole === "staff") {
        const response = await api.get(`/schedules/showReportForStaff${queryParams}`);
        setReportData(response.data);
      } else if (userRole === "teacher") {
        const response = await api.get(`/schedules/showReport${queryParams}`);
        setReportData(response.data);
      }
    } catch (err) {
      console.error("Error fetching report:", err.response?.data || err.message);
      setError(err.response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { reportData, isLoading, error, fetchReport };
};
