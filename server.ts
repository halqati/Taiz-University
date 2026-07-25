import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { telegramRouter } from './telegram-api/index';

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Mount Telegram API Router BEFORE Vite / Static middlewares
  app.use('/telegram', telegramRouter);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', storage: 'Firebase Firestore & Storage' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://0.0.0.0:${PORT} (Firebase integrated)`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
