import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Google GenAI client (following skill guidelines)
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('[Server] Google GenAI initialized successfully.');
  } catch (err) {
    console.error('[Server] Failed to initialize Google GenAI:', err);
  }
} else {
  console.log('[Server] No GEMINI_API_KEY detected. AI simulator will provide fallback responses.');
}

// API: Live Gemini Chat / Ask endpoint for the simulator
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!ai) {
      // Offline/Fallback simulation response
      return res.json({
        reply: `🤖 <b>Simulated Gemini 2.5 Flash Response</b>\n\n` +
          `Here is what the bot answered:\n\n` +
          `• <b>Query Analyzed:</b> "${prompt.slice(0, 60)}..."\n` +
          `• <b>Model:</b> <code>gemini-2.5-flash</code>\n` +
          `• <b>Execution:</b> Processed in non-blocking ThreadPoolExecutor\n\n` +
          `<i>Note: Attach your <code>GEMINI_API_KEY</code> in Secrets to test real-time cloud responses!</i>`,
        isSimulated: true,
      });
    }

    const defaultInstruction =
      systemInstruction ||
      'You are an ultra-fast, helpful AI assistant embedded in a Telegram Bot. Answer clearly using clean Telegram HTML formatting (<b>bold</b>, <code>code</code>, bullet points). Keep your answer structured, insightful, and concise.';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: defaultInstruction,
      },
    });

    const reply = response.text || 'I could not generate an answer for this prompt.';
    return res.json({ reply, isSimulated: false });
  } catch (error: any) {
    console.error('[Server] Gemini generation error:', error);
    return res.status(500).json({
      error: error?.message || 'Error communicating with Gemini model',
    });
  }
});

// API: Get production files for the inspector
app.get('/api/files', (req, res) => {
  try {
    const fileNames = ['bot.py', 'requirements.txt', '.env.example', 'Dockerfile', 'Procfile', 'README.md'];
    const files = fileNames.map((name) => {
      const filePath = path.join(__dirname, name);
      if (fs.existsSync(filePath)) {
        return {
          name,
          content: fs.readFileSync(filePath, 'utf-8'),
        };
      }
      return { name, content: '' };
    });
    res.json({ files });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite Middleware integration
async function setupServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Server] Server listening on http://0.0.0.0:${port}`);
  });
}

setupServer().catch((err) => {
  console.error('[Server] Startup error:', err);
});
