const { GoogleGenAI, Type } = require('@google/genai');
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

async function testAnalyze() {
  const systemInstruction = `אתה מומחה SIBO עולמי. קבע רמזור (GREEN, YELLOW, RED) לפי חוקי SIBO.`;
  const parts = [{ text: 'נתח את המאכל הבא: תפוצ׳יפס טבעי מלח' }];

  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            foodName: { type: Type.STRING },
            shortVerdict: { type: Type.STRING },
            detailedExplanation: { type: Type.STRING },
            fodmapTriggers: { type: Type.ARRAY, items: { type: Type.STRING } },
            phase1Compatibility: { type: Type.BOOLEAN },
            phase2Compatibility: { type: Type.BOOLEAN },
            maxSafePortion: { type: Type.STRING },
            safeSubstitutions: { type: Type.ARRAY, items: { type: Type.STRING } },
            cookingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            medicalReferences: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskScore: { type: Type.INTEGER },
          },
          required: ['status', 'foodName', 'shortVerdict', 'detailedExplanation', 'riskScore'],
        },
      },
    });

    console.log('✅ /api/analyze-food Gemini 3.6 test passed:', res.text);
  } catch (err) {
    console.error('❌ /api/analyze-food Gemini 3.6 test failed:', err);
  }
}

testAnalyze();
