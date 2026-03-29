const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val) env[key.trim()] = val.join('=').trim();
});

console.log("🔍 فحص الاتصال...");
console.log("📏 طول المفتاح الخاص:", env.PROJECT_KEY_PRIVATE?.length);

const supabase = createClient(env.PROJECT_LINK_FINAL, env.PROJECT_KEY_PRIVATE);

async function check() {
    const { data, error } = await supabase.from('tenants').select('count').single();
    if (error) {
        console.error("❌ فشل:", error.message);
    } else {
        console.log("✅ نجاح باهر! الاتصال سليم تماماً.");
        console.log("🚀 فاضل كود واحد: vercel --prod");
    }
}
check();
