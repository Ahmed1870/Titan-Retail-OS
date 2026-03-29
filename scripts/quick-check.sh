#!/bin/bash
# قراءة القيم من ملف .env.local
URL=$(grep PROJECT_LINK_FINAL .env.local | cut -d '=' -f2)
KEY=$(grep PROJECT_KEY_PUBLIC .env.local | cut -d '=' -f2)

echo "Connecting to: $URL"

# محاولة جلب عدد المستخدمين باستخدام REST API الخاص بسوبابيز
response=$(curl -s -X GET "$URL/rest/v1/users?select=count" \
-H "apikey: $KEY" \
-H "Authorization: Bearer $KEY")

if [[ $response == *"count"* ]]; then
  echo "✅ تم الاتصال بنجاح! الاستجابة: $response"
else
  echo "❌ فشل الاتصال. تأكد من المفاتيح في .env.local"
  echo "الرد من السيرفر: $response"
fi
