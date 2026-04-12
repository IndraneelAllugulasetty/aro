import { getLands, getUsers, rentLand, postUpdate } from '@/actions';

export default async function FarmerDashboard() {
  const users = await getUsers();
  const farmer = users.find(u => u.role === 'FARMER');
  
  const allLands = await getLands();
  const availableLands = allLands.filter(l => l.status === 'AVAILABLE');
  const myRentedLands = allLands.filter(l => l.renterId === farmer?.id);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
            Farmer Portal
          </h1>
          <p className="text-gray-400 mt-2">Find AI-analyzed lands suitable for your next harvest and post updates.</p>
        </div>
        <div className="glass-panel px-6 py-4 text-right flex items-center space-x-6">
          {farmer && (
             <div className="flex items-center space-x-3 border-r border-white/10 pr-6">
               <img src={farmer.avatarUrl || '/vercel.svg'} alt={farmer.name} className="w-12 h-12 rounded-full border border-amber-500 object-cover" />
               <div className="text-left">
                  <p className="text-sm font-semibold">{farmer.name}</p>
                  <p className="text-xs text-amber-400">{farmer.isVerified ? 'Verified Farmer ✓' : ''}</p>
               </div>
             </div>
          )}
          <div>
            <p className="text-sm text-gray-400">Total Rented</p>
            <p className="text-3xl font-bold text-amber-400">{myRentedLands.length} Farms</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold border-b border-white/10 pb-2">My Active Farms</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myRentedLands.length === 0 ? (
             <p className="text-gray-500 italic col-span-3">You haven't rented any land yet.</p>
          ) : (
            myRentedLands.map(land => (
              <div key={land.id} className="glass-card flex flex-col overflow-hidden border border-amber-500/20">
                <div className="h-32 w-full relative group">
                  <img src={land.imageUrl || 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800'} alt="Farm" className="object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent p-4 flex flex-col justify-end">
                    <h3 className="font-bold text-lg text-white">{land.name}</h3>
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                   <p className="text-sm text-gray-400 mb-4">{land.location}</p>
                   <div className="space-y-2 text-sm mb-6 border-b border-white/10 pb-4">
                     <div className="flex justify-between"><span className="text-gray-500">Growing:</span> <span className="text-amber-400 font-semibold">{land.suitableCrops}</span></div>
                     <div className="flex justify-between"><span className="text-gray-500">Expected Yield:</span> <span className="text-emerald-400 font-semibold">${land.estYield?.toLocaleString()}</span></div>
                   </div>

                   {/* Previous Updates */}
                   {land.updates && land.updates.length > 0 && (
                     <div className="mb-4 bg-black/20 border border-white/5 rounded-lg p-3 max-h-40 overflow-y-auto custom-scrollbar">
                       <p className="text-xs text-emerald-400 font-semibold mb-2 uppercase tracking-wider">Past Milestones</p>
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

                   {/* Post Update Form */}
                   <div className="bg-black/30 p-3 rounded-lg mt-auto">
                      <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Post Milestone</p>
                      <form action={async (formData) => {
                        "use server";
                        const title = formData.get('title') as string;
                        const content = formData.get('content') as string;
                        if (title && content) {
                          await postUpdate(land.id, title, content);
                        }
                      }} className="space-y-2">
                         <input name="title" required placeholder="Milestone Title" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm focus:border-amber-500 outline-none" />
                         <textarea name="content" required placeholder="What progress did you make?" rows={2} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm focus:border-amber-500 outline-none resize-none"></textarea>
                         <button type="submit" className="w-full py-1.5 bg-amber-600/80 hover:bg-amber-500 text-xs font-semibold rounded transition-colors">
                           Submit Update
                         </button>
                      </form>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-6 mt-12">
         <h2 className="text-2xl font-semibold border-b border-white/10 pb-2">Discover Lands</h2>
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 transform-gpu">
          {availableLands.map(land => (
             <div key={land.id} className="glass-card flex flex-col relative overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
               {/* Cover Image */}
               <div className="h-48 w-full relative group">
                  <img src={land.imageUrl || 'https://images.unsplash.com/photo-1508546594248-c8751bf878d6?auto=format&fit=crop&q=80&w=800'} alt="Farm" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                     <h3 className="font-bold text-xl text-white">{land.name}</h3>
                     <p className="text-sm text-gray-200">{land.location} • {land.sizeAcres} Acres</p>
                  </div>
               </div>

               <div className="p-5 flex-1 flex flex-col justify-between">
                 <div>
                    <div className="flex items-center space-x-3 mb-4 bg-white/5 p-3 rounded-lg">
                      <img src={land.owner.avatarUrl || 'https://via.placeholder.com/150'} alt="Owner" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-semibold">{land.owner.name} <span className="text-amber-400 text-xs ml-1">✓</span></p>
                        <p className="text-xs text-gray-400 line-clamp-1">{land.owner.bio || 'Land Owner'}</p>
                      </div>
                    </div>
                    
                    <div className="my-4 space-y-2 bg-black/30 p-3 rounded-lg text-sm shadow-inner">
                      <div className="flex justify-between"><span className="text-gray-500">Soil:</span> <span>{land.soilType}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Best For:</span> <span className="text-amber-400 font-semibold">{land.suitableCrops}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Funding Limit:</span> <span>${land.estBudget?.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Pesticides:</span> <span>{land.pesticides}</span></div>
                    </div>
                 </div>
                 
                 <form action={async () => {
                   "use server";
                   await rentLand(land.id, farmer?.id!);
                 }}>
                   <button type="submit" className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 font-semibold rounded-lg transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                     Rent & Start Growing
                   </button>
                 </form>
               </div>
             </div>
          ))}
         </div>
      </div>

    </div>
  );
}
