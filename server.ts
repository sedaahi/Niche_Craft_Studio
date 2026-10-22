import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  const resendApiKey = process.env.RESEND_API_KEY;
  const resend = resendApiKey ? new Resend(resendApiKey) : null;

  // Endpoint to send transactional emails via Resend
  app.post('/api/send-email', async (req, res) => {
    try {
      const { to, subject, html, type, orderNumber } = req.body;
      if (!to || !subject || !html) {
        return res.status(400).json({ error: 'to, subject, and html are required.' });
      }

      if (resend) {
        const response = await resend.emails.send({
          from: 'Niche Craft Studio <onboarding@resend.dev>',
          to,
          subject,
          html,
        });
        console.log(`[Server Resend] Sent ${type} email to ${to}:`, response);
        return res.json({ success: true, id: response.data?.id || 're_ok', simulated: false });
      } else {
        const simulatedId = 're_sim_' + Math.random().toString(36).substring(2, 10);
        console.log(`[Server Resend (Simulated)] Dispatched ${type} email to ${to} (${subject})`);
        return res.json({
          success: true,
          id: simulatedId,
          simulated: true,
          message: 'RESEND_API_KEY tanımlanmadığı için e-posta simülasyon modunda başarıyla iletildi.',
        });
      }
    } catch (error: any) {
      console.error('[Server Resend Error]:', error);
      return res.status(500).json({ error: error.message || 'Failed to send email' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Niche Craft Studio API',
      resendConfigured: Boolean(resendApiKey),
      time: new Date().toISOString(),
    });
  });

  // Vite integration in dev, static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`> Niche Craft Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
