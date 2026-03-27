# 🛡️ Titan-Retail OS v3.1 (Enterprise SaaS)
**Engineered by: Ahmed (The Engineer)**

## 🚀 نظرة عامة
نظام إدارة مبيعات (SaaS) متكامل مبني ليعمل بكفاءة على الأجهزة الضعيفة والموبايل (Termux Friendly).

## 🏗️ الهيكل التقني (Stack)
- **Framework:** Next.js 14/15 (App Router)
- **Database:** Supabase (PostgreSQL v16)
- **Auth:** Supabase Auth (Role-Based)
- **Styling:** Tailwind CSS (Minimalist Premium)

## 📡 الوحدات الأساسية (Core Modules)
1. **/merchant:** لوحة تحكم التاجر (المخزن، المبيعات، الموظفين).
2. **/admin:** لوحة التحكم العليا (الاشتراكات، العمولات، المراقبة).
3. **/store:** واجهة العرض للعملاء (السلة، الدفع، التتبع).
4. **/pos:** واجهة البيع السريع للكاشير (الباركود، الورديات).

## 🛠️ تعليمات التشغيل (Execution)
1. تنفيذ ملفات الـ SQL في `database/schema.sql`.
2. ضبط المتغيرات في `.env.local` (Supabase Keys).
3. تشغيل `npm install` ثم `npm run dev`.

---
*Generated for the Engineer's Deployment - 2026*
