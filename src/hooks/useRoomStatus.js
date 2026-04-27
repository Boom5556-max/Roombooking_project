import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";

export const useRoomStatusLogic = (id) => {
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(null);
  const [roomDetail, setRoomDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchRoomStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // ยิง API ได้เลยไม่ต้องเช็ค Token 
      // (Backend ของน้องต้องเปิด Endpoint /bookings/:id และ /rooms/:id ให้เป็น Public ด้วยนะ)
      const [bookingRes, roomRes] = await Promise.all([
        api.get(`/bookings/${id}`),
        api.get(`/rooms/${id}`),
      ]);

      setRoomData(bookingRes.data);
      setRoomDetail(roomRes.data);
    } catch (err) {
      console.error("Fetch Error:", err);
      // ถ้า Error 401 หรือ 403 แสดงว่า Backend ยังไม่ยอมให้ Public เข้าถึง
      if (err.response?.status === 401) {
        setError("หน้านี้จำเป็นต้องเข้าสู่ระบบก่อนดูข้อมูล");
      } else {
        setError("สเเกนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchRoomStatus();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); 

    return () => clearInterval(timer);
  }, [fetchRoomStatus, id]);

  const isAvailable = useMemo(() => {
    if (!roomData?.schedule || roomData.schedule.length === 0) return true;

    const now = currentTime.getTime();
    const todayStr = new Date().toISOString().split('T')[0];

    const ongoingBooking = roomData.schedule.find((item) => {
      const startTimeStr = item.start_time.includes('T') ? item.start_time : `${todayStr}T${item.start_time}`;
      const endTimeStr = item.end_time.includes('T') ? item.end_time : `${todayStr}T${item.end_time}`;

      const start = new Date(startTimeStr).getTime();
      const end = new Date(endTimeStr).getTime();

      return !isNaN(start) && now >= start && now < end;
    });

    return !ongoingBooking;
  }, [roomData, currentTime]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return {
    roomData,
    roomDetail,
    isLoading,
    error,
    isAvailable,
    formatDate,
    navigate,
  };
};