/**
 * Format utilities
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

// Customize relative time strings
dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'a few seconds',
    m: '1 minute',
    mm: '%d minutes',
    h: '1 hour',
    hh: '%d hours',
    d: '1 day',
    dd: '%d days',
    M: '1 month',
    MM: '%d months',
    y: '1 year',
    yy: '%d years',
  },
});

/**
 * Format file size in bytes to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format date string to readable format with relative time
 * Uses dayjs for better parsing and formatting
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'Unknown date';

  const date = dayjs(dateString);
  
  if (!date.isValid()) {
    console.warn('Invalid date string:', dateString);
    return 'Invalid date';
  }

  const now = dayjs();
  const diffDays = now.diff(date, 'day');

  // Show relative time for recent dates (within 7 days)
  if (diffDays < 7) {
    return date.fromNow();
  }

  // For older dates, show formatted date
  return date.format('MMM D, YYYY');
};

/**
 * Format timestamp to readable format
 */
export const formatTimestamp = (timestamp: number): string => {
  return dayjs(timestamp).format('MMM D, YYYY h:mm A');
};
