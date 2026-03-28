"use client";
"use client";
'use client';
import { useEffect } from 'react';

export default function Toast({ message, type = 'error', onClose }: { message: string, type?: 'error' | 'success', onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = type === 'error' ? 'border-red-500/50 bg-red-900/20 text-red-400' : 'border-green-500/50 bg-green-900/20 text-green-400';

  return (
    <div className={\`fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-2xl border backdrop-blur-md shadow-2xl \${colors} animate-pulse\`}>
      <div className="flex items-center gap-3 font-bold text-sm">
        {message}
      </div>
    </div>
  );
}
