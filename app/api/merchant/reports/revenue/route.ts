export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { reportService } from '@/services';

export const GET = withAuth(['merchant', 'admin'], async (req: NextRequest, { tenant }: any) => {
  const days = Number(new URL(req.url).searchParams.get('days') ?? 30);
  const chart = await reportService.getRevenueChart(tenant.id, Math.min(days, 365));
  return NextResponse.json(chart);
});
