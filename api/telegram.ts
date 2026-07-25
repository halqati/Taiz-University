import express from 'express';
import cors from 'cors';
import { telegramRouter } from '../telegram-api/index.ts';

const app = express();

app.use(cors());
app.use(express.json());

// Mount the router on both /telegram and / to handle Vercel serverless function rewrites
app.use('/telegram', telegramRouter);
app.use('/', telegramRouter);

export default app;
