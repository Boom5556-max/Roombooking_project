/**
 * Converts minutes from 00:00 to HH:mm format
 * @param {number} mins 
 * @returns {string} HH:mm
 */
export const minsToTime = (mins) => {
  if (mins === undefined || mins === null) return "";
  const h = Math.floor(mins / 60).toString().padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

/**
 * Converts HH:mm string to minutes from 00:00
 * @param {string} timeStr HH:mm
 * @returns {number} minutes
 */
export const timeToMins = (timeStr) => {
  if (!timeStr || !timeStr.includes(":")) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return (h * 60) + (m || 0);
};
/**
 * Generates all 30-minute time slots in a 24-hour day (00:00 to 23:30)
 * @returns {string[]}
 */
export const getAllDay30MinSlots = () => {
  const slots = [];
  for (let i = 0; i < 24; i++) {
    const h = i.toString().padStart(2, "0");
    slots.push(`${h}:00`);
    slots.push(`${h}:30`);
  }
  return slots;
};
