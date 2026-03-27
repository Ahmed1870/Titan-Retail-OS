export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { auditService } from '@/services';

export const GET = withAuth(['admin'], async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const logs = await auditService.getLogs({
    tenantId: searchParams.get('tenant_id') ?? undefined,
    resourceType: searchParams.get('resource_type') ?? undefined,
    page: Number(searchParams.get('page') ?? 1),
  });
  return NextResponse.json(logs);
});
