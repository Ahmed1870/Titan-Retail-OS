'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()
  const links = [
    { name: 'Terminal', path: '/dashboard' },
    { name: 'Inventory', path: '/dashboard/inventory' },
    { name: 'Orders', path: '/dashboard/orders' },
    { name: 'Wallet', path: '/dashboard/wallet' }
  ]

  return (
    <nav className="w-64 border-r border-white/5 h-screen p-6 space-y-8 sticky top-0 bg-black">
      <div className="text-[#00ff88] font-black italic tracking-tighter text-2xl uppercase border-b border-[#00ff88]/20 pb-4">
        Titan_OS
      </div>
      <div className="space-y-2">
        {links.map(link => (
          <Link key={link.path} href={link.path} className={`block p-3 rounded-lg font-mono text-xs uppercase italic ${pathname === link.path ? 'bg-[#00ff88] text-black font-black' : 'text-gray-500 hover:text-white'}`}>
            // {link.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}
