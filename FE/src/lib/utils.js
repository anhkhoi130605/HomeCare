import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a .NET TimeSpan string (like "09:00:00" or "1.01:30:00") into a human-readable AM/PM format.
 * Correctly handles spans that cross multiple days.
 */
export function formatTimeSpan(timeStr) {
  if (!timeStr) return '--:--';

  // Check if it's already in a readable format (contains AM/PM)
  if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;

  // Handle TimeSpan format "d.HH:mm:ss" or "HH:mm:ss"
  let hours = 0;
  let minutes = "00";

  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    const hourPart = parts[0]; // Could be "HH" or "d.HH"
    if (hourPart.includes('.')) {
      const dayHour = hourPart.split('.');
      const days = parseInt(dayHour[0]) || 0;
      const hh = parseInt(dayHour[1]) || 0;
      hours = days * 24 + hh;
    } else {
      hours = parseInt(hourPart) || 0;
    }
    minutes = parts[1];

    const ampm = (hours % 24) >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes} ${ampm}`;
  }
  return timeStr;
}

/**
 * Formats a Date object to 'YYYY-MM-DD' in local time.
 * Avoids off-by-one errors caused by .toISOString().
 */
export function formatDateToYYYYMMDD(date) {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}