import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, ArrowRight, FilePlus, CheckCircle2, AlertCircle } from "lucide-react";
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
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col pb-20 md:pb-0 font-sans">
      <Navbar />
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex-grow">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold border-b-2 border-[#B2BB1E] text-[#302782] dark:text-white">ภาพรวมระบบ</h2>
        </div>

        <StatusCards role={role} roomCount={roomCount} pendingCount={pendingCount} approvedCount={approvedCount} />

        <Button
          variant="secondary" size="none" onClick={() => navigate("/Rooms")}
          className="w-full p-5 rounded-3xl justify-between flex mb-6 border dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 transition-all shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="bg-[#B2BB1E] p-3 rounded-2xl text-white"><LayoutGrid size={24} /></div>
            <div className="text-left">
              <p className="font-bold text-lg text-[#302782] dark:text-white">ดูรายการห้องเรียน</p>
              <p className="text-gray-500 text-sm">ตรวจสอบตารางการใช้ห้องทั้งหมด</p>
            </div>
          </div>
          <ArrowRight className="text-[#B2BB1E] w-7 h-7" />
        </Button>

        {/* 🚩 ใช้ Form ที่แบ่งออกมา */}
        {(role === "staff" || role === "teacher") && (
          <SmartSearchForm 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            onSubmit={handleSmartSearch} 
          />
        )}

        {role === "staff" && (
          <div onClick={() => setIsModalOpen(true)} className="bg-gray-50 dark:bg-gray-800 rounded-[32px] p-6 border-2 border-dashed dark:border-gray-700 cursor-pointer hover:border-[#B2BB1E] transition-all flex justify-between items-center group">
            <div>
              <h3 className="font-bold text-[#302782] dark:text-white flex items-center gap-2"><FilePlus size={20} className="text-[#B2BB1E]" /> ระบบจัดการไฟล์</h3>
              <p className="text-gray-500 text-xs mt-1">อัปโหลดตารางเรียน (.xlsx, .csv)</p>
            </div>
            <FilePlus size={32} className="text-[#302782] opacity-20 group-hover:opacity-40" />
          </div>
        )}

        {role === "teacher" && (
          <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-[40px] border dark:border-gray-700 mt-6 font-bold text-[#302782] dark:text-white">
            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#B2BB1E] shadow-sm"><CheckCircle2 size={28} /></div>
            ระบบจองห้องเรียนออนไลน์
          </div>
        )}
      </div>

      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {alertModal.isOpen && (
        <ActionModal
          icon={<AlertCircle size={60} className="text-red-500 mx-auto mb-2" />}
          title={<span className="text-red-600 font-bold">{alertModal.title}</span>}
          showButtons={false} autoClose={true}
          onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        />
      )}

      {/* 🚩 ใช้ Footer ที่แบ่งออกมา */}
      <DashboardFooter />
    </div>
  );
};

export default Dashboard;