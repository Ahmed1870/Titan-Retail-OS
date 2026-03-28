export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-black p-4">
      {children}
    </div>
  );
}
