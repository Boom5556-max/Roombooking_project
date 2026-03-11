// src/api/axios.js
import axios from "axios";
import { API_BASE_URL } from "./config";
import Swal from "sweetalert2";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// เพิ่ม Interceptor เพื่อใส่ Token ทุกครั้งที่ยิง
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// เพิ่ม Response Interceptor ตรวจสอบ SESSION_SUPERSEDED
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (error.response.data && error.response.data.code === 'SESSION_SUPERSEDED') {
        // ล้างข้อมูลออกจาก LocalStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // แจ้งเตือนผู้ใช้แล้ว Redirect ไปหน้า Login
        Swal.fire({
          icon: 'warning',
          title: 'ถูกออกจากระบบ',
          text: 'บัญชีของคุณถูกเข้าสู่ระบบจากอุปกรณ์อื่น คุณได้ถูกออกจากระบบ',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#302782',
        }).then(() => {
          window.location.href = '/login';
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;