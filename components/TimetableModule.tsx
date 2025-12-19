
import React, { useState, useMemo } from 'react';
import { TimeTableSlot, User, UserRole } from '../types';
import { MapPin, User as UserIcon, Trash2, Plus, X, Clock, Filter, Building2, Search, CalendarDays } from 'lucide-react';

interface TimetableModuleProps {
  timetable: TimeTableSlot[];
  onAddSlot: (slot: TimeTableSlot) => void;
  onDeleteSlot: (id: string) => void;
  currentUser: User;
  studentDepartments: string[];
  fiveYearPrograms: string[];
  availableBatches: string[];
}

export const TimetableModule: React.FC<TimetableModuleProps> = ({ 
  timetable, 
  onAddSlot, 
  onDeleteSlot, 
  currentUser,
  studentDepartments,
  fiveYearPrograms,
  availableBatches
}) => {
  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const [showModal, setShowModal] = useState(false);
  const isAdmin = currentUser.role === UserRole.ADMIN;
  
  const [viewClass, setViewClass] = useState(currentUser.classYear || '1st Year');
  const [viewBatch, setViewBatch] = useState(currentUser.batch || (availableBatches[0] || ''));
  const [viewDepartment, setViewDepartment] = useState(currentUser.department && studentDepartments.includes(currentUser.department) ? currentUser.department : (studentDepartments[0] || ''));

  const [searchInstructor, setSearchInstructor] = useState('');
  const [searchRoom, setSearchRoom] = useState('');
  const [dayFilter, setDayFilter] = useState('All Days');

  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [subject, setSubject] = useState('');
  const [instructor, setInstructor] = useState('');
  const [room, setRoom] = useState('');
  const [targetClass, setTargetClass] = useState('1st Year');
  const [targetBatch, setTargetBatch] = useState(availableBatches[0] || '');
  const [targetDepartment, setTargetDepartment] = useState(studentDepartments[0] || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSlot({
      id: `t-${Date.now()}`,
      day,
      time: `${startTime} - ${endTime}`,
      subject, instructor, room,
      classYear: targetClass,
      batch: targetBatch,
      program: targetDepartment
    });
    setShowModal(false);
    setSubject('');
    setInstructor('');
    setRoom('');
  };

  const filteredDays = useMemo(() => {
    if (dayFilter === 'All Days') return allDays;
    return allDays.filter(d => d === dayFilter);
  }, [dayFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Time Table</h2>
          <p className="text-slate-500">{viewDepartment} - {viewClass} {viewBatch ? `(${viewBatch})` : ''}</p>
        </div>
        <div className="flex gap-2">
            {isAdmin && (
                <button 
                    onClick={() => setShowModal(true)} 
                    className="bg-maroon-700 hover:bg-maroon-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
                >
                    <Plus size={18} />
                    <span>Add Class</span>
                </button>
            )}
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
         {isAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Department Scope</label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select 
                            value={viewDepartment} 
                            onChange={(e) => setViewDepartment(e.target.value)} 
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-maroon-700 outline-none transition-all"
                        >
                            {studentDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Class Scope</label>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select 
                            value={viewClass} 
                            onChange={(e) => setViewClass(e.target.value)} 
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-maroon-700 outline-none transition-all"
                        >
                            {['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Batch Scope</label>
                    <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select 
                            value={viewBatch} 
                            onChange={(e) => setViewBatch(e.target.value)} 
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-maroon-700 outline-none transition-all"
                        >
                            <option value="">All Batches</option>
                            {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                </div>
            </div>
         )}

         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Filter by Day</label>
                <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                        value={dayFilter} 
                        onChange={(e) => setDayFilter(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-maroon-700 outline-none transition-all"
                    >
                        <option value="All Days">All Days</option>
                        {allDays.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Search Instructor</label>
                <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Instructor Name..." 
                        value={searchInstructor} 
                        onChange={(e) => setSearchInstructor(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-maroon-700 outline-none"
                    />
                </div>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Search Room</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Room/Hall..." 
                        value={searchRoom} 
                        onChange={(e) => setSearchRoom(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-maroon-700 outline-none"
                    />
                </div>
            </div>
         </div>
      </div>

      <div className={`grid gap-6 ${dayFilter === 'All Days' ? 'xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2' : 'grid-cols-1'}`}>
        {filteredDays.map((dayName) => {
          const daySlots = timetable.filter(t => {
              const matchesBase = t.day === dayName && t.classYear === viewClass && (viewBatch ? t.batch === viewBatch : true) && t.program === viewDepartment;
              const matchesInstructor = !searchInstructor || t.instructor.toLowerCase().includes(searchInstructor.toLowerCase());
              const matchesRoom = !searchRoom || t.room.toLowerCase().includes(searchRoom.toLowerCase());
              return matchesBase && matchesInstructor && matchesRoom;
          });

          return (
            <div key={dayName} className="rounded-xl border border-slate-200 bg-white flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-slate-50 font-bold text-center border-b border-slate-200 text-maroon-900 rounded-t-xl">
                {dayName}
              </div>
              <div className="p-4 space-y-4 flex-1">
                {daySlots.length > 0 ? daySlots.map(slot => (
                  <div key={slot.id} className="border border-slate-100 bg-slate-50/50 rounded-lg p-3 relative group hover:border-maroon-200 hover:bg-maroon-50/20 transition-all">
                    {isAdmin && (
                        <button 
                            onClick={() => { if(confirm("Remove this class?")) onDeleteSlot(slot.id); }} 
                            className="absolute top-2 right-2 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all p-1"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-maroon-700 uppercase tracking-wide mb-1">
                        <Clock size={10} />
                        {slot.time}
                    </div>
                    <h4 className="font-bold text-slate-800 leading-snug mb-2">{slot.subject}</h4>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <UserIcon size={12} className="text-slate-400" />
                            <span className="truncate">{slot.instructor}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin size={12} className="text-slate-400" />
                            <span className="truncate">{slot.room}</span>
                        </div>
                    </div>
                  </div>
                )) : (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                        <CalendarDays size={24} className="opacity-20 mb-2" />
                        <p className="text-[10px] font-medium uppercase tracking-widest">No classes</p>
                    </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-fade-in space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-800">Add New Schedule</h3>
                <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                    <X size={24} />
                </button>
            </div>

            <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Target Program</label>
                        <select value={targetDepartment} onChange={(e) => setTargetDepartment(e.target.value)} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-maroon-700 bg-slate-50">
                            {studentDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Target Batch</label>
                        <select value={targetBatch} onChange={(e) => setTargetBatch(e.target.value)} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-maroon-700 bg-slate-50">
                            {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Class Year</label>
                        <select value={targetClass} onChange={(e) => setTargetClass(e.target.value)} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-maroon-700 bg-slate-50">
                            {['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Day of Week</label>
                        <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-maroon-700 bg-slate-50">
                            {allDays.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Start Time</label>
                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-maroon-700 bg-slate-50" required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">End Time</label>
                        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-maroon-700 bg-slate-50" required />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Subject</label>
                    <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-maroon-700" placeholder="e.g. Biochemistry II" required />
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Instructor</label>
                    <input type="text" value={instructor} onChange={(e) => setInstructor(e.target.value)} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-maroon-700" placeholder="Dr. Name" required />
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Room / Location</label>
                    <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-maroon-700" placeholder="e.g. Lab 1 or Hall B" required />
                </div>
            </div>

            <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 py-3 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-maroon-700 hover:bg-maroon-800 text-white py-3 rounded-lg font-bold shadow-md transition-all active:scale-95">Save Schedule</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
