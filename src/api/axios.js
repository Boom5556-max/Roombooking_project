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

/**
 * ฟังก์ชันสำหรับตั้งค่าสถานะการ Redirect/Logout (ใช้ป้องกัน Alert ซ้อน)
 */
export const setIsApiRedirecting = (val) => {
  isRedirecting = val;
};

// ตรวจสอบว่า Path ปัจจุบันเป็นหน้าสาธารณะ (Public Page) หรือไม่
const checkIsPublicPath = () => {
  const path = window.location.pathname;
  return path === "/" || path === "/login" || path.startsWith("/room-status/");
};


// ==========================================
// 1. Request Interceptor: แนบ Token ไปทุกครั้ง
// ==========================================
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token");

  // ไม่ทำ proactive check ตอนกำลัง Auth, Logout และทำเฉพาะ "คนที่มี Token (ล็อกอินแล้ว)" เท่านั้น
  if (token && 
      !config.url.includes('/refresh-token') && 
      !config.url.includes('/login') && 
      !config.url.includes('/otp') &&
      !config.url.includes('/logout')
  ) {
    const isValid = await verifyAndRefreshToken(); // วิ่งไปเช็ค ถ้าหมดก็นำไปต่ออายุแล้วกลับมาทำ Request ต่อ
    
    // ถ้าระบบบอกว่าตายสนิท หรือต่ออายุไม่สำเร็จ ให้หยุดยิง API เส้นนี้ทันที
    if (!isValid) {
      const isPublic = checkIsPublicPath();
      
      if (!isRedirecting && !isPublic) {
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

      // ถ้าเป็นหน้าสาธารณะ ให้เคลียร์ Token เงียบๆ ไม่ต้องแสดง Popup
      if (isPublic) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
      
      // 🚨 กรณีที่ 1: โดนเตะออกเพราะล็อกอินซ้อน (SESSION_SUPERSEDED) - ห้าม Retry!
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
            customClass: { backdrop: 'swal-backdrop-blur', popup: 'rounded-3xl', confirmButton: 'rounded-lg' }
          }).then(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = '/login';
          });
        }
        return Promise.reject(error);
      }

      // 🔄 กรณีที่ 2: Access Token พังหรือหมดอายุระหว่างการใช้งาน (ลอง Refresh และ Retry)
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          console.log('พบ 401 - กำลังลองขอ Token ใหม่และRetry...');
          const isRefreshed = await verifyAndRefreshToken(true);
          
          if (isRefreshed) {
            const newToken = localStorage.getItem('token');
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            console.log('Refresh สำเร็จ - กำลังส่งคำขอเดิมซ้ำ (Retry)');
            return api(originalRequest); // ยิงใหม่!
          }
        } catch (refreshErr) {
          console.error('Refresh & Retry Error:', refreshErr);
        }
      }

      // 🚨 ถ้ามาถึงตรงนี้แสดงว่า Refresh ไม่ผ่าน หรือ Retry แล้วก็ยัง 401 อยู่ (ล้มเหลวโดยสิ้นเชิง)
      // ยกเว้น: ถ้าเป็น path /logout หรือกำลัง Redirect หรืออยู่หน้าสาธารณะ ไม่ต้องโชว์ Alert
      const isPublic = checkIsPublicPath();
      if (!isRedirecting && !originalRequest.url?.includes('/logout') && !isPublic) {
        isRedirecting = true;
        
        Swal.fire({
          icon: 'info',
          title: 'เซสชันหมดอายุ',
          text: 'กรุณาเข้าสู่ระบบใหม่อีกครั้งเพื่อความปลอดภัย',
          confirmButtonText: 'เข้าสู่ระบบ',
          confirmButtonColor: '#302782',
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: { backdrop: 'swal-backdrop-blur', popup: 'rounded-3xl', confirmButton: 'rounded-lg' }
        }).then(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = '/login';
        });
      } else if (isPublic) {
        // ถ้าเป็นหน้าสาธารณะ เคลียร์ Token เงียบๆ
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      return Promise.reject(error);
    }

    // ถ้าเป็น Error อื่นๆ ที่ไม่ใช่ 401 ก็โยนกลับไปตามปกติ
    return Promise.reject(error);
  }
);

export default api;