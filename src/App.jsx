import React, { useEffect } from 'react'; // 🚩 เพิ่ม useEffect
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';

import QrFirstpage from './pages/QrFirstpage'; 
import QRScanner from './pages/QRScanner';     

import ManageBooking from './pages/ManageBooking';
import RoomStatus from './pages/RoomStatus';
import Calendar from './pages/Calendar';
import RoomDetail from './pages/RoomDetail';
import BookingRoom from './pages/Booking';
import RoomResults from './pages/RoomResults'; 
import Users from './pages/Users'; 

import ScheduleManagement from './pages/ScheduleManagement'; 
import ExportLog from './pages/ExportLog';

// 🔴 1. ด่านตรวจสำหรับ "คนที่ต้อง Login แล้วเท่านั้น"
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // 🚩 ตัวดักจับ Bfcache: ป้องกัน Browser เอาหน้าเก่าจากหน่วยความจำมาแสดงตอนกดย้อนกลับ
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!localStorage.getItem("token")) {
        window.location.replace("/"); // ถ้าไม่มี Token ให้รีเฟรชเตะออกทันที
      }
    };
    window.addEventListener("focus", handleVisibilityChange);
    window.addEventListener("pageshow", handleVisibilityChange); 
    
    return () => {
      window.removeEventListener("focus", handleVisibilityChange);
      window.removeEventListener("pageshow", handleVisibilityChange);
    };
  }, []);

  if (!token) {
    return <Navigate to="/" replace />; 
  }
  return children;
};

// 🟢 2. ด่านตรวจสำหรับ "คนที่ยังไม่ได้ Login เท่านั้น" (เพิ่มเข้ามาใหม่ 🚩)
const GuestRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (token) {
    // ถ้ามี Token อยู่แล้ว แปลว่าล็อกอินแล้ว ให้เตะกลับไปหน้า dashboard ทันที ไม่ให้เห็นหน้า Login
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🟢 หน้า Public ใช้ <GuestRoute> ครอบ เพื่อไม่ให้คนล็อกอินแล้วย้อนกลับมาได้ */}
        <Route path="/" element={
          <GuestRoute><QrFirstpage /></GuestRoute>
        } />
        <Route path="/login" element={
          <GuestRoute><LoginPage /></GuestRoute>
        } />
        
        {/* หน้า Status หลังสแกน QR (เข้าได้ทุกคน) */}
        <Route path="/room-status/:id" element={<RoomStatus />} />

        {/* 🔴 หน้า Private (ต้อง Login และมี Token เท่านั้นถึงจะเข้าได้) */}
        <Route path="/scanner" element={<ProtectedRoute><QRScanner /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
        <Route path="/room-results" element={<ProtectedRoute><RoomResults /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/schedules" element={<ProtectedRoute><ScheduleManagement /></ProtectedRoute>} />
        <Route path="/export-log" element={<ProtectedRoute><ExportLog /></ProtectedRoute>} />
        <Route path="/bookingRoom/:id" element={<ProtectedRoute><BookingRoom /></ProtectedRoute>} />
        <Route path="/calendar/" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/calendar/:id" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/manage-booking" element={<ProtectedRoute><ManageBooking /></ProtectedRoute>} />
        <Route path="/room-detail/:id" element={<ProtectedRoute><RoomDetail /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;