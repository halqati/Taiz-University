import { Router, Request, Response } from 'express';
import { authenticateTelegramApi } from './middleware';
import {
  getActiveColleges,
  getActiveLevelsByCollege,
  getActiveCoursesByLevel,
  getActiveLecturesByCourse,
  getActiveFilesByLecture,
  getTelegramBotSettings,
} from './services';

const router = Router();

// Apply secret protection middleware to all telegram API endpoints
router.use(authenticateTelegramApi);

/**
 * GET /telegram/health
 * Verification endpoint to test API secret and connection status
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'ok',
    service: 'Telegram Bot API Bridge',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /telegram/colleges
 * Returns active, non-deleted colleges only.
 */
router.get('/colleges', async (_req: Request, res: Response) => {
  try {
    const colleges = await getActiveColleges();
    res.json({
      success: true,
      count: colleges.length,
      data: colleges,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'فشل جلب قائمة الكليات من قاعدة البيانات',
      details: error.message || String(error),
    });
  }
});

/**
 * GET /telegram/levels/:collegeId
 * Returns active, non-deleted levels for a specific college.
 */
router.get('/levels/:collegeId', async (req: Request, res: Response) => {
  const { collegeId } = req.params;
  if (!collegeId) {
    res.status(400).json({
      success: false,
      error: 'معرف الكلية (collegeId) مطلوب',
    });
    return;
  }

  try {
    const levels = await getActiveLevelsByCollege(collegeId);
    res.json({
      success: true,
      collegeId,
      count: levels.length,
      data: levels,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'فشل جلب المستويات الدراسية للكلية',
      details: error.message || String(error),
    });
  }
});

/**
 * GET /telegram/courses/:levelId
 * Returns active, non-deleted courses for a specific level.
 */
router.get('/courses/:levelId', async (req: Request, res: Response) => {
  const { levelId } = req.params;
  if (!levelId) {
    res.status(400).json({
      success: false,
      error: 'معرف المستوى الدراسي (levelId) مطلوب',
    });
    return;
  }

  try {
    const courses = await getActiveCoursesByLevel(levelId);
    res.json({
      success: true,
      levelId,
      count: courses.length,
      data: courses,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'فشل جلب المواد الدراسية للمستوى',
      details: error.message || String(error),
    });
  }
});

/**
 * GET /telegram/lectures/:courseId
 * Returns active, non-deleted lectures for a specific course.
 */
router.get('/lectures/:courseId', async (req: Request, res: Response) => {
  const { courseId } = req.params;
  if (!courseId) {
    res.status(400).json({
      success: false,
      error: 'معرف المادة (courseId) مطلوب',
    });
    return;
  }

  try {
    const lectures = await getActiveLecturesByCourse(courseId);
    res.json({
      success: true,
      courseId,
      count: lectures.length,
      data: lectures,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'فشل جلب المحاضرات للمادة',
      details: error.message || String(error),
    });
  }
});

/**
 * GET /telegram/files/:lectureId
 * Returns active, non-deleted files and download URLs for a specific lecture.
 */
router.get('/files/:lectureId', async (req: Request, res: Response) => {
  const { lectureId } = req.params;
  if (!lectureId) {
    res.status(400).json({
      success: false,
      error: 'معرف المحاضرة (lectureId) مطلوب',
    });
    return;
  }

  try {
    const files = await getActiveFilesByLecture(lectureId);
    res.json({
      success: true,
      lectureId,
      count: files.length,
      data: files,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'فشل جلب الملفات والمرفقات للمحاضرة',
      details: error.message || String(error),
    });
  }
});

/**
 * GET /telegram/settings
 * Returns Telegram Bot configuration & texts (welcome message, channels, support)
 */
router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await getTelegramBotSettings();
    res.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'فشل جلب إعدادات البوت',
      details: error.message || String(error),
    });
  }
});

export default router;
