import { getCurrentUser, getLands, submitLandListing } from '@/actions';
import { redirect } from 'next/navigation';
import { LocationFields } from '@/components/LocationFields';

export default async function LandownerDashboard() {
  const owner = await getCurrentUser();
  if (!owner) redirect('/login?next=/dashboard/landowner');
  if (owner.role !== 'LANDOWNER') redirect('/');
  
  const allLands = await getLands();
  const myLands = allLands.filter(l => l.ownerId === owner?.id);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-600">
          Landowner Dashboard
        </h1>
        <p className="text-gray-400 mt-2">Manage your lands and see AI predictions for your soil.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold mb-4">List New Land</h2>
          <form action={submitLandListing} className="space-y-4">
            <input type="hidden" name="ownerId" value={owner.id} />
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Land Name</label>
              <input name="name" required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="e.g. Sunny Valley Acres" />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Location</label>
              <LocationFields />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Size (Acres)</label>
              <input name="sizeAcres" type="number" step="0.1" min="0.01" required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="e.g. 5.5" />
            </div>

            <button type="submit" className="w-full py-3 mt-4 bg-emerald-500 hover:bg-emerald-600 font-semibold rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all">
              Analyze with AI & List Land
            </button>
          </form>
        </div>

        {/* Listings Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">My Listed Lands</h2>
          {myLands.length === 0 ? (
            <div className="text-gray-500 italic">No lands listed yet.</div>
          ) : (
            myLands.map(land => (
              <div key={land.id} className="glass-card p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                  {land.status === 'RENTED' ? (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Rented</span>
                  ) : (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Available</span>
                  )}
                </div>
                <h3 className="font-bold text-lg">{land.name}</h3>
                <p className="text-sm text-gray-400">{land.location} • {land.sizeAcres} Acres</p>
                
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-black/30 p-2 rounded">
                    <span className="text-xs text-gray-500 block">AI Soil Type</span>
                    {land.soilType}
                  </div>
                  <div className="bg-black/30 p-2 rounded">
                    <span className="text-xs text-gray-500 block">Suggested Crops</span>
                    {land.suitableCrops}
                  </div>
                  <div className="bg-black/30 p-2 rounded">
                    <span className="text-xs text-gray-500 block">Est. Yield Return</span>
                    ${land.estYield?.toLocaleString()}
                  </div>
                </div>

                {/* Farmer Updates */}
                {land.status === 'RENTED' && land.updates && land.updates.length > 0 && (
                  <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 max-h-40 overflow-y-auto custom-scrollbar">
                    <p className="text-xs text-emerald-400 font-semibold mb-2 uppercase tracking-wider">Farmer Updates</p>
                    <div className="space-y-3">
                      {land.updates.map((update: any) => (
                        <div key={update.id} className="border-b border-white/5 pb-2 last:border-0 last:pb-0">
                          <p className="text-sm font-semibold">{update.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{update.content}</p>
                          <p className="text-[10px] text-gray-500 mt-1">{new Date(update.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
