import { Markup } from 'telegraf';
import { College, Level, Course, Lecture, LibraryFile } from '../../../src/types';
import { getFileTypeEmoji, formatFileSize } from '../utils/helpers';

/**
 * Inline Keyboards builder for the Telegram Bot navigation hierarchy
 */

/**
 * 1. Start / Main Menu Keyboard
 */
export function getStartKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📚 تصفح الكليات والمواد', 'nav:colleges')],
  ]);
}

/**
 * 2. Colleges Keyboard
 */
export function getCollegesKeyboard(colleges: College[]) {
  const buttons = colleges.map((c) => [
    Markup.button.callback(`🏛️ ${c.name}`, `col:${c.id}`),
  ]);

  return Markup.inlineKeyboard(buttons);
}

/**
 * 3. Levels Keyboard for a College
 */
export function getLevelsKeyboard(levels: Level[], collegeId: string) {
  const buttons = levels.map((l) => [
    Markup.button.callback(`🎓 ${l.name}`, `lvl:${l.id}:${collegeId}`),
  ]);

  // Back button
  buttons.push([Markup.button.callback('⬅️ رجوع للكليات', 'nav:colleges')]);

  return Markup.inlineKeyboard(buttons);
}

/**
 * 4. Courses Keyboard for a Level
 */
export function getCoursesKeyboard(courses: Course[], levelId: string, collegeId: string) {
  const buttons = courses.map((c) => [
    Markup.button.callback(
      `📘 ${c.name}${c.code ? ` (${c.code})` : ''}`,
      `crs:${c.id}:${levelId}:${collegeId}`
    ),
  ]);

  // Back button
  buttons.push([Markup.button.callback('⬅️ رجوع للمستويات', `col:${collegeId}`)]);

  return Markup.inlineKeyboard(buttons);
}

/**
 * 5. Lectures Keyboard for a Course
 */
export function getLecturesKeyboard(lectures: Lecture[], courseId: string, levelId: string) {
  const buttons = lectures.map((l) => [
    Markup.button.callback(
      `🎥 #${l.lectureOrder || 1} - ${l.title}`,
      `lec:${l.id}:${courseId}:${levelId}`
    ),
  ]);

  // Back button
  buttons.push([Markup.button.callback('⬅️ رجوع للمواد', `lvl:${levelId}:back`)]);

  return Markup.inlineKeyboard(buttons);
}

/**
 * 6. Files Keyboard for a Lecture
 */
export function getFilesKeyboard(files: LibraryFile[], lectureId: string, courseId: string) {
  const buttons = files.map((f) => {
    const emoji = getFileTypeEmoji(f.type);
    const size = formatFileSize(f.sizeBytes);
    return [
      Markup.button.callback(
        `${emoji} ${f.name} [${f.type} - ${size}]`,
        `file:${f.id}:${lectureId}:${courseId}`
      ),
    ];
  });

  // Back button
  buttons.push([Markup.button.callback('⬅️ رجوع للمحاضرات', `crs:${courseId}:back:back`)]);

  return Markup.inlineKeyboard(buttons);
}

/**
 * 7. Single File Detail & Download Keyboard
 */
export function getFileDetailKeyboard(file: LibraryFile, lectureId: string) {
  const buttons = [];

  // Direct download / open link button
  if (file.downloadUrl || file.url) {
    buttons.push([
      Markup.button.url('📥 فتح / تنزيل الملف المباشر', file.downloadUrl || file.url),
    ]);
  }

  // Back button
  buttons.push([Markup.button.callback('⬅️ رجوع قائمة الملفات', `lec:${lectureId}:back:back`)]);

  return Markup.inlineKeyboard(buttons);
}
