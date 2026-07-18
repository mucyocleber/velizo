import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ukwrryamwqaevgqnchfq.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  try {
    const { email, password, fullName, role, companyName } = await request.json();

    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Email, password, full name, and role are required.' },
        { status: 400 }
      );
    }

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    // Initialize Supabase admin client using the service role key to bypass SMTP confirmation mail
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Create user with email_confirm: true
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: role,
        ...(role === 'employer' && companyName ? { company_name: companyName } : {})
      }
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account created and verified successfully.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role
      }
    });
  } catch (err: any) {
    console.error('Registration API error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
