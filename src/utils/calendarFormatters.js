import { useState, useEffect } from "react";
import { API_BASE_URL } from "../api/config.js";
import api from "../api/axios.js";

export const useCalendarData = (roomIdFromUrl) => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงรายชื่อห้อง
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get("/rooms/");
        const data = res.data;
        if (data?.length > 0) {
          setRooms(data);
          setSelectedRoom(roomIdFromUrl || data[0].room_id);
        }
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    fetchRooms();
  }, [roomIdFromUrl]);

  // ดึงข้อมูลตารางและคำขอจอง
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!selectedRoom || !token) return;

      try {
        const [bookRes, schedRes] = await Promise.all([
          api.get(`/bookings/allBooking/${selectedRoom}?status=approved`),
          api.get(`/schedule/${selectedRoom}`)
        ]);

        const bookingData = bookRes.data || [];
        const scheduleData = schedRes.data || { schedules: [] };

        // Formatting Logic ... (ยกมาจากโค้ดเดิมของนาย)
        const formattedEvents = [
            ...bookingData.map(b => ({ /* format booking */ })),
            ...(scheduleData.schedules || []).map(s => ({ /* format schedule */ }))
        ];
        setEvents(formattedEvents);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [selectedRoom]);

  return { rooms, selectedRoom, setSelectedRoom, events, isLoading };
};