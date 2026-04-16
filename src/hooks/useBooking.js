import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";
import { getBookingScope } from "../api/bookingScope";

export const useBookingLogic = (initialId) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [isRoomBusy, setIsRoomBusy] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [scope, setScope] = useState({
    opening_mins: 480,
    closing_mins: 1200,
    max_advance_days: 10,
    min_advance_hours: 1
  });

  const [formData, setFormData] = useState({
    room_id: initialId || "",
    date: "",
    start_time: "",
    end_time: "",
    purpose: "",
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get("/rooms/");
        const allRooms = Array.isArray(res.data) ? res.data : [];

        // ✅ กรองเฉพาะห้องที่ไม่ได้อยู่ในสถานะซ่อม (repair !== true)
        const availableRooms = allRooms.filter((room) => room.repair !== true);

        setRooms(availableRooms);
      } catch (err) {
        console.error("Fetch rooms error:", err);
      }
    };
    fetchRooms();

    const fetchScope = async () => {
      try {
        const result = await getBookingScope();
        if (result.success && result.data) {
          setScope(result.data);
        }
      } catch (err) {
        console.error("Fetch scope error:", err);
      }
    };
    fetchScope();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. ตรวจสอบเวลาเบื้องต้น
    if (formData.start_time >= formData.end_time) {
      setServerMessage("❌ เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม");
      setIsRoomBusy(false); // ไม่ใช่เคสห้องไม่ว่าง แต่เป็นกรอกข้อมูลผิด
      setShowStatus(true);
      return;
    }

    setIsLoading(true);
    setShowStatus(false);

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const userRole = decoded?.role?.toLowerCase().trim() || "student";

      let endpoint = "/bookings";
      if (userRole === "teacher") endpoint += "/teacher";
      if (userRole === "staff") endpoint += "/staff";

      const response = await api.post(endpoint, formData);

      // --- กรณีสำเร็จ ---
      setIsRoomBusy(false);
      setServerMessage(
        userRole === "staff" ? "✅ จองสำเร็จแล้ว" : "✅ ส่งคำขอจองสำเร็จแล้ว",
      );
      setShowStatus(true);

      // ล้างข้อมูลฟอร์มแต่เก็บ room_id ไว้
      setFormData({
        room_id: formData.room_id,
        date: "",
        start_time: "",
        end_time: "",
        purpose: "",
      });

      setTimeout(() => setShowStatus(false), 4000);
    } catch (error) {
      // --- กรณีเกิด Error ---
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message;

      if (status === 409) {
        // 🚩 เคสเดียวที่จะให้ขึ้นสถานะ "ไม่ว่าง" (การ์ดสีเทา)
        setIsRoomBusy(true);
        setServerMessage(errorMessage || "ห้องไม่ว่างในช่วงเวลานี้");
      } else if (status === 400) {
        // เคสข้อมูลผิดพลาด (เช่น จองวันย้อนหลัง)
        setIsRoomBusy(false);
        setServerMessage(`❌ ${errorMessage || "ข้อมูลไม่ถูกต้อง"}`);
      } else {
        // เคสอื่นๆ เช่น CORS พัง, เน็ตหลุด, Server ดับ
        setIsRoomBusy(false);
        setServerMessage(
          error.response
            ? `❌ ${errorMessage}`
            : "❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (Network Error)",
        );
      }

      setShowStatus(true);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    rooms,
    formData,
    setFormData,
    handleSubmit,
    isLoading,
    showStatus,
    isRoomBusy,
    serverMessage,
    setShowStatus,
    scope,
  };
};
