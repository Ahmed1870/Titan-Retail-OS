#!/bin/bash
echo "🔄 جاري مزامنة الأسطول مع السحاب..."
git pull origin main --rebase

echo "🚀 جاري تجهيز الملفات للرفع..."
git add .

# طلب رسالة التحديث
read -p "ما هو توصيف هذا التعديل؟: " message
git commit -m "$message"

echo "📤 جاري الرفع إلى GitHub..."
git push origin main

if [ $? -eq 0 ]; then
  echo "✅ تم الرفع بنجاح يا هندسة!"
else
  echo "❌ فشل الرفع، تأكد من اتصال الإنترنت أو إعدادات الصلاحيات."
fi
