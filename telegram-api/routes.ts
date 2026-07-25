import { Router, Request, Response } from 'express';
import { authenticateTelegramApi } from './middleware';

const router = Router();

/**
 * GET /telegram/health
 * Public verification endpoint to test API health and Express router on Vercel
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'ok',
    service: 'Telegram Bot API Bridge',
    timestamp: new Date().toISOString(),
  });
});

// Apply secret protection middleware to all data endpoints below
router.use(authenticateTelegramApi);

/**
 * GET /telegram/colleges
 */
router.get('/colleges', async (_req: Request, res: Response) => {
  res.json({
    success: true,
    count: 0,
    data: [],
    note: 'Phase 1 - Router working without Firebase',
  });
});

/**
 * GET /telegram/levels/:collegeId
 */
router.get('/levels/:collegeId', async (req: Request, res: Response) => {
  res.json({
    success: true,
    collegeId: req.params.collegeId,
    count: 0,
    data: [],
    note: 'Phase 1 - Router working without Firebase',
  });
});

/**
 * GET /telegram/courses/:levelId
 */
router.get('/courses/:levelId', async (req: Request, res: Response) => {
  res.json({
    success: true,
    levelId: req.params.levelId,
    count: 0,
    data: [],
    note: 'Phase 1 - Router working without Firebase',
  });
});

/**
 * GET /telegram/lectures/:courseId
 */
router.get('/lectures/:courseId', async (req: Request, res: Response) => {
  res.json({
    success: true,
    courseId: req.params.courseId,
    count: 0,
    data: [],
    note: 'Phase 1 - Router working without Firebase',
  });
});

/**
 * GET /telegram/files/:lectureId
 */
router.get('/files/:lectureId', async (req: Request, res: Response) => {
  res.json({
    success: true,
    lectureId: req.params.lectureId,
    count: 0,
    data: [],
    note: 'Phase 1 - Router working without Firebase',
  });
});

/**
 * GET /telegram/settings
 */
router.get('/settings', async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: null,
    note: 'Phase 1 - Router working without Firebase',
  });
});

export default router;
