import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { API_BASE_URL } from './config';

let isRefreshing = false;
let refreshPromise = null;

// ฟังก์ชันตรวจสอบและจัดการ Token แบบมี Grace Period (+1.5 ชม.)
export const verifyAndRefreshToken = async (forceRefresh = false) => {
  const token = localStorage.getItem('token');
  
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // วันตายที่แท้จริง = วันหมดอายุของ Access Token + Grace Period (1.5 ชม.)
    const GRACE_PERIOD_SECONDS = 1.5 * 60 * 60; 
    const hardExpiryTime = decoded.exp + GRACE_PERIOD_SECONDS;

    // 🚨 กรณีที่ 1: เลยช่วงอนุโลมไปแล้ว หรือโดนบังคับ Refresh แต่ Token ดิบก็พังเกินเยียวยา
    if (!forceRefresh && currentTime > hardExpiryTime) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false; 
    }

    // 🔄 เงื่อนไขที่ 2: Access Token หมดอายุแล้ว หรือ โดนบังคับให้ต้อง Refresh (จาก 401 Interceptor)
    // เพิ่ม Leeway 60 วินาที เพื่อกันปัญหาเวลาเครื่องผู้ใช้ช้า/เร็วไม่เท่ากับ Server
    if (forceRefresh || (currentTime + 60) > decoded.exp) {
      if (isRefreshing) return refreshPromise;
      
      isRefreshing = true;
      refreshPromise = new Promise(async (resolve) => {
        try {
          // ใช้ axios ปกติไปขอยื่นแทน ตัว api (กัน Circular Dependency)
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`, 
            {}, 
            { withCredentials: true }
          ); 
          
          const newToken = response.data.token || response.data.access_token;
          if (newToken) {
            localStorage.setItem('token', newToken);
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (refreshError) {
          resolve(false);
        } finally {
          isRefreshing = false;
        }
      });
      
      return refreshPromise;
    }

    // ✅ เงื่อนไขที่ 3: Access Token ยังสดใหม่
    return true; 

  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
};
