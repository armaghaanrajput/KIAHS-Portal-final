
import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';
import { Camera, Mail, Lock, Building2, Shield, Save, KeyRound, User as UserIcon, RefreshCw, Settings, Ban } from 'lucide-react';

interface ProfileModuleProps {
  targetUser: User;
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onToggleSuspension?: (userId: string) => void;
  studentDepartments: string[];
  staffDepartments: string[];
  fiveYearPrograms: string[];
}

export const ProfileModule: React.FC<ProfileModuleProps> = ({ 
  targetUser, 
  currentUser, 
  onUpdateUser,
  onToggleSuspension,
  studentDepartments,
  staffDepartments,
  fiveYearPrograms
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...targetUser });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isOwnProfile = currentUser.id === targetUser.id;
  const canEdit = isOwnProfile || isAdmin;
  const isRootAdmin = targetUser.id === 'Armaghaanrajput';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (newPassword && newPassword !== confirmPassword) return alert("Passwords do not match");
    const updatedUser: User = {
      ...formData,
      password: newPassword ? newPassword : targetUser.password
    };
    onUpdateUser(updatedUser);
    setIsEditing(false);
  };

  const departments = formData.role === UserRole.STUDENT ? studentDepartments : staffDepartments;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="h-32 bg-maroon-700"></div>
        <div className="px-8 pb-8">
          <div className="flex justify-between items-end -mt-12 mb-6">
            <div className="relative w-24 h-24 rounded-full border-4 border-white bg-slate-200 overflow-hidden flex items-center justify-center text-2xl font-bold">
                {formData.avatar ? <img src={formData.avatar} className="w-full h-full object-cover" /> : formData.name.charAt(0)}
                {isEditing && <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer"><Camera className="text-white" /></div>}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if(f) {
                    const r = new FileReader();
                    r.onloadend = () => setFormData({...formData, avatar: r.result as string});
                    r.readAsDataURL(f);
                }
            }} />
            <div className="flex gap-2">
                {isAdmin && !isOwnProfile && !isRootAdmin && onToggleSuspension && <button onClick={() => onToggleSuspension(targetUser.id)} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100">{targetUser.isSuspended ? 'Reactivate' : 'Suspend'}</button>}
                {canEdit && !isEditing && <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-maroon-700 text-white rounded-lg text-sm font-bold">Edit Profile</button>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                      <input name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing} className="w-full border p-2 rounded mt-1 disabled:bg-slate-50" />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                      <input name="email" value={formData.email || ''} onChange={handleInputChange} disabled={!isEditing} className="w-full border p-2 rounded mt-1 disabled:bg-slate-50" />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
                      {isEditing && isAdmin ? (
                          <select name="department" value={formData.department} onChange={handleInputChange} className="w-full border p-2 rounded mt-1">
                              {departments.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                      ) : <div className="p-2 bg-slate-50 border rounded mt-1 text-sm">{formData.department}</div>}
                  </div>
              </div>
              {isEditing && (
                  <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-dashed">
                      <h4 className="font-bold flex items-center gap-2"><Lock size={16}/> Security</h4>
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border p-2 rounded text-sm" placeholder="New Password" />
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border p-2 rounded text-sm" placeholder="Confirm" />
                      <div className="flex gap-2 pt-2">
                          <button onClick={() => setIsEditing(false)} className="flex-1 bg-white border py-2 rounded text-sm">Cancel</button>
                          <button onClick={handleSave} className="flex-1 bg-maroon-700 text-white py-2 rounded text-sm font-bold">Save</button>
                      </div>
                  </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
