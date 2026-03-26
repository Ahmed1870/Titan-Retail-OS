import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// إنشاء نسخة واحدة للتعامل مع قاعدة البيانات
export const supabase = createClientComponentClient();

export const checkSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};
