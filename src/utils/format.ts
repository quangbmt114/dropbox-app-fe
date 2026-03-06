/**
 * Format utilities
 */

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

// Extend dayjs with plugins
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

// Customize relative time strings
dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "a few seconds",
    m: "1 minute",
    mm: "%d minutes",
    h: "1 hour",
    hh: "%d hours",
    d: "1 day",
    dd: "%d days",
    M: "1 month",
    MM: "%d months",
    y: "1 year",
    yy: "%d years",
  },
});

/**
 * Format file size in bytes to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Format date string to readable format with relative time
 * Uses dayjs for better parsing and formatting
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return "Unknown date";

  const date = dayjs(dateString);

  if (!date.isValid()) {
    console.warn("Invalid date string:", dateString);
    return "Invalid date";
  }

  const now = dayjs();
  const diffDays = now.diff(date, "day");

  // Show relative time for recent dates (within 7 days)
  if (diffDays < 7) {
    return date.fromNow();
  }

  // For older dates, show formatted date
  return date.format("MMM D, YYYY");
};

/**
 * Format timestamp to readable format
 */
export const formatTimestamp = (timestamp: number): string => {
  return dayjs(timestamp).format("MMM D, YYYY h:mm A");
};

/**
 * Format duration in seconds to human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "2m 35s", "1h 5m")
 *
 * @example
 * formatDuration(45);      // "45s"
 * formatDuration(125);     // "2m 5s"
 * formatDuration(3725);    // "1h 2m"
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds || seconds < 0) return "0s";

  const dur = dayjs.duration(seconds, "seconds");

  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const mins = dur.minutes();
    const secs = dur.seconds();
    return `${mins}m ${secs}s`;
  } else {
    const hours = dur.hours();
    const mins = dur.minutes();
    return `${hours}h ${mins}m`;
  }
};

/**
 * Format duration as HH:MM:SS
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "01:02:35")
 */
export const formatDurationClock = (seconds: number): string => {
  if (!seconds || seconds < 0) return "00:00:00";

  const dur = dayjs.duration(seconds, "seconds");
  const hours = String(dur.hours()).padStart(2, "0");
  const mins = String(dur.minutes()).padStart(2, "0");
  const secs = String(dur.seconds()).padStart(2, "0");

  return `${hours}:${mins}:${secs}`;
};

/**
 * Format relative time from now
 * @param date - Date string or Date object
 * @returns Relative time string (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  return dayjs(date).fromNow();
};

/**
 * Format elapsed time since a start time
 * @param startTime - Start timestamp in milliseconds
 * @returns Formatted duration string
 */
export const formatElapsedTime = (startTime: number): string => {
  const elapsed = (Date.now() - startTime) / 1000;
  return formatDuration(elapsed);
};
