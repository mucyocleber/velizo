import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

export const employerRoutes = Router();

// GET /api/employers/dashboard — Employer dashboard stats
employerRoutes.get('/dashboard', authenticate, authorize('employer'), asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  // Get counts in parallel
  const [jobsResult, applicationsResult] = await Promise.all([
    supabaseAdmin.from('jobs').select('id', { count: 'exact' }).eq('employer_id', userId),
    supabaseAdmin.from('job_applications').select('id, status', { count: 'exact' })
      .in('job_id', (await supabaseAdmin.from('jobs').select('id').eq('employer_id', userId)).data?.map(j => j.id) || []),
  ]);

  res.json({
    success: true,
    data: {
      totalJobs: jobsResult.count || 0,
      totalApplications: applicationsResult.count || 0,
      shortlisted: applicationsResult.data?.filter(a => a.status === 'shortlisted').length || 0,
      interviews: applicationsResult.data?.filter(a => a.status === 'interview').length || 0,
    },
  });
}));

// GET /api/employers/company — Get employer's company profile
employerRoutes.get('/company', authenticate, authorize('employer'), asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('company_profiles')
    .select('*')
    .eq('employer_id', req.user!.id)
    .single();

  if (error) {
    res.status(404).json({ success: false, error: { message: 'Company profile not found.' } });
    return;
  }

  res.json({ success: true, data });
}));

// POST /api/employers/company — Create company profile
employerRoutes.post('/company', authenticate, authorize('employer'), asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('company_profiles')
    .insert({ ...req.body, employer_id: req.user!.id })
    .select()
    .single();

  if (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
    return;
  }

  res.status(201).json({ success: true, data });
}));

// PUT /api/employers/company — Update company profile
employerRoutes.put('/company', authenticate, authorize('employer'), asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('company_profiles')
    .update(req.body)
    .eq('employer_id', req.user!.id)
    .select()
    .single();

  if (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
    return;
  }

  res.json({ success: true, data });
}));

// GET /api/employers/applications — Get applications for employer's jobs
employerRoutes.get('/applications', authenticate, authorize('employer'), asyncHandler(async (req: Request, res: Response) => {
  const { job_id, status } = req.query;

  // Get employer's job IDs
  const { data: jobs } = await supabaseAdmin
    .from('jobs')
    .select('id')
    .eq('employer_id', req.user!.id);

  const jobIds = jobs?.map(j => j.id) || [];

  let query = supabaseAdmin
    .from('job_applications')
    .select('*, profiles(full_name, email, avatar_url), jobs(title)')
    .in('job_id', jobIds)
    .order('created_at', { ascending: false });

  if (job_id) query = query.eq('job_id', job_id);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;

  if (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
    return;
  }

  res.json({ success: true, data });
}));

// PUT /api/employers/applications/:id/status — Update application status
employerRoutes.put('/applications/:id/status', authenticate, authorize('employer'), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, feedback } = req.body;

  const validStatuses = ['reviewing', 'shortlisted', 'interview', 'offered', 'hired', 'rejected'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ success: false, error: { message: 'Invalid status.' } });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('job_applications')
    .update({ status, employer_feedback: feedback })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
    return;
  }

  res.json({ success: true, data });
}));
