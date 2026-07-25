import express, { Request, Response } from 'express';
import cors from 'cors';
import { telegramRouter } from '../telegram-api/index';

const app = express();

app.use(cors());
app.use(express.json());

// Mount the router on all potential paths passed by Vercel rewrites
app.use('/telegram', telegramRouter);
app.use('/api/telegram', telegramRouter);
app.use('/', telegramRouter);

// Export default Vercel serverless function handler
export default function handler(req: Request, res: Response) {
  return app(req, res);
}
