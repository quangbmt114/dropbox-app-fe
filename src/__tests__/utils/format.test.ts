import { describe, it, expect } from 'vitest';
import { formatFileSize, formatDate, formatDuration } from '@/utils/format';

describe('formatFileSize', () => {
  it('should format bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });

  it('should handle custom decimals', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(2048)).toBe('2 KB');
  });
});

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const formatted = formatDate(date.toISOString());
    expect(formatted).toMatch(/Jan 15, 2024/);
  });

  it('should handle date strings', () => {
    const formatted = formatDate('2024-01-15');
    expect(formatted).toContain('2024');
  });
});

describe('formatDuration', () => {
  it('should format seconds', () => {
    expect(formatDuration(30)).toBe('30s');
    expect(formatDuration(59)).toBe('59s');
  });

  it('should format minutes', () => {
    expect(formatDuration(60)).toBe('1m 0s');
    expect(formatDuration(90)).toBe('1m 30s');
  });

  it('should format hours', () => {
    expect(formatDuration(3600)).toBe('1h 0m');
    expect(formatDuration(3661)).toBe('1h 1m');
  });
});
