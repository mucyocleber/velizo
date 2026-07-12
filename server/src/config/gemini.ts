import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Default model for most AI features (fast, cost-effective)
export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
});

// Pro model for complex tasks (resume analysis, career coaching)
export const geminiProModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
});

export { genAI };
