import axios from "axios";
import { API_BASE_URL } from "./config";
import Swal from "sweetalert2";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  withCredentials: true,
});

// ==========================================
// ตัวแปรจัดการการ Refresh Token
// ==========================================
let isRefreshing = false;         // กำลังขอ Token ใหม่อยู่หรือเปล่า
let failedQueue = [];             // คิวเก็บ Request ที่ค้างระหว่างรอ Token ใหม่
let isRedirecting = false;        // ป้องกัน SweetAlert popup ซ้อนกัน

// ฟังก์ชัน: ปล่อย Request ที่ค้างอยู่ในคิวทั้งหมด
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ==========================================
// ฟังก์ชัน: ล้างข้อมูลผู้ใช้และเด้งไปหน้า Login
// ==========================================
const forceLogout = (title, text, icon = 'info') => {
  if (isRedirecting) return;
  isRedirecting = true;

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  Swal.fire({
    icon,
    title,
    text,
    confirmButtonText: 'เข้าสู่ระบบ',
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
// 2. Response Interceptor (Global Error Handler)
//    ดักจับ 401 → พยายาม Silent Refresh ก่อน
//    ถ้า Refresh ไม่สำเร็จ → เตะกลับหน้า Login
// ==========================================
api.interceptors.response.use(
  (response) => response, // ✅ ถ้าสำเร็จ ปล่อยผ่านตามปกติ
  async (error) => {
    const originalRequest = error.config;

    // ถ้าไม่ใช่ 401 → โยนกลับไปตามปกติ
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // 🚨 กรณีพิเศษ: โดนเตะเพราะล็อกอินซ้อน (SESSION_SUPERSEDED)
    //    → ไม่ต้อง Refresh, เตะออกเลย
    if (error.response.data && error.response.data.code === 'SESSION_SUPERSEDED') {
      forceLogout(
        'ถูกออกจากระบบ',
        'บัญชีของคุณถูกเข้าสู่ระบบจากอุปกรณ์อื่น คุณได้ถูกออกจากระบบ',
        'warning'
      );
      return Promise.reject(error);
    }

    // ป้องกันไม่ให้ Request เดิมถูก Retry ซ้ำมากกว่า 1 ครั้ง
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // ------------------------------------------
    // 🔄 Silent Refresh Logic
    // ------------------------------------------

    // ถ้ากำลัง Refresh อยู่ ให้ Request นี้เข้าคิวรอก่อน
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // เริ่มกระบวนการ Refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // ยิง API ขอ Access Token ใหม่
      // Refresh Token ถูกส่งไปอัตโนมัติผ่าน HttpOnly Cookie (withCredentials: true)
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newToken = data.accessToken || data.token;

      if (!newToken) {
        throw new Error("No token in refresh response");
      }

      // เซฟ Access Token ตัวใหม่ทับตัวเก่า
      localStorage.setItem("token", newToken);

      // อัปเดต Header ของ api instance ด้วย
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

      // ปล่อย Request ที่ค้างอยู่ในคิวทั้งหมด
      processQueue(null, newToken);

      // ยิง Request ตัวเดิมที่ค้างไว้อีกรอบ ด้วย Token ใหม่
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);

    } catch (refreshError) {
      // ❌ Refresh ไม่สำเร็จ (Refresh Token หมดอายุด้วย)
      //    → ล้างข้อมูลและเตะกลับหน้า Login
      processQueue(refreshError, null);
      forceLogout(
        'เซสชันหมดอายุ',
        'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
      );
      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

export default api;