import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Ban,
  History,
  Trash2,
} from "lucide-react";
import { useNotificationLogic } from "../hooks/useNotificationLogic.js";
import {
  BookingCard,
  SectionTitle,
} from "../components/notification/NotificationComponents.jsx";
import Navbar from "../components/layout/Navbar.jsx";
import ActionModal from "../components/common/ActionModal";
import BookingDetailModal from "../components/notification/BookingDetailModal";

const isPastDate = (dateString) => {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookingDate = new Date(dateString);
  bookingDate.setHours(0, 0, 0, 0);
  return bookingDate < today;
};

const Notification = () => {
  const {
    pendingRequests,
    approvedRequests,
    historyRequests,
    userRole,
    selectedBooking,
    setSelectedBooking,
    handleUpdateStatus,
    handleUpdateBooking,
    handleCancelBooking,
    getFullName,
  } = useNotificationLogic();

  const [activeTab, setActiveTab] = useState("current");
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    icon: null,
    onConfirm: null,
    showConfirm: true,
    variant: "primary",
  });

  const showAlert = (
    title,
    icon,
    onConfirm = null,
    showConfirm = true,
    variant = "primary",
    showCloseButton = true,
    autoClose = false,
    showButtons = true, // <--- เพิ่ม Default เป็น true เพื่อให้ Modal ปกติยังมีปุ่ม
  ) => {
    setAlertConfig({
      isOpen: true,
      title,
      icon,
      showConfirm,
      variant,
      showCloseButton,
      autoClose,
      showButtons, // <--- บันทึกลง state
      onConfirm:
        onConfirm ||
        (() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))),
    });
  };

  const showResult = (success, successTitle, errorTitle) => {
    showAlert(
      success ? successTitle : errorTitle, // เลือก title ตามสถานะ
      success ? (
        <CheckCircle size={50} className="text-green-500" />
      ) : (
        <XCircle size={50} className="text-red-500" />
      ), // เลือกไอคอนตามสถานะ
      null, // onConfirm
      false, // showConfirm
      success ? "primary" : "danger", // เลือกสีตามสถานะ
      false, // showCloseButton
      true, // autoClose
      false, // showButtons (ซ่อนปุ่มทั้งหมด)
    );
  };
  // --- Logic Functions ---
  const handleApproveClick = (bookingId) => {
  showAlert(
    "คุณต้องการอนุมัติคำขอนี้ใช่หรือไม่?",
    <CheckCircle size={50} className="text-[#B2BB1E]" />,
    async () => {
      setAlertConfig((prev) => ({ ...prev, isOpen: false }));
      setSelectedBooking(null); // ปิด Modal รายละเอียด
      const result = await handleUpdateStatus(bookingId, "approved");
      
      // แสดงเฉพาะข้อความผลลัพธ์
      setTimeout(() => {
        setAlertConfig({
          isOpen: true,
          title: result?.success ? "อนุมัติการจองสำเร็จ" : "เกิดข้อผิดพลาด",
          icon: result?.success ? <CheckCircle size={50} className="text-green-500"/> : <XCircle size={50} className="text-red-500"/>,
          showButtons: false, 
          autoClose: true,
          variant: result?.success ? "primary" : "danger"
        });
      }, 150);
    }
  );
};

  const handleCancelClick = (bookingId) => {
    // 1. เช็ค Role เพื่อกำหนดข้อความแจ้งเตือน และ ข้อความตอนสำเร็จ
    const confirmMessage = 
      userRole === "staff" 
        ? "คุณต้องการไม่อนุมัติคำขอนี้ใช่หรือไม่?" 
        : "คุณแน่ใจหรือไม่ที่จะยกเลิกการจองนี้?";

    const successMessage = 
      userRole === "staff" 
        ? "ไม่อนุมัติคำขอสำเร็จ"
        : "ยกเลิกการจองสำเร็จ";

    // 2. เรียก Modal เพื่อยืนยันก่อน
    showAlert(
      confirmMessage,
      <Trash2 size={50} className="text-red-500" />,
      async () => {
        // 3. เมื่อกดตกลงแล้ว ให้ปิด Modal ยืนยัน
        setAlertConfig((prev) => ({ ...prev, isOpen: false }));
        setSelectedBooking(null);
        
        // ✨ แก้ไขตรงนี้: แยก Logic การเรียก API 
        let result;
        if (userRole === "staff") {
          // ถ้ายูสเซอร์เป็น Staff ให้ใช้ฟังก์ชันเปลี่ยนสถานะเป็น "rejected"
          result = await handleUpdateStatus(bookingId, "rejected"); 
        } else {
          // ถ้าเป็น Teacher ให้ใช้ฟังก์ชันยกเลิกปกติ
          result = await handleCancelBooking(bookingId); 
        }
        
        // 4. แสดงผลลัพธ์แบบ "มีแต่ข้อความ"
        setTimeout(() => {
          setAlertConfig({
            isOpen: true,
            title: result?.success ? successMessage : "เกิดข้อผิดพลาด",
            icon: result?.success ? <CheckCircle size={50} className="text-green-500"/> : <XCircle size={50} className="text-red-500"/>,
            showButtons: false,
            autoClose: true,
            variant: result?.success ? "primary" : "danger"
          });
        }, 150);
      },
      true, // showConfirm
      "danger"
    );
  };
  const handleBanClick = (bookingId) => {
  showAlert(
    "คุณแน่ใจหรือไม่ที่จะงดการใช้ห้องนี้?",
    <Ban size={50} className="text-red-500" />,
    async () => {
      setAlertConfig((prev) => ({ ...prev, isOpen: false }));
      setSelectedBooking(null); // ปิด Modal รายละเอียด
      const result = await handleCancelBooking(bookingId);
      
      setTimeout(() => {
        setAlertConfig({
          isOpen: true,
          title: result?.success ? "ดำเนินการสำเร็จ" : "ไม่สำเร็จ",
          icon: result?.success ? <CheckCircle size={50} className="text-green-500"/> : <XCircle size={50} className="text-red-500"/>,
          showButtons: false,
          autoClose: true,
          variant: result?.success ? "primary" : "danger"
        });
      }, 150);
    },
    true,
    "danger"
  );
};

  return (
    <div className="fixed inset-0 bg-[#302782] dark:bg-gray-950 flex flex-col font-sans overflow-hidden">
      <Navbar />

      {/* Tabs สำหรับ User Role: Teacher */}
      {userRole === "teacher" && (
        <div className="px-4 sm:px-8 lg:px-12 xl:px-16 pt-4 bg-[#302782] dark:bg-gray-950">
          {/* ✅ ปรับความกว้างของ Tabs ให้สอดคล้องกับเนื้อหาด้านล่าง */}
          <div className="flex gap-3 w-full max-w-7xl mx-auto">
            <button
              onClick={() => setActiveTab("current")}
              className={`flex-1 py-3.5 rounded-t-[24px] sm:rounded-t-[30px] font-bold text-xs sm:text-sm transition-all duration-300 ${activeTab === "current" ? "bg-white dark:bg-gray-800 text-[#302782] dark:text-white shadow-lg" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              การจองของฉัน
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-3.5 rounded-t-[24px] sm:rounded-t-[30px] font-bold text-xs sm:text-sm transition-all duration-300 ${activeTab === "history" ? "bg-white dark:bg-gray-800 text-[#302782] dark:text-white shadow-lg" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              ประวัติการจอง
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`flex-grow overflow-y-auto bg-white dark:bg-gray-800 p-4 sm:p-8 lg:px-12 xl:px-16 shadow-inner transition-all duration-500 
        ${userRole === "staff" ? "rounded-t-[40px] sm:rounded-t-[50px] mt-4" : "rounded-b-none sm:rounded-b-[50px]"}`}
      >
        {/* ✅ เปลี่ยนจาก max-w-4xl เป็น max-w-7xl เพื่อให้หน้าจอโน้ตบุ๊กแสดงผลได้กว้างขึ้น */}
        <div className="w-full max-w-7xl mx-auto pb-24">
          {userRole === "staff" ? (
            <div className="space-y-10">
              <StaffSection
                title="รออนุมัติ"
                icon={ClockIcon}
                data={pendingRequests}
                color="text-[#302782] dark:text-white"
                getFullName={getFullName}
                onSelect={setSelectedBooking}
                variant="pending"
              />
              <StaffSection
                title="อนุมัติแล้ว"
                icon={CheckCircle}
                data={approvedRequests}
                color="text-[#B2BB1E]"
                getFullName={getFullName}
                onSelect={(b) =>
                  setSelectedBooking({
                    ...b,
                    isHistory: isPastDate(b.booking_date || b.date),
                  })
                }
                variant="approved"
              />
              <StaffSection
                title="ไม่อนุมัติ"
                icon={XCircle}
                data={historyRequests}
                color="text-gray-400"
                getFullName={getFullName}
                onSelect={(b) => setSelectedBooking({ ...b, isHistory: true })}
                variant="rejected"
              />
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              {activeTab === "current" ? (
                <>
                  <div className="space-y-4">
                    <SectionTitle
                      title="รออนุมัติ"
                      icon={ClockIcon}
                      colorClass="text-[#302782] dark:text-white"
                    />
                    {pendingRequests.length > 0 ? (
                      pendingRequests.map((req) => (
                        <BookingCard
                          key={req.id || req.booking_id}
                          req={req}
                          variant="pending"
                          getFullName={getFullName}
                          onClick={setSelectedBooking}
                        />
                      ))
                    ) : (
                      <EmptyState />
                    )}
                  </div>
                  <div className="space-y-4 pt-4">
                    <SectionTitle
                      title="อนุมัติแล้ว"
                      icon={CheckCircle}
                      colorClass="text-[#B2BB1E]"
                    />
                    {approvedRequests.length > 0 ? (
                      approvedRequests.map((req) => (
                        <BookingCard
                          key={req.id || req.booking_id}
                          req={req}
                          variant="approved"
                          getFullName={getFullName}
                          onClick={(b) =>
                            setSelectedBooking({
                              ...b,
                              isHistory: isPastDate(b.booking_date || b.date),
                            })
                          }
                        />
                      ))
                    ) : (
                      <EmptyState />
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <SectionTitle
                    title="ประวัติการจอง"
                    icon={History}
                    colorClass="text-gray-400"
                  />
                  {historyRequests.length > 0 ? (
                    historyRequests.map((req) => (
                      <BookingCard
                        key={req.id || req.booking_id}
                        req={req}
                        variant="rejected"
                        getFullName={getFullName}
                        onClick={(b) =>
                          setSelectedBooking({ ...b, isHistory: true })
                        }
                      />
                    ))
                  ) : (
                    <EmptyState />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          userRole={userRole}
          onClose={() => setSelectedBooking(null)}
          onUpdateStatus={handleApproveClick}
          onCancel={handleCancelClick}
          onBan={handleBanClick}
          onUpdateBooking={handleUpdateBooking}
          getFullName={getFullName}
          showAlert={showAlert}
        />
      )}

      {alertConfig.isOpen && (
        <ActionModal
          icon={alertConfig.icon}
          title={alertConfig.title}
          showConfirm={alertConfig.showConfirm}
          showCloseButton={alertConfig.showCloseButton}
          autoClose={alertConfig.autoClose}
          showButtons={alertConfig.showButtons} // <--- ส่งค่านี้เข้าไป
          variant={alertConfig.variant}
          onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={alertConfig.onConfirm}
        />
      )}
    </div>
  );
};

// Component เสริมสำหรับแสดงเมื่อไม่มีข้อมูล
const EmptyState = () => (
  <p className="text-gray-400 text-sm text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600">
    ไม่มีรายการในขณะนี้
  </p>
);

const StaffSection = ({
  title,
  icon,
  data,
  color,
  getFullName,
  onSelect,
  variant,
}) => (
  <section className="animate-in slide-in-from-bottom-2 duration-500">
    <div className="mb-4">
      <SectionTitle title={title} icon={icon} colorClass={color} />
    </div>
    {/* ✅ ถ้าเนื้อหากว้างขึ้นแล้วอยากให้การ์ดเรียงกัน 2 คอลัมน์บนจอใหญ่ สามารถเพิ่ม lg:grid-cols-2 ได้ครับ (ถ้าชอบแบบแถวยาวๆ เหมือนเดิมก็ให้คง grid-cols-1 ไว้ครับ) */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {data.length > 0 ? (
        data.map((req) => (
          <BookingCard
            key={req.booking_id || req.id}
            req={req}
            variant={variant}
            getFullName={getFullName}
            onClick={onSelect}
          />
        ))
      ) : (
        <EmptyState />
      )}
    </div>
  </section>
);

export default Notification;
