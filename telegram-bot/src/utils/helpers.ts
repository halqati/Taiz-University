/**
 * Helper utility functions for Telegram Bot formatting and callbacks
 */

/**
 * Format bytes into human-readable string (KB, MB, GB)
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return 'حجم غير محدد';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get emoji corresponding to file type
 */
export function getFileTypeEmoji(type?: string): string {
  switch (type?.toUpperCase()) {
    case 'PDF':
      return '📄';
    case 'VIDEO':
      return '🎬';
    case 'ZIP':
      return '📦';
    case 'DOCX':
      return '📝';
    default:
      return '📎';
  }
}

/**
 * Escape MarkdownV2 characters if needed
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  return text.trim();
}
