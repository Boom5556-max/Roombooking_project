import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import googleCalendarPlugin from "@fullcalendar/google-calendar";

const CalendarView = ({
  events,
  onEventClick,
  isCancelMode,
  currentUserId,
  currentUserRole,
}) => {
  const renderEventContent = (eventInfo) => {
    // ✨ Handle Google Calendar Holidays
    if (eventInfo.event.source?.id === "google-holidays-source" || eventInfo.event.classNames.includes("google-holiday")) {
      return (
        <div className="flex items-center justify-center w-full h-full px-2 py-1 bg-[#ef4444] rounded-[12px] cursor-default">
          <span className="text-white font-bold text-[11px] sm:text-[13px] truncate drop-shadow-sm cursor-default">
            {eventInfo.event.title}
          </span>
        </div>
      );
    }

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
      timeClasses = "bg-gray-200 text-black dark:bg-gray-600 dark:text-white shadow-inner";
    } else {
      // ✨ ใช้พื้นหลังเวลาสีดำโปร่งแสง และตัวหนังสือสีขาว
      timeClasses = "bg-black/20 !text-white font-medium";
    }

    // 🟢 สี "ชื่อวิชา"
    let titleClasses = "";
    if (shouldElevate) {
      titleClasses = "text-[#302782] font-bold";
    } else if (shouldRestore) {
      titleClasses = "text-black dark:text-white font-bold";
    } else if (isClosed) {
      titleClasses = "text-black dark:text-white";
    } else {
      // ✨ บังคับใช้ตัวหนังสือสีขาวเสมอ เพื่อให้อ่านง่ายบนพื้นสีสด
      titleClasses = "!text-white font-bold drop-shadow-sm";
    }

    // 🟢 สีพื้นหลังและขอบดั้งเดิมจากข้อมูล
    const originalBg = eventInfo.event.backgroundColor || "#10B981";
    const originalBorder = eventInfo.event.borderColor || "transparent";

    return (
      <div
        className={`fc-event-inline-wrapper 
          ${shouldElevate ? "elevated-clean" : ""} 
          ${shouldRestore ? "elevated-restore" : ""}
          ${isClosed ? "is-closed" : ""}
          ${isCancelMode && isClosed && hasPermission ? "already-closed-active" : ""}`}
        style={{
          backgroundColor: isClosed ? undefined : originalBg,
          borderColor: isClosed ? undefined : originalBorder,
          borderRadius: '12px',
          borderWidth: isClosed ? undefined : '1px',
          borderStyle: isClosed ? undefined : 'solid',
          overflow: 'hidden'
        }}
        title={isClosed ? "งดใช้ห้อง" : (isBooking ? "การจองทั่วไป" : "ตารางเรียนหลัก")}
      >
        <span
          className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 shadow-sm border-[1.5px] ${dotConfig.border}`}
          style={{ backgroundColor: dotConfig.bg }}
        ></span>

        <span className={`fc-event-time-bold text-[11px] sm:text-[0.9rem] flex-shrink-0 rounded px-1.5 py-0.5 ${timeClasses}`} style={{ borderRadius: '6px' }}>
          {eventInfo.timeText}
        </span>

        <span className={`fc-event-title-light text-[13px] sm:text-[1rem] w-full flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap ${titleClasses}`}>
          {eventInfo.event.title}
        </span>
      </div>
    );
  };

  const processedEvents = React.useMemo(() => {
    return events?.map(event => {
      const isClosed = event.extendedProps?.temporarily_closed;

      return {
        ...event,
        display: 'block',
        backgroundColor: isClosed ? "#f1f5f9" : event.backgroundColor,
        borderColor: isClosed ? "#ef4444" : (event.borderColor || "transparent"),
        textColor: ""
      };
    });
  }, [events]);

  return (
    <div className="flex-grow w-full h-full bg-[#FFFFFF] dark:bg-gray-800 p-2 sm:p-4 md:p-6 flex flex-col relative font-sans overflow-hidden">
      <div className="calendar-container flex-grow h-full">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, googleCalendarPlugin]}
          googleCalendarApiKey={import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY}
          initialView="dayGridMonth"
          eventSources={[
            { events: processedEvents || [] },
            {
              id: 'google-holidays-source',
              googleCalendarId: 'th.th.official#holiday@group.v.calendar.google.com',
              className: 'google-holiday',
              display: 'block'
            }
          ]}
          eventClick={(info) => {
            if (info.event.source?.id === "google-holidays-source" || info.event.classNames.includes("google-holiday") || info.event.url) {
              info.jsEvent.preventDefault();
              return;
            }
            if (onEventClick) onEventClick(info);
          }}
          locale="th"
          height="100%"
          stickyHeaderDates={true}
          timeZone="UTC"
          eventDisplay="block"
          allDaySlot={true}
          allDayText="ทั้งวัน"
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

        /* 🚨 แก้ปัญหาขอบแหลมที่ระดับนอกสุดของ FullCalendar */
        .fc-event {
          border-radius: 12px !important;
          overflow: hidden !important;
          border: none !important;
          background-color: transparent !important;
        }

        .fc-event-inline-wrapper { 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          padding: 4px 8px; 
          width: 100%; 
          height: 100%;
          border-radius: 12px; /* ล้อไปกับกล่องนอก */
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .fc-event-time-bold {
          border-radius: 8px !important;
        }
        
        .fc-v-event .fc-event-inline-wrapper { flex-direction: column; align-items: flex-start; height: 100%; }
        
        /* 🚨 ล้างบางทุก Layer ให้เรียบเนียน */
        .fc-event-main, 
        .fc-daygrid-event, 
        .fc-timegrid-event,
        .fc-h-event, 
        .fc-v-event { 
          background: transparent !important; 
          background-color: transparent !important; 
          border: none !important; 
          border-radius: 12px !important;
          box-shadow: none !important;
        }

        .is-closed { background-color: #F9FAFB !important; border: 1px solid #F3F4F6 !important; }
        .dark .is-closed { background-color: #374151 !important; border: 1px solid #4B5563 !important; }
        
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
        .fc .fc-button-primary { background-color: #FFFFFF !important; color: #000000 !important; border: 1px solid #E5E7EB !important; border-radius: 10px !important; font-weight: 600 !important; }
        .dark .fc .fc-button-primary { background-color: #374151 !important; color: #FFFFFF !important; border: 1px solid #4B5563 !important; }
        .fc .fc-next-button, .fc .fc-timeGridWeek-button { margin-left: 8px !important; }
        .fc .fc-button-primary.fc-button-active { background-color: #302782 !important; color: #FFFFFF !important; border-color: #302782 !important; }
        .dark .fc .fc-button-primary.fc-button-active { background-color: #B2BB1E !important; color: #FFFFFF !important; border-color: #B2BB1E !important; }
        .fc .fc-today-button { background-color: #B2BB1E !important; color: #FFFFFF !important; border: none !important; margin-left: 12px !important; }
        .fc-theme-standard td, .fc-theme-standard th { border-color: #F1F5F9 !important; }
        .dark .fc-theme-standard td, .dark .fc-theme-standard th { border-color: #374151 !important; }
        .fc-daygrid-day-number { color: #000000 !important; font-weight: 700 !important; }
        .dark .fc-daygrid-day-number { color: #FFFFFF !important; }
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
          color: #FFFFFF !important;
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