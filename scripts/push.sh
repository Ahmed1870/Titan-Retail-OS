#!/bin/bash
echo "📤 جاري تجهيز ورفع TITAN إلى GitHub..."

# 1. تنظيف الكاش والملفات الزائدة
rm -rf .next
find . -name ".DS_Store" -type f -delete
find . -name "*.log" -type f -delete

# 2. التأكد من وجود Git
if [ ! -d .git ]; then
    echo "Initializing Git..."
    git init
    git remote add origin https://github.com/Ahmed-Ahmoxi/titan-retail-os.git 2>/dev/null
fi

# 3. إضافة التعديلات
git add .

# 4. تسجيل التعديلات (Commit) بوصف احترافي
git commit -m "feat: implement multi-tenant core, RLS security, and finance logic refactoring"

# 5. الرفع للفرع الرئيسي
git branch -M main
git push -u origin main

echo "✅ تم الرفع بنجاح إلى GitHub!"
