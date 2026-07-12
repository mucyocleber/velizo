import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

export const candidateRoutes = Router();

// GET /api/candidates/profile — Get current candidate's profile
candidateRoutes.get('/profile', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      *,
      candidates(*),
      career_passports(*),
      education_records(*),
      employment_history(*),
      skills(*),
      certifications(*)
    `)
    .eq('id', req.user!.id)
    .single();

  if (error) {
    res.status(404).json({ success: false, error: { message: 'Profile not found.' } });
    return;
  }

  res.json({ success: true, data });
}));

// PUT /api/candidates/profile — Update candidate profile
candidateRoutes.put('/profile', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(req.body)
    .eq('id', req.user!.id)
    .select()
    .single();

  if (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
    return;
  }

  res.json({ success: true, data });
}));

// GET /api/candidates/applications — Get candidate's job applications
candidateRoutes.get('/applications', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('job_applications')
    .select('*, jobs(title, company_profiles(company_name, logo_url))')
    .eq('candidate_id', req.user!.id)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
    return;
  }

  res.json({ success: true, data });
}));

// POST /api/candidates/apply/:jobId — Apply for a job
candidateRoutes.post('/apply/:jobId', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const { resume_url, cover_letter } = req.body;

  // Check if already applied
  const { data: existing } = await supabaseAdmin
    .from('job_applications')
    .select('id')
    .eq('candidate_id', req.user!.id)
    .eq('job_id', jobId)
    .single();

  if (existing) {
    res.status(400).json({
      success: false,
      error: { message: 'You have already applied for this job.' },
    });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('job_applications')
    .insert({
      candidate_id: req.user!.id,
      job_id: jobId,
      resume_url,
      cover_letter,
      status: 'submitted',
    })
    .select()
    .single();

  if (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
    return;
  }

  res.status(201).json({ success: true, data });
}));
