import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { productService } from '@/services';
import { validate, createProductSchema } from '@/lib/utils';

export const GET = withAuth(['merchant', 'admin'], async (req: NextRequest, { tenant }: any) => {
  const { searchParams } = new URL(req.url);
  const result = await productService.list(tenant.id, {
    category: searchParams.get('category') ?? undefined,
    search: searchParams.get('q') ?? undefined,
    page: Number(searchParams.get('page') ?? 1),
  });
  return NextResponse.json(result);
});

export const POST = withAuth(['merchant'], async (req: NextRequest, { user, tenant }: any) => {
  const body = validate(createProductSchema, await req.json());
  const data = await productService.create(tenant.id, user.id, body as any);
  return NextResponse.json(data, { status: 201 });
});
