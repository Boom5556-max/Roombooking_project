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
    const isBooking = props.type === "booking";
    const isClosed = props.temporarily_closed;

    const ownerId = String(props.teacher_id || props.user_id || "");
    const myId = String(currentUserId || "");
    
    let isOwner = false;
    if (ownerId !== "" && ownerId !== "null" && ownerId !== "undefined") {
      isOwner = ownerId === myId;
    }
    const isStaff = String(currentUserRole || "").toLowerCase().trim() === "staff";
    const hasPermission = isOwner || isStaff;

    const shouldElevate = isCancelMode && isSchedule && hasPermission && !isClosed;
    const shouldRestore = isCancelMode && isSchedule && hasPermission && isClosed;

    const getDotConfig = () => {
      if (isClosed) return { bg: "#9CA3AF", border: "border-transparent" }; 
      const isLightBg = isClosed || shouldElevate || shouldRestore;
      if (isBooking) {
        return { 
          bg: "#F59E0B", 
          border: isLightBg ? "border-transparent" : "border-white dark:border-gray-800"
        };
      }
      return { 
        bg: "#10B981", 
        border: isLightBg ? "border-transparent" : "border-white dark:border-gray-800" 
      };
    };

    const dotConfig = getDotConfig();

    // 🟢 สี "ป้ายเวลา" (ใช้แบบดั้งเดิม)
    // 🟢 สี "ป้ายเวลา"
    // 🟢 สี "ป้ายเวลา"
    let timeClasses = "";
    if (shouldElevate) {
        timeClasses = "bg-[#302782] text-white"; 
    } else if (shouldRestore) {
        timeClasses = "bg-[#9CA3AF] text-white";
    } else if (isClosed) {
        timeClasses = "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100 shadow-inner";
    } else {
        // ✨ ใช้พื้นหลังเวลาสีดำโปร่งแสง และตัวหนังสือสีขาว
        timeClasses = "bg-black/20 !text-white font-medium";
    }

    // 🟢 สี "ชื่อวิชา"
    let titleClasses = "";
    if (shouldElevate) {
        titleClasses = "text-[#302782] font-bold"; 
    } else if (shouldRestore) {
        titleClasses = "text-gray-500 font-bold"; 
    } else if (isClosed) {
        titleClasses = "text-gray-900 dark:text-gray-100";
    } else {
        // ✨ บังคับใช้ตัวหนังสือสีขาวเสมอ เพื่อให้อ่านง่ายบนพื้นสีสด
        titleClasses = "!text-white font-bold drop-shadow-sm"; 
    }

    return (
      <div
        className={`fc-event-inline-wrapper 
          ${shouldElevate ? "elevated-clean" : ""} 
          ${shouldRestore ? "elevated-restore" : ""}
          ${isClosed ? "is-closed" : ""}
          ${isCancelMode && isClosed && hasPermission ? "already-closed-active" : ""}`}
        title={isClosed ? "งดใช้ห้อง" : (isBooking ? "การจองทั่วไป" : "ตารางเรียนหลัก")}
      >
        <span 
          className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 shadow-sm border-[1.5px] ${dotConfig.border}`}
          style={{ backgroundColor: dotConfig.bg }}
        ></span>
        
        {/* 🟢 ปรับเวลาให้ใหญ่ขึ้น: ใช้ text-[11px] สำหรับจอมือถือ และ sm:text-[0.9rem] สำหรับจอคอม */}
        <span className={`fc-event-time-bold text-[11px] sm:text-[0.9rem] rounded px-1.5 py-0.5 ${timeClasses}`}>
          {eventInfo.timeText}
        </span>
        
        {/* 🟢 ปรับชื่อวิชาให้ใหญ่ขึ้น: ใช้ text-[13px] สำหรับจอมือถือ และ sm:text-[1rem] สำหรับจอคอม */}
        <span className={`fc-event-title-light text-[13px] sm:text-[1rem] overflow-hidden text-ellipsis whitespace-nowrap ${titleClasses}`}>
          {isClosed ? ` ${eventInfo.event.title}` : eventInfo.event.title}
        </span>
      </div>
    );
  };

  const processedEvents = events?.map(event => {
    const isClosed = event.extendedProps?.temporarily_closed;

    return {
      ...event,
      display: 'block', 
      backgroundColor: isClosed ? "#f1f5f9" : event.backgroundColor,
      borderColor: isClosed ? "#ef4444" : (event.borderColor || "transparent"),
      textColor: "" 
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
          padding: 4px 6px; 
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
          border: none !important; /* ซ่อน border เดิมเพื่อใช้ของ inline-wrapper แทน */
        }

        .is-closed { background-color: #F9FAFB !important; border-color: #F3F4F6 !important; }
        .dark .is-closed { background-color: #374151 !important; border-color: #4B5563 !important; }
        
        .elevated-clean {
          background-color: #FFFFFF !important;
          z-index: 50 !important;
          box-shadow: 0 4px 12px rgba(48, 39, 130, 0.1) !important;
          border: 2px solid #302782 !important;
        }

        .elevated-restore {
          background-color: #FFFFFF !important;
          z-index: 50 !important;
          box-shadow: 0 4px 12px rgba(178, 187, 30, 0.15) !important;
          border: 2px solid #B2BB1E !important;
        }

        ${isCancelMode ? `
          .fc-event:not(:has(.elevated-clean)):not(:has(.elevated-restore)) {
            opacity: 0.3;
            filter: grayscale(100%);
            pointer-events: none !important; 
            cursor: default !important;
          }

          .fc-event:has(.elevated-clean), .fc-event:has(.elevated-restore) {
            pointer-events: auto !important;
            cursor: pointer !important;
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

        .dark {
          --fc-page-bg-color: transparent; 
          --fc-neutral-bg-color: #1F2937;
          --fc-today-bg-color: rgba(255, 255, 255, 0.05);
          --fc-border-color: #374151;
        }

        .dark .fc-col-header-cell { 
          background-color: #1F2937 !important; 
          color: #F9FAFB !important; 
        }

        .dark .fc-day-today,
        .dark .fc-timegrid-col.fc-day-today,
        .dark .fc-col-header-cell.fc-day-today { 
          background-color: rgba(255, 255, 255, 0.05) !important; 
        }

        .dark .fc-timegrid-axis {
          background-color: #1F2937 !important;
        }

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