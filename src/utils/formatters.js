/**
 * Formats a 24-hour time string (HH:mm) to 12-hour format (h:mm AM/PM)
 * @param {string} time - The time string in 24-hour format
 * @returns {string} - The time string in 12-hour format
 */
export const formatTo12Hour = (time) => {
  if (!time) return "";
  
  // If it already has AM/PM, return as is
  if (time.toLowerCase().includes("am") || time.toLowerCase().includes("pm")) {
    return time;
  }
  
  try {
    const [hoursStr, minutesStr] = time.split(":");
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    
    if (isNaN(hours) || isNaN(minutes)) return time;

    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${hours12}:${formattedMinutes} ${period}`;
  } catch (e) {
    return time;
  }
};
