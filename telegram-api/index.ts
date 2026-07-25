import telegramRouter from './routes.ts';
import { authenticateTelegramApi } from './middleware.ts';

export { telegramRouter, authenticateTelegramApi };
export default telegramRouter;
