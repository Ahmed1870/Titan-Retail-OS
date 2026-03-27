export default function SignUpSuccess() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white shadow rounded-lg">
        <h1 className="text-2xl font-bold text-green-600">تم إنشاء الحساب بنجاح!</h1>
        <p className="mt-4 text-gray-600">يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب.</p>
        <a href="/signin" className="mt-6 inline-block text-blue-600 hover:underline">
          الانتقال لصفحة تسجيل الدخول
        </a>
      </div>
    </div>
  );
}
