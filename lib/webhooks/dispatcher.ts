export async function dispatchWebhook(tenantId: string, event: string, payload: any) {
  // هذا الأكشن سيعمل في الخلفية (Background)
  // 1. جلب كافة الـ Webhooks النشطة لهذا التاجر
  // ملاحظة: نستخدم fetch لإرسال البيانات بصيغة JSON
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/webhooks?tenant_id=eq.${tenantId}&is_active=eq.true`, {
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });

  const hooks = await response.json();

  hooks.forEach(async (hook: any) => {
    try {
      await fetch(hook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Titan-Signature': hook.secret_key,
          'X-Titan-Event': event
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          event: event,
          data: payload
        })
      });
    } catch (e) {
      console.error(`Webhook failed for ${hook.url}`, e);
    }
  });
}
