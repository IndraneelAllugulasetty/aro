import Link from 'next/link';
import { LoginForm } from './LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const next = sp.next && sp.next.startsWith('/') ? sp.next : '/';

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="glass-panel w-full max-w-md p-6">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-gray-400 mt-2">Login to your Aro account.</p>

        <LoginForm nextPath={next} />

        <p className="text-sm text-gray-400 mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

