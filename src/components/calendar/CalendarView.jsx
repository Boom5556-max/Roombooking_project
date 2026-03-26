import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const CalendarView = ({
  events,
  onEventClick,
  isCancelMode,
  currentUserId,
  currentUserRole,
}) => {
  const renderEventContent = (eventInfo) => {
    const props = eventInfo.event.extendedProps;
    const isSchedule = props.isSchedule;
    const isClosed = props.temporarily_closed;
    const isUpload = props.isUpload;
    const isRoomView = props.isRoomView; // รับค่าสถานะว่าเป็นหน้าแยกห้องไหม

    const isOwner = String(props.teacher_id) === String(currentUserId);
    const isStaff = String(currentUserRole || "").toLowerCase().trim() === "staff";
    const hasPermission = isOwner || isStaff;

    const shouldElevate = isCancelMode && isSchedule && hasPermission && !isClosed;
    const shouldRestore = isCancelMode && isSchedule && hasPermission && isClosed;

    // กำหนดสีของจุด (Dot) เหมือนเดิม
    const getDotColor = () => {
      if (isClosed) return "#9CA3AF"; // Gray
      return isUpload ? "#F59E0B" : "#10B981"; // Yellow : Green
    };

    return (
      <div
        className={`fc-event-inline-wrapper 
          ${shouldElevate ? "elevated-clean" : ""} 
          ${shouldRestore ? "elevated-restore" : ""}
          ${isClosed ? "is-closed" : ""}
          ${isCancelMode && isClosed && hasPermission ? "already-closed-active" : ""}`}
      >
        <span 
          className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 shadow-sm"
          style={{ backgroundColor: getDotColor() }}
        ></span>
        
        {/* 🚩 3. แก้ไข CSS ตัวแปรของเวลา */}
        {/* ถ้าเป็นหน้าแยกห้อง (ซึ่งพื้นหลังแถบกิจกรรมสีใส) เราต้องทำให้แถบเวลาสีขาวเด่นขึ้นมา */}
        <span className={`fc-event-time-bold text-[9px] sm:text-[0.8rem] rounded px-1
          ${isRoomView ? "bg-white text-gray-700 shadow-inner" : "text-white"}`}>
          {eventInfo.timeText}
        </span>
        
        {/* 🚩 4. แก้ไข CSS ตัวแปรของชื่อวิชา */}
        {/* ถ้าเป็นหน้ารวมตัวหนังสือสีขาว, หน้าแยกห้องตัวหนังสือสีดำ */}
        <span className={`fc-event-title-light text-[10px] sm:text-[0.85rem] font-semibold overflow-hidden text-overflow-ellipsis white-space-nowrap
          ${isRoomView ? "text-gray-900" : "text-white"}`}>
          {isClosed ? ` ${eventInfo.event.title}` : eventInfo.event.title}
        </span>
      </div>
    );
  };

  return (
    <div className="flex-grow w-full h-full bg-[#FFFFFF] dark:bg-gray-800 p-2 sm:p-4 md:p-6 flex flex-col relative font-sans overflow-hidden">
      <div className="calendar-container flex-grow h-full">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={onEventClick}
          locale="th"
          height="100%"
          stickyHeaderDates={true}
          timeZone="UTC"
          eventDisplay="block" // บังคับแสดงเป็นแถบทึบเสมอเพื่อให้ CSS ทำงานง่าย
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          expandRows={true} 
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek",
          }}
          buttonText={{ today: "วันนี้", month: "เดือน", week: "สัปดาห์" }}
          eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
          eventContent={renderEventContent}
          dayMaxEvents={3}
        />
      </div>

      <style>{`
        /* Responsive CSS */
        @media (max-width: 640px) {
          .fc .fc-toolbar-title { font-size: 1rem !important; }
          .fc .fc-button { padding: 4px 6px !important; font-size: 0.7rem !important; }
          .fc-event-inline-wrapper { padding: 2px !important; gap: 2px !important; }
          .fc-daygrid-day-number { font-size: 0.75rem !important; padding: 2px !important; }
        }

        /* 🚩 5. ปรับ CSS ของ wrapper ใหม่เพื่อให้ใช้สีพื้นหลังที่ส่งมาจาก Helper */
        .fc-event-inline-wrapper { 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          padding: 3px 6px; 
          width: 100%; 
          overflow: hidden; 
          border-radius: 6px;
          transition: all 0.2s ease;
          /* คราวนี้เราไม่ต้องลบตรงนี้แล้ว แต่เราอาศัยสีที่ Helper ส่งมาแทน */
        }
        
        /* CSS เดิมๆ เก็บไว้ */
        .fc-v-event .fc-event-inline-wrapper { flex-direction: column; align-items: flex-start; height: 100%; }
        
        /* 🚩 6. ปรับ CSS ของ FC Event พื้นฐานเพื่อให้ได้ตามภาพ 3 (สำหรับหน้าแยกห้อง) */
        .fc-h-event, .fc-v-event { 
          /* เอา background: transparent !important; ออก เพื่อให้หน้ารวมแสดงสีห้องได้ */
          background-color: transparent; 
          border-width: inherit; /* ให้ใช้ขนาดขอบที่ส่งมา */
          border-color: inherit; /* ให้ใช้สีขอบที่ส่งมา */
        }

        /* Dark mode compatibility สำหรับแถบกิจกรรมสีใส */
        .dark .fc-h-event.fc-event-background-transparent,
        .dark .fc-v-event.fc-event-background-transparent {
          background-color: rgba(255, 255, 255, 0.05); /* นิดนึงใน dark mode */
        }

        /* สถานะ งดใช้ห้อง CSS เดิมๆ */
        .is-closed { background-color: #F9FAFB !important; border-color: #F3F4F6 !important; }
        .dark .is-closed { background-color: #374151 !important; border-color: #4B5563 !important; }
        .is-closed span { color: #9CA3AF !important; } /* ตัวหนังสือเป็นสีเทา */

        /* Cancel Mode elevation เหมือนเดิม */
        .elevated-clean {
          background-color: #FFFFFF !important;
          z-index: 50 !important;
          box-shadow: 0 4px 12px rgba(48, 39, 130, 0.1) !important;
          border-color: #302782 !important;
        }
        .elevated-clean span { color: #302782 !important; }

        .elevated-restore {
          background-color: #FFFFFF !important;
          z-index: 50 !important;
          box-shadow: 0 4px 12px rgba(178, 187, 30, 0.15) !important;
          border-color: #B2BB1E !important;
        }
        .elevated-restore span { color: #9CA3AF !important; }

        /* Cancel Mode dimming เหมือนเดิม */
        ${isCancelMode ? `
          .fc-event:not(:has(.elevated-clean)):not(:has(.elevated-restore)) {
            opacity: 0.2;
            filter: grayscale(100%);
            pointer-events: none;
          }
        ` : ""}

        /* Toolbar / UI เหมือนเดิม */
        .fc .fc-toolbar-title { font-weight: 700; color: #302782; }
        .dark .fc .fc-toolbar-title { color: #FFFFFF; }
        .fc .fc-button-primary { background-color: #FFFFFF !important; color: #6B7280 !important; border: 1px solid #E5E7EB !important; border-radius: 10px !important; font-weight: 600 !important; }
        .dark .fc .fc-button-primary { background-color: #374151 !important; color: #D1D5DB !important; border: 1px solid #4B5563 !important; }
        .fc .fc-next-button, .fc .fc-timeGridWeek-button { margin-left: 8px !important; }
        .fc .fc-button-primary.fc-button-active { background-color: #302782 !important; color: #FFFFFF !important; border-color: #302782 !important; }
        .dark .fc .fc-button-primary.fc-button-active { background-color: #B2BB1E !important; color: #FFFFFF !important; border-color: #B2BB1E !important; }
        .fc .fc-today-button { background-color: #B2BB1E !important; color: #FFFFFF !important; border: none !important; margin-left: 12px !important; }
        .fc-theme-standard td, .fc-theme-standard th { border-color: #F1F5F9 !important; }
        .dark .fc-theme-standard td, .dark .fc-theme-standard th { border-color: #374151 !important; }
        .fc-daygrid-day-number { color: #475569 !important; font-weight: 700 !important; }
        .dark .fc-daygrid-day-number { color: #D1D5DB !important; }
        .fc-daygrid-event-dot { display: none !important; } /* ซ่อน Dot พื้นฐานของ FC */
      `}</style>
    </div>
  );
};

export default CalendarView;