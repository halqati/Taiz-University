import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'ok',
  });
});

export const telegramRouter = router;
export default router;

