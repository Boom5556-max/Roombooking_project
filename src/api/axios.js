import axios from "axios";
import { API_BASE_URL } from "./config";
import Swal from "sweetalert2";
import { verifyAndRefreshToken } from "./auth";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  withCredentials: true // 🚨 จำเป็นมากสำหรับให้อ่าน Refresh Token ใน Cookie ได้
});

let isRedirecting = false;

// ==========================================
// 1. Request Interceptor: แนบ Token ไปทุกครั้ง
// ==========================================
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token");

  // ไม่ทำ proactive check ตอนกำลัง Auth และทำเฉพาะ "คนที่มี Token (ล็อกอินแล้ว)" เท่านั้น
  if (token && !config.url.includes('/refresh-token') && !config.url.includes('/login') && !config.url.includes('/otp')) {
    const isValid = await verifyAndRefreshToken(); // วิ่งไปเช็ค ถ้าหมดก็นำไปต่ออายุแล้วกลับมาทำ Request ต่อ
    
    // ถ้าระบบบอกว่าตายสนิท หรือต่ออายุไม่สำเร็จ ให้หยุดยิง API เส้นนี้ทันที
    if (!isValid) {
      if (!isRedirecting) {
        isRedirecting = true;
        Swal.fire({
          icon: 'info',
          title: 'เซสชันหมดอายุ',
          text: 'กรุณาเข้าสู่ระบบใหม่อีกครั้งเพื่อความปลอดภัย',
          confirmButtonText: 'เข้าสู่ระบบ',
          confirmButtonColor: '#302782',
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: {
            backdrop: 'swal-backdrop-blur',
            popup: 'rounded-3xl',
            confirmButton: 'rounded-lg'
          }
        }).then(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        });
      }
      return Promise.reject(new axios.Cancel('Session Expired: Token is physically dead or refresh failed.'));
    }
  }

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
    // ถ้าเป็นการกดยกเลิก API (Cancel) หรือ Error ที่ไม่มี config ส่งมา ให้ปล่อยผ่านไปเลยจะได้ไม่พัง
    if (axios.isCancel(error) || !error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // 🚨 1. ป้องกัน Loop: ถ้าเส้นที่พังคือเส้น refresh-token เอง ให้ยอมแพ้ ห้ามวนลูป!
    if (originalRequest.url && originalRequest.url.includes('/refresh-token')) {
      return Promise.reject(error);
    }

    // ถ้าพบ Error 401 (Unauthorized / Token มีปัญหา)
    if (error.response && error.response.status === 401) {
      
      // 🚨 กรณีที่ 1: โดนเตะออกเพราะล็อกอินซ้อน (SESSION_SUPERSEDED)
      if (error.response.data && error.response.data.code === 'SESSION_SUPERSEDED') {
        if (!isRedirecting) {
          isRedirecting = true;

          Swal.fire({
            icon: 'warning',
            title: 'ถูกออกจากระบบ',
            text: 'บัญชีของคุณถูกเข้าสู่ระบบจากอุปกรณ์อื่น คุณได้ถูกออกจากระบบ',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#302782',
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: {
              backdrop: 'swal-backdrop-blur',
              popup: 'rounded-3xl',
              confirmButton: 'rounded-lg'
            }
          }).then(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = '/login';
          });
        }
        return Promise.reject(error);
      }

      // 🔄 กรณีที่ 2: Access Token พังหรือหมดอายุระหว่างการใช้งาน
      // หน้าบ้านจัดการตรวจสอบ token ใหม่ให้แล้วก่อนจะเปลี่ยนหน้าจอ 
      // แต่ถ้าระหว่างที่กำลังค้างอยู่หน้านั้นนานๆ แล้ว API หายไป จะตกลงมาตรงนี้ เราจึงทำการเตะออก
      if (!isRedirecting) {
        isRedirecting = true;
        
        Swal.fire({
          icon: 'info',
          title: 'เซสชันหมดอายุ',
          text: 'กรุณาเข้าสู่ระบบใหม่อีกครั้งเพื่อความปลอดภัย',
          confirmButtonText: 'เข้าสู่ระบบ',
          confirmButtonColor: '#302782',
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: {
            backdrop: 'swal-backdrop-blur',
            popup: 'rounded-3xl',
            confirmButton: 'rounded-lg'
          }
        }).then(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = '/login';
        });
      }
      return Promise.reject(error);
    }

    // ถ้าเป็น Error อื่นๆ ที่ไม่ใช่ 401 ก็โยนกลับไปตามปกติ
    return Promise.reject(error);
  }
);

export default api;