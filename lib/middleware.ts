import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { UserRole, User, Tenant } from '@/types';
import { ServiceError } from '@/services/errors';

type RouteContext = {
  user: User & { tenants: Tenant };
  tenant: Tenant;
};

type RouteHandler = (
  req: NextRequest,
  ctx: RouteContext,
  params?: any
) => Promise<NextResponse>;

export function withAuth(allowedRoles: UserRole[], handler: RouteHandler) {
  return async (req: NextRequest, { params }: { params?: any } = {}) => {
    try {
      // التصحيح الجوهري: نمرر الـ cookies كـ function
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ 
        cookies: () => cookieStore 
      });

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*, tenants(*)')
        .eq('id', session.user.id)
        .is('deleted_at', null)
        .single();

      if (userError || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 });
      }

      if (!allowedRoles.includes(user.role as UserRole)) {
        return NextResponse.json(
          { error: 'Forbidden', code: 'INSUFFICIENT_ROLE' },
          { status: 403 }
        );
      }

      // تحديث آخر ظهور (سيلنت)
      supabase.from('users').update({ last_seen_at: new Date().toISOString() }).eq('id', user.id);

      return await handler(req, { user: user as any, tenant: user.tenants as Tenant }, params);
    } catch (err) {
      if (err instanceof ServiceError) {
        return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
      }
      console.error('[API Error]', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

export function withWebhookAuth(handler: (req: NextRequest, body: unknown) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const signature = req.headers.get('x-webhook-signature');
      const secret = "Titan_System_Admin_2026";

      if (!signature || !secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.text();
      const expected = await crypto.subtle.sign(
        'HMAC',
        await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']),
        new TextEncoder().encode(body)
      );
      const expectedHex = Array.from(new Uint8Array(expected)).map(b => b.toString(16).padStart(2, '0')).join('');

      if (signature !== expectedHex) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }

      return handler(req, JSON.parse(body));
    } catch (e) {
      return NextResponse.json({ error: 'Invalid webhook request' }, { status: 400 });
    }
  };
}
