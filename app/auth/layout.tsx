'use client'
import { useState } from 'react';
import LoginForm from '@/modules/auth/components/LoginForm';
import SignUpForm from '@/modules/auth/components/SignUpForm';
import ForgotPasswordForm from '@/modules/auth/components/ForgotPasswordForm';
import ResetPasswordForm from '@/modules/auth/components/ResetPasswordForm';
import Toast from '@/modules/shared/components/Toast';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [activeForm, setActiveForm] = useState<'login'|'signup'|'forgot'|'reset'>('login');
  const [toast, setToast] = useState<{msg:string,type:'success'|'error'}|null>(null);

  const renderForm = () => {
    switch(activeForm) {
      case 'login': return <LoginForm />;
      case 'signup': return <SignUpForm />;
      case 'forgot': return <ForgotPasswordForm />;
      case 'reset': return <ResetPasswordForm />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-black p-4">
      <div className="w-full max-w-2xl p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl relative overflow-hidden">
        {renderForm()}
        <div className="absolute top-4 right-4 space-x-2 text-xs text-zinc-400">
          <button onClick={()=>setActiveForm('login')}>Login</button>
          <button onClick={()=>setActiveForm('signup')}>Signup</button>
          <button onClick={()=>setActiveForm('forgot')}>Forgot</button>
          <button onClick={()=>setActiveForm('reset')}>Reset</button>
        </div>
      </div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
    </div>
  );
}
