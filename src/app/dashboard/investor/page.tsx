import { getCurrentUser, getLands, getInvestments, createInvestment } from '@/actions';
import { redirect } from 'next/navigation';
import { getServerTranslation } from '@/lib/translations';

export default async function InvestorDashboard() {
  const t = await getServerTranslation();
  const investor = await getCurrentUser();
  if (!investor) redirect('/login?next=/dashboard/investor');
  if (investor.role !== 'INVESTOR') redirect('/');
  
  const allLands = await getLands();
  const activeFarms = allLands.filter(l => l.status === 'RENTED');
  
  const allInvestments = await getInvestments();
  const myInvestments = allInvestments.filter(i => i.investorId === investor?.id);
  const totalInvested = myInvestments.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            {t.investor_portal}
          </h1>
          <p className="text-gray-400 mt-2">Invest in high-yield crops and watch your portfolio grow.</p>
        </div>
        <div className="glass-panel px-6 py-4 text-right flex items-center space-x-6">
          <div className="flex items-center space-x-3 border-r border-white/10 pr-6">
            <img src={investor.avatarUrl || '/vercel.svg'} alt={investor.name} className="w-12 h-12 rounded-full border border-blue-500 object-cover" />
            <div className="text-left">
              <p className="text-sm font-semibold">{investor.name}</p>
              <p className="text-xs text-blue-400">{investor.isVerified ? 'Verified Investor ✓' : ''}</p>
            </div>
          </div>
          <div>
             <p className="text-sm text-gray-400">Total Portfolio</p>
             <p className="text-3xl font-bold text-blue-400">${totalInvested.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {myInvestments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-white/10 pb-2">My Holdings</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {myInvestments.map(inv => (
              <div key={inv.id} className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex flex-col relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="text-xs text-blue-300">Equity Share</span>
                <span className="text-xl font-bold">${inv.amount.toLocaleString()}</span>
                <span className="text-sm mt-2 font-semibold">{(inv.land as any).name}</span>
                <span className="text-xs text-gray-400">Target Yield: ${(inv.land as any).estYield?.toLocaleString()}</span>
                
                {/* Milestone Updates for Holdings */}
                {(inv.land as any).updates && (inv.land as any).updates.length > 0 && (
                   <div className="mt-4 pt-4 border-t border-blue-500/20">
                     <p className="text-xs text-emerald-400 font-semibold mb-2 uppercase tracking-wider">Project Updates</p>
                     <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                       {(inv.land as any).updates.map((update: any) => (
                         <div key={update.id} className="bg-black/20 p-2 rounded">
                           <p className="text-sm font-semibold">{update.title}</p>
                           <p className="text-xs text-gray-400 mt-1">{update.content}</p>
                           <p className="text-[10px] text-gray-500 mt-1">{new Date(update.createdAt).toLocaleDateString()}</p>
                         </div>
                       ))}
                     </div>
                   </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6 mt-12">
         <h2 className="text-2xl font-semibold border-b border-white/10 pb-2">Marketplace (Active Farms)</h2>
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 transform-gpu">
          {activeFarms.map(land => (
             <div key={land.id} className="glass-card flex flex-col relative overflow-hidden transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-blue-500/20">
               {/* Cover Image */}
               <div className="h-48 w-full relative group">
                  <img src={land.imageUrl || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800'} alt="Farm" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                     <h3 className="font-bold text-xl text-white">{land.name}</h3>
                     <p className="text-sm text-gray-200">{land.location} • {land.sizeAcres} Acres</p>
                  </div>
               </div>
               
               <div className="p-5 flex-1 flex flex-col">
                  {/* Farmer/Owner Profile Info */}
                  <div className="flex items-center space-x-3 mb-4 bg-white/5 p-3 rounded-lg">
                    <img src={land.owner.avatarUrl || 'https://via.placeholder.com/150'} alt="Owner" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold">{land.owner.name} <span className="text-blue-400 text-xs ml-1">✓</span></p>
                      <p className="text-xs text-gray-400 line-clamp-1">{land.owner.bio || 'Land Owner'}</p>
                    </div>
                  </div>

                  <div className="my-2 bg-black/40 rounded-lg p-4 font-mono text-sm shadow-inner">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Crop:</span>
                      <span className="text-blue-300 font-bold">{land.suitableCrops}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Funding Needed:</span>
                      <span>${land.estBudget?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-400">
                      <span className="opacity-80">Proj. Return:</span>
                      <span>+${(land.estYield! - land.estBudget!).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Milestones / Updates logic summary */}
                  {land.updates && land.updates.length > 0 && (
                    <div className="mt-2 mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 max-h-32 overflow-y-auto custom-scrollbar">
                       <p className="text-xs text-emerald-400 font-semibold mb-2 uppercase tracking-wider">Recent Milestones</p>
                       <div className="space-y-3">
                         {land.updates.map((update: any) => (
                           <div key={update.id} className="border-b border-emerald-500/20 pb-2 last:border-0 last:pb-0">
                             <p className="text-sm font-semibold">{update.title}</p>
                             <p className="text-xs text-gray-400 mt-1">{update.content}</p>
                           </div>
                         ))}
                       </div>
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-white/5">
                     <form action={async () => {
                       "use server";
                       await createInvestment(land.id, investor.id, 500);
                     }}>
                       <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-semibold rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]">
                         Invest $500 (Stripe)
                       </button>
                     </form>
                  </div>
               </div>
             </div>
          ))}
          {activeFarms.length === 0 && (
             <p className="text-gray-500 italic col-span-3">No active farms looking for funding right now.</p>
          )}
         </div>
      </div>
    </div>
  );
}
