import React, { useEffect, useState } from 'react'; // 🚩 เพิ่ม useEffect, useState
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { verifyAndRefreshToken } from './api/auth';

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
import TermManagement from './pages/TermManagement';

// 🔴 1. ด่านตรวจสำหรับ "คนที่ต้อง Login แล้วเท่านั้น"
const ProtectedRoute = ({ children }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const result = await verifyAndRefreshToken();
      setIsValid(result);
      setIsVerifying(false);
      
      if (!result && window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.replace("/");
      }
    };
    
    checkToken();

    // 🚩 ตัวดักจับ Bfcache: ป้องกัน Browser เอาหน้าเก่าจากหน่วยความจำมาแสดงตอนกดย้อนกลับ
    const handleVisibilityChange = () => {
      if (!localStorage.getItem("token") && window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.replace("/");
      }
    };
    
    window.addEventListener("focus", handleVisibilityChange);
    window.addEventListener("pageshow", handleVisibilityChange); 
    
    return () => {
      window.removeEventListener("focus", handleVisibilityChange);
      window.removeEventListener("pageshow", handleVisibilityChange);
    };
  }, []);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
         <div className="text-[#302782] dark:text-[#B2BB1E] animate-spin">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
         </div>
      </div>
    ); 
  }

  if (!isValid) {
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
        <Route path="/term-management" element={<ProtectedRoute><TermManagement /></ProtectedRoute>} />
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