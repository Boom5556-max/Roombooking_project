import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { data } from "react-router-dom";

export const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. ดึงข้อมูลห้องทั้งหมด
  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/rooms/");
      setRooms(response.data);
      console.log(response)
    } catch (error) {
      console.error(
        "Error fetching rooms:",
        error.response?.data || error.message,
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. เพิ่มห้องใหม่ (POST /rooms)
  // แก้ไขบรรทัดที่ 20
  const addRoom = async (roomId, roomData) => {
    // รับ roomId มาด้วย (แม้ไม่ได้ใช้ใน URL แต่ต้องรับเพื่อให้ลำดับ parameter ตรงกัน)
    try {
      // ส่ง roomData ไปที่ Backend
      await api.post("/rooms/", roomData);
      await fetchRooms();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "เพิ่มห้องไม่สำเร็จ",
      };
    }
  };

  // 3. แก้ไขห้อง (PUT /rooms/:room_id/edit)
  const updateRoom = async (roomId, roomData) => {
    try {
      // ส่งค่า is_active ไปด้วยเสมอตามที่นายกำมับไว้ใน Backend
      const response = await api.put(`/rooms/${roomId}/edit`, {
        ...roomData,
        is_active: roomData.is_active ?? true,
      });
      await fetchRooms();
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "แก้ไขไม่สำเร็จ",
      };
    }
  };

  // 4. ลบห้องแบบ Soft Delete (DELETE /rooms/:room_id/delete)
  const deleteRoom = async (roomId) => {
  try {
    // 1. เปลี่ยนจาก api.delete เป็น api.patch
    // 2. ใช้ URL ให้ตรงกับที่ตั้งไว้ใน router คือ /rooms/:id/delete
    const response = await api.patch(`/rooms/${roomId}/delete`); 
    
    await fetchRooms();
    return { success: true, message: response.data.message };
  } catch (error) {
    console.error("Delete error:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || "ลบไม่สำเร็จ" 
    };
  }
};

  // 5. ดึง QR Code ของห้อง (GET /rooms/:id/qrcode)
  const getRoomQRCode = async (roomId) => {
    try {
      const response = await api.get(`/rooms/${roomId}/qrcode`);
      return response.data.qr_code; // คืนค่าเป็น base64 string
    } catch (error) {
      console.error("QR Code error:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return {
    rooms,
    isLoading,
    fetchRooms,
    addRoom,
    updateRoom,
    deleteRoom,
    getRoomQRCode,
  };
};
