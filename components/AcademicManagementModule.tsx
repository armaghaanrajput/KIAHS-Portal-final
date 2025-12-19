
import React, { useState } from 'react';
import { Building2, Plus, Trash2, Edit2, Check, X, Shield, BookOpen, Clock, CalendarDays } from 'lucide-react';

interface AcademicManagementModuleProps {
  studentDepartments: string[];
  staffDepartments: string[];
  fiveYearPrograms: string[];
  availableBatches: string[];
  onUpdateStudentDepts: (depts: string[]) => void;
  onUpdateStaffDepts: (depts: string[]) => void;
  onUpdateFiveYearPrograms: (programs: string[]) => void;
  onUpdateBatches: (batches: string[]) => void;
}

export const AcademicManagementModule: React.FC<AcademicManagementModuleProps> = ({
  studentDepartments,
  staffDepartments,
  fiveYearPrograms,
  availableBatches,
  onUpdateStudentDepts,
  onUpdateStaffDepts,
  onUpdateFiveYearPrograms,
  onUpdateBatches
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'STAFF' | 'BATCHES'>('STUDENT');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    
    if (activeTab === 'STUDENT') {
      if (studentDepartments.includes(newItemName.trim())) return alert("Program already exists");
      onUpdateStudentDepts([...studentDepartments, newItemName.trim()]);
    } else if (activeTab === 'STAFF') {
      if (staffDepartments.includes(newItemName.trim())) return alert("Department already exists");
      onUpdateStaffDepts([...staffDepartments, newItemName.trim()]);
    } else {
      if (availableBatches.includes(newItemName.trim())) return alert("Batch already exists");
      onUpdateBatches([...availableBatches, newItemName.trim()]);
    }
    setNewItemName('');
  };

  const handleDeleteItem = (name: string) => {
    if (!window.confirm(`Are you sure you want to remove '${name}'? Existing data linked to this will need manual updates.`)) return;
    
    if (activeTab === 'STUDENT') {
      onUpdateStudentDepts(studentDepartments.filter(d => d !== name));
      onUpdateFiveYearPrograms(fiveYearPrograms.filter(p => p !== name));
    } else if (activeTab === 'STAFF') {
      onUpdateStaffDepts(staffDepartments.filter(d => d !== name));
    } else {
      onUpdateBatches(availableBatches.filter(b => b !== name));
    }
  };

  const handleToggleDuration = (name: string) => {
    if (fiveYearPrograms.includes(name)) {
      onUpdateFiveYearPrograms(fiveYearPrograms.filter(p => p !== name));
    } else {
      onUpdateFiveYearPrograms([...fiveYearPrograms, name]);
    }
  };

  const startEditing = (index: number, val: string) => {
    setEditingIndex(index);
    setEditingValue(val);
  };

  const saveEdit = (index: number) => {
    if (!editingValue.trim()) return;
    
    if (activeTab === 'STUDENT') {
      const oldVal = studentDepartments[index];
      const newDepts = [...studentDepartments];
      newDepts[index] = editingValue.trim();
      onUpdateStudentDepts(newDepts);
      if (fiveYearPrograms.includes(oldVal)) {
          onUpdateFiveYearPrograms(fiveYearPrograms.map(p => p === oldVal ? editingValue.trim() : p));
      }
    } else if (activeTab === 'STAFF') {
      const newDepts = [...staffDepartments];
      newDepts[index] = editingValue.trim();
      onUpdateStaffDepts(newDepts);
    } else {
      const newBatches = [...availableBatches];
      newBatches[index] = editingValue.trim();
      onUpdateBatches(newBatches);
    }
    setEditingIndex(null);
  };

  const currentList = activeTab === 'STUDENT' ? studentDepartments : 
                    activeTab === 'STAFF' ? staffDepartments : availableBatches;

  const tabLabel = activeTab === 'STUDENT' ? 'Program' : 
                   activeTab === 'STAFF' ? 'Department' : 'Batch';

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-maroon-700 to-maroon-900 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Shield size={24} />
          Academic & Staff Management
        </h2>
        <p className="opacity-90">Manage institute departments, sessions, and academic durations.</p>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-lg w-fit overflow-x-auto max-w-full">
        <button
          onClick={() => { setActiveTab('STUDENT'); setEditingIndex(null); }}
          className={`px-6 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap ${activeTab === 'STUDENT' ? 'bg-white text-maroon-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Programs
        </button>
        <button
          onClick={() => { setActiveTab('STAFF'); setEditingIndex(null); }}
          className={`px-6 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap ${activeTab === 'STAFF' ? 'bg-white text-maroon-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Departments
        </button>
        <button
          onClick={() => { setActiveTab('BATCHES'); setEditingIndex(null); }}
          className={`px-6 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap ${activeTab === 'BATCHES' ? 'bg-white text-maroon-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Batches
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-maroon-700" />
              Add {tabLabel}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{tabLabel} Name/Range</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={activeTab === 'BATCHES' ? 'e.g. 2026-2032' : `e.g. New ${tabLabel}`}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-maroon-700 outline-none"
                />
              </div>
              <button
                onClick={handleAddItem}
                disabled={!newItemName.trim()}
                className="w-full bg-maroon-700 hover:bg-maroon-800 text-white font-bold py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                Add {tabLabel}
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-sm">
             <h4 className="font-bold mb-1 flex items-center gap-1">
                <Shield size={14} /> Admin Note
             </h4>
             <p className="opacity-80">Updating batches or programs here will refresh options in sign-up and filter menus across the portal.</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">{tabLabel}</th>
                  {activeTab === 'STUDENT' && <th className="px-6 py-4 text-center">Duration</th>}
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentList.map((name, index) => (
                  <tr key={name} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      {editingIndex === index ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="border border-maroon-300 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-maroon-700"
                          />
                          <button onClick={() => saveEdit(index)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={16} /></button>
                          <button onClick={() => setEditingIndex(null)} className="p-1 text-slate-400 hover:bg-slate-50 rounded"><X size={16} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-maroon-50 flex items-center justify-center">
                            {activeTab === 'BATCHES' ? <CalendarDays size={16} className="text-maroon-700" /> : <Building2 size={16} className="text-maroon-700" />}
                          </div>
                          <span className="font-medium text-slate-800">{name}</span>
                        </div>
                      )}
                    </td>
                    {activeTab === 'STUDENT' && (
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleDuration(name)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            fiveYearPrograms.includes(name)
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}
                        >
                          <Clock size={12} />
                          {fiveYearPrograms.includes(name) ? '5 Years' : '4 Years'}
                        </button>
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditing(index, name)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Rename"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
