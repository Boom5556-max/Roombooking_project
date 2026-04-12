import React, { useState, useMemo } from "react";
import {
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Ban,
  History,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { useManageBooking } from "../hooks/useManage_Booking.js"; // อัปเดตชื่อ Hook ตามที่คุณเพิ่งเปลี่ยน
import {
  BookingCard,
  SectionTitle,
} from "../components/managebooking/Manage_BookingComponents.jsx";
import Navbar from "../components/layout/Navbar.jsx";
import ActionModal from "../components/common/ActionModal.jsx";
import BookingDetailModal from "../components/managebooking/BookingDetailModal.jsx";

const isPastDate = (dateString) => {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookingDate = new Date(dateString);
  bookingDate.setHours(0, 0, 0, 0);
  return bookingDate < today;
};

// ✅ เปลี่ยนชื่อ Component เป็น ManageBooking
const ManageBooking = () => {
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
  } = useManageBooking(); // ✅ เรียกใช้ชื่อ Hook ใหม่

  const [activeTab, setActiveTab] = useState("current");
  const [selectedRoom, setSelectedRoom] = useState(null); // null = ทั้งหมด
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    icon: null,
    onConfirm: null,
    showConfirm: true,
    variant: "primary",
  });

  // ดึงรายชื่อห้องทั้งหมดที่ไม่ซ้ำ จาก booking ทุกสถานะ (เฉพาะ staff)
  const uniqueRooms = useMemo(() => {
    const allBookings = [...pendingRequests, ...approvedRequests, ...historyRequests];
    const roomSet = new Set(allBookings.map((b) => b.room_id).filter(Boolean));
    return [...roomSet].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  }, [pendingRequests, approvedRequests, historyRequests]);

  // กรองข้อมูลตามห้องที่เลือก
  const filterByRoom = (data) => {
    if (!selectedRoom) return data;
    return data.filter((b) => b.room_id === selectedRoom);
  };

  const filteredPending = filterByRoom(pendingRequests);
  const filteredApproved = filterByRoom(approvedRequests);
  const filteredHistory = filterByRoom(historyRequests);

  const showAlert = (
    title,
    icon,
    onConfirm = null,
    showConfirm = true,
    variant = "primary",
    showCloseButton = true,
    autoClose = false,
    showButtons = true,
  ) => {
    setAlertConfig({
      isOpen: true,
      title,
      icon,
      showConfirm,
      variant,
      showCloseButton,
      autoClose,
      showButtons,
      onConfirm:
        onConfirm ||
        (() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))),
    });
  };

  const showResult = (success, successTitle, errorTitle) => {
    showAlert(
      success ? successTitle : errorTitle,
      success ? (
        <CheckCircle size={50} className="text-green-500" />
      ) : (
        <XCircle size={50} className="text-red-500" />
      ),
      null,
      false,
      success ? "primary" : "danger",
      false,
      true,
      false,
    );
  };

  const handleApproveClick = (bookingId) => {
    showAlert(
      "คุณต้องการอนุมัติคำขอนี้ใช่หรือไม่?",
      <CheckCircle size={50} className="text-[#B2BB1E]" />,
      async () => {
        setAlertConfig((prev) => ({ ...prev, isOpen: false }));
        setSelectedBooking(null);
        const result = await handleUpdateStatus(bookingId, "approved");
        
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

  // ✨ 1. เพิ่มพารามิเตอร์ reason มารับค่าจาก Modal
  const handleCancelClick = (bookingId, reason) => { 
    console.log("reason ที่รับมา:", reason)
    const confirmMessage = 
      userRole === "staff" 
        ? "คุณต้องการไม่อนุมัติคำขอนี้ใช่หรือไม่?" 
        : "คุณแน่ใจหรือไม่ที่จะยกเลิกการจองนี้?";

    const successMessage = 
      userRole === "staff" 
        ? "ไม่อนุมัติคำขอสำเร็จ"
        : "ยกเลิกการจองสำเร็จ";

    showAlert(
      confirmMessage,
      <Trash2 size={50} className="text-red-500" />,
      async () => {
        setAlertConfig((prev) => ({ ...prev, isOpen: false }));
        setSelectedBooking(null);
        
        let result;
        if (userRole === "staff") {
          // ✨ 2. ส่ง reason พ่วงไปด้วย (กรณี staff ปฏิเสธ)
          // หมายเหตุ: ต้องแน่ใจว่า handleUpdateStatus ใน Hook ถูกเขียนให้รับ parameter ตัวที่ 3 ด้วยนะครับ
          console.log("reason ตอนส่ง API:", reason)
          result = await handleUpdateStatus(bookingId, "rejected", reason); 
        } else {
          // ✨ 3. เอา "" ออก แล้วใส่ reason ที่รับมาแทน (กรณียกเลิกของ Teacher)
          result = await handleCancelBooking(bookingId, reason); 
        }
        
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
      true,
      "danger"
    );
  };

  // 👇 เพิ่ม reason เข้ามาเป็นพารามิเตอร์ตัวที่สอง
const handleBanClick = (bookingId, reason) => {
  showAlert(
    // ปรับข้อความให้แสดงเหตุผลด้วย เพื่อให้ผู้ใช้ตรวจทานก่อนกดยืนยันอีกรอบ
    `คุณแน่ใจหรือไม่ที่จะงดการใช้ห้องนี้?`,
    <Ban size={50} className="text-red-500" />,
    async () => {
      setAlertConfig((prev) => ({ ...prev, isOpen: false }));
      setSelectedBooking(null);
      
      // 👇 ส่ง reason เข้าไปในฟังก์ชัน API ด้วย
      const result = await handleCancelBooking(bookingId, reason); 
      
      setTimeout(() => {
        setAlertConfig({
          isOpen: true,
          title: result?.success ? "งดใช้ห้องสำเร็จ" : "งดใช้ห้องไม่สำเร็จ",
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
          <div className="flex gap-3 w-full max-w-7xl mx-auto">
            <button
              onClick={() => setActiveTab("current")}
              className={`flex-1 py-3.5 rounded-t-[24px] sm:rounded-t-[30px] font-bold text-xs sm:text-sm transition-all duration-300 ${activeTab === "current" ? "bg-white dark:bg-gray-800 text-[#302782] dark:text-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)]" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              การจองของฉัน
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-3.5 rounded-t-[24px] sm:rounded-t-[30px] font-bold text-xs sm:text-sm transition-all duration-300 ${activeTab === "history" ? "bg-white dark:bg-gray-800 text-[#302782] dark:text-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)]" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              ประวัติการจอง
            </button>
          </div>
        </div>
      )}

      {/* ตัวกรองห้อง: สำหรับ Staff เท่านั้น */}
      {userRole === "staff" && uniqueRooms.length > 0 && (
        <div className="px-4 sm:px-8 lg:px-12 xl:px-16 pt-4 pb-1 bg-[#302782] dark:bg-gray-950">
          <div className="w-full max-w-3xl mx-auto">
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
              {/* ปุ่ม "ทั้งหมด" */}
              <button
                onClick={() => setSelectedRoom(null)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                  selectedRoom === null
                    ? "bg-white text-[#302782]"
                    : "bg-white/15 text-white/80 hover:bg-white/25 active:scale-95"
                }`}
              >
                ทั้งหมด
              </button>
              {uniqueRooms.map((room) => (
                <button
                  key={room}
                  onClick={() => setSelectedRoom(room)}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                    selectedRoom === room
                      ? "bg-[#B2BB1E] text-white"
                      : "bg-white/15 text-white/80 hover:bg-white/25 active:scale-95"
                  }`}
                >
                  {room}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`flex-grow overflow-y-auto bg-white dark:bg-gray-800 p-4 sm:p-8 lg:px-12 xl:px-16 transition-all duration-500 
        ${userRole === "staff" ? "rounded-t-[40px] sm:rounded-t-[50px] mt-4" : ""}`}
      >
        <div className="w-full max-w-3xl mx-auto pb-24">
          {userRole === "staff" ? (
            <div className="space-y-10">
              <StaffSection
                title="รออนุมัติ"
                icon={ClockIcon}
                data={filteredPending}
                color="text-[#302782] dark:text-white"
                getFullName={getFullName}
                onSelect={setSelectedBooking}
                variant="pending"
              />
              <StaffSection
                title="อนุมัติแล้ว"
                icon={CheckCircle}
                data={filteredApproved}
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
                data={filteredHistory}
                color="text-red-400"
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
                        variant={req.status || "rejected"}
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
          showButtons={alertConfig.showButtons}
          variant={alertConfig.variant}
          onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={alertConfig.onConfirm}
        />
      )}
    </div>
  );
};

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
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const Icon = icon;
  const hasData = data.length > 0;

  return (
    <section className="animate-in slide-in-from-bottom-2 duration-500">
      {/* หัวข้อ: กดเพื่อพับ/กาง */}
      <button
        onClick={() => hasData && setIsOpen((prev) => !prev)}
        className={`flex items-center gap-3 mt-10 mb-4 px-1 w-full text-left group ${hasData ? "cursor-pointer" : "cursor-default"}`}
      >
        {Icon && (
          <div className={`p-2 rounded-xl bg-white dark:bg-gray-700 shadow-sm border border-gray-50 dark:border-gray-600 ${color || "text-[#302782]"}`}>
            <Icon size={20} strokeWidth={2.5} />
          </div>
        )}
        <h2 className={`text-xl font-black tracking-tight ${color || "text-[#302782]"}`}>
          {title}
        </h2>

        {/* จำนวนรายการ */}
        {hasData && (
          <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 px-2.5 py-1 rounded-full">
            {data.length}
          </span>
        )}

        <div className="flex-grow h-[1px] bg-gradient-to-r from-gray-100 dark:from-gray-600 to-transparent ml-2" />

        {/* ลูกศร Chevron */}
        {hasData && (
          <ChevronDown 
            size={20} 
            strokeWidth={2.5}
            className={`text-gray-300 dark:text-gray-500 transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : "rotate-0"}`} 
          />
        )}
      </button>

      {/* รายการ Booking */}
      <div className={`grid grid-cols-1 gap-4 overflow-hidden transition-all duration-300 ${
        !hasData || isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
      }`}>
        {hasData ? (
          data.map((req) => (
            <BookingCard
              key={req.booking_id || req.id}
              req={req}
              variant={
                variant === "rejected" ? "rejected" : 
                (req.status || variant)
              }
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
};

// ✅ อัปเดตการ Export ให้ตรงกับชื่อ Component ใหม่
export default ManageBooking;