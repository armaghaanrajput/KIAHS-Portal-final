
import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, UserRole, LeaveApplication } from '../types';
import { Check, X, Clock, Calendar, Lock, Filter, Building2, Download, Plus, AlertCircle, Info, CheckCircle2, XCircle } from 'lucide-react';
import { getLahoreDate, getLahoreTime } from '../constants';

interface AttendanceModuleProps {
  attendanceRecords: AttendanceRecord[];
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
  currentUser: User;
  users: User[];
  leaveApplications?: LeaveApplication[];
  onAddLeave?: (leave: LeaveApplication) => void;
  onUpdateLeaveStatus?: (id: string, status: 'Approved' | 'Rejected', reason?: string) => void;
  studentDepartments: string[];
  staffDepartments: string[];
  fiveYearPrograms: string[];
  availableBatches: string[];
}

export const AttendanceModule: React.FC<AttendanceModuleProps> = ({ 
    attendanceRecords, 
    onUpdateAttendance, 
    currentUser, 
    users,
    leaveApplications = [],
    onAddLeave,
    onUpdateLeaveStatus,
    studentDepartments,
    staffDepartments,
    fiveYearPrograms,
    availableBatches
}) => {
  const [viewMode, setViewMode] = useState<'ATTENDANCE' | 'LEAVES'>('ATTENDANCE');
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'STAFF'>('STUDENT');
  
  const [selectedDate, setSelectedDate] = useState<string>(getLahoreDate());
  const [selectedClass, setSelectedClass] = useState('1st Year');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveFrom, setLeaveFrom] = useState('');
  const [leaveTo, setLeaveTo] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveFilterStatus, setLeaveFilterStatus] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');

  useEffect(() => {
    if (activeTab === 'STUDENT') {
        setSelectedDepartment(studentDepartments[0] || '');
    } else {
        setSelectedDepartment('All'); 
    }
  }, [activeTab, studentDepartments]);

  useEffect(() => {
    if (activeTab === 'STUDENT' && selectedDepartment) {
       if (availableBatches.length > 0) setSelectedBatch(availableBatches[0]);
    }
  }, [selectedDepartment, activeTab, availableBatches]);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState<string>(getLahoreDate());
  const [exportEndDate, setExportEndDate] = useState<string>(getLahoreDate());

  const isStudent = currentUser.role === UserRole.STUDENT;
  const isStaff = currentUser.role === UserRole.STAFF;
  const isAdmin = currentUser.role === UserRole.ADMIN;

  const isAuthorizedStaff = isAdmin || (isStaff && (currentUser.department === 'Teaching Staff' || currentUser.department === 'Faculty'));
  const canMarkStatus = isAdmin || (isAuthorizedStaff && activeTab === 'STUDENT');

  const handleStatusChange = (userId: string, userName: string, status: 'Present' | 'Absent' | 'Late' | 'Online') => {
    if (!canMarkStatus) return;
    const existingIndex = attendanceRecords.findIndex(r => r.userId === userId && r.date === selectedDate);
    const user = users.find(u => u.id === userId);
    let newRecords = [...attendanceRecords];
    if (existingIndex >= 0) {
      newRecords[existingIndex] = { ...newRecords[existingIndex], status };
    } else {
      newRecords.push({
        id: `att-${userId}-${selectedDate}`,
        userId, userName, date: selectedDate, status,
        role: activeTab === 'STUDENT' ? UserRole.STUDENT : UserRole.STAFF,
        classYear: user?.classYear,
        batch: user?.batch
      });
    }
    onUpdateAttendance(newRecords);
  };

  const handleTimeChange = (userId: string, userName: string, time: string) => {
    const isSelf = currentUser.id === userId;
    if (!isAdmin && !isSelf) return;
    const existingIndex = attendanceRecords.findIndex(r => r.userId === userId && r.date === selectedDate);
    let newRecords = [...attendanceRecords];
    if (existingIndex >= 0) {
      newRecords[existingIndex] = { ...newRecords[existingIndex], officeReachedTime: time, status: 'Present' };
    } else {
      newRecords.push({ id: `att-${userId}-${selectedDate}`, userId, userName, date: selectedDate, status: 'Present', role: UserRole.STAFF, officeReachedTime: time });
    }
    onUpdateAttendance(newRecords);
  };

  const handleMarkCurrentTime = (userId: string, userName: string) => {
    const currentTime = getLahoreTime();
    handleTimeChange(userId, userName, currentTime);
  };

  const handleExportCSV = () => {
    let usersToExport = users.filter(u => activeTab === 'STUDENT' ? u.role === UserRole.STUDENT : u.role === UserRole.STAFF);
    if (activeTab === 'STUDENT') {
      usersToExport = usersToExport.filter(u => (!u.classYear || u.classYear === selectedClass) && (!u.batch || u.batch === selectedBatch) && (!selectedDepartment || u.department === selectedDepartment));
    } else if (selectedDepartment && selectedDepartment !== 'All') {
        usersToExport = usersToExport.filter(u => u.department === selectedDepartment);
    }

    const dates: string[] = [];
    let curr = new Date(exportStartDate);
    const end = new Date(exportEndDate);
    while (curr <= end) { dates.push(curr.toISOString().split('T')[0]); curr.setDate(curr.getDate() + 1); }

    const headers = ['Date', 'User ID', 'Name', 'Role', 'Department', 'Class', 'Batch', 'Status', 'Arrival Time'];
    const rows = [headers.join(',')];
    dates.forEach(date => {
      usersToExport.forEach(user => {
        const record = attendanceRecords.find(r => r.userId === user.id && r.date === date);
        const row = [date, user.id, `"${user.name}"`, user.role, user.department || '', user.classYear || '', user.batch || '', record?.status || 'Absent', record?.officeReachedTime || ''];
        rows.push(row.join(','));
      });
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `KIAHS_Attendance_${activeTab}.csv`);
    link.click();
    setShowExportModal(false);
  };

  const renderStatusBadge = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
            <CheckCircle2 size={14} />
            Present
          </span>
        );
      case 'Late':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
            <Clock size={14} />
            Late
          </span>
        );
      case 'Absent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <XCircle size={14} />
            Absent
          </span>
        );
      case 'Online':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Info size={14} />
            Online
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
            <Clock size={14} />
            Not Marked
          </span>
        );
    }
  };

  const renderViewToggle = () => (
      <div className="flex bg-slate-100 p-1 rounded-lg mb-6 w-fit">
          <button onClick={() => setViewMode('ATTENDANCE')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'ATTENDANCE' ? 'bg-white text-maroon-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Daily Attendance</button>
          <button onClick={() => setViewMode('LEAVES')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${viewMode === 'LEAVES' ? 'bg-white text-maroon-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <span>Leaves</span>
              {isAdmin && <span className="bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full font-bold">{leaveApplications.filter(l => l.status === 'Pending').length}</span>}
          </button>
      </div>
  );

  if (viewMode === 'LEAVES') {
      if (!isAdmin) {
          const myLeaves = leaveApplications.filter(l => l.applicantId === currentUser.id).sort((a,b) => b.appliedOn.localeCompare(a.appliedOn));
          return (
              <div>
                  {renderViewToggle()}
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-slate-800">My Leave Applications</h2>
                      <button onClick={() => setShowLeaveModal(true)} className="bg-maroon-700 hover:bg-maroon-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
                          <Plus size={18} />
                          Apply for Leave
                      </button>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 border-b text-slate-600 font-medium">
                              <tr><th className="px-6 py-4">Applied</th><th className="px-6 py-4">Duration</th><th className="px-6 py-4">Reason</th><th className="px-6 py-4">Status</th></tr>
                          </thead>
                          <tbody className="divide-y text-slate-700">
                              {myLeaves.length > 0 ? myLeaves.map(l => (
                                  <tr key={l.id} className="hover:bg-slate-50">
                                      <td className="px-6 py-4">{l.appliedOn}</td>
                                      <td className="px-6 py-4">{l.dateFrom} to {l.dateTo}</td>
                                      <td className="px-6 py-4 max-w-xs truncate" title={l.reason}>{l.reason}</td>
                                      <td className="px-6 py-4">
                                          <div className="flex flex-col gap-1">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold w-fit ${
                                                l.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                                                l.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>{l.status}</span>
                                            {l.status === 'Rejected' && l.rejectionReason && (
                                                <span className="text-[10px] text-red-500 italic">Note: {l.rejectionReason}</span>
                                            )}
                                          </div>
                                      </td>
                                  </tr>
                              )) : (
                                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">No leave applications found.</td></tr>
                              )}
                          </tbody>
                      </table>
                  </div>
                  {showLeaveModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
                              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Plus size={20} className="text-maroon-700"/>Apply for Leave</h3>
                              <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <label className="text-xs font-bold text-slate-500 block mb-1">From</label>
                                          <input type="date" value={leaveFrom} onChange={(e) => setLeaveFrom(e.target.value)} className="w-full border rounded p-2 outline-none focus:ring-2 focus:ring-maroon-700" />
                                      </div>
                                      <div>
                                          <label className="text-xs font-bold text-slate-500 block mb-1">To</label>
                                          <input type="date" value={leaveTo} onChange={(e) => setLeaveTo(e.target.value)} className="w-full border rounded p-2 outline-none focus:ring-2 focus:ring-maroon-700" />
                                      </div>
                                  </div>
                                  <div>
                                      <label className="text-xs font-bold text-slate-500 block mb-1">Reason</label>
                                      <textarea value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} className="w-full border p-2 rounded h-24 outline-none focus:ring-2 focus:ring-maroon-700 resize-none" placeholder="Explain your leave reason..." />
                                  </div>
                                  <div className="flex gap-2">
                                      <button onClick={() => setShowLeaveModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 py-2 rounded font-medium transition-colors">Cancel</button>
                                      <button onClick={() => { 
                                          if(!leaveFrom || !leaveTo || !leaveReason) return alert("Please fill all fields");
                                          if(onAddLeave) onAddLeave({ 
                                              id: `leave-${Date.now()}`, 
                                              applicantId: currentUser.id, 
                                              applicantName: currentUser.name, 
                                              applicantRole: currentUser.role,
                                              classYear: currentUser.classYear, 
                                              department: currentUser.department || 'General', 
                                              dateFrom: leaveFrom, 
                                              dateTo: leaveTo, 
                                              reason: leaveReason, 
                                              status: 'Pending', 
                                              appliedOn: getLahoreDate() 
                                          }); 
                                          setShowLeaveModal(false);
                                          setLeaveFrom(''); setLeaveTo(''); setLeaveReason('');
                                      }} className="flex-1 bg-maroon-700 hover:bg-maroon-800 text-white py-2 rounded font-bold shadow-md transition-colors">Submit</button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          );
      }

      const filteredLeaves = leaveApplications.filter(l => leaveFilterStatus === 'All' ? true : l.status === leaveFilterStatus);
      return (
          <div className="space-y-6">
              {renderViewToggle()}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold text-slate-800">Review Leave Applications</h2>
                  <div className="flex gap-1 bg-white border p-1 rounded-lg shadow-sm">
                      {['Pending', 'Approved', 'Rejected', 'All'].map(s => (
                          <button key={s} onClick={() => setLeaveFilterStatus(s as any)} className={`px-4 py-1.5 text-xs font-bold rounded transition-all ${leaveFilterStatus === s ? 'bg-maroon-700 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>{s}</button>
                      ))}
                  </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b text-slate-600 font-medium">
                            <tr>
                                <th className="px-6 py-4">Applicant</th>
                                <th className="px-6 py-4">Dates</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-slate-700">
                            {filteredLeaves.length > 0 ? filteredLeaves.map(l => (
                                <tr key={l.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">{l.applicantName}</span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-tighter">{l.applicantRole} • {l.department}</span>
                                            {l.classYear && <span className="text-[10px] text-maroon-700 font-bold">{l.classYear}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        <div className="font-medium">{l.dateFrom} to {l.dateTo}</div>
                                        <div className="text-slate-400 mt-0.5">Applied: {l.appliedOn}</div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate" title={l.reason}>{l.reason}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold w-fit ${
                                                l.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                                                l.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>{l.status}</span>
                                            {l.status === 'Rejected' && l.rejectionReason && (
                                                <span className="text-[10px] text-red-500 italic max-w-[120px] line-clamp-2">Reason: {l.rejectionReason}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            {l.status === 'Pending' ? (
                                                <>
                                                    <button 
                                                        onClick={() => { if(confirm("Approve this leave?")) onUpdateLeaveStatus?.(l.id, 'Approved'); }} 
                                                        className="flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white px-3 py-1 rounded text-xs font-bold transition-all border border-green-200"
                                                    >
                                                        <Check size={14} /> Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            const reason = prompt("Enter rejection reason (optional):");
                                                            if (reason !== null) onUpdateLeaveStatus?.(l.id, 'Rejected', reason);
                                                        }} 
                                                        className="flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white px-3 py-1 rounded text-xs font-bold transition-all border border-red-200"
                                                    >
                                                        <X size={14} /> Reject
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-1 text-slate-400 italic text-xs">
                                                    <AlertCircle size={14} /> Processed
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                                    <Info size={32} className="opacity-20" />
                                    <p>No leave applications matching the filter.</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>
      );
  }

  let filteredList = users.filter(u => activeTab === 'STUDENT' ? u.role === UserRole.STUDENT : u.role === UserRole.STAFF);
  if (activeTab === 'STUDENT') {
      filteredList = filteredList.filter(u => (!u.classYear || u.classYear === selectedClass) && (!u.batch || u.batch === selectedBatch) && (!selectedDepartment || u.department === selectedDepartment));
  } else if (selectedDepartment && selectedDepartment !== 'All') {
      filteredList = filteredList.filter(u => u.department === selectedDepartment);
  }

  return (
    <div className="space-y-6">
      {renderViewToggle()}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Attendance Management</h2>
        <div className="flex gap-2">
            <div className="flex bg-white border rounded-lg p-1 shadow-sm">
                <button onClick={() => setActiveTab('STUDENT')} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'STUDENT' ? 'bg-maroon-700 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Students</button>
                <button onClick={() => setActiveTab('STAFF')} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'STAFF' ? 'bg-maroon-700 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Staff</button>
            </div>
            {(isAdmin || isAuthorizedStaff) && <button onClick={() => setShowExportModal(true)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"><Download size={18}/>Export</button>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {activeTab === 'STUDENT' ? (
            <>
                <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-maroon-700">
                    {studentDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-maroon-700">
                    {['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-maroon-700">
                    {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
            </>
        ) : (
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="col-span-2 border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-maroon-700">
                <option value="All">All Departments</option>
                {staffDepartments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
        )}
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-maroon-700" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-4">Name</th>
              {activeTab === 'STAFF' && <th className="px-6 py-4">Time</th>}
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-700">
            {filteredList.map((person) => {
              const record = attendanceRecords.find(r => r.userId === person.id && r.date === selectedDate);
              const status = record?.status || 'Absent';
              return (
                <tr key={person.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{person.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{person.id}</div>
                  </td>
                  {activeTab === 'STAFF' && (
                      <td className="px-6 py-4">
                          {isAdmin || person.id === currentUser.id ? (
                              <button onClick={() => handleMarkCurrentTime(person.id, person.name)} className="text-xs bg-maroon-700 hover:bg-maroon-800 text-white px-3 py-1.5 rounded flex items-center gap-1 shadow-sm transition-colors">
                                  <Clock size={12}/> Mark Now
                              </button>
                          ) : (
                              <span className="font-mono">{record?.officeReachedTime || '--:--'}</span>
                          )}
                      </td>
                  )}
                  <td className="px-6 py-4 text-center">
                    {renderStatusBadge(status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {canMarkStatus ? (
                        <div className="flex justify-end gap-1">
                            <button 
                                onClick={() => handleStatusChange(person.id, person.name, 'Present')} 
                                className={`p-1.5 border rounded transition-colors ${status === 'Present' ? 'bg-green-600 text-white border-green-600' : 'hover:bg-green-50 text-slate-400'}`} 
                                title="Mark Present"
                            >
                                <Check size={16}/>
                            </button>
                            <button 
                                onClick={() => handleStatusChange(person.id, person.name, 'Late')} 
                                className={`p-1.5 border rounded transition-colors ${status === 'Late' ? 'bg-yellow-500 text-white border-yellow-500' : 'hover:bg-yellow-50 text-slate-400'}`} 
                                title="Mark Late"
                            >
                                <Clock size={16}/>
                            </button>
                            <button 
                                onClick={() => handleStatusChange(person.id, person.name, 'Absent')} 
                                className={`p-1.5 border rounded transition-colors ${status === 'Absent' ? 'bg-red-600 text-white border-red-600' : 'hover:bg-red-50 text-slate-400'}`} 
                                title="Mark Absent"
                            >
                                <X size={16}/>
                            </button>
                        </div>
                    ) : (
                        <span className="text-xs text-slate-400 italic">View Only</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredList.length === 0 && (
                <tr><td colSpan={activeTab === 'STAFF' ? 4 : 3} className="px-6 py-8 text-center text-slate-400 italic">No users found for this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl animate-fade-in">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-maroon-800"><Download size={20}/>Export CSV</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-slate-500 block mb-1">Start Date</label>
                          <input type="date" value={exportStartDate} onChange={(e) => setExportStartDate(e.target.value)} className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-maroon-700" />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-slate-500 block mb-1">End Date</label>
                          <input type="date" value={exportEndDate} onChange={(e) => setExportEndDate(e.target.value)} className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-maroon-700" />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => setShowExportModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 py-2 rounded font-medium transition-colors">Close</button>
                        <button onClick={handleExportCSV} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold shadow-md transition-colors">Download</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
