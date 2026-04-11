import { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";

export const useManageBooking = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [historyRequests, setHistoryRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const role = decoded?.role?.toLowerCase().trim() || "teacher";
      setUserRole(role);

      if (role === "staff") {
        const [pRes, aRes, rRes] = await Promise.all([
          api.get("/bookings/pending"),
          api.get("/bookings/approved"),
          api.get("/bookings/rejected")
        ]);
        console.log(rRes)
        setPendingRequests(pRes.data || []);
        setApprovedRequests(aRes.data || []);
        setHistoryRequests(rRes.data || []);
      } else {
        const [activeRes, historyRes] = await Promise.all([
          api.get("/bookings/my-bookings/active"),
          api.get("/bookings/my-bookings/history")
        ]);
        const active = activeRes.data || [];
        setPendingRequests(active.filter(i => i.status === 'pending'));
        setApprovedRequests(active.filter(i => i.status === 'approved'));
        setHistoryRequests(historyRes.data || []);
      }
    } catch (error) {
      console.error("❌ Fetch Error:", error.response?.status);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✨ แก้ไข: รับพารามิเตอร์ reason เข้ามาและส่งไปให้ Backend (cancel_reason)
  const handleUpdateStatus = async (bookingId, status, reason = "") => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { 
        status, 
        cancel_reason: reason // ส่งไปเผื่อกรณีที่ status เป็น 'rejected'
      });
      fetchBookings(); 
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "อัปเดตไม่สำเร็จ" };
    }
  };

  const handleUpdateBooking = async (bookingId, updatedData) => {
    try {
      const fixedData = { ...updatedData };

      const formatLocalDate = (dateString) => {
        if (!dateString) return dateString;
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString; 

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; 
      };

      if (fixedData.booking_date) {
        fixedData.booking_date = formatLocalDate(fixedData.booking_date);
      }
      if (fixedData.date) {
        fixedData.date = formatLocalDate(fixedData.date);
      }

      await api.put(`/bookings/${bookingId}`, fixedData);
      fetchBookings(); 
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "แก้ไขไม่สำเร็จ" };
    }
  };

  const handleCancelBooking = async (bookingId, reason = "") => {
    try {
      const response = await api.put(`/bookings/${bookingId}/cancel`, { cancel_reason: reason });
      fetchBookings(); 
      return { success: true, message: response.data.message }; 
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "ยกเลิกไม่สำเร็จ" };
    }
  };

  const getFullName = (req) => {
    if (!req) return "ไม่ระบุชื่อ";
    return `${req.teacher_name || req.name || ''} ${req.teacher_surname || req.surname || ''}`.trim() || "ไม่ระบุชื่อ";
  };

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  return {
    pendingRequests, approvedRequests, historyRequests,
    userRole, selectedBooking, setSelectedBooking, isLoading,
    handleUpdateStatus, handleUpdateBooking, handleCancelBooking, getFullName,
    refreshData: fetchBookings 
  };
};