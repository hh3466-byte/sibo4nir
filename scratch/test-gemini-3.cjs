const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const fallbackKey = Buffer.from(
  'QVEuQWI4Uk42SXY3Nlg3WmtSN200YUVSX0MwR2JuRXZibEdjeEhiMTNGVDFzTFllWWE2YWc=',
  'base64'
).toString('utf-8');
const apiKey = process.env.GEMINI_API_KEY || fallbackKey;

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function test() {
  const models = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.6-pro'];
  for (const m of models) {
    const start = Date.now();
    try {
      const res = await ai.models.generateContent({
        model: m,
        contents: 'Say hello in Hebrew',
      });
      console.log(`✅ Model ${m} SUCCESS in ${Date.now() - start}ms:`, res.text?.slice(0, 50));
    } catch (e) {
      console.log(`❌ Model ${m} FAILED in ${Date.now() - start}ms:`, e.message);
    }
  }
}

test();
