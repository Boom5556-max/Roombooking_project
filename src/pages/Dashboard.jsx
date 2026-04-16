import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, FilePlus, AlertCircle } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import Navbar from "../components/layout/Navbar.jsx";
import Button from "../components/common/Button.jsx";
import StatusCards from "../components/dashboard/StatusCards";
import UploadModal from "../components/dashboard/UploadModal";
import ActionModal from "../components/common/ActionModal";
import PageReveal from "../components/common/PageReveal";

// Import ส่วนที่แบ่งไป
import SmartSearchForm from "../components/dashboard/SmartSearchForm";
import BookingScopeModal from "../components/dashboard/BookingScopeModal";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import { useReport } from "../hooks/useReport";
import RoomReportSection from "../components/rooms/RoomReportSection";
import StaffReportSection from "../components/rooms/StaffReportSection.jsx";
import { getBookingScope } from "../api/bookingScope";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
  const [scopeRefreshKey, setScopeRefreshKey] = useState(0);
  const [scope, setScope] = useState({
    opening_mins: 480, // 08:00
    closing_mins: 1200, // 20:00
    max_advance_days: 10,
    min_advance_hours: 1
  });
  const [isLoadingScope, setIsLoadingScope] = useState(false);

  // ✨ Dashboard States & Hooks
  const { role, roomCount, pendingCount, approvedCount, isLoading: isDashboardLoading } = useDashboard();
  const { reportData, isLoading: isReportLoading, error: reportError } = useReport();

  React.useEffect(() => {
    // โหลดข้อมูลเมื่อคอมโพเนนต์ Mount หรือเมื่อ role เปลี่ยน (เพื่อให้แน่ใจว่า Token/Permissions พร้อม)
    const fetchScope = async () => {
      setIsLoadingScope(true);
      try {
        const result = await getBookingScope();
        if (result.success && result.data) {
          setScope(result.data);
          console.log("Booking Scope loaded successfully for role:", role);
        }
      } catch (err) {
        console.error("Dashboard fetch scope error (Using defaults):", err);
      } finally {
        setIsLoadingScope(false);
      }
    };
    
    // ดึงข้อมูลเมื่อ mount หรือเมื่อ role เปลี่ยนจาก null เป็นค่าอื่น
    if (role) {
      fetchScope();
    }
  }, [scopeRefreshKey, role]);

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
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 flex flex-col pb-40 md:pb-0 font-sans transition-colors duration-200 relative overflow-x-hidden">
      <Navbar />

      <PageReveal 
        isLoading={isDashboardLoading || isReportLoading} 
        loadingText={isDashboardLoading ? "กำลังวิเคราะห์ข้อมูลระบบ..." : "กำลังจัดทำรายงานสรุป..."}
        delay={800}
      >
        <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full flex-grow space-y-6 lg:space-y-8">
          
          {/* Header Section */}
          <div className="flex justify-between items-center pb-3 border-b-2 border-gray-100 dark:border-gray-800">
            <h2 className="text-xl lg:text-2xl font-black text-[#302782] dark:text-white flex items-center gap-3">
              <div className="w-2.5 h-7 bg-[#B2BB1E] rounded-full"></div>
              ภาพรวมระบบ
            </h2>
          </div>

          <StatusCards role={role} roomCount={roomCount} pendingCount={pendingCount} approvedCount={approvedCount} />

          <div className={`grid grid-cols-1 ${role === "staff" || role === "teacher" ? "lg:grid-cols-12" : ""} gap-6 lg:gap-8 items-start`}>
            
            {/* เลย์เอาต์ส่วนซ้าย: รายงาน (Teacher) */}
            {(role === "teacher") && (
              <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                <RoomReportSection 
                  reportData={reportData} 
                  isLoading={isReportLoading} 
                  error={reportError} 
                />
              </div>
            )}

            {/* เลย์เอาต์ส่วนซ้าย: รายงาน (Staff) */}
            {(role === "staff") && (
              <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                <StaffReportSection 
                  reportData={reportData} 
                  isLoading={isReportLoading} 
                  error={reportError} 
                />
              </div>
            )}

            <div className={`${role === "staff" || role === "teacher" ? "lg:col-span-12 xl:col-span-7" : ""} space-y-6`}>
              
              {(role === "staff" || role === "teacher") && (
                <SmartSearchForm 
                  searchQuery={searchQuery} 
                  setSearchQuery={setSearchQuery} 
                  onSubmit={handleSmartSearch}
                  isDesktopView={true} 
                  role={role}
                  onOpenScope={() => setIsScopeModalOpen(true)}
                  scope={scope}
                />
              )}
              
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
                      <p className="text-black dark:text-white text-sm font-medium mt-1">อัปโหลดตารางเรียน (.xlsx, .csv)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DashboardFooter scope={scope} />
        </div>
      </PageReveal>

      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {alertModal.isOpen && (
        <ActionModal
          icon={<AlertCircle size={60} className="text-red-500 mx-auto mb-2" />}
          title={<span className="text-red-600 font-black">{alertModal.title}</span>}
          showButtons={false} autoClose={true}
          onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        />
      )}

      <BookingScopeModal 
        isOpen={isScopeModalOpen} 
        onClose={() => setIsScopeModalOpen(false)} 
        onUpdate={() => setScopeRefreshKey(prev => prev + 1)}
      />
    </div>
  );
};

export default Dashboard;