import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { formatCalendarEvents } from "../utils/calendarHelper.js";

export const useCalendarData = (roomIdFromUrl) => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(roomIdFromUrl || "");
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelMode, setIsCancelMode] = useState(false);

  const fetchRooms = async () => {
    try {
      const res = await api.get("/rooms/");
      if (res.data?.length > 0) {
        // เอาเฉพาะห้องที่ repair เป็น false หรือไม่ใช่ true
        const activeRooms = res.data.filter((room) => room.repair !== true);
        setRooms(activeRooms);
      }
    } catch (err) {
      console.error("Fetch Rooms Error:", err);
    }
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      let bookingUrl, scheduleUrl;
      if (selectedRoom && selectedRoom !== "") {
        bookingUrl = `/bookings/allBookingSpecific/${selectedRoom}?status=approved`;
        scheduleUrl = `/schedules/${selectedRoom}`;
      } else {
        bookingUrl = `/bookings/allBooking?status=approved`;
        scheduleUrl = `/schedules/`;
      }

      const [bookRes, schedRes] = await Promise.all([
        api.get(bookingUrl).catch(() => ({ data: [] })),
        api.get(scheduleUrl).catch(() => ({ data: { schedules: [] } })),
      ]);

      const rawSchedules = schedRes.data?.schedules || schedRes.data || [];

      // 🚩 1. ค้นหาชื่อห้องจาก state 'rooms' ที่ดึงมาตอนแรก
      const matchedRoom = rooms.find((r) => String(r.room_id) === String(selectedRoom));
      const defaultRoomName = matchedRoom ? matchedRoom.room_name : "";

      // 🚩 2. ส่ง selectedRoom (เลขห้อง) และ defaultRoomName (ชื่อห้อง) พ่วงเข้าไปด้วย
      const formatted = formatCalendarEvents(
        bookRes.data || [], 
        rawSchedules,
        selectedRoom,        // ส่งเลขห้องสำรองเข้าไป
        defaultRoomName      // ส่งชื่อห้องสำรองเข้าไป
      );
      
      setEvents(formatted);
    } catch (err) {
      console.error("Fetch Data Error:", err);
      setEvents([]);
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  }, [selectedRoom, rooms]); // 🚩 3. อย่าลืมเพิ่ม rooms เข้ามาใน Dependency ของ useCallback

  const updateStatus = async (id, isClosed) => {
    if (!id) {
      console.error("Update Error: Missing schedule ID");
      return { success: false };
    }

    try {
      console.log(`📡 Sending Update: ID=${id}, Status=${isClosed}`);

      const payload = { temporarily_closed: isClosed };
      const response = await api.patch(`/schedules/${id}/status`, payload);

      console.log("✅ API Response:", response.data);

      await fetchData();
      return { success: true };
    } catch (err) {
      console.error("❌ API Error Details:", err.response?.data || err.message);

      const isForbidden = err.response?.status === 403;
      const message = err.response?.data?.message || "เกิดข้อผิดพลาด";

      return { success: false, isForbidden, message };
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    rooms,
    selectedRoom,
    setSelectedRoom,
    events,
    isLoading,
    isCancelMode,
    setIsCancelMode,
    handleCancelSchedule: async (id) => await updateStatus(id, true),
    handleRestoreSchedule: async (id) => await updateStatus(id, false),
    refreshData: fetchData,
  };
};