import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
      {/* Hero Section */}
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
          Unlock the True Potential of <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Agricultural Land
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
          Aro connects unused agricultural spaces with passionate farmers and global investors to cultivate a sustainable and profitable future.
        </p>
      </div>

      {/* Pathways */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        
        {/* Landowner */}
        <div className="glass-panel p-8 flex flex-col items-center text-center space-y-4 hover:scale-105 transition-transform duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          </div>
          <h2 className="text-2xl font-bold">Landowner</h2>
          <p className="text-gray-400 text-sm flex-1">
            List your idle land and let our AI suggest the most profitable crops. Rent it out securely.
          </p>
          <Link href="/dashboard/landowner" className="w-full py-3 rounded-lg bg-white/10 hover:bg-emerald-500 hover:text-white border border-white/20 hover:border-emerald-500 transition-all font-semibold">
            List Land
          </Link>
        </div>

        {/* Farmer */}
        <div className="glass-panel p-8 flex flex-col items-center text-center space-y-4 hover:scale-105 transition-transform duration-300">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/50">
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
          </div>
          <h2 className="text-2xl font-bold">Farmer</h2>
          <p className="text-gray-400 text-sm flex-1">
            Discover vetted lands with AI-driven budget planning. Grow crops and sell yields to the platform.
          </p>
          <Link href="/dashboard/farmer" className="w-full py-3 rounded-lg bg-white/10 hover:bg-amber-500 hover:text-white border border-white/20 hover:border-amber-500 transition-all font-semibold">
            Find Land
          </Link>
        </div>

        {/* Investor */}
        <div className="glass-panel p-8 flex flex-col items-center text-center space-y-4 hover:scale-105 transition-transform duration-300">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          </div>
          <h2 className="text-2xl font-bold">Investor</h2>
          <p className="text-gray-400 text-sm flex-1">
            Invest in high-yield agricultural projects. Get returns when the harvest is sold.
          </p>
          <Link href="/dashboard/investor" className="w-full py-3 rounded-lg bg-white/10 hover:bg-blue-500 hover:text-white border border-white/20 hover:border-blue-500 transition-all font-semibold">
            Invest Now
          </Link>
        </div>

      </div>

    </div>
  );
}
