import path from 'path';
import { fileURLToPath } from 'url';
import { Request, Response } from 'express';
import { app } from './src/apiApp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // In development: attach Vite dev server as middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production: serve built assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    const express = (await import('express')).default;
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
    console.log(`\n======================================================`);
    console.log(`🚀 KormoAI Full-Stack Server Running on http://localhost:${PORT}`);
    console.log(`🔑 Gemini Status: ${hasKey ? 'ACTIVE (Server Key Loaded)' : 'FALLBACK SIMULATION (No key in .env)'}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`======================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
