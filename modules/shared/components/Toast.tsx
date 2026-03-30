'use client'
import { useEffect } from 'react';

export default function Toast({ message, type = 'error', onClose }: { message: string, type?: 'error' | 'success', onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = type === 'error' 
    ? { border: 'border-red-500/20', bg: 'bg-red-500/10', icon: '✕', color: 'text-red-400' }
    : { border: 'border-green-500/20', bg: 'bg-green-500/10', icon: '✓', color: 'text-green-400' };

  return (
    <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[9999] animate-slide-up`}>
      <div className={`flex items-center gap-4 px-6 py-4 rounded-full border ${config.border} ${config.bg} backdrop-blur-2xl shadow-2xl`}>
        <span className={`flex items-center justify-center w-6 h-6 rounded-full ${config.color} border border-current text-[10px] font-bold`}>
          {config.icon}
        </span>
        <span className={`text-sm font-bold tracking-tight ${config.color}`}>{message}</span>
        <button onClick={onClose} className="ml-4 text-white/20 hover:text-white transition-colors">✕</button>
      </div>
    </div>
  );
}
