import {
  adminDeleteMessage,
  adminListLands,
  adminListMessages,
  adminListUsers,
  adminMarketOverview,
  adminRecentActivity,
  adminSetLandStatus,
  adminSetUserRole,
  adminSetUserVerified,
  getCurrentUser,
} from '@/actions';
import { redirect } from 'next/navigation';

function money(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

export default async function AdminPage() {
  const me = await getCurrentUser();
  if (!me) redirect('/login?next=/admin');
  if (me.role !== 'ADMIN') redirect('/');

  const [overview, activity, users, lands, messages] = await Promise.all([
    adminMarketOverview(),
    adminRecentActivity(),
    adminListUsers(),
    adminListLands(),
    adminListMessages(),
  ]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-indigo-400">
          Admin
        </h1>
        <p className="text-gray-400 mt-2">
          Track marketplace health, verify users, and moderate content.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Market overview</h2>
          <p className="text-sm text-gray-500">Live snapshot</p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="glass-card p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Users</p>
            <p className="text-3xl font-bold mt-2">{overview.users.total}</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Lands</p>
            <p className="text-3xl font-bold mt-2">{overview.lands.total}</p>
            <p className="text-xs text-gray-500 mt-2">
              {overview.lands.available} available • {overview.lands.rented} rented • {overview.lands.suspended} suspended
            </p>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Paid investments</p>
            <p className="text-3xl font-bold mt-2">{money(overview.investments.paidAmount)}</p>
            <p className="text-xs text-gray-500 mt-2">{overview.investments.paidCount} payments</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Paid payouts</p>
            <p className="text-3xl font-bold mt-2">{money(overview.payouts.paidAmount)}</p>
            <p className="text-xs text-gray-500 mt-2">{overview.payouts.paidCount} transfers</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Recent activity</h2>
          <p className="text-sm text-gray-500">Last 10 events per stream</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="glass-panel p-4">
            <h3 className="font-semibold mb-3">Payments</h3>
            <div className="space-y-2 text-sm">
              {activity.recentPayments.length === 0 ? (
                <p className="text-gray-500 italic">No payments yet.</p>
              ) : (
                activity.recentPayments.map((p) => (
                  <div key={p.id} className="bg-black/30 border border-white/10 rounded-xl p-3">
                    <p className="text-xs text-gray-500">
                      {new Date(p.createdAt).toLocaleString()} • <span className="text-gray-300">{p.status}</span>
                    </p>
                    <p className="mt-1 font-semibold">{money(p.amount)} ({p.currency.toUpperCase()})</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {p.investor.name} → {p.land.name}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel p-4">
            <h3 className="font-semibold mb-3">Investments</h3>
            <div className="space-y-2 text-sm">
              {activity.recentInvestments.length === 0 ? (
                <p className="text-gray-500 italic">No investments yet.</p>
              ) : (
                activity.recentInvestments.map((inv) => (
                  <div key={inv.id} className="bg-black/30 border border-white/10 rounded-xl p-3">
                    <p className="text-xs text-gray-500">
                      {new Date(inv.createdAt).toLocaleString()} • <span className="text-gray-300">{inv.status}</span>
                    </p>
                    <p className="mt-1 font-semibold">{money(inv.amount)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {inv.investor.name} → {inv.land.name}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel p-4">
            <h3 className="font-semibold mb-3">Farm updates</h3>
            <div className="space-y-2 text-sm">
              {activity.recentUpdates.length === 0 ? (
                <p className="text-gray-500 italic">No updates yet.</p>
              ) : (
                activity.recentUpdates.map((u) => (
                  <div key={u.id} className="bg-black/30 border border-white/10 rounded-xl p-3">
                    <p className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleString()}</p>
                    <p className="mt-1 font-semibold">{u.title}</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{u.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Land: <span className="text-gray-300">{u.land.name}</span> (owner {u.land.owner.name})
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold">User verification</h2>
          <p className="text-sm text-gray-500">{users.length} total</p>
        </div>

        <div className="glass-panel p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-400">
              <tr className="border-b border-white/10">
                <th className="text-left font-semibold py-2">User</th>
                <th className="text-left font-semibold py-2">Email</th>
                <th className="text-left font-semibold py-2">Role</th>
                <th className="text-left font-semibold py-2">Verified</th>
                <th className="text-left font-semibold py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatarUrl || '/vercel.svg'}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover border border-white/10"
                      />
                      <div>
                        <div className="font-semibold">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-gray-300">{u.email}</td>
                  <td className="py-3">
                    <form
                      action={async (formData) => {
                        'use server';
                        const role = String(formData.get('role') || '');
                        await adminSetUserRole(u.id, role);
                      }}
                    >
                      <select
                        name="role"
                        defaultValue={u.role}
                        className="bg-black/40 border border-white/10 rounded-lg px-2 py-1"
                      >
                        <option value="LANDOWNER">LANDOWNER</option>
                        <option value="FARMER">FARMER</option>
                        <option value="INVESTOR">INVESTOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      <button className="ml-2 px-2 py-1 rounded bg-white/10 hover:bg-white/15 border border-white/10">
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="py-3">
                    <span
                      className={[
                        'text-xs px-2 py-1 rounded border',
                        u.isVerified
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-300',
                      ].join(' ')}
                    >
                      {u.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                    </span>
                  </td>
                  <td className="py-3">
                    <form
                      action={async () => {
                        'use server';
                        await adminSetUserVerified(u.id, !u.isVerified);
                      }}
                    >
                      <button className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/20 transition-colors">
                        {u.isVerified ? 'Unverify' : 'Verify'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Land moderation</h2>
          <p className="text-sm text-gray-500">{lands.length} lands</p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {lands.map((l) => (
            <div key={l.id} className="glass-card p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-bold text-lg">{l.name}</div>
                  <div className="text-sm text-gray-400">{l.location}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Owner: <span className="text-gray-300">{l.owner.name}</span>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10">{l.status}</span>
              </div>

              <div className="text-sm text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-500">Acres</span>
                  <span>{l.sizeAcres}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Investments</span>
                  <span>{l.investments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Updates</span>
                  <span>{l.updates.length}</span>
                </div>
              </div>

              <form
                action={async (formData) => {
                  'use server';
                  const status = String(formData.get('status') || '');
                  await adminSetLandStatus(l.id, status);
                }}
                className="flex items-center gap-2"
              >
                <select
                  name="status"
                  defaultValue={l.status}
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-sm"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="RENTED">RENTED</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
                <button className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-sm">
                  Save
                </button>
              </form>
            </div>
          ))}
          {lands.length === 0 && <p className="text-gray-500 italic">No lands yet.</p>}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Message moderation</h2>
          <p className="text-sm text-gray-500">Latest {messages.length}</p>
        </div>

        <div className="glass-panel p-4 space-y-3 max-h-[520px] overflow-y-auto custom-scrollbar">
          {messages.length === 0 ? (
            <p className="text-gray-500 italic">No messages.</p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="bg-black/30 border border-white/10 rounded-xl p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">
                      <span className="text-gray-300 font-semibold">{m.sender.name}</span> →{' '}
                      <span className="text-gray-300 font-semibold">{m.receiver.name}</span> •{' '}
                      {new Date(m.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm mt-2 whitespace-pre-wrap break-words">{m.content}</p>
                  </div>
                  <form
                    action={async () => {
                      'use server';
                      await adminDeleteMessage(m.id);
                    }}
                  >
                    <button className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/25 text-sm">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

