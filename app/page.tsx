import { redirect } from 'next/navigation';

export default function RootPage() {
  // الصفحة دي مش هتعمل حاجة غير إنها تودي المستخدم للـ dashboard
  // والـ Middleware هو اللي هيتأكد لو مسجل دخول ولا لأ
  redirect('/dashboard');
}
