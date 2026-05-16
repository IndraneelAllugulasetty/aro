import { signup } from '@/actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function SignupPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="glass-panel w-full max-w-md p-6">
        <h1 className="text-3xl font-bold">Create your account</h1>
        <p className="text-gray-400 mt-2">Pick your role and get started.</p>

        <form
          className="space-y-4 mt-6"
          action={async (formData) => {
            'use server';
            await signup(formData);
            redirect('/');
          }}
        >
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              name="name"
              required
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Your name"
            />
          </div>

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
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Role</label>
            <select
              name="role"
              required
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              defaultValue="LANDOWNER"
            >
              <option value="LANDOWNER">Landowner</option>
              <option value="FARMER">Farmer</option>
              <option value="INVESTOR">Investor</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 font-semibold rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all"
          >
            Sign up
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

