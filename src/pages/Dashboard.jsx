import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, FilePlus, AlertCircle } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import Navbar from "../components/layout/Navbar.jsx";
import Button from "../components/common/Button.jsx";
import StatusCards from "../components/dashboard/StatusCards";
import UploadModal from "../components/dashboard/UploadModal";
import ActionModal from "../components/common/ActionModal";

// Import ส่วนที่แบ่งไป
import SmartSearchForm from "../components/dashboard/SmartSearchForm";
import DashboardFooter from "../components/dashboard/DashboardFooter";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { role, roomCount, pendingCount, approvedCount } = useDashboard();
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: "" });
  const [searchQuery, setSearchQuery] = useState({ date: "", start_time: "", end_time: "", capacity: "" });

  const handleSmartSearch = (e) => {
    e.preventDefault();
    const { date, start_time, end_time } = searchQuery;

    if (!date || !start_time || !end_time) {
      setAlertModal({ isOpen: true, title: "กรุณาระบุข้อมูลให้ครบถ้วนครับ" });
      return;
    }
    if (start_time >= end_time) {
      setAlertModal({ isOpen: true, title: "เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด" });
      return;
    }
    if (new Date(`${date}T${start_time}`) < new Date()) {
      setAlertModal({ isOpen: true, title: "ไม่สามารถเลือกเวลาในอดีตได้" });
      return;
    }
    navigate("/room-results", { state: searchQuery });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 flex flex-col pb-20 md:pb-0 font-sans transition-colors duration-200">
      <Navbar />
      
      {/* 🚩 1. ปรับ max-w-7xl (1280px) เพื่อให้กว้างขึ้นบน Desktop และเพิ่ม spacing (lg:space-y-8) */}
      <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full flex-grow space-y-6 lg:space-y-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center pb-3 border-b-2 border-gray-100 dark:border-gray-800">
          <h2 className="text-xl lg:text-2xl font-black text-[#302782] dark:text-white flex items-center gap-3">
            <div className="w-2.5 h-7 bg-[#B2BB1E] rounded-full"></div>
            ภาพรวมระบบ
          </h2>
        </div>

        {/* Status Cards (สีตัวเลขจะอยู่ในไฟล์ StatusCards) */}
        <StatusCards role={role} roomCount={roomCount} pendingCount={pendingCount} approvedCount={approvedCount} />

        {/* 🚩 2. ปรับ Layout ส่วนล่างให้เป็น Grid บน Desktop (lg:grid-cols-12) เพื่อกระจาย Component */}
        <div className={`grid grid-cols-1 ${role === "staff" || role === "teacher" ? "lg:grid-cols-12" : ""} gap-6 lg:gap-8 items-start`}>
          
          {/* ส่วนปุ่ม Action และจัดการไฟล์ (lg:col-span-5) */}
          <div className={`${role === "staff" || role === "teacher" ? "lg:col-span-5" : ""} space-y-6`}>
            
            <Button
              variant="secondary" size="none" onClick={() => navigate("/Rooms")}
              className="w-full p-6 rounded-[24px] justify-between flex border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-[#B2BB1E]/50 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-5">
                <div className="bg-[#B2BB1E]/10 p-4 rounded-2xl text-[#B2BB1E] group-hover:bg-[#B2BB1E] group-hover:text-white transition-colors">
                  <LayoutGrid size={28} />
                </div>
                <div className="text-left font-sans">
                  <p className="font-black text-xl text-[#302782] dark:text-white">ดูรายการห้องเรียน</p>
                  {/* เพิ่ม dark:text-gray-400 */}
                  <p className="text-black dark:text-white text-sm font-medium mt-1">ตรวจสอบตารางการใช้ห้องทั้งหมด</p>
                </div>
              </div>

            </Button>

            {role === "staff" && (
              <div onClick={() => setIsModalOpen(true)} className="bg-white dark:bg-gray-800 rounded-[24px] p-6 border border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-[#B2BB1E] hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-all flex justify-between items-center group shadow-sm">
                <div className="flex items-center gap-5">
                  <div className="bg-[#302782]/5 p-4 rounded-2xl text-[#302782] dark:text-white group-hover:bg-[#302782] group-hover:text-white transition-colors">
                    <FilePlus size={28} />
                  </div>
                  <div className="text-left font-sans">
                    <h3 className="font-black text-xl text-[#302782] dark:text-white">ระบบจัดการไฟล์</h3>
                    {/* เพิ่ม dark:text-gray-400 */}
                    <p className="text-black dark:text-white text-sm font-medium mt-1">อัปโหลดตารางเรียน (.xlsx, .csv)</p>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* 🚩 3. ปรับ Smart Search Form ให้ใช้พื้นที่ที่เหลือบน Desktop (lg:col-span-7) */}
          {(role === "staff" || role === "teacher") && (
            <div className="lg:col-span-7">
              {/* ส่ง prop ไปบอก SmartSearchForm ว่าเป็นโหมด Desktop จะได้จัด Layout ภายในใหม่ */}
              <SmartSearchForm 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
                onSubmit={handleSmartSearch}
                isDesktopView={true} 
              />
            </div>
          )}
        </div>

      </div>

      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {alertModal.isOpen && (
        <ActionModal
          icon={<AlertCircle size={60} className="text-red-500 mx-auto mb-2" />}
          title={<span className="text-red-600 font-black">{alertModal.title}</span>}
          showButtons={false} autoClose={true}
          onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        />
      )}

      <DashboardFooter />
    </div>
  );
};

export default Dashboard;