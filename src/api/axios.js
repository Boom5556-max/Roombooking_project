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
// 1. Request Interceptor: แนบ Token ไปทุกครั้ง
// ==========================================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRedirecting = false;

// ==========================================
// 2. Response Interceptor: ดักจับ 401 และจัดการปัญหา
// ==========================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ถ้าพบ Error 401 (Unauthorized / Token มีปัญหา)
    if (error.response && error.response.status === 401) {
      
      // 🚨 กรณีที่ 1: โดนเตะออกเพราะล็อกอินซ้อน (โค้ดสุดเจ๋งของคุณพงศ์ภัค)
      if (error.response.data && error.response.data.code === 'SESSION_SUPERSEDED') {
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
      // ถ้ายังไม่เคยพยายามต่อเวลาเลย (ป้องกันการลูป)
      if (!originalRequest._retry) {
        originalRequest._retry = true; 

        try {
          // วิ่งไปขอ Access Token ดอกใหม่แบบเงียบๆ
          const res = await api.post('/refresh-token');
          const newAccessToken = res.data.accessToken;
          
          // อัปเดตกุญแจดอกใหม่ลง LocalStorage
          localStorage.setItem('token', newAccessToken);

          // เอากุญแจดอกใหม่ใส่กลับเข้าไปใน Request เดิม
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // ยิง Request เดิมที่เพิ่งพังไป ใหม่อีกรอบ!
          return api(originalRequest); 

        } catch (refreshError) {
          // ❌ กรณีที่ 3: ต่อเวลาไม่สำเร็จ (Refresh Token หมดอายุ 7 วัน หรือโดนแบน)
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