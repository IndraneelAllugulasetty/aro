'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { resetPasswordMock } from '@/actions';

export default function ForgotPasswordPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await resetPasswordMock(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    });
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="glass-panel w-full max-w-md p-6">
        <h1 className="text-3xl font-bold">Reset Password</h1>
        <p className="text-gray-400 mt-2">Enter your email and a new password to reset it.</p>

        {success ? (
          <div className="mt-6 text-center space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-4 rounded-lg text-sm">
              Your password has been successfully reset!
            </div>
            <Link href="/login" className="inline-block py-3 px-6 bg-emerald-500 hover:bg-emerald-600 font-semibold rounded-lg transition-all text-white">
              Back to Login
            </Link>
          </div>
        ) : (
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
              <label className="block text-sm text-gray-400 mb-1">New Password</label>
              <input
                name="newPassword"
                type="password"
                required
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all mt-4"
            >
              {isPending ? 'Resetting...' : 'Reset Password'}
            </button>

            <p className="text-sm text-gray-400 mt-5 text-center">
              Remember your password?{' '}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold">
                Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
