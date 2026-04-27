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

      // ดึงข้อมูลทั้ง 3 เส้น: การจองผ่านระบบ, ตารางเรียน, รายละเอียดห้อง
      const [bookingRes, scheduleRes, roomRes] = await Promise.all([
        api.get(`/bookings/${id}`),
        api.get(`/schedules/${id}`).catch(() => ({ data: { schedules: [] } })),
        api.get(`/rooms/${id}`),
      ]);

      const bookingData = bookingRes.data;
      const rawSchedules = scheduleRes.data?.schedules || scheduleRes.data || [];

      // กรองเฉพาะ schedule ของวันนี้ และแปลงให้อยู่ในรูปแบบเดียวกับ booking
      const todayStr = new Date().toISOString().split("T")[0];
      const todaySchedules = (Array.isArray(rawSchedules) ? rawSchedules : [])
        .filter((s) => {
          // กรองเฉพาะตารางเรียนที่ไม่ได้ถูกงดใช้ห้อง
          if (s.temporarily_closed === true || s.temporarily_closed === 1 || s.temporarily_closed === "1") {
            return false;
          }
          const dateSource = s.date || s.schedule_date;
          if (!dateSource) return false;
          const d = new Date(dateSource);
          const schedDate = !isNaN(d.getTime())
            ? d.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" })
            : String(dateSource).split("T")[0];
          return schedDate === todayStr;
        })
        .map((s) => {
          // สร้างชื่อเต็มจาก teacher_name + teacher_surname (field จริงจาก API)
          const teacherFullName = (s.teacher_name && s.teacher_surname)
            ? `${s.teacher_name} ${s.teacher_surname}`
            : s.teacher_name || s.full_name || "ตารางเรียน";

          return {
            booking_id: `schedule-${s.schedule_id}`,
            start_time: s.start_time,
            end_time: s.end_time,
            full_name: teacherFullName,
            first_name: s.teacher_name || "",
            last_name: s.teacher_surname || "",
            student_count: s.student_count || null,
            purpose: s.subject_name
              ? `${s.course_code ? s.course_code + " " : ""}${s.subject_name}`
              : "ตารางเรียน",
            type: "schedule",
          };
        });

      // รวม booking + schedule เข้าด้วยกัน
      const mergedSchedule = [
        ...(bookingData?.schedule || []).map((b) => ({ ...b, type: "booking" })),
        ...todaySchedules,
      ];

      // เรียงตามเวลาเริ่มต้น
      mergedSchedule.sort((a, b) => {
        const timeA = a.start_time || "";
        const timeB = b.start_time || "";
        return timeA.localeCompare(timeB);
      });

      setRoomData({
        ...bookingData,
        schedule: mergedSchedule,
      });
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