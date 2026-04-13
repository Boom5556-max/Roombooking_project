import React, { useEffect, useState } from 'react'; // 🚩 เพิ่ม useEffect, useState
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

// 🎨 Theme Controller: คอยจัดการสีของหน้าเว็บ (เวอร์ชันจำสีตลอดเวลา)
const ThemeController = () => {
  const location = useLocation();

  useEffect(() => {
    // ❌ ไม่ต้องเช็ค Token แล้ว
    const savedTheme = localStorage.getItem("theme") || "light"; 

    // ✅ เช็คแค่ว่าเคยตั้งสีอะไรไว้ ก็ใช้สีนั้นเลยไม่ว่าจะอยู่หน้าไหน
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [location.pathname]); 

  return null; 
};

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

// 🟢 2. ด่านตรวจสำหรับ "คนที่ยังไม่ได้ Login เท่านั้น"
const GuestRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      {/* 🚩 ThemeController ทำงานเบื้องหลัง */}
      <ThemeController />
      
      <Routes>
        <Route path="/" element={
          <GuestRoute><QrFirstpage /></GuestRoute>
        } />
        <Route path="/login" element={
          <GuestRoute><LoginPage /></GuestRoute>
        } />
        
        <Route path="/room-status/:id" element={<RoomStatus />} />

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