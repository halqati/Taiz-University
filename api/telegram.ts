import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { telegramRouter } from '../telegram-api/index';

const app = express();

app.use(cors());
app.use(express.json());

// Mount router on all potential rewrite paths
app.use('/telegram', telegramRouter);
app.use('/api/telegram', telegramRouter);
app.use('/', telegramRouter);

// Express global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Telegram API Serverless Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error in Serverless Function',
    details: err?.message || String(err),
  });
});

export default app;


