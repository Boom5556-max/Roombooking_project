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

    const isOwner = String(props.teacher_id) === String(currentUserId);
    const isStaff = String(currentUserRole || "").toLowerCase().trim() === "staff";
    const hasPermission = isOwner || isStaff;

    const shouldElevate = isCancelMode && isSchedule && hasPermission && !isClosed;
    const shouldRestore = isCancelMode && isSchedule && hasPermission && isClosed;

    const dotColor = isClosed
      ? "bg-gray-400"
      : isSchedule
        ? "bg-[#302782]"
        : "bg-[#B2BB1E]";

    return (
      <div
        className={`fc-event-inline-wrapper 
          ${shouldElevate ? "elevated-clean" : ""} 
          ${shouldRestore ? "elevated-restore" : ""}
          ${isClosed ? "is-closed" : ""}
          ${isCancelMode && isClosed && hasPermission ? "already-closed-active" : ""}`}
      >
        <span className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 ${dotColor}`}></span>
        <span className="fc-event-time-bold text-[9px] sm:text-[0.8rem] dark:text-white">{eventInfo.timeText}</span>
        <span className="fc-event-title-light text-[10px] sm:text-[0.85rem] dark:text-gray-100">
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
          // ปรับโครงสร้าง Toolbar ให้เหมาะกับมือถือ
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
          }}
          buttonText={{ today: "วันนี้", month: "เดือน", week: "สัปดาห์" }}
          eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
          eventContent={renderEventContent}
          dayMaxEvents={3} // จำกัดการแสดงผลบนจอเล็กไม่ให้ทะลัก
        />
      </div>

      <style>{`
        /* --- Responsive Typography --- */
        @media (max-width: 640px) {
          .fc .fc-toolbar-title { 
            font-size: 1.1rem !important; 
          }
          .fc .fc-button {
            padding: 4px 8px !important;
            font-size: 0.75rem !important;
          }
          .fc-event-inline-wrapper {
            padding: 2px 4px !important;
            gap: 4px !important;
          }
          .fc-daygrid-day-number {
            font-size: 0.75rem !important;
            padding: 4px !important;
          }
        }

        /* --- Event Base Styles --- */
        .fc-event-inline-wrapper { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          padding: 4px 10px; 
          width: 100%; 
          overflow: hidden; 
          border-radius: 8px;
          transition: all 0.2s ease; 
        }
        
        .fc-event-time-bold { 
          font-weight: 700; 
          white-space: nowrap; 
          color: inherit; 
        }
        .fc-event-title-light { 
          font-weight: 600; 
          overflow: hidden; 
          text-overflow: ellipsis; 
          white-space: nowrap; 
          color: inherit; 
        }

        .dark .fc-event-inline-wrapper:not(.is-closed):not(.elevated-clean):not(.elevated-restore) {
          color: #FFFFFF !important;
        }

        /* --- Special Status Classes --- */
        .is-closed {
          background-color: #F9FAFB !important; 
          color: #9CA3AF !important; 
          border: 1px solid #F3F4F6 !important;
        }
        .dark .is-closed {
          background-color: #374151 !important;
          color: #9CA3AF !important;
          border: 1px solid #4B5563 !important;
        }

        .elevated-clean {
          background-color: #FFFFFF !important;
          color: #302782 !important;
          border: 1.5px solid #302782 !important;
          z-index: 50 !important;
          box-shadow: 0 4px 12px rgba(48, 39, 130, 0.1) !important;
        }
        .dark .elevated-clean {
          background-color: #1F2937 !important;
          color: #FFFFFF !important;
          border-color: #B2BB1E !important;
        }

        .elevated-restore {
          background-color: #FFFFFF !important;
          border: 1.5px solid #B2BB1E !important; 
          z-index: 50 !important;
          box-shadow: 0 4px 12px rgba(178, 187, 30, 0.15) !important;
        }
        .dark .elevated-restore {
          background-color: #374151 !important;
          color: #9CA3AF !important;
          border-color: #B2BB1E !important;
        }

        /* Hide Default FC Backgrounds */
        .fc-h-event, .fc-v-event { 
          background: transparent !important; 
          border: none !important; 
        }
        
        ${isCancelMode ? `
          .fc-event:not(:has(.elevated-clean)):not(:has(.elevated-restore)) {
            opacity: 0.2;
            filter: grayscale(100%);
            pointer-events: none;
          }
        ` : ""}

        .fc .fc-toolbar-title { 
          font-weight: 700; 
          color: #302782; 
        }
        .dark .fc .fc-toolbar-title {
          color: #FFFFFF;
        }
        .fc .fc-button-primary { 
          background-color: #FFFFFF !important; 
          color: #6B7280 !important;
          border: 1px solid #E5E7EB !important; 
          border-radius: 10px !important; 
          font-weight: 600 !important;
          transition: all 0.2s;
        }
        .dark .fc .fc-button-primary {
          background-color: #374151 !important;
          color: #D1D5DB !important;
          border: 1px solid #4B5563 !important;
        }
        .fc .fc-button-primary:hover {
          border-color: #302782 !important;
          color: #302782 !important;
        }
        
        /* ขยับช่องว่างให้ปุ่ม < และ > ไม่ติดกัน รวมไปถึงปุ่ม เดือน/สัปดาห์ด้วย */
        .fc .fc-next-button,
        .fc .fc-timeGridWeek-button {
          margin-left: 8px !important;
        }

        /* ✅ แก้ไขส่วนนี้: บังคับให้ปุ่มที่ถูกเลือก (เดือน/สัปดาห์) มีตัวหนังสือสีขาวเสมอ */
        .fc .fc-button-primary.fc-button-active,
        .fc .fc-button-primary.fc-button-active:hover {
          background-color: #302782 !important;
          color: #FFFFFF !important;
          border-color: #302782 !important;
        }

        .dark .fc .fc-button-primary.fc-button-active,
        .dark .fc .fc-button-primary.fc-button-active:hover {
          background-color: #B2BB1E !important;
          color: #FFFFFF !important;
          border-color: #B2BB1E !important;
        }

        .fc .fc-today-button { 
          background-color: #B2BB1E !important; 
          color: #FFFFFF !important; 
          border: none !important;
          margin-left: 12px !important;
        }
        
        .fc-theme-standard td, .fc-theme-standard th { 
          border-color: #F1F5F9 !important; 
        }
        .dark .fc-theme-standard td, .dark .fc-theme-standard th {
          border-color: #374151 !important;
        }
        .fc-col-header-cell-cushion {
          color: #94A3B8 !important;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 10px 0 !important;
        }
        .dark .fc-col-header-cell {
          background-color: #1F2937 !important;
        }
        .fc-daygrid-day-number {
          color: #475569 !important;
          font-weight: 700 !important;
        }
        .dark .fc-daygrid-day-number {
          color: #D1D5DB !important;
        }
        .dark .fc-daygrid-day-frame {
          background-color: #1F2937;
        }
        .dark .fc-day-today .fc-daygrid-day-frame {
          background-color: #374151 !important;
        }
        .fc-daygrid-event-dot { 
          display: none !important; 
        }
        
        /* สไตล์ Scrollbar สำหรับ Chrome/Safari */
        .fc-scroller::-webkit-scrollbar {
          width: 4px;
        }
        .fc-scroller::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .fc-scroller::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default CalendarView;