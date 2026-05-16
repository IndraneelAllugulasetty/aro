'use client';

import Link from 'next/link';

export function HeaderActions({ user }: { user: any }) {
  const handleLangReset = () => {
    document.cookie = "aro-lang=; path=/; max-age=0";
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleLangReset}
        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
        title="Change Language"
      >
        <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </button>
      {!user && (
        <>
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors"
          >
            Sign up
          </Link>
        </>
      )}
    </div>
  );
}
