import { getCurrentUser, getConversation, listOtherUsers, sendMessage } from '@/actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function MessagesPage({
  searchParams,
}: {
  searchParams?: Promise<{ to?: string }>;
}) {
  const me = await getCurrentUser();
  if (!me) redirect('/login?next=/messages');

  const sp = (await searchParams) ?? {};
  const to = sp.to;

  const users = await listOtherUsers();
  const selectedId = to && users.some((u) => u.id === to) ? to : users[0]?.id;

  const convo = selectedId ? await getConversation(selectedId) : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Messages
          </h1>
          <p className="text-gray-400 mt-2">Chat with landowners, farmers, and investors.</p>
        </div>
        <Link
          href="/"
          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 transition-colors text-sm"
        >
          Back home
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="glass-panel p-4 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">People</h2>
            <span className="text-xs text-gray-500">{users.length} users</span>
          </div>

          <div className="space-y-2">
            {users.length === 0 ? (
              <p className="text-gray-500 italic">No other users yet.</p>
            ) : (
              users.map((u) => {
                const active = u.id === selectedId;
                return (
                  <Link
                    key={u.id}
                    href={`/messages?to=${u.id}`}
                    className={[
                      'flex items-center gap-3 p-3 rounded-xl border transition-colors',
                      active
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10',
                    ].join(' ')}
                  >
                    <img
                      src={u.avatarUrl || '/vercel.svg'}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.role}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </aside>

        <section className="glass-panel p-4 lg:col-span-2 flex flex-col min-h-[520px]">
          {!convo ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 italic">
              Select a person to start chatting.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <img
                    src={convo.withUser.avatarUrl || '/vercel.svg'}
                    alt={convo.withUser.name}
                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <p className="font-semibold">{convo.withUser.name}</p>
                    <p className="text-xs text-gray-400">{convo.withUser.role}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 py-4 space-y-3 overflow-y-auto custom-scrollbar pr-1">
                {convo.messages.length === 0 ? (
                  <p className="text-gray-500 italic">No messages yet. Say hi.</p>
                ) : (
                  convo.messages.map((m) => {
                    const mine = m.senderId === convo.me.id;
                    return (
                      <div key={m.id} className={mine ? 'flex justify-end' : 'flex justify-start'}>
                        <div
                          className={[
                            'max-w-[85%] rounded-2xl px-4 py-2 border',
                            mine
                              ? 'bg-emerald-500/15 border-emerald-500/25'
                              : 'bg-white/5 border-white/10',
                          ].join(' ')}
                        >
                          <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                          <p className="text-[10px] text-gray-500 mt-1">
                            {new Date(m.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                className="pt-3 border-t border-white/10 flex gap-2"
                action={async (formData) => {
                  'use server';
                  const content = (formData.get('content') as string) || '';
                  await sendMessage(convo.withUser.id, content);
                }}
              >
                <input
                  name="content"
                  placeholder="Type a message…"
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  required
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-emerald-600/80 hover:bg-emerald-500 font-semibold text-sm transition-colors"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

