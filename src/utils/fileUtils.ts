/**
 * File Utils
 * Helper functions for file type detection and formatting
 */

// File type categories
export const FILE_TYPES = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
  VIDEO: ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'],
  AUDIO: ['mp3', 'wav', 'ogg', 'aac', 'm4a'],
  PDF: ['pdf'],
  DOCUMENT: ['doc', 'docx', 'txt', 'rtf'],
  SPREADSHEET: ['xls', 'xlsx', 'csv'],
  PRESENTATION: ['ppt', 'pptx'],
  ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz'],
  CODE: ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'java', 'cpp', 'c'],
} as const;

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  if (!filename || typeof filename !== 'string') return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Check if file is an image
 */
export function isImage(filename: string): boolean {
  if (!filename) return false;
  const ext = getFileExtension(filename);
  return FILE_TYPES.IMAGE.includes(ext as any);
}

/**
 * Check if file is a video
 */
export function isVideo(filename: string): boolean {
  if (!filename) return false;
  const ext = getFileExtension(filename);
  return FILE_TYPES.VIDEO.includes(ext as any);
}

/**
 * Check if file is audio
 */
export function isAudio(filename: string): boolean {
  if (!filename) return false;
  const ext = getFileExtension(filename);
  return FILE_TYPES.AUDIO.includes(ext as any);
}

/**
 * Check if file is a PDF
 */
export function isPDF(filename: string): boolean {
  if (!filename) return false;
  const ext = getFileExtension(filename);
  return FILE_TYPES.PDF.includes(ext as any);
}

/**
 * Check if file is previewable (image, video, audio, pdf)
 */
export function isPreviewable(filename: string): boolean {
  return isImage(filename) || isVideo(filename) || isAudio(filename) || isPDF(filename);
}

/**
 * Get file type category
 */
export function getFileType(filename: string): string {
  if (!filename) return 'file';
  const ext = getFileExtension(filename);

  if (FILE_TYPES.IMAGE.includes(ext as any)) return 'image';
  if (FILE_TYPES.VIDEO.includes(ext as any)) return 'video';
  if (FILE_TYPES.AUDIO.includes(ext as any)) return 'audio';
  if (FILE_TYPES.PDF.includes(ext as any)) return 'pdf';
  if (FILE_TYPES.DOCUMENT.includes(ext as any)) return 'document';
  if (FILE_TYPES.SPREADSHEET.includes(ext as any)) return 'spreadsheet';
  if (FILE_TYPES.PRESENTATION.includes(ext as any)) return 'presentation';
  if (FILE_TYPES.ARCHIVE.includes(ext as any)) return 'archive';
  if (FILE_TYPES.CODE.includes(ext as any)) return 'code';

  return 'file';
}

/**
 * Get appropriate icon for file type
 */
export function getFileIcon(filename: string): string {
  const type = getFileType(filename);

  const iconMap: Record<string, string> = {
    image: 'FiImage',
    video: 'FiVideo',
    audio: 'FiMusic',
    pdf: 'FiFileText',
    document: 'FiFileText',
    spreadsheet: 'FiGrid',
    presentation: 'FiLayout',
    archive: 'FiArchive',
    code: 'FiCode',
    file: 'FiFile',
  };

  return iconMap[type] || 'FiFile';
}

/**
 * Get file type color
 */
export function getFileColor(filename: string): string {
  const type = getFileType(filename);

  const colorMap: Record<string, string> = {
    image: 'purple.500',
    video: 'red.500',
    audio: 'pink.500',
    pdf: 'red.600',
    document: 'blue.500',
    spreadsheet: 'green.500',
    presentation: 'orange.500',
    archive: 'gray.500',
    code: 'cyan.500',
    file: 'gray.400',
  };

  return colorMap[type] || 'gray.400';
}
