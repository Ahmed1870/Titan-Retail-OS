export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center">
      <h1 className="text-3xl font-black mb-4">تم تسجيل متجرك بنجاح! 🚀</h1>
      <p className="text-zinc-400 max-w-md">يرجى مراجعة بريدك الإلكتروني وتفعيل الحساب للبدء في استخدام تايتان.</p>
      <a href="/auth/login" className="mt-6 text-blue-500 hover:underline text-sm">العودة لتسجيل الدخول</a>
    </div>
  )
}
