import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API endpoint for Gemini C++ AI Tutor
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { question, codeContext } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an expert C++ professor and senior software engineer. The user is asking about the C++ Matrix Template program provided:
\`\`\`cpp
${codeContext}
\`\`\`

User question: ${question}

Provide a clear, concise, and educational response explaining C++ concepts (templates, fixed-size arrays, matrix multiplication algorithm, efficiency, or type safety). Use clean formatting and markdown.`,
    });
    res.json({ answer: response.text });
  } catch (error: any) {
    console.error('AI Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate AI response' });
  }
});

async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
