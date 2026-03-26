import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { tenant_id, customer_name, customer_phone, items, total_amount } = await req.json();

    // 1. إنشاء الطلب الأساسي
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{ tenant_id, total_amount, status: 'PENDING' }])
      .select().single();

    if (orderError) throw orderError;

    // 2. تسجيل تفاصيل الطلب (Items)
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_purchase: item.price
    }));

    await supabaseAdmin.from('order_items').insert(orderItems);

    return NextResponse.json({ success: true, order_id: order.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
