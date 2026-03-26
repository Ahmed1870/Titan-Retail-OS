export default function NotFound() {
  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-[#00ff88]">
      <h1 className="text-9xl font-black italic opacity-20">404</h1>
      <p className="text-xl uppercase italic tracking-widest -mt-10">System_Link_Severed</p>
      <a href="/" className="mt-8 px-6 py-2 border border-[#00ff88] hover:bg-[#00ff88] hover:text-black transition uppercase italic text-sm">Return_to_Core</a>
    </div>
  );
}
