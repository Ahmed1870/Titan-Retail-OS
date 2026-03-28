const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.PROJECT_LINK_FINAL,
  process.env.PROJECT_KEY_PUBLIC
);

async function check() {
  const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
  if (error) {
    console.error('❌ خطأ في الاتصال: ', error.message);
  } else {
    console.log('✅ تم الاتصال بنجاح! عدد المستخدمين المسجلين:', data);
  }
}
check();
