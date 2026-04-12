// 🎨 ฟังก์ชันกลางสำหรับดึงสีประจำห้อง (ใช้ร่วมกันทั้ง Calendar และ ManageBooking)
export const getRoomColor = (roomId) => {
  if (!roomId || roomId === "ไม่ระบุเลขห้อง")
    return { bg: "#475569", border: "#334155" };

  const colorPalette = [
    { bg: "#3b82f6", border: "#2563eb" }, // blue
    { bg: "#8b5cf6", border: "#7c3aed" }, // violet
    { bg: "#ec4899", border: "#db2777" }, // pink
    { bg: "#f97316", border: "#ea580c" }, // orange
    { bg: "#14b8a6", border: "#0d9488" }, // teal
    { bg: "#ef4444", border: "#dc2626" }, // red
    { bg: "#0ea5e9", border: "#0284c7" }, // sky
  ];

  // ระบบ Hash จะสุ่มสีให้แต่ละห้องอัตโนมัติ และได้สีเดิมเสมอสำหรับห้องเดิม
  let hash = 0;
  const str = String(roomId);
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
};
