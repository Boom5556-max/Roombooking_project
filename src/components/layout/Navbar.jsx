import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar as CalendarIcon, Bell, QrCode, LogOut, Users } from 'lucide-react';
import { jwtDecode } from "jwt-decode";
import ActionModal from "../common/ActionModal";
import ProfileDropdown from "./ProfileDropdown";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState("");

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
        localStorage.removeItem("token");
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
      <nav className="bg-[#302782] w-full px-4 sm:px-8 py-3 flex justify-between items-center shadow-[0_4px_20px_rgba(0,0,0,0.15)] sticky top-0 z-[1000] border-b border-[#FFFFFF]/5 backdrop-blur-md font-sans flex-none">
        
        {/* Logo Section - ปรับขนาดตัวอักษรตามหน้าจอ */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate("/dashboard")}
        >
          <div className="flex flex-col">
            <h1 className="text-[#FFFFFF] text-2xl sm:text-4xl font-bold leading-tight tracking-tight">
              SCI <span className="text-[#B2BB1E]">KU</span>
            </h1>
            <p className="text-[#FFFFFF]/40 text-[7px] sm:text-[9px] font-bold tracking-[0.3em] sm:tracking-[0.50em] leading-none uppercase italic">Sriracha Campus</p>
          </div>
        </div>

        {/* Menu Section - Desktop (md ขึ้นไปจะแสดงแบบเดิม) */}
        <div className="hidden md:flex gap-2 lg:gap-4 items-center">
          <NavItemsGroup navigate={navigate} getNavStyle={getNavStyle} userRole={userRole} />
          
          <div className="ml-2 flex items-center gap-2">
            {userRole === "staff" && <ProfileDropdown isMobile={false} />}
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
            {userRole === "staff" && <ProfileDropdown isMobile={true} />}
            <button
              onClick={handleLogoutClick}
              className="w-10 h-10 flex items-center justify-center text-[#FFFFFF]/60"
            >
              <LogOut size={22} />
            </button>
        </div>
      </nav>

      {/* --- Mobile Bottom Navigation (แสดงเฉพาะหน้าจอเล็ก < 768px) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#302782]/95 backdrop-blur-lg border-t border-white/10 z-[1000] px-2 pb-safe">
        <div className="flex justify-around items-center h-16">
          <NavItemsGroup navigate={navigate} getNavStyle={getNavStyle} userRole={userRole} isMobile={true} />
        </div>
      </div>

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
    {userRole === "staff" && (
      <NavItem 
        onClick={() => navigate("/users")} 
        style={getNavStyle("/users")} 
        icon={<Users size={isMobile ? 24 : 22} />} 
        title="สมาชิก" 
      />
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

export default Navbar;