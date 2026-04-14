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
      const statusParams = "?status=approved,cancel,cancelled";

      if (selectedRoom && selectedRoom !== "") {
        bookingUrl = `/bookings/allBookingSpecific/${selectedRoom}${statusParams}`; 
        scheduleUrl = `/schedules/${selectedRoom}`;
      } else {
        bookingUrl = `/bookings/allBooking${statusParams}`; 
        scheduleUrl = `/schedules/`;
      }
      
      const [bookRes, schedRes] = await Promise.all([
        api.get(bookingUrl).catch(() => ({ data: [] })),
        api.get(scheduleUrl).catch(() => ({ data: { schedules: [] } })),
      ]);

      const rawSchedules = schedRes.data?.schedules || schedRes.data || [];
      const matchedRoom = rooms.find((r) => String(r.room_id) === String(selectedRoom));
      const defaultRoomName = matchedRoom ? matchedRoom.room_name : "";

      const formatted = formatCalendarEvents(
        bookRes.data || [], 
        rawSchedules,
        selectedRoom,        
        defaultRoomName      
      );
      
      setEvents(formatted);
    } catch (err) {
      console.error("Fetch Data Error:", err);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRoom, rooms]);

  // ✨ เพิ่ม parameter reason รับค่าเหตุผลการงดใช้ห้อง
  const updateStatus = async (id, isClosed, reason = "") => {
    if (!id) {
      console.error("Update Error: Missing schedule ID");
      return { success: false };
    }

    try {
      // ✨ แนบ closed_reason ไปใน Payload เพื่อส่งให้ Backend
      const payload = { temporarily_closed: isClosed, closed_reason: reason };
      const response = await api.patch(`/schedules/${id}/status`, payload);
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
    // ✨ อัปเดตให้ handleCancelSchedule รับค่า reason ด้วย
    handleCancelSchedule: async (id, reason) => await updateStatus(id, true, reason),
    handleRestoreSchedule: async (id) => await updateStatus(id, false),
    refreshData: fetchData,
  };
};