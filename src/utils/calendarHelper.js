// 🚩 พารามิเตอร์เหมือนเดิม defaultRoomId/defaultRoomName รับมาจาก useCalendarData
export const formatCalendarEvents = (bookingsData, schedulesData, defaultRoomId = null, defaultRoomName = "") => {
  
  const getRoomColor = (roomId) => {
    if (!roomId || roomId === "ไม่ระบุเลขห้อง")
      return { bg: "#475569", border: "#334155" };

    const colorPalette = [
      { bg: "#3b82f6", border: "#2563eb" }, { bg: "#8b5cf6", border: "#7c3aed" },
      { bg: "#ec4899", border: "#db2777" }, { bg: "#f97316", border: "#ea580c" },
      { bg: "#14b8a6", border: "#0d9488" }, { bg: "#ef4444", border: "#dc2626" },
      { bg: "#0ea5e9", border: "#0284c7" },
    ];

    let hash = 0;
    const str = String(roomId);
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorPalette.length;
    return colorPalette[index];
  };

  const formatThaiDate = (dateStr) => {
    if (!dateStr || dateStr === "Invalid Date") return "ไม่ระบุวันที่";
    try {
      const months = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
      ];
      const parts = dateStr.split("-");
      if (parts.length !== 3) return dateStr;
      const [y, m, day] = parts;
      return `${parseInt(day)} ${months[parseInt(m) - 1]} ${parseInt(y) + 543}`;
    } catch (e) { return dateStr; }
  };

  const processItem = (item, type) => {
    // 🚩 1. ล้างข้อมูล ID ให้สะอาด (Trim ช่องว่าง) เพื่อให้ matching เจอ
    const itemRoomId = item.room_id ? String(item.room_id).trim() : null;
    const defRoomId = defaultRoomId ? String(defaultRoomId).trim() : null;
    
    // 🚩 2. Logic สำคัญ: ถ้าเลือกดูรายห้อง (isRoomView) แต่ item ไม่มี room_id ให้ยัดค่าใส่ให้เลย
    const finalRoomId = itemRoomId || defRoomId || "ไม่ระบุเลขห้อง";
    const finalRoomName = item.room_name || defaultRoomName || finalRoomId;

    const dateSource = item.date || item.booking_date || item.schedule_date;
    const d = new Date(dateSource);

    // ปรับปรุงการอ่านวันที่ให้ยืดหยุ่นขึ้น
    const rawDate = !isNaN(d.getTime())
      ? d.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" })
      : (dateSource ? String(dateSource).split('T')[0] : "Invalid Date");

    const isScheduleType = type === "schedule";
    const isClosed = isScheduleType && (item.temporarily_closed === true || item.temporarily_closed === 1 || item.temporarily_closed === "1");
    const isUpload = isScheduleType;

    // 🚩 3. เช็คว่าเป็นหน้าแยกห้องหรือไม่ (ถ้า defRoomId มีค่า แปลว่าอยู่หน้าแยกห้อง)
    const isRoomView = defRoomId !== null && defRoomId !== "" && defRoomId !== "undefined";

    const roomPrefix = (finalRoomName && finalRoomName !== "ไม่ระบุเลขห้อง" && !isRoomView) ? `[${finalRoomName}] ` : "";
    const originalTitle = type === "booking" ? (item.purpose || "จองใช้ห้อง") : (item.subject_name || "ตารางเรียนหลัก");
    const displayTitle = isClosed ? `(งดใช้ห้อง) ${roomPrefix}${originalTitle}` : `${roomPrefix}${originalTitle}`;

    const roomTheme = getRoomColor(finalRoomId);
    let finalBgColor = roomTheme.bg;
    let finalBorderColor = roomTheme.border;
    let finalTextColor = "#ffffff";

    if (isClosed) {
      finalBgColor = "#fee2e2"; finalBorderColor = "#ef4444"; finalTextColor = "#ef4444";
    } else if (isRoomView) {
      finalBgColor = "transparent";
      finalBorderColor = roomTheme.bg;
      finalTextColor = "#111827";
    }

    return {
      id: type === "booking" ? item.booking_id : item.schedule_id,
      title: displayTitle,
      start: `${rawDate}T${item.start_time || "00:00:00"}`,
      end: `${rawDate}T${item.end_time || "00:00:00"}`,
      extendedProps: {
        type: type,
        isSchedule: isScheduleType,
        fullDate: formatThaiDate(rawDate),
        temporarily_closed: isClosed,
        isUpload: isUpload, 
        teacher: `${item.teacher_name || ""} ${item.teacher_surname || ""}`.trim() || "ไม่ระบุผู้สอน",
        startTime: String(item.start_time || "00:00").substring(0, 5),
        endTime: String(item.end_time || "00:00").substring(0, 5),
        subjectName: item.subject_name,
        purpose: item.purpose,
        room_id: finalRoomId, 
        room_name: finalRoomName,
        isRoomView: isRoomView,
      },
      backgroundColor: finalBgColor,
      borderColor: finalBorderColor,
      textColor: finalTextColor,
      borderWidth: isClosed || isRoomView ? "1.5px" : "1px",
    };
  };

  const bookingEvents = (Array.isArray(bookingsData) ? bookingsData : [])
    .map((b) => processItem(b, "booking"))
    .filter((event) => event.start && !event.start.includes("Invalid Date"));

  const scheduleEvents = (Array.isArray(schedulesData) ? schedulesData : [])
    .map((s) => processItem(s, "schedule"))
    .filter((event) => event.start && !event.start.includes("Invalid Date"));

  return [...bookingEvents, ...scheduleEvents];
};