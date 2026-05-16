import { getCurrentUser, getLands, rentLand, postUpdate } from '@/actions';
import { redirect } from 'next/navigation';
import { WeatherCard } from '@/components/WeatherCard';
import { getServerTranslation } from '@/lib/translations';

export default async function FarmerDashboard() {
  const t = await getServerTranslation();
  const farmer = await getCurrentUser();
  if (!farmer) redirect('/login?next=/dashboard/farmer');
  if (farmer.role !== 'FARMER') redirect('/');
  
  const allLands = await getLands();
  const availableLands = allLands.filter(l => l.status === 'AVAILABLE');
  const myRentedLands = allLands.filter(l => l.renterId === farmer?.id);

  const marketPrices = [
    { crop: 'Rice (Basmati)', price: '₹4,200', trend: '+2.4%', up: true },
    { crop: 'Wheat', price: '₹2,350', trend: '-0.8%', up: false },
    { crop: 'Cotton', price: '₹7,100', trend: '+5.2%', up: true },
    { crop: 'Sugarcane', price: '₹3,150', trend: '+1.1%', up: true },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
            {t.farmer_portal}
          </h1>
          <p className="text-gray-400 mt-2">Precision agriculture tools and real-time market intelligence.</p>
        </div>
        
        {/* Market Prices Ticker */}
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {marketPrices.map((item, i) => (
            <div key={i} className="glass-panel px-4 py-3 min-w-[160px] border-amber-500/10">
              <p className="text-[10px] text-gray-500 font-bold uppercase">{item.crop}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-black text-white">{item.price}</span>
                <span className={`text-[10px] font-bold ${item.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {item.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Farms + Weather */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
          <h2 className="text-2xl font-bold">My Active Portfolio</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {myRentedLands.length === 0 ? (
             <p className="text-gray-500 italic col-span-2">No active farm management found. Browse listings below to start.</p>
          ) : (
            myRentedLands.map(land => (
              <div key={land.id} className="glass-panel overflow-hidden border-amber-500/10 hover:border-amber-500/30 transition-all duration-500 group">
                <div className="flex flex-col xl:flex-row h-full">
                  <div className="xl:w-1/2 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">{land.name}</h3>
                      <span className="text-[10px] px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full font-black tracking-widest uppercase">Active</span>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        {land.location}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Target Crop</p>
                          <p className="text-sm font-black text-amber-400">{land.suitableCrops}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Est. Profit</p>
                          <p className="text-sm font-black text-emerald-400">₹{(land.estYield || 0) * 80}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto">
                       <form action={async (formData) => {
                        "use server";
                        const title = formData.get('title') as string;
                        const content = formData.get('content') as string;
                        if (title && content) await postUpdate(land.id, title, content);
                      }} className="space-y-2">
                         <input name="title" required placeholder="Milestone (e.g. Sowing complete)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-amber-500 outline-none" />
                         <button type="submit" className="w-full py-2 bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all">
                           Log Progress
                         </button>
                      </form>
                    </div>
                  </div>
                  
                  {/* Weather Intelligence Widget */}
                  <div className="xl:w-1/2 bg-black/40 border-l border-white/5">
                    <WeatherCard 
                      lat={land.latitude || 19.076} 
                      lon={land.longitude || 72.877} 
                      landName={land.name} 
                    />
                    
                    {/* Activity Feed Snippet */}
                    <div className="p-6 pt-0">
                      <p className="text-[10px] text-gray-500 font-black uppercase mb-3 tracking-widest">Recent Activity</p>
                      <div className="space-y-3">
                        {land.updates?.slice(0, 2).map((up: any) => (
                          <div key={up.id} className="flex gap-3">
                            <div className="w-1 h-8 bg-white/10 rounded-full" />
                            <div>
                              <p className="text-xs font-bold text-gray-300">{up.title}</p>
                              <p className="text-[10px] text-gray-500">{new Date(up.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Discovery Section */}
      <div className="space-y-6 mt-16">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <h2 className="text-2xl font-bold">New Opportunities</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {availableLands.map(land => (
            <div key={land.id} className="glass-panel group hover:border-emerald-500/50 transition-all duration-500 p-6 flex flex-col h-full relative overflow-hidden">
               <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">{land.name}</h3>
                  <img src={land.owner.avatarUrl || 'https://via.placeholder.com/150'} className="w-8 h-8 rounded-full border border-white/10" />
               </div>
               
               <p className="text-gray-400 text-sm mb-6">{land.location} • {land.sizeAcres} Acres</p>
               
               <div className="grid grid-cols-2 gap-3 mb-6">
                 <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                   <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Soil Score</p>
                   <p className="text-sm font-black text-amber-400">A+ Organic</p>
                 </div>
                 <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                   <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Yield Potential</p>
                   <p className="text-sm font-black text-emerald-400">High</p>
                 </div>
               </div>

               <form action={async () => {
                 "use server";
                 await rentLand(land.id, farmer.id);
               }} className="mt-auto">
                 <button type="submit" className="w-full py-3 bg-white/5 hover:bg-emerald-500 border border-white/10 hover:border-emerald-500 text-gray-300 hover:text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all">
                   Request Lease →
                 </button>
               </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
