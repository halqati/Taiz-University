import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to authenticate Telegram Bot API requests via secret key.
 * Checks x-telegram-secret, x-api-key, Authorization header, or query param.
 */
export const authenticateTelegramApi = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const secret = process.env.TELEGRAM_API_SECRET || 'default_telegram_secret_key_2026';

  const providedSecret =
    req.headers['x-telegram-secret'] ||
    req.headers['x-api-key'] ||
    (typeof req.headers['authorization'] === 'string'
      ? req.headers['authorization'].replace(/^Bearer\s+/i, '')
      : null) ||
    req.query.secret ||
    req.query.api_key;

  if (!providedSecret || providedSecret !== secret) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or missing Telegram API Secret key.',
      message: 'يرجى تقديم المفتاح السري الصحيح للربط مع API البوت (Header: x-telegram-secret)',
    });
    return;
  }

  next();
};
