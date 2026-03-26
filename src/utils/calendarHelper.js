// 🚩 พารามิเตอร์เหมือนเดิม defaultRoomId/defaultRoomName รับมาจาก useCalendarData
export const formatCalendarEvents = (bookingsData, schedulesData, defaultRoomId = null, defaultRoomName = "") => {
  
  
  const getRoomColor = (roomId) => {
    if (!roomId || roomId === "ไม่ระบุเลขห้อง")
      return { bg: "#475569", border: "#334155" };

    const colorPalette = [
      { bg: "#3b82f6", border: "#2563eb" }, // Blue
      { bg: "#8b5cf6", border: "#7c3aed" }, // Purple
      { bg: "#ec4899", border: "#db2777" }, // Pink
      { bg: "#f97316", border: "#ea580c" }, // Orange
      { bg: "#14b8a6", border: "#0d9488" }, // Teal
      { bg: "#ef4444", border: "#dc2626" }, // Red
      { bg: "#0ea5e9", border: "#0284c7" }, // Sky Blue
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
    const months = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
    ];
    const [y, m, day] = dateStr.split("-");
    return `${parseInt(day)} ${months[parseInt(m) - 1]} ${parseInt(y) + 543}`;
  };

  const processItem = (item, type) => {
    const dateSource = item.date || item.booking_date || item.schedule_date;
    const d = new Date(dateSource);

    const rawDate = !isNaN(d.getTime())
      ? d.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" })
      : "Invalid Date";

    const isScheduleType = type === "schedule";

    const isClosed =
      isScheduleType &&
      (item.temporarily_closed === true ||
        item.temporarily_closed === 1 ||
        item.temporarily_closed === "1");

    const isUpload = isScheduleType;

    // 🚩 1. ดักจับ room_id สำรองเหมือนเดิม (แก้ไขเรื่องคลิกแล้วไม่มีเลขห้องใน Modal)
    // สาเหตุที่ภาพ 4 ขึ้น "ไม่ระบุเลขห้อง" เพราะ API ของหน้าแยกห้องไม่ได้ส่ง room_id มาในรายกิจกรรมครับ
    // โค้ดตรงนี้จะไปหยิบเลขห้องของหน้าที่เราเลือกอยู่มายัดใส่แทน รับรอง Modal มีเลขห้องแน่นอน!
    const finalRoomId = item.room_id || defaultRoomId || "ไม่ระบุเลขห้อง";
    const finalRoomName = item.room_name || defaultRoomName || finalRoomId;

    const roomPrefix = finalRoomName && finalRoomName !== "ไม่ระบุเลขห้อง" ? `[${finalRoomName}] ` : "";
    const originalTitle =
      type === "booking"
        ? item.purpose || "จองใช้ห้อง"
        : item.subject_name || "ตารางเรียนหลัก";

    const displayTitle = isClosed
      ? `(งดใช้ห้อง) ${roomPrefix}${originalTitle}`
      : `${roomPrefix}${originalTitle}`;

    const roomTheme = getRoomColor(finalRoomId);

    // 🚩 2. Logic แยกสีหน้ารวม vs หน้าแยกห้อง
    // เราใช้การมีตัวตนของ defaultRoomId เป็นตัวบอกว่านี่คือหน้า "แยกห้อง" ครับ
    const isRoomView = defaultRoomId !== null && defaultRoomId !== "";

    // กำหนดสีเริ่มต้น (เผื่อไว้)
    let finalBgColor = roomTheme.bg;
    let finalBorderColor = roomTheme.border;
    let finalTextColor = "#ffffff"; // หน้ารวมตัวหนังสือสีขาว

    if (isClosed) {
      // ถ้างดใช้ห้อง เป็นสีแดงเสมอทั้งสองหน้า
      finalBgColor = "#fee2e2";
      finalBorderColor = "#ef4444";
      finalTextColor = "#ef4444";
    } else if (isRoomView) {
      // 🚩 ถ้าเป็นหน้าแยกห้อง บังคับให้พื้นหลังเป็นสีขาว/ใส และตัวหนังสือเป็นสีดำ
      // เพื่อให้ได้ตามภาพที่ 3 (หน้าแยกห้องไม่มีแถบสี)
      finalBgColor = "transparent"; // หรือ "#ffffff" ถ้าอยากได้ขาวทึบ
      finalBorderColor = roomTheme.bg; // ให้ขอบเป็นสีตามห้องเดิม จะได้พอดูออก
      finalTextColor = "#111827"; // ตัวหนังสือสีดำเข้ม
    }
    // ถ้าไม่เข้าเงื่อนไขด้านบน (คือหน้ารวมปกติ) ก็จะใช้สีที่กำหนดไว้ตอนต้น (finalBgColor = roomTheme.bg)

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
        teacher_id: item.teacher_id,
        teacher:
          `${item.teacher_name || ""} ${item.teacher_surname || ""}`.trim() ||
          "ไม่ระบุผู้สอน",
        startTime: String(item.start_time || "00:00").substring(0, 5),
        endTime: String(item.end_time || "00:00").substring(0, 5),
        subjectName: item.subject_name,
        purpose: item.purpose,
        room_id: finalRoomId, // ส่งข้อมูลที่แก้ไขแล้วไปให้ Modal
        room_name: finalRoomName, // ส่งชื่อห้องที่แก้ไขแล้วไปให้ Modal ด้วย
        isRoomView: isRoomView, // ส่งสถานะไปบอกหน้า View
      },

      // ส่งสีที่คำนวณตาม Logic ด้านบนไปให้ FullCalendar
      backgroundColor: finalBgColor,
      borderColor: finalBorderColor,
      textColor: finalTextColor,
      borderWidth: isClosed || isRoomView ? "1.5px" : "1px", // ถ้าเป็นหน้าแยกห้องหรือปิดปรับปรุง ให้ขอบชัดนิดนึง
    };
  };

  const bookingEvents = (Array.isArray(bookingsData) ? bookingsData : [])
    .map((b) => processItem(b, "booking"))
    .filter((event) => !event.start.includes("Invalid Date"));

  const scheduleEvents = (Array.isArray(schedulesData) ? schedulesData : [])
    .map((s) => processItem(s, "schedule"))
    .filter((event) => !event.start.includes("Invalid Date"));

  return [...bookingEvents, ...scheduleEvents];
};