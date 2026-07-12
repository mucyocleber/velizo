import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

export const notificationRoutes = Router();

// GET /api/notifications — Get user's notifications
notificationRoutes.get('/', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', req.user!.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
    return;
  }

  res.json({ success: true, data });
}));

// GET /api/notifications/unread-count — Get unread count
notificationRoutes.get('/unread-count', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { count, error } = await supabaseAdmin
    .from('notifications')
    .select('id', { count: 'exact' })
    .eq('user_id', req.user!.id)
    .eq('is_read', false);

  if (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
    return;
  }

  res.json({ success: true, data: { unreadCount: count || 0 } });
}));

// PUT /api/notifications/:id/read — Mark notification as read
notificationRoutes.put('/:id/read', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', req.user!.id);

  if (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
    return;
  }

  res.json({ success: true, message: 'Notification marked as read.' });
}));

// PUT /api/notifications/read-all — Mark all as read
notificationRoutes.put('/read-all', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', req.user!.id)
    .eq('is_read', false);

  if (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
    return;
  }

  res.json({ success: true, message: 'All notifications marked as read.' });
}));
