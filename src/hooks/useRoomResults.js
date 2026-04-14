import { useState, useEffect } from 'react';
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export const useRoomResults = (searchQuery) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [purpose, setPurpose] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState(""); // 🌟 เพิ่ม State สำหรับหมายเหตุ
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmBooking = async () => {
    // เช็คค่าว่างเบื้องต้น
    if (!purpose.trim()) {
      return { success: false, message: "กรุณาระบุวัตถุประสงค์" };
    }

    try {
      setIsSubmitting(true);
      
      const user = JSON.parse(localStorage.getItem("user")); 
      const role = user?.role;

      let endpoint = "";
      if (role === 'teacher') {
        endpoint = "/bookings/teacher";
      } else if (role === 'staff' || role === 'admin') { // รองรับ admin
        endpoint = "/bookings/staff";
      } else if (role === 'student') { 
        endpoint = "/bookings/student";
      } else {
        throw new Error("คุณไม่มีสิทธิ์ในการจองห้อง");
      }

      const bookingData = {
        room_id: selectedRoom.room_id,
        date: searchQuery.date,
        start_time: searchQuery.start_time,
        end_time: searchQuery.end_time,
        purpose: purpose,
        additional_notes: additionalNotes // 🌟 ส่งหมายเหตุเพิ่มเติมไปยัง Backend
      };

      // ยิง API
      await axios.post(endpoint, bookingData);

      return { success: true };

    } catch (err) {
      console.error(err);
      return { 
        success: false, 
        message: err.response?.data?.message || "ไม่สามารถจองได้" 
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchRooms = async () => {
      if (!searchQuery || !searchQuery.date) { setLoading(false); return; }
      try {
        setLoading(true);
        const response = await axios.post('/rooms/search', searchQuery);
        setRooms(response.data.available_rooms || []);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลห้องว่างได้");
      } finally { setLoading(false); }
    };
    fetchRooms();
  }, [searchQuery]);

  return { 
    rooms, loading, error, 
    selectedRoom, setSelectedRoom, 
    purpose, setPurpose, 
    additionalNotes, setAdditionalNotes, // 🌟 ส่งออกไปให้ UI ใช้งาน
    isSubmitting, handleConfirmBooking 
  };
};