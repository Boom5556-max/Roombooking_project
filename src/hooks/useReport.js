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

    try {
      const decoded = jwtDecode(token);
      const role = decoded?.role?.toLowerCase().trim();
      if (role !== "staff" && role !== "teacher") {
        return; // ไม่ใช่ staff หรือ teacher ไม่ต้องดึงข้อมูล
      }
    } catch (e) {
      console.error("Token parse error in useReport", e);
      return;
    }


    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/schedules/showReport");
      setReportData(response.data);
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
