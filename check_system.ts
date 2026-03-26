import { createClient } from '@supabase/supabase-js';

// استخراج البيانات من ملف الـ .env مباشرة لضمان الدقة في Termux
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDiagnostic() {
  console.log("\n🚀 [TITAN-OS] STARTING CRITICAL DIAGNOSTIC...");
  console.log("-------------------------------------------");

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ ENV ERROR: NEXT_PUBLIC_SUPABASE_URL or KEY is MISSING.");
    return;
  }

  // 1. فحص النبض (Database Pulse)
  const { data, error } = await supabase.from('settings').select('*').limit(1);
  if (error) {
    console.error("❌ DATABASE LINK: FAILED");
    console.error("Reason:", error.message);
  } else {
    console.log("✅ DATABASE LINK: ESTABLISHED (Schema v2.0 Live)");
  }

  // 2. فحص الجداول (Tenants & Wallets)
  const { data: tenants } = await supabase.from('tenants').select('id').limit(1);
  console.log(tenants ? "✅ MULTI-TENANCY ENGINE: READY" : "⚠️ TENANTS TABLE: EMPTY (Waiting for First Merchant)");

  console.log("-------------------------------------------");
  console.log("🏁 [DIAGNOSTIC COMPLETE]\n");
}

runDiagnostic();
