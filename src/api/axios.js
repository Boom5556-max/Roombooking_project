import axios from "axios";
import { API_BASE_URL } from "./config";
import Swal from "sweetalert2";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  withCredentials: true // 🚨 จำเป็นมากสำหรับให้อ่าน Refresh Token ใน Cookie ได้
});

// ==========================================
// ตัวแปรสำหรับระบบคิว (กันยิง Refresh Token ซ้ำซ้อน)
// ==========================================
let isRedirecting = false;
let isRefreshing = false; // ตัวล็อก: บอกว่ากำลังไปขอกุญแจใหม่ขลุกขลักอยู่หรือเปล่า
let failedQueue = []; // คิว: เก็บ API เส้นอื่นๆ ที่รอเอากุญแจใหม่ไปใช้

// ฟังก์ชันสำหรับปล่อยคิว: ถ้าได้ token ใหม่ก็ให้ยิงต่อ ถ้าไม่ได้ก็ให้ยกเลิก
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ==========================================
// 1. Request Interceptor: แนบ Token ไปทุกครั้ง
// ==========================================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==========================================
// 2. Response Interceptor: ดักจับ 401 และจัดการปัญหา
// ==========================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🚨 1. ป้องกัน Loop: ถ้าเส้นที่พังคือเส้น refresh-token เอง ให้ยอมแพ้ ห้ามวนลูป!
    if (originalRequest.url.includes('/refresh-token')) {
      return Promise.reject(error);
    }

    // ถ้าพบ Error 401 (Unauthorized / Token มีปัญหา)
    if (error.response && error.response.status === 401) {
      
      // 🚨 กรณีที่ 1: โดนเตะออกเพราะล็อกอินซ้อน (SESSION_SUPERSEDED)
      if (error.response.data && error.response.data.code === 'SESSION_SUPERSEDED') {
        
        // ถ้าคิวอื่นรออยู่ ให้บอกว่าพังแล้ว ไม่ต้องรอ
        processQueue(error, null); 

        if (!isRedirecting) {
          isRedirecting = true;
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          Swal.fire({
            icon: 'warning',
            title: 'ถูกออกจากระบบ',
            text: 'บัญชีของคุณถูกเข้าสู่ระบบจากอุปกรณ์อื่น คุณได้ถูกออกจากระบบ',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#302782',
            customClass: {
              popup: 'rounded-3xl',
              confirmButton: 'rounded-lg'
            },
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then(() => {
            window.location.href = '/login';
          });
        }
        return Promise.reject(error);
      }

      // 🔄 กรณีที่ 2: Access Token หมดอายุธรรมดา (Silent Refresh)
      if (!originalRequest._retry) {
        
        // 🛑 ถ้าระบบ "กำลังขอ" Token ใหม่อยู่ (มีคนไปขอแล้ว) -> ให้เส้นนี้เข้าคิวรอ
        if (isRefreshing) {
          return new Promise(function(resolve, reject) {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            // พอได้กุญแจใหม่ปุ๊บ ก็เอามาสวมให้ API เส้นนี้ แล้วยิงออกไป
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        // 🟢 ถ้ายังไม่มีใครไปขอ Token -> ให้เส้นนี้เป็นตัวแทนไปขอ (ล็อกประตู)
        originalRequest._retry = true; 
        isRefreshing = true;

        try {
          // วิ่งไปขอ Access Token ดอกใหม่แบบเงียบๆ
          const res = await api.post('/auth/refresh-token');
          const newAccessToken = res.data.token;
          
          // อัปเดตกุญแจดอกใหม่ลง LocalStorage
          localStorage.setItem('token', newAccessToken);

          // เอากุญแจดอกใหม่ใส่กลับเข้าไปใน Request ของตัวมันเอง
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // 🔓 ปลดล็อกประตู และปลุก API เส้นอื่นๆ ที่รอในคิวให้ทำงานต่อ
          processQueue(null, newAccessToken);
          isRefreshing = false;

          // ยิง Request เดิมที่เพิ่งพังไป ใหม่อีกรอบ!
          return api(originalRequest); 

        } catch (refreshError) {
          // ❌ กรณีที่ 3: ต่อเวลาไม่สำเร็จ (Refresh Token หมดอายุ 7 วัน หรือโดนแบน)
          
          // สั่งให้คิวที่รออยู่พังไปด้วย จะได้ไม่ค้าง
          processQueue(refreshError, null);
          isRefreshing = false;

          if (!isRedirecting) {
            isRedirecting = true;
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            
            // แจ้งเตือนเนียนๆ ก่อนเด้งไปหน้า Login
            Swal.fire({
              icon: 'info',
              title: 'เซสชันหมดอายุ',
              text: 'กรุณาเข้าสู่ระบบใหม่อีกครั้งเพื่อความปลอดภัย',
              confirmButtonText: 'เข้าสู่ระบบ',
              confirmButtonColor: '#302782',
            }).then(() => {
              window.location.href = '/login';
            });
          }
          return Promise.reject(refreshError);
        }
      }
    }

    // ถ้าเป็น Error อื่นๆ ที่ไม่ใช่ 401 ก็โยนกลับไปตามปกติ
    return Promise.reject(error);
  }
);

export default api;