import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

export const jobRoutes = Router();

// GET /api/jobs — Public: List all published jobs
jobRoutes.get('/', asyncHandler(async (req: Request, res: Response) => {
  const {
    page = '1',
    limit = '20',
    category,
    country,
    employment_type,
    experience_level,
    search,
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  let query = supabaseAdmin
    .from('jobs')
    .select('*, company_profiles(company_name, logo_url, country)', { count: 'exact' })
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range(offset, offset + limitNum - 1);

  if (category) query = query.eq('category', category);
  if (country) query = query.eq('country', country);
  if (employment_type) query = query.eq('employment_type', employment_type);
  if (experience_level) query = query.eq('experience_level', experience_level);
  if (search) query = query.ilike('title', `%${search}%`);

  const { data, count, error } = await query;

  if (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
    return;
  }

  res.json({
    success: true,
    data: {
      jobs: data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    },
  });
}));

// GET /api/jobs/:id — Public: Get single job
jobRoutes.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('jobs')
    .select('*, company_profiles(company_name, logo_url, country, industry, website)')
    .eq('id', id)
    .single();

  if (error || !data) {
    res.status(404).json({ success: false, error: { message: 'Job not found.' } });
    return;
  }

  res.json({ success: true, data });
}));

// POST /api/jobs — Employer: Create job
jobRoutes.post('/', authenticate, authorize('employer', 'agency', 'admin'), asyncHandler(async (req: Request, res: Response) => {
  const jobData = {
    ...req.body,
    employer_id: req.user!.id,
    status: 'draft',
  };

  const { data, error } = await supabaseAdmin
    .from('jobs')
    .insert(jobData)
    .select()
    .single();

  if (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
    return;
  }

  res.status(201).json({ success: true, data });
}));

// PUT /api/jobs/:id — Employer: Update job
jobRoutes.put('/:id', authenticate, authorize('employer', 'agency', 'admin'), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('jobs')
    .update(req.body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
    return;
  }

  res.json({ success: true, data });
}));

// DELETE /api/jobs/:id — Employer/Admin: Delete job
jobRoutes.delete('/:id', authenticate, authorize('employer', 'admin'), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('jobs')
    .delete()
    .eq('id', id);

  if (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
    return;
  }

  res.json({ success: true, message: 'Job deleted successfully.' });
}));
