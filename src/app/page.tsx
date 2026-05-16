import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions';

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const role = user.role.toLowerCase();
  
  if (role === 'admin') {
    redirect('/admin');
  }

  if (role === 'landowner') {
    redirect('/dashboard/landowner');
  }

  if (role === 'farmer') {
    redirect('/dashboard/farmer');
  }

  if (role === 'investor') {
    redirect('/dashboard/investor');
  }

  redirect(`/dashboard/${role}`);
}
