import { getRoomColor } from './roomColors.js';

// 🚩 พารามิเตอร์เหมือนเดิม defaultRoomId/defaultRoomName รับมาจาก useCalendarData
export const formatCalendarEvents = (bookingsData, schedulesData, defaultRoomId = null, defaultRoomName = "") => {

  const processItem = (item, type) => {
    
    if (type === "booking" && (item.status === "pending" || item.status === "rejected")) {
        return null;
    }

    const itemRoomId = item.room_id ? String(item.room_id).trim() : null;
    const defRoomId = defaultRoomId ? String(defaultRoomId).trim() : null;
    const finalRoomId = itemRoomId || defRoomId || "ไม่ระบุเลขห้อง";
    const finalRoomName = item.room_name || defaultRoomName || finalRoomId;

    const dateSource = item.date || item.booking_date || item.schedule_date;
    const d = new Date(dateSource);
    const rawDate = !isNaN(d.getTime())
        ? d.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" })
        : (dateSource ? String(dateSource).split('T')[0] : "Invalid Date");

    const isScheduleType = type === "schedule";
    const isScheduleClosed = isScheduleType && (item.temporarily_closed === true || item.temporarily_closed === 1 || item.temporarily_closed === "1");
    const isBookingClosed = type === "booking" && (item.status === "cancel" || item.status === "cancelled"); 
    const isClosed = isScheduleClosed || isBookingClosed;
    
    const isRoomView = defRoomId !== null && defRoomId !== "" && defRoomId !== "undefined";
    const isUploadItem = item.is_upload === 1 || item.is_upload === true || item.source === 'excel';

    const roomPrefix = (finalRoomName && finalRoomName !== "ไม่ระบุเลขห้อง" && !isRoomView) ? `${finalRoomName} ` : "";
    const courseCodePrefix = item.course_code ? `${item.course_code} ` : "";
    const prefix = type === "booking" ? roomPrefix : courseCodePrefix;
    
    const originalTitle = type === "booking" ? (item.purpose || "จองใช้ห้อง") : (item.subject_name || "ตารางเรียนหลัก");
    const displayTitle = isClosed ? `(งดใช้ห้อง) ${prefix}${originalTitle}` : `${prefix}${originalTitle}`;

    const roomTheme = getRoomColor(finalRoomId);
    let finalBgColor = roomTheme.bg;
    let finalBorderColor = roomTheme.border;
    let eventClasses = []; 

    if (isClosed) {
        finalBgColor = "rgba(239, 68, 68, 0.15)"; 
        finalBorderColor = "#ef4444";
        eventClasses.push("!text-red-700 dark:!text-red-300 font-medium");
    }
    // 🔴 เอาเงื่อนไข isRoomView ออกไปแล้ว เพื่อให้มันใช้ finalBgColor ที่เป็นสีห้องตามปกติ

    const eventData = {
        id: type === "booking" ? item.booking_id : item.schedule_id,
        title: displayTitle,
        start: `${rawDate}T${item.start_time || "00:00:00"}`,
        end: `${rawDate}T${item.end_time || "00:00:00"}`,
        extendedProps: {
            ...item,
            type: type,
            isSchedule: isScheduleType,
            temporarily_closed: isClosed,
            room_id: finalRoomId, 
            room_name: finalRoomName,
            isRoomView: isRoomView,
            isUpload: isUploadItem,
            displayDate: rawDate, 
            booking_date: type === "booking" ? rawDate : item.booking_date,
            schedule_date: type === "schedule" ? rawDate : item.schedule_date,
            date: rawDate
        },
        backgroundColor: finalBgColor,
        borderColor: finalBorderColor,
        className: eventClasses.join(" "), 
        // 🔴 ปล่อย textColor เป็นค่าว่าง เพื่อให้ Tailwind จัดการโหมดสว่าง/มืดแทน
    };

    return eventData;
  };

  const bookingEvents = (Array.isArray(bookingsData) ? bookingsData : [])
    .map((b) => processItem(b, "booking"))
    .filter((event) => event !== null && event.start && !event.start.includes("Invalid Date"));

  const scheduleEvents = (Array.isArray(schedulesData) ? schedulesData : [])
    .map((s) => processItem(s, "schedule"))
    .filter((event) => event !== null && event.start && !event.start.includes("Invalid Date"));

  return [...bookingEvents, ...scheduleEvents];
};