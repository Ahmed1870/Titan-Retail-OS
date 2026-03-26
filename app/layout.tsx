import './globals.css'
export const metadata = { title: 'TITAN-RETAIL OS', description: 'Industrial SaaS' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark bg-black">
      <body className="antialiased selection:bg-[#00ff88] selection:text-black">
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}
