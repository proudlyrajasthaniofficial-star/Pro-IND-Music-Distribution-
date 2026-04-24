import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy, updateDoc, doc, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { 
  Users, 
  Search, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Wallet, 
  Mail,
  Disc,
  ArrowUpRight 
} from "lucide-react";
import { formatCurrency, cn } from "../../lib/utils";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const toggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await updateDoc(doc(db, "users", userId), { status: nextStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const [adjustingBalance, setAdjustingBalance] = useState<any>(null);
  const [newBalance, setNewBalance] = useState("");

  const updateBalance = async () => {
    if (!adjustingBalance) return;
    const bal = parseFloat(newBalance);
    if (isNaN(bal)) return;

    try {
      await updateDoc(doc(db, "users", adjustingBalance.id), { walletBalance: bal });
      setUsers(users.map(u => u.id === adjustingBalance.id ? { ...u, walletBalance: bal } : u));
      setAdjustingBalance(null);
      alert("Treasury balance updated.");
    } catch (err) {
      alert("Adjustment failed.");
    }
  };

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userReleases, setUserReleases] = useState<any[]>([]);
  const [fetchingUserReleases, setFetchingUserReleases] = useState(false);

  const viewUserDetails = async (user: any) => {
    setSelectedUser(user);
    setFetchingUserReleases(true);
    try {
      const q = query(
        collection(db, "releases"),
        where("userId", "==", user.id),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setUserReleases(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error fetching user releases:", err);
    } finally {
      setFetchingUserReleases(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
        <div>
           <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight uppercase">User Directory</h1>
           <p className="text-xs md:text-sm text-slate-400 font-medium">Manage artist access, wallet balances, and account status.</p>
        </div>
        <div className="relative w-full lg:w-auto">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-500" />
           <input 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             placeholder="Search by name or email..."
             className="w-full bg-[#1E293B] border-slate-700 rounded-2xl py-3.5 md:py-4 pl-12 md:pl-14 pr-6 md:pr-8 text-xs md:text-sm focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium md:min-w-[300px]"
           />
        </div>
      </div>

      <div className="bg-[#1E293B] rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl">
         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[1000px]">
            <thead>
               <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  <th className="px-12 py-8">User Identity</th>
                  <th className="px-6 py-8">Role</th>
                  <th className="px-6 py-8">Wallet Balance</th>
                  <th className="px-6 py-8">Join Date</th>
                  <th className="px-6 py-8">Status</th>
                  <th className="px-12 py-8 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
               {filteredUsers.map((u, i) => (
                 <tr key={i} className="group hover:bg-slate-800/50 transition-colors">
                    <td className="px-12 py-8">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-linear-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white font-bold text-sm">
                             {u.displayName?.[0] || 'U'}
                          </div>
                          <div>
                             <p className="font-bold text-white">{u.displayName}</p>
                             <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                                <Mail className="w-3 h-3" /> {u.email}
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-8">
                       <span className="text-xs font-bold uppercase tracking-widest text-slate-300 px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg">
                          {u.role}
                       </span>
                    </td>
                    <td className="px-6 py-8">
                       <button 
                         onClick={() => { setAdjustingBalance(u); setNewBalance(u.walletBalance.toString()); }}
                         className="flex items-center gap-2 text-emerald-400 font-black font-display text-lg hover:bg-emerald-500/10 p-2 rounded-xl transition-all"
                       >
                          <Wallet className="w-5 h-5 opacity-40" /> {formatCurrency(u.walletBalance || 0)}
                       </button>
                    </td>
                    <td className="px-6 py-8 text-[10px] font-bold text-slate-500 uppercase">
                       {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-8">
                       <span className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                          u.status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                       )}>
                          {u.status}
                       </span>
                    </td>
                    <td className="px-12 py-8 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => viewUserDetails(u)}
                            className="p-3 text-brand-blue bg-brand-blue/10 rounded-xl hover:bg-brand-blue hover:text-white transition-all shadow-sm"
                            title="Full Management"
                          >
                             <Users className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => toggleStatus(u.id, u.status)}
                            className={cn(
                              "p-3 rounded-xl transition-all",
                              u.status === 'active' ? "text-slate-500 hover:bg-rose-500/10 hover:text-rose-500" : "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                            )}>
                             {u.status === 'active' ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                          </button>
                       </div>
                    </td>
                 </tr>
               ))}
               {filteredUsers.length === 0 && (
                 <tr>
                    <td colSpan={5} className="px-12 py-24 text-center text-slate-500 font-medium uppercase tracking-[0.2em]">No Users Found.</td>
                 </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[300] flex items-center justify-center p-6">
           <div className="bg-[#1E293B] w-full max-w-4xl rounded-[4rem] p-12 border border-slate-700 shadow-3xl text-left max-h-[90vh] overflow-y-auto custom-scrollbar relative">
              <button 
                onClick={() => setSelectedUser(null)}
                className="absolute top-10 right-10 text-slate-500 hover:text-white transition-colors"
              >
                 <UserX className="w-8 h-8" />
              </button>

              <div className="flex items-center gap-8 mb-12">
                 <div className="w-24 h-24 rounded-[2rem] bg-linear-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white font-black text-3xl shadow-2xl">
                    {selectedUser.displayName?.[0] || 'U'}
                 </div>
                 <div>
                    <h2 className="text-4xl font-black font-display tracking-tight text-white uppercase">{selectedUser.displayName}</h2>
                    <p className="text-slate-400 font-medium text-lg italic mt-1">{selectedUser.email}</p>
                    <div className="flex gap-4 mt-4">
                       <span className="px-4 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-black uppercase text-slate-300 tracking-widest">{selectedUser.role}</span>
                       <span className={cn(
                          "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                          selectedUser.status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                        )}>{selectedUser.status}</span>
                    </div>
                 </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                 <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Available Balance</p>
                    <h3 className="text-3xl font-black text-emerald-400 font-display">{formatCurrency(selectedUser.walletBalance || 0)}</h3>
                 </div>
                 <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Releases</p>
                    <h3 className="text-3xl font-black text-white font-display">{userReleases.length}</h3>
                 </div>
                 <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 flex items-center justify-center">
                    <button 
                      onClick={() => toggleStatus(selectedUser.id, selectedUser.status)}
                      className={cn(
                        "w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg",
                        selectedUser.status === 'active' ? "bg-rose-500 text-white shadow-rose-900/20" : "bg-emerald-500 text-white shadow-emerald-900/20"
                      )}
                    >
                      {selectedUser.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                    </button>
                 </div>
              </div>

              <div>
                 <h4 className="text-xl font-black font-display text-white uppercase mb-8 flex items-center gap-4">
                    <Disc className="text-brand-blue w-6 h-6" /> User Catalog
                 </h4>
                 {fetchingUserReleases ? (
                   <div className="py-20 text-center animate-pulse text-slate-500 uppercase font-black text-xs tracking-widest">Scanning Disk Space...</div>
                 ) : (
                   <div className="grid sm:grid-cols-2 gap-4">
                      {userReleases.map(r => (
                        <div key={r.id} className="flex items-center gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group">
                           <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                              <img src={r.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                           </div>
                           <div className="min-w-0 flex-1">
                              <p className="text-xs font-black text-white truncate uppercase tracking-tight">{r.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 <span className={cn(
                                    "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                    r.status === 'live' ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-800 text-slate-500"
                                 )}>{r.status}</span>
                                 <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()}</span>
                              </div>
                           </div>
                           <Link to={`/admin/review/${r.id}`} className="p-2 text-slate-500 hover:text-white transition-colors">
                              <ArrowUpRight className="w-5 h-5" />
                           </Link>
                        </div>
                      ))}
                      {userReleases.length === 0 && (
                        <div className="col-span-full py-16 text-center text-slate-600 uppercase font-black text-[10px] tracking-[0.2em] bg-slate-950 rounded-[2rem] border-2 border-dashed border-slate-800">
                           No recorded assets detected.
                        </div>
                      )}
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {adjustingBalance && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[300] flex items-center justify-center p-6">
           <div className="bg-[#1E293B] w-full max-w-sm rounded-[3rem] p-10 border border-slate-700">
              <h3 className="text-xl font-black font-display uppercase text-white mb-6">Adjust <span className="text-brand-purple">Treasury</span></h3>
              <div className="space-y-4">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target: {adjustingBalance.displayName}</p>
                 <input 
                   type="number"
                   value={newBalance}
                   onChange={(e) => setNewBalance(e.target.value)}
                   className="w-full bg-slate-900 border-slate-700 p-5 rounded-2xl text-2xl font-black text-emerald-400"
                 />
                 <div className="flex gap-4 pt-4">
                    <button onClick={() => setAdjustingBalance(null)} className="flex-1 py-4 bg-slate-800 rounded-2xl text-xs font-black uppercase text-slate-400">Cancel</button>
                    <button onClick={updateBalance} className="flex-1 py-4 bg-brand-purple rounded-2xl text-xs font-black uppercase text-white shadow-xl shadow-purple-900/40">Apply</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
