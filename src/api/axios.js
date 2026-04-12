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
// ตัวแปรกันแจ้งเตือนซ้ำ (ป้องกัน SweetAlert popup ซ้อนกัน)
// ==========================================
let isRedirecting = false;

// ==========================================
// ฟังก์ชัน: ล้างข้อมูลผู้ใช้และเด้งไปหน้า Login
// ==========================================
const forceLogout = (title, text, icon = 'info') => {
  if (isRedirecting) return; // ถ้ากำลังเด้งอยู่แล้ว ไม่ต้องทำซ้ำ
  isRedirecting = true;

  // ล้างข้อมูลทั้งหมดออกจาก localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // แสดง SweetAlert แจ้งเตือน แล้วเด้งไปหน้า Login
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
//    ดักจับ 401 → ล้างข้อมูล → เตะกลับหน้า Login ทันที
//    ไม่มีการต่ออายุ Token (No Silent Refresh)
// ==========================================
api.interceptors.response.use(
  (response) => response, // ✅ ถ้าสำเร็จ ปล่อยผ่านตามปกติ
  (error) => {

    // ถ้าพบ Error 401 (Unauthorized / Token หมดอายุ)
    if (error.response && error.response.status === 401) {

      // 🚨 กรณีที่ 1: โดนเตะออกเพราะล็อกอินซ้อน (SESSION_SUPERSEDED)
      if (error.response.data && error.response.data.code === 'SESSION_SUPERSEDED') {
        forceLogout(
          'ถูกออกจากระบบ',
          'บัญชีของคุณถูกเข้าสู่ระบบจากอุปกรณ์อื่น คุณได้ถูกออกจากระบบ',
          'warning'
        );
        return Promise.reject(error);
      }

      // 🔒 กรณีที่ 2: Token หมดอายุ หรือไม่มี Token
      //    → ล้างข้อมูลและเด้งกลับหน้า Login ทันที (ไม่ต่ออายุ)
      forceLogout(
        'เซสชันหมดอายุ',
        'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
      );
      return Promise.reject(error);
    }

    // ถ้าเป็น Error อื่นๆ ที่ไม่ใช่ 401 ก็โยนกลับไปตามปกติ
    return Promise.reject(error);
  }
);

export default api;