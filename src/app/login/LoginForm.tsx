'use client';

import { login } from '@/actions';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import Link from 'next/link';

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await login(formData);
      if (res.error) {
        setError(res.error);
      } else {
        router.push(nextPath);
      }
    });
  }

  return (
    <form className="space-y-4 mt-6" onSubmit={onSubmit}>
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm text-gray-400 mb-1">Email</label>
        <input
          name="email"
          type="email"
          required
          className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Password</label>
        <input
          name="password"
          type="password"
          required
          className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          placeholder="••••••••"
        />
        <div className="mt-2 text-right">
          <Link href="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300">
            Forgot password?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all"
      >
        {isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
