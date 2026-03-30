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
    
    // 🚩 เปลี่ยนมาเช็คจาก type ของข้อมูล (Booking หรือ Schedule)
    const isSchedule = props.isSchedule; // หรือ props.type === "schedule"
    const isBooking = props.type === "booking";
    const isClosed = props.temporarily_closed;
    const isRoomView = props.isRoomView; 

    const isOwner = String(props.teacher_id) === String(currentUserId);
    const isStaff = String(currentUserRole || "").toLowerCase().trim() === "staff";
    const hasPermission = isOwner || isStaff;

    const shouldElevate = isCancelMode && isSchedule && hasPermission && !isClosed;
    const shouldRestore = isCancelMode && isSchedule && hasPermission && isClosed;

    // 🚩 จัดการสีและขอบของจุด (Dot)
    const getDotConfig = () => {
      // 1. ถ้างดใช้ห้อง (สีเทา)
      if (isClosed) return { bg: "#9CA3AF", border: "border-transparent" }; 
      
      const isLightBg = isRoomView || isClosed;
      
      // 2. ถ้ามาจากการจองทั่วไป Booking (สีส้ม + มีขอบตัดพื้นหลัง)
      if (isBooking) {
        return { 
          bg: "#F59E0B", 
          border: isLightBg ? "border-transparent" : "border-white dark:border-gray-800"
        };
      }
      
      // 3. ถ้าเป็นตารางเรียนหลัก Schedule (สีเขียว + มีขอบตัดพื้นหลัง)
      return { 
        bg: "#10B981", 
        border: isLightBg ? "border-transparent" : "border-white dark:border-gray-800" 
      };
    };

    const dotConfig = getDotConfig();

    return (
      <div
        className={`fc-event-inline-wrapper 
          ${shouldElevate ? "elevated-clean" : ""} 
          ${shouldRestore ? "elevated-restore" : ""}
          ${isClosed ? "is-closed" : ""}
          ${isCancelMode && isClosed && hasPermission ? "already-closed-active" : ""}`}
        title={isClosed ? "งดใช้ห้อง" : (isBooking ? "การจองทั่วไป" : "ตารางเรียนหลัก")}
      >
        {/* 🚩 ใช้สีตาม Config และมีเส้นขอบกั้น */}
        <span 
          className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 shadow-sm border-[1.5px] ${dotConfig.border}`}
          style={{ backgroundColor: dotConfig.bg }}
        ></span>
        
        <span className={`fc-event-time-bold text-[9px] sm:text-[0.8rem] rounded px-1
          ${isRoomView || isClosed ? "bg-gray-100 text-gray-700 shadow-inner" : "text-white"}`}>
          {eventInfo.timeText}
        </span>
        
        <span className={`fc-event-title-light text-[10px] sm:text-[0.85rem] font-semibold overflow-hidden text-overflow-ellipsis white-space-nowrap
          ${isRoomView || isClosed ? "text-gray-900" : "text-white"}`}>
          {isClosed ? ` ${eventInfo.event.title}` : eventInfo.event.title}
        </span>
      </div>
    );
  };

  const processedEvents = events?.map(event => {
    const isRoomView = event.extendedProps?.isRoomView;
    const isClosed = event.extendedProps?.temporarily_closed;

    return {
      ...event,
      display: 'block', 
      backgroundColor: isClosed ? "#f1f5f9" : (isRoomView ? "rgba(0,0,0,0.02)" : event.backgroundColor),
      borderColor: isClosed ? "#ef4444" : (isRoomView ? event.borderColor : "transparent"),
      textColor: isRoomView || isClosed ? "#111827" : "#ffffff"
    };
  });

  return (
    <div className="flex-grow w-full h-full bg-[#FFFFFF] dark:bg-gray-800 p-2 sm:p-4 md:p-6 flex flex-col relative font-sans overflow-hidden">
      <div className="calendar-container flex-grow h-full">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={processedEvents}
          eventClick={onEventClick}
          locale="th"
          height="100%"
          stickyHeaderDates={true}
          timeZone="UTC"
          eventDisplay="block" 
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
        @media (max-width: 640px) {
          .fc .fc-toolbar-title { font-size: 1rem !important; }
          .fc .fc-button { padding: 4px 6px !important; font-size: 0.7rem !important; }
          .fc-event-inline-wrapper { padding: 2px !important; gap: 2px !important; }
          .fc-daygrid-day-number { font-size: 0.75rem !important; padding: 2px !important; }
        }

        .fc-event-inline-wrapper { 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          padding: 3px 6px; 
          width: 100%; 
          overflow: hidden; 
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        
        .fc-v-event .fc-event-inline-wrapper { flex-direction: column; align-items: flex-start; height: 100%; }
        
        .fc-h-event, .fc-v-event { 
          background-color: transparent; 
          border-width: inherit; 
          border-color: inherit; 
        }

        .dark .fc-h-event.fc-event-background-transparent,
        .dark .fc-v-event.fc-event-background-transparent {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .is-closed { background-color: #F9FAFB !important; border-color: #F3F4F6 !important; }
        .dark .is-closed { background-color: #374151 !important; border-color: #4B5563 !important; }
        .is-closed span { color: #9CA3AF !important; }

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

        ${isCancelMode ? `
          .fc-event:not(:has(.elevated-clean)):not(:has(.elevated-restore)) {
            opacity: 0.2;
            filter: grayscale(100%);
            pointer-events: none;
          }
        ` : ""}

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
        .fc-daygrid-event-dot { display: none !important; }

        /* 1. ควบคุมตัวแปรสีหลักของ FullCalendar ให้เป็นโหมดมืด */
        .dark {
          --fc-page-bg-color: transparent; 
          --fc-neutral-bg-color: #1F2937;
          --fc-today-bg-color: rgba(255, 255, 255, 0.05);
          --fc-border-color: #374151;
        }

        /* 2. แก้สีพื้นหลังตัวอักษรหัวตาราง */
        .dark .fc-col-header-cell { 
          background-color: #1F2937 !important; 
          color: #F9FAFB !important; 
        }

        /* 3. บังคับสีช่อง "วันนี้" */
        .dark .fc-day-today,
        .dark .fc-timegrid-col.fc-day-today,
        .dark .fc-col-header-cell.fc-day-today { 
          background-color: rgba(255, 255, 255, 0.05) !important; 
        }

        /* 4. แก้มุมซ้ายบนของหน้ารายสัปดาห์ */
        .dark .fc-timegrid-axis {
          background-color: #1F2937 !important;
        }

        /* 5. แก้เส้นขอบและตัวอักษรเวลาในมุมมองรายสัปดาห์ */
        .dark .fc-theme-standard .fc-timegrid-slot, 
        .dark .fc-theme-standard .fc-timegrid-col,
        .dark .fc-theme-standard td, 
        .dark .fc-theme-standard th {
          border-color: #374151 !important;
        }
        .dark .fc-timegrid-axis-cushion, 
        .dark .fc-timegrid-slot-label-cushion {
          color: #D1D5DB !important;
        }

        /* 6. เปลี่ยนสี Scrollbar */
        .dark .fc-scroller::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .dark .fc-scroller::-webkit-scrollbar-track {
          background: #1F2937;
        }
        .dark .fc-scroller::-webkit-scrollbar-thumb {
          background: #4B5563;
          border-radius: 4px;
        }
        .dark .fc-scroller::-webkit-scrollbar-thumb:hover {
          background: #6B7280;
        }
      `}</style>
    </div>
  );
};

export default CalendarView;