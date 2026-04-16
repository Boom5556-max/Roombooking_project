import api from "./axios";
import { minsToTime, timeToMins } from "../utils/timeUtils";

/**
 * ดึงข้อมูลการตั้งค่าเงื่อนไขการจองล่าสุด
 * แปลงค่า TIME จาก Backend เป็น minutes (Number) เพื่อใช้คำนวณใน Frontend
 */
export const getBookingScope = async () => {
  try {
    const response = await api.get("/bookings/scope");
    const data = response.data;

    if (data.success && data.data) {
      // Normalize: แปลง "HH:mm" เป็น minutes
      const raw = data.data;
      data.data = {
        ...raw,
        opening_mins: typeof raw.opening_mins === "string" ? timeToMins(raw.opening_mins) : raw.opening_mins,
        closing_mins: typeof raw.closing_mins === "string" ? timeToMins(raw.closing_mins) : raw.closing_mins,
      };
    }
    
    return data;
  } catch (error) {
    console.error("Get Booking Scope Error:", error);
    throw error;
  }
};

/**
 * บันทึกหรืออัปเดตการตั้งค่าเงื่อนไขการจอง
 * แปลง minutes (Number) เป็น "HH:mm" (String) เพื่อส่งให้ Backend (DB TYPE: TIME)
 */
export const updateBookingScope = async (data) => {
  try {
    // Clone และแปลงค่าเป็น String ก่อนส่ง
    const payload = {
      ...data,
      opening_mins: typeof data.opening_mins === "number" ? minsToTime(data.opening_mins) : data.opening_mins,
      closing_mins: typeof data.closing_mins === "number" ? minsToTime(data.closing_mins) : data.closing_mins,
    };

    const response = await api.put("/bookings/scope", payload);
    return response.data;
  } catch (error) {
    console.error("Update Booking Scope Error:", error);
    throw error;
  }
};
