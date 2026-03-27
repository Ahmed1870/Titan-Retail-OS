'use client';
import { useFormStatus } from 'react-dom';
import { signInAction } from '../actions/signIn';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      disabled={pending}
      className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
    >
      {pending ? 'AUTHENTICATING...' : 'LOG IN TO TITAN'}
    </button>
  );
}

export default function LoginForm() {
  return (
    <div className="max-w-md w-full mx-auto space-y-8 p-8 bg-[#0f171a] border border-slate-800 rounded-3xl">
      <div className="text-center">
        <h2 className="text-3xl font-black text-white tracking-tighter">WELCOME BACK</h2>
        <p className="text-slate-500 text-xs uppercase tracking-widest mt-2">Access your retail ecosystem</p>
      </div>

      <form action={signInAction} className="space-y-4">
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Email Address</label>
          <input 
            name="email" 
            type="email" 
            required 
            className="w-full bg-[#020617] border border-slate-800 p-4 rounded-xl text-white focus:border-emerald-500 outline-none transition-all"
          />
        </div>
        
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Password</label>
          <input 
            name="password" 
            type="password" 
            required 
            className="w-full bg-[#020617] border border-slate-800 p-4 rounded-xl text-white focus:border-emerald-500 outline-none transition-all"
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
