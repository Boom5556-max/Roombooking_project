import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { API_BASE_URL } from './config';

let isRefreshing = false;
let refreshPromise = null;

// ફังก์ชันตรวจสอบและจัดการ Token แบบมี Grace Period (+1.5 ชม.)
export const verifyAndRefreshToken = async () => {
  const token = localStorage.getItem('token');
  
  // 1. ถ้าไม่มี Token เตะกลับเลย
  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // เวลาปัจจุบัน (หน่วย: วินาที)
    
    // คำนวณช่วงเวลาอนุโลม (ปรับเป็น 120 วิ ตามที่กำลังทดสอบอยู่, ถ้าจะแก้กลับเป็น 1.5 ชม ให้แก้ตรงนี้)
    const GRACE_PERIOD_SECONDS = 1.5 * 60 * 60; 
    
    // วันตายที่แท้จริง = วันหมดอายุของ Access Token + Grace Period
    const hardExpiryTime = decoded.exp + GRACE_PERIOD_SECONDS;

    // 🚨 เงื่อนไขที่ 1: เลยช่วงอนุโลมไปแล้ว (เช่น ทิ้งไว้ข้ามคืน)
    if (currentTime > hardExpiryTime) {
      console.log('เลยเวลาอนุโลมไปแล้ว - เตรียมเตะออก');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false; 
    }

    // 🔄 เงื่อนไขที่ 2: Access Token หมดอายุแล้ว แต่ยังอยู่ในช่วงอนุโลม
    if (currentTime > decoded.exp) {
      console.log('Access Token หมดอายุ แต่ยังอยู่ในช่วงอนุโลม -> ลองขอใหม่');
      
      // ถ้าระบบกำลังขอ Token ใหม่อยู่ ให้ API อื่นๆ มารอ Promise แกนกลางอันนี้
      if (isRefreshing) {
        return refreshPromise;
      }
      
      isRefreshing = true;
      refreshPromise = new Promise(async (resolve) => {
        try {
          // ใช้ axios ปกติไปขอยื่นแทน ตัว api (กัน Circular Dependency)
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`, 
            {}, 
            { withCredentials: true }
          ); 
          
          // ถ้าสำเร็จ เอาของใหม่ทับของเก่า แล้วให้ผ่าน
          localStorage.setItem('token', response.data.token || response.data.access_token);
          resolve(true); 
        } catch (refreshError) {
          // ถ้าขอใหม่ไม่ผ่าน
          console.error('ไม่สามารถต่ออายุ Token ได้ - เตรียมเตะออก');
          resolve(false);
        } finally {
          isRefreshing = false;
        }
      });
      
      return refreshPromise;
    }

    // ✅ เงื่อนไขที่ 3: Access Token ยังสดใหม่ (ไม่หมดอายุ)
    return true; 

  } catch (error) {
    // กรณีที่ Token พังหรือถอดรหัสไม่ได้
    console.error('Token ไม่ถูกต้อง');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
};
