import { Router, Request, Response } from 'express';
import { geminiModel } from '../config/gemini';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

export const aiRoutes = Router();

// POST /api/ai/chat — AI Chat Assistant (Public)
aiRoutes.post('/chat', asyncHandler(async (req: Request, res: Response) => {
  const { message, context } = req.body;

  if (!message) {
    res.status(400).json({ success: false, error: { message: 'Message is required.' } });
    return;
  }

  const systemPrompt = `You are VELIZO AI Assistant, a helpful career and recruitment assistant for the VELIZO international recruitment platform. 

Your role:
- Help candidates find jobs, improve their profiles, and navigate their career
- Help employers with recruitment questions and hiring best practices
- Answer questions about the VELIZO platform features
- Provide career advice and industry insights

Guidelines:
- Be professional, friendly, and concise
- Give actionable advice
- If asked something outside your scope, politely redirect
- Never share personal data about other users

${context ? `Context: ${context}` : ''}`;

  try {
    const result = await geminiModel.generateContent([
      { text: systemPrompt },
      { text: message },
    ]);

    const response = result.response.text();

    res.json({
      success: true,
      data: { message: response },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: 'AI service temporarily unavailable. Please try again.' },
    });
  }
}));

// POST /api/ai/resume-analysis — AI Resume Analysis (Premium)
aiRoutes.post('/resume-analysis', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { resumeText, jobDescription } = req.body;

  if (!resumeText) {
    res.status(400).json({ success: false, error: { message: 'Resume text is required.' } });
    return;
  }

  const prompt = `You are an expert resume analyst and ATS (Applicant Tracking System) specialist. Analyze the following resume and provide a detailed assessment.

RESUME:
${resumeText}

${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}` : ''}

Provide your analysis in the following JSON format:
{
  "overallScore": <number 0-100>,
  "atsScore": <number 0-100>,
  "strengths": ["list of strengths"],
  "weaknesses": ["list of areas to improve"],
  "missingKeywords": ["keywords that should be added"],
  "formatSuggestions": ["formatting improvements"],
  "contentSuggestions": ["content improvements"],
  "summary": "brief overall assessment"
}

Return ONLY valid JSON, no markdown or extra text.`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the JSON response
    const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(cleanJson);

    res.json({ success: true, data: analysis });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: 'Resume analysis failed. Please try again.' },
    });
  }
}));

// POST /api/ai/career-coach — AI Career Coaching (Premium)
aiRoutes.post('/career-coach', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { question, userProfile } = req.body;

  if (!question) {
    res.status(400).json({ success: false, error: { message: 'Question is required.' } });
    return;
  }

  const prompt = `You are VELIZO Career Coach, an expert career advisor for international job seekers. Provide personalized, actionable career advice.

${userProfile ? `USER PROFILE:
- Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
- Experience: ${userProfile.experience || 'Not specified'}
- Education: ${userProfile.education || 'Not specified'}
- Target Role: ${userProfile.targetRole || 'Not specified'}
- Target Country: ${userProfile.targetCountry || 'Not specified'}` : ''}

USER QUESTION: ${question}

Provide clear, practical, and encouraging career advice. Include specific action steps when possible.`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = result.response.text();

    res.json({
      success: true,
      data: { advice: response },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: 'Career coaching service temporarily unavailable.' },
    });
  }
}));

// POST /api/ai/interview-prep — AI Interview Preparation (Premium)
aiRoutes.post('/interview-prep', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { jobTitle, jobDescription, questionType = 'mixed' } = req.body;

  if (!jobTitle) {
    res.status(400).json({ success: false, error: { message: 'Job title is required.' } });
    return;
  }

  const prompt = `You are an expert interview coach. Generate interview preparation material for the following position.

JOB TITLE: ${jobTitle}
${jobDescription ? `JOB DESCRIPTION: ${jobDescription}` : ''}
QUESTION TYPE: ${questionType} (options: technical, behavioral, mixed)

Generate 8 interview questions with detailed sample answers in this JSON format:
{
  "questions": [
    {
      "question": "the interview question",
      "type": "technical|behavioral|situational",
      "difficulty": "easy|medium|hard",
      "sampleAnswer": "a strong sample answer",
      "tips": "tips for answering well"
    }
  ],
  "generalTips": ["list of general interview tips for this role"]
}

Return ONLY valid JSON, no markdown or extra text.`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const prepData = JSON.parse(cleanJson);

    res.json({ success: true, data: prepData });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: 'Interview prep service temporarily unavailable.' },
    });
  }
}));
