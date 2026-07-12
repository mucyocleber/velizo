import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { asyncHandler } from '../middleware/errorHandler';

export const authRoutes = Router();

// POST /api/auth/register
authRoutes.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, fullName, role } = req.body;

  if (!email || !password || !fullName || !role) {
    res.status(400).json({
      success: false,
      error: { message: 'Email, password, full name, and role are required.' },
    });
    return;
  }

  const validRoles = ['candidate', 'employer', 'agency'];
  if (!validRoles.includes(role)) {
    res.status(400).json({
      success: false,
      error: { message: 'Role must be candidate, employer, or agency.' },
    });
    return;
  }

  // Create auth user in Supabase
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { full_name: fullName, role },
  });

  if (authError) {
    res.status(400).json({
      success: false,
      error: { message: authError.message },
    });
    return;
  }

  // Create profile record
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      role,
    });

  if (profileError) {
    console.error('Profile creation error:', profileError);
  }

  res.status(201).json({
    success: true,
    message: 'Account created successfully. Please verify your email.',
    data: {
      userId: authData.user.id,
      email: authData.user.email,
      role,
    },
  });
}));

// POST /api/auth/login
authRoutes.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      error: { message: 'Email and password are required.' },
    });
    return;
  }

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    res.status(401).json({
      success: false,
      error: { message: 'Invalid email or password.' },
    });
    return;
  }

  // Get user profile with role
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  res.json({
    success: true,
    data: {
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: profile?.full_name,
        role: profile?.role,
        avatarUrl: profile?.avatar_url,
      },
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      },
    },
  });
}));

// POST /api/auth/forgot-password
authRoutes.post('/forgot-password', asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({
      success: false,
      error: { message: 'Email is required.' },
    });
    return;
  }

  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    console.error('Password reset error:', error);
  }

  // Always return success to prevent email enumeration
  res.json({
    success: true,
    message: 'If an account exists with this email, a password reset link has been sent.',
  });
}));
