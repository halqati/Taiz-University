import { apiClient } from '../api/client';
import {
  getStartKeyboard,
  getCollegesKeyboard,
  getLevelsKeyboard,
  getCoursesKeyboard,
  getLecturesKeyboard,
  getFilesKeyboard,
  getFileDetailKeyboard,
} from '../keyboards/inlineKeyboards';
import { getFileTypeEmoji, formatFileSize } from '../utils/helpers';

/**
 * Service encapsulating Telegram Bot flow logic
 */
export class BotService {
  /**
   * Render Start Welcome Message
   */
  async getStartResponse() {
    const settings = await apiClient.getSettings();
    const welcomeMsg = settings?.welcomeMessage ||
      'أهلاً بك في البوت الأكاديمي الشامل! 🎓\n\nيمكنك تصفح المواد الدراسية، المحاضرات، وتنزيل الملخصات والملفات المرفقة مباشرة.';

    const supportInfo = settings?.supportContact ? `\n\n💬 للدعم والتواصل: ${settings.supportContact}` : '';
    const channel = settings?.channelUsername || settings?.requiredChannels?.[0];
    const channelInfo = channel ? `\nقناة الأخبار: ${channel.startsWith('@') ? channel : `@${channel}`}` : '';

    return {
      text: `${welcomeMsg}${supportInfo}${channelInfo}`,
      keyboard: getStartKeyboard(),
    };
  }

  /**
   * Render Colleges List
   */
  async getCollegesResponse() {
    const colleges = await apiClient.getColleges();
    if (colleges.length === 0) {
      return {
        text: '⚠️ لا توجد كليات نشطة حالياً في المكتبة.',
        keyboard: getStartKeyboard(),
      };
    }

    return {
      text: '🏛️ **الكليات المتاحة**\nيرجى اختيار الكلية لتصفح المستويات الدراسية:',
      keyboard: getCollegesKeyboard(colleges),
    };
  }

  /**
   * Render Levels List for a College
   */
  async getLevelsResponse(collegeId: string) {
    const levels = await apiClient.getLevels(collegeId);
    if (levels.length === 0) {
      return {
        text: '⚠️ لا توجد مستويات دراسية مسجلة لهذه الكلية حالياً.',
        keyboard: getCollegesKeyboard(await apiClient.getColleges()),
      };
    }

    return {
      text: '🎓 **المستويات الدراسية**\nاختر المستوى الدراسي المطلوب:',
      keyboard: getLevelsKeyboard(levels, collegeId),
    };
  }

  /**
   * Render Courses List for a Level
   */
  async getCoursesResponse(levelId: string, collegeId: string) {
    const courses = await apiClient.getCourses(levelId);
    if (courses.length === 0) {
      return {
        text: '⚠️ لا توجد مواد دراسية مضافة لهذا المستوى حتى الآن.',
        keyboard: getLevelsKeyboard(await apiClient.getLevels(collegeId), collegeId),
      };
    }

    return {
      text: '📘 **المواد الدراسية**\nاختر المادة لتصفح المحاضرات والملحقات:',
      keyboard: getCoursesKeyboard(courses, levelId, collegeId),
    };
  }

  /**
   * Render Lectures List for a Course
   */
  async getLecturesResponse(courseId: string, levelId: string) {
    const lectures = await apiClient.getLectures(courseId);
    if (lectures.length === 0) {
      return {
        text: '⚠️ لا توجد محاضرات مرفوعة لهذه المادة حالياً.',
        keyboard: getCoursesKeyboard(await apiClient.getCourses(levelId), levelId, ''),
      };
    }

    return {
      text: '🎥 **فهرس المحاضرات**\nاختر المحاضرة لعرض المرفقات والملفات:',
      keyboard: getLecturesKeyboard(lectures, courseId, levelId),
    };
  }

  /**
   * Render Files List for a Lecture
   */
  async getFilesResponse(lectureId: string, courseId: string) {
    const files = await apiClient.getFiles(lectureId);
    if (files.length === 0) {
      return {
        text: '⚠️ لا توجد ملفات أو ملخصات مرفقة لهذه المحاضرة حتى الآن.',
        keyboard: getLecturesKeyboard(await apiClient.getLectures(courseId), courseId, ''),
      };
    }

    return {
      text: '📁 **ملحقات المحاضرة**\nاضغط على اسم الملف لمعاينته أو تنزيله مباشرة:',
      keyboard: getFilesKeyboard(files, lectureId, courseId),
    };
  }

  /**
   * Process File Delivery or Detail Response
   */
  async getFileDetail(fileId: string, lectureId: string) {
    const files = await apiClient.getFiles(lectureId);
    const file = files.find((f) => f.id === fileId);

    if (!file) {
      throw new Error('الملف المطلوب غير موجود أو تم تحويله للأرشيف.');
    }

    const emoji = getFileTypeEmoji(file.type);
    const sizeStr = formatFileSize(file.sizeBytes);

    const caption = `${emoji} **${file.name}**\n\n📌 **النوع:** ${file.type}\n📦 **الحجم:** ${sizeStr}\n🔗 **الرابط:** ${file.downloadUrl || file.url}`;

    return {
      file,
      caption,
      keyboard: getFileDetailKeyboard(file, lectureId),
    };
  }
}

export const botService = new BotService();
