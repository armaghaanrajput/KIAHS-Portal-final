
import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';
import { Search, Ban, CheckCircle, User as UserIcon, Shield, ShieldCheck, ChevronDown, Camera, UserCog, RefreshCw, Eye, Trash2, ImagePlus, Info, X, Mail, Building2, CalendarDays, GraduationCap } from 'lucide-react';

interface UserManagementModuleProps {
  users: User[];
  onToggleSuspension: (userId: string) => void;
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onUpdateUserAvatar: (userId: string, avatar: string) => void;
  onViewProfile?: (userId: string) => void; 
  onDeleteUser: (userId: string) => void;
  currentUser: User;
}

export const UserManagementModule: React.FC<UserManagementModuleProps> = ({ 
  users, 
  onToggleSuspension, 
  onUpdateUserRole, 
  onUpdateUserAvatar,
  onViewProfile,
  onDeleteUser,
  currentUser 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | UserRole>('ALL');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailUser, setDetailUser] = useState<User | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Helper to check if user is the Root Admin to protect them
  const isRootAdmin = (id: string) => id === 'Armaghaanrajput';

  const handleAvatarClick = (userId: string) => {
    setSelectedUserId(userId);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedUserId) {
        if (file.size > 2 * 1024 * 1024) {
            alert("File is too large. Please select an image under 2MB.");
            if (fileInputRef.current) fileInputRef.current.value = '';
            setSelectedUserId(null);
            return;
        }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
            onUpdateUserAvatar(selectedUserId, reader.result as string);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
        setSelectedUserId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>, user: User) => {
      const newRole = e.target.value as UserRole;
      const oldRole = user.role;
      if (newRole === oldRole) return;
      const roleLabels = { [UserRole.STUDENT]: 'Student', [UserRole.STAFF]: 'Staff Member', [UserRole.ADMIN]: 'Admin Staff' };
      if (window.confirm(`Are you sure you want to change ${user.name}'s role to ${roleLabels[newRole]}?`)) {
          onUpdateUserRole(user.id, newRole);
      } else { e.target.value = oldRole; }
  };

  const handleDeleteClick = (user: User) => {
    if (isRootAdmin(user.id)) { alert("Cannot delete the Root Administrator."); return; }
    if (window.confirm(`Are you sure you want to PERMANENTLY delete ${user.name}?\n\nThis action cannot be undone.`)) { onDeleteUser(user.id); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
          <p className="text-slate-500">Manage user accounts, avatars, and access permissions.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by Name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-maroon-700 outline-none transition-all"
          />
        </div>
        <select 
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as any)}
          className="px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-maroon-700 bg-white"
        >
          <option value="ALL">All Roles</option>
          <option value={UserRole.STUDENT}>Students</option>
          <option value={UserRole.STAFF}>Staff</option>
          <option value={UserRole.ADMIN}>Admin Staff</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className={`transition-colors ${user.isSuspended ? 'bg-slate-50/50 text-slate-500' : 'hover:bg-slate-50/80'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center overflow-hidden shrink-0 ${user.isSuspended ? 'bg-slate-200 border-slate-300 text-slate-400' : 'bg-maroon-50 border-maroon-100 text-maroon-700'}`}>
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserIcon size={18} />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{user.name}</div>
                        <p className="text-[10px] font-mono text-slate-400 tracking-tight">{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : user.role === UserRole.STAFF ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${user.isSuspended ? 'text-red-500' : 'text-green-600'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${user.isSuspended ? 'bg-red-500' : 'bg-green-600'}`}></div>
                        {user.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                         <button 
                            onClick={() => setDetailUser(user)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-maroon-50 text-slate-600 hover:text-maroon-700 rounded-lg transition-all text-xs font-bold border border-slate-200 hover:border-maroon-200"
                         >
                            <Eye size={14} />
                            <span className="hidden sm:inline">View Profile</span>
                         </button>
                         {user.id !== currentUser.id && !isRootAdmin(user.id) && (
                             <>
                                <button onClick={() => onToggleSuspension(user.id)} className={`p-1.5 rounded-lg border transition-all ${user.isSuspended ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                    {user.isSuspended ? <RefreshCw size={14} /> : <Ban size={14} />}
                                </button>
                                <button onClick={() => handleDeleteClick(user)} className="p-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-600 hover:text-white">
                                    <Trash2 size={14} />
                                </button>
                             </>
                         )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      
      {/* User Detail Modal */}
      {detailUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transition-all">
                <div className="h-24 bg-maroon-700 relative">
                    <button onClick={() => setDetailUser(null)} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors">
                        <X size={20} />
                    </button>
                    <div className="absolute -bottom-10 left-6">
                        <div className="w-20 h-20 rounded-2xl border-4 border-white bg-slate-100 shadow-lg overflow-hidden flex items-center justify-center">
                            {detailUser.avatar ? <img src={detailUser.avatar} className="w-full h-full object-cover" /> : <UserIcon size={40} className="text-slate-300" />}
                        </div>
                    </div>
                </div>

                <div className="px-6 pt-14 pb-8 space-y-6">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900">{detailUser.name}</h3>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">{detailUser.id}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Shield size={10} /> Role</span>
                            <div className="text-sm font-semibold text-slate-700">{detailUser.role}</div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Building2 size={10} /> Department</span>
                            <div className="text-sm font-semibold text-slate-700">{detailUser.department || 'N/A'}</div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Mail size={10} /> Email</span>
                            <div className="text-sm font-semibold text-slate-700 truncate">{detailUser.email || 'No email provided'}</div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><CheckCircle size={10} /> Status</span>
                            <div className={`text-sm font-bold ${detailUser.isSuspended ? 'text-red-600' : 'text-green-600'}`}>
                                {detailUser.isSuspended ? 'Suspended' : 'Active'}
                            </div>
                        </div>
                    </div>

                    {detailUser.role === UserRole.STUDENT && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
                            <div className="p-2.5 bg-white rounded-lg border shadow-sm"><GraduationCap size={20} className="text-maroon-700" /></div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Academic Details</p>
                                <p className="text-sm font-bold text-slate-800">{detailUser.classYear} • Batch {detailUser.batch}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <button 
                            onClick={() => { setDetailUser(null); handleAvatarClick(detailUser.id); }}
                            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition-all"
                        >
                            <Camera size={16} />
                            Change Photo
                        </button>
                        <button 
                            onClick={() => setDetailUser(null)}
                            className="flex-1 bg-maroon-700 hover:bg-maroon-800 text-white font-bold py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                        >
                            Close Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
