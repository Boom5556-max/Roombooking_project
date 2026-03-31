import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// 1. 🚩 เพิ่ม FileText เข้ามาสำหรับใช้เป็นไอคอนจัดการตารางเรียน
import { Home, Calendar as CalendarIcon, Bell, QrCode, LogOut, Users, FileText, Download, MoreHorizontal } from 'lucide-react';
import { jwtDecode } from "jwt-decode";
import ActionModal from "../common/ActionModal";
import ProfileDropdown from "./ProfileDropdown";

import logo from "../../assets/image/sci ku src.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState("");
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false, title: "", icon: null, onConfirm: null, showConfirm: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded?.role?.toLowerCase().trim() || "");
      } catch (err) {
        console.error("Token Decode Error in Navbar:", err);
      }
    }
  }, []);

  const showAlert = (title, icon, onConfirm = null, showConfirm = true) => {
    setAlertConfig({
      isOpen: true, title, icon, showConfirm,
      onConfirm: onConfirm || (() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))),
    });
  };

  const handleLogoutClick = () => {
    showAlert(
      "คุณแน่ใจหรือไม่ที่จะออกจากระบบ?",
      <LogOut size={50} className="text-red-500" />,
      () => {
        // 1. บังคับเปลี่ยนค่าใน localStorage กลับเป็นโหมดสว่าง
        localStorage.setItem('theme', 'light');
        
        // 2. ลบคลาส dark ออกจากหน้าเว็บทันที
        document.documentElement.classList.remove('dark');
        
        // 3. ลบ Token ออกจากระบบ
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // 4. กลับไปหน้า Login
        window.location.replace("/");
      }
    );
  };

  const getNavStyle = (path) => {
    const active = location.pathname === path;
    return {
      // ปรับขนาดไอคอนให้ใหญ่ขึ้นเล็กน้อยบนมือถือเพื่อให้กดง่าย (Touch Target)
      container: `relative flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 transition-all duration-300 ${
        active ? "text-[#B2BB1E]" : "text-[#FFFFFF]/60 hover:text-[#FFFFFF]"
      }`,
      indicator: `absolute -bottom-1 sm:bottom-0 w-5 h-1 bg-[#B2BB1E] rounded-full transition-all duration-300 ${
        active ? "opacity-100 scale-100" : "opacity-0 scale-0"
      }`
    };
  };

  return (
    <>
      {/* --- Desktop & Tablet Header --- */}
      <nav className="bg-[#302782] dark:bg-gray-950 w-full px-4 sm:px-8 py-3 flex justify-between items-center shadow-[0_4px_20px_rgba(0,0,0,0.15)] sticky top-0 z-[1000] border-b border-[#FFFFFF]/5 backdrop-blur-md font-sans flex-none">
        
        {/* Logo Section - ปรับมาใช้รูปภาพและชื่อคณะภาษาไทย (ขนาดใหญ่ขึ้น) */}
        <div
          className="flex items-center gap-4 cursor-pointer group"
          onClick={() => navigate("/dashboard")}
        >
          <div className="bg-white p-1.5 rounded-xl shadow-sm">
            <img 
              src={logo} 
              alt="SCI KU SRC" 
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>
          <div className="flex flex-col justify-center border-l border-white/20 pl-4">
            <h1 className="text-[#FFFFFF] text-sm sm:text-base font-black leading-tight">
              คณะวิทยาศาสตร์
            </h1>
            <p className="text-[#FFFFFF]/90 text-xs sm:text-sm font-bold leading-tight">
              ศรีราชา
            </p>
          </div>
        </div>

        {/* Menu Section - Desktop (md ขึ้นไปจะแสดงแบบเดิม) */}
        <div className="hidden md:flex gap-2 lg:gap-4 items-center">
          <NavItemsGroup navigate={navigate} getNavStyle={getNavStyle} userRole={userRole} />
          
          <div className="ml-2 flex items-center gap-2">
            <ProfileDropdown isMobile={false} />
            <div className="pl-4 border-l border-[#FFFFFF]/10 flex items-center">
              <button
                onClick={handleLogoutClick}
                className="w-10 h-10 flex items-center justify-center text-[#FFFFFF]/40 hover:text-red-400 transition-colors rounded-xl hover:bg-red-400/10"
                title="ออกจากระบบ"
              >
                <LogOut size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Logout สำหรับมือถือ (แสดงเฉพาะปุ่ม Logout ด้านบนขวา) */}
        <div className="md:hidden flex items-center gap-2">
            <ProfileDropdown isMobile={true} />
            <button
              onClick={handleLogoutClick}
              className="w-10 h-10 flex items-center justify-center text-[#FFFFFF]/60"
            >
              <LogOut size={22} />
            </button>
        </div>
      </nav>

      {/* --- Mobile Bottom Navigation (แสดงเฉพาะหน้าจอเล็ก < 768px) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#302782]/95 dark:bg-gray-950/95 backdrop-blur-lg border-t border-white/10 z-[1001] px-2 pb-safe">
        <div className="flex justify-around items-center h-16">
          <NavItem 
            onClick={() => { navigate("/dashboard"); setIsMoreMenuOpen(false); }} 
            style={getNavStyle("/dashboard")} 
            icon={<Home size={24} />} 
            title="หน้าหลัก" 
          />
          <NavItem 
            onClick={() => { navigate("/notification"); setIsMoreMenuOpen(false); }} 
            style={getNavStyle("/notification")} 
            icon={<Bell size={24} />} 
            title="แจ้งเตือน" 
          />
          <NavItem 
            onClick={() => { navigate("/scanner"); setIsMoreMenuOpen(false); }} 
            style={getNavStyle("/scanner")} 
            icon={<QrCode size={24} />} 
            title="สแกน" 
          />
          <button 
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`relative flex flex-col items-center justify-center w-12 h-12 transition-all duration-300 ${
              isMoreMenuOpen ? "text-[#B2BB1E]" : "text-[#FFFFFF]/60"
            }`}
          >
            <MoreHorizontal size={24} />
            {isMoreMenuOpen && <div className="absolute -bottom-1 w-5 h-1 bg-[#B2BB1E] rounded-full" />}
          </button>
        </div>
      </div>

      {/* --- Mobile 'More' Menu Popup --- */}
      {isMoreMenuOpen && (
        <>
          <div 
            className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-[1000]" 
            onClick={() => setIsMoreMenuOpen(false)}
          />
          <div className="md:hidden fixed bottom-20 right-4 bg-[#302782]/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 min-w-[180px] shadow-2xl z-[1001] animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="flex flex-col gap-1">
              <MobileMoreMenuItem 
                onClick={() => { navigate("/calendar"); setIsMoreMenuOpen(false); }}
                icon={<CalendarIcon size={20} />}
                title="ตารางรายเดือน"
                isActive={location.pathname === "/calendar"}
              />
              {userRole === "staff" && (
                <>
                  <MobileMoreMenuItem 
                    onClick={() => { navigate("/users"); setIsMoreMenuOpen(false); }}
                    icon={<Users size={20} />}
                    title="จัดการสมาชิก"
                    isActive={location.pathname === "/users"}
                  />
                  <MobileMoreMenuItem 
                    onClick={() => { navigate("/schedules"); setIsMoreMenuOpen(false); }}
                    icon={<FileText size={20} />}
                    title="จัดการตาราง"
                    isActive={location.pathname === "/schedules"}
                  />
                  <MobileMoreMenuItem 
                    onClick={() => { navigate("/export-log"); setIsMoreMenuOpen(false); }}
                    icon={<Download size={20} />}
                    title="ดาวน์โหลด Log"
                    isActive={location.pathname === "/export-log"}
                  />
                </>
              )}
            </div>
          </div>
        </>
      )}

      {alertConfig.isOpen && (
        <ActionModal
          icon={alertConfig.icon}
          title={alertConfig.title}
          showConfirm={alertConfig.showConfirm}
          onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={alertConfig.onConfirm}
        />
      )}
    </>
  );
};

// แยกกลุ่มเมนูออกมาเพื่อให้เรียกใช้ได้ทั้งบนและล่าง
const NavItemsGroup = ({ navigate, getNavStyle, userRole, isMobile = false }) => (
  <>
    <NavItem 
      onClick={() => navigate("/dashboard")} 
      style={getNavStyle("/dashboard")} 
      icon={<Home size={isMobile ? 24 : 22} />} 
      title="หน้าหลัก" 
    />
    <NavItem 
      onClick={() => navigate("/calendar")} 
      style={getNavStyle("/calendar")} 
      icon={<CalendarIcon size={isMobile ? 24 : 22} />} 
      title="ตาราง" 
    />
    
    {/* 2. 🚩 ส่วนนี้จะถูกเรนเดอร์เฉพาะเมื่อ userRole เป็น staff */}
    {userRole === "staff" && (
      <>
        <NavItem 
          onClick={() => navigate("/users")} 
          style={getNavStyle("/users")} 
          icon={<Users size={isMobile ? 24 : 22} />} 
          title="สมาชิก" 
        />
        {/* เมนูจัดการตารางเรียน (เพิ่มใหม่) */}
        <NavItem 
          onClick={() => navigate("/schedules")} 
          style={getNavStyle("/schedules")} 
          icon={<FileText size={isMobile ? 24 : 22} />} 
          title="จัดการตาราง" 
        />
        {/* เมนูดาวน์โหลด Log Excel */}
        <NavItem 
          onClick={() => navigate("/export-log")} 
          style={getNavStyle("/export-log")} 
          icon={<Download size={isMobile ? 24 : 22} />} 
          title="ดาวน์โหลด Log" 
        />
      </>
    )}

    <NavItem 
      onClick={() => navigate("/notification")} 
      style={getNavStyle("/notification")} 
      icon={<Bell size={isMobile ? 24 : 22} />} 
      title="แจ้งเตือน" 
    />
    <NavItem 
      onClick={() => navigate("/scanner")} 
      style={getNavStyle("/scanner")} 
      icon={<QrCode size={isMobile ? 24 : 22} />} 
      title="สแกน" 
    />
  </>
);

const NavItem = ({ onClick, style, icon, title }) => (
  <button onClick={onClick} className={style.container} title={title}>
    {icon}
    <div className={style.indicator} />
  </button>
);

const MobileMoreMenuItem = ({ onClick, icon, title, isActive }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 ${
      isActive 
        ? "bg-[#B2BB1E]/20 text-[#B2BB1E]" 
        : "text-white/70 hover:bg-white/5 hover:text-white"
    }`}
  >
    <div className={`${isActive ? "text-[#B2BB1E]" : "text-white/60"}`}>
      {icon}
    </div>
    <span className="text-sm font-medium">{title}</span>
  </button>
);

export default Navbar;