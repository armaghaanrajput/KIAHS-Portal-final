
import React, { useState } from 'react';
import { User, UserRole, ClassTest } from '../types';
import { Filter, Search, Plus, Trash2, TrendingUp, BookOpen, GraduationCap, X, Calendar, PieChart, AlertCircle } from 'lucide-react';
import { getLahoreDate } from '../constants';

interface ProgressReportModuleProps {
  currentUser: User;
  users: User[];
  classTests: ClassTest[];
  onAddTest: (test: ClassTest) => void;
  onDeleteTest: (id: string) => void;
  studentDepartments: string[];
  fiveYearPrograms: string[];
  availableBatches: string[];
}

export const ProgressReportModule: React.FC<ProgressReportModuleProps> = ({ 
  currentUser, 
  users, 
  classTests, 
  onAddTest, 
  onDeleteTest,
  studentDepartments,
  fiveYearPrograms,
  availableBatches
}) => {
  const isStudent = currentUser.role === UserRole.STUDENT;
  const isAuthorizedStaff = currentUser.role === UserRole.ADMIN || (currentUser.role === UserRole.STAFF && (currentUser.department === 'Teaching Staff' || currentUser.department === 'Faculty'));

  const [selectedDept, setSelectedDept] = useState(studentDepartments[0] || '');
  const [selectedClass, setSelectedClass] = useState('1st Year');
  const [selectedBatch, setSelectedBatch] = useState(availableBatches[0] || '');
  const [searchStudent, setSearchStudent] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetStudent, setTargetStudent] = useState<User | null>(null);
  const [viewStudent, setViewStudent] = useState<User | null>(null);
  
  const [testTitle, setTestTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [totalMarks, setTotalMarks] = useState(50);
  const [obtainedMarks, setObtainedMarks] = useState(0);
  const [testDate, setTestDate] = useState(getLahoreDate());

  const filteredStudents = users.filter(u => {
      if (u.role !== UserRole.STUDENT) return false;
      const matchesDept = u.department === selectedDept;
      const matchesClass = u.classYear === selectedClass;
      const matchesBatch = selectedBatch ? u.batch === selectedBatch : true;
      const matchesSearch = u.name.toLowerCase().includes(searchStudent.toLowerCase());
      return matchesDept && matchesClass && matchesBatch && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!targetStudent) return;
      onAddTest({
          id: `test-${Date.now()}`,
          studentId: targetStudent.id,
          studentName: targetStudent.name,
          department: targetStudent.department || '',
          classYear: targetStudent.classYear || '',
          batch: targetStudent.batch || '',
          instructorId: currentUser.id,
          title: testTitle,
          subject: subject,
          totalMarks, obtainedMarks, date: testDate
      });
      setShowAddModal(false);
  };

  if (isStudent) {
      const myTests = classTests.filter(t => t.studentId === currentUser.id).sort((a,b) => b.date.localeCompare(a.date));
      const avg = myTests.length > 0 ? Math.round(myTests.reduce((acc, curr) => acc + ((curr.obtainedMarks / curr.totalMarks) * 100), 0) / myTests.length) : 0;
      return (
          <div className="space-y-6">
              <h2 className="text-2xl font-bold">My Progress</h2>
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-maroon-700 p-4 rounded-xl text-white">
                      <p className="text-xs opacity-80">Average Score</p>
                      <h3 className="text-2xl font-bold">{avg}%</h3>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-xl text-white">
                      <p className="text-xs opacity-80">Tests Taken</p>
                      <h3 className="text-2xl font-bold">{myTests.length}</h3>
                  </div>
              </div>
              <div className="bg-white rounded-xl border overflow-hidden">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b"><tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">Subject</th><th className="px-6 py-4">Marks</th></tr></thead>
                      <tbody className="divide-y">{myTests.map(t => (
                          <tr key={t.id}>
                              <td className="px-6 py-4 text-xs">{t.date}</td>
                              <td className="px-6 py-4 font-bold">{t.title} ({t.subject})</td>
                              <td className="px-6 py-4">{t.obtainedMarks}/{t.totalMarks}</td>
                          </tr>
                      ))}</tbody>
                  </table>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold">Progress Reports</h2>
        <div className="bg-white p-4 rounded-xl border grid md:grid-cols-4 gap-4">
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="border rounded p-2 text-sm">
                {studentDepartments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="border rounded p-2 text-sm">
                {['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="border rounded p-2 text-sm">
                <option value="">All Batches</option>
                {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <input type="text" placeholder="Search Student..." value={searchStudent} onChange={(e) => setSearchStudent(e.target.value)} className="border rounded p-2 text-sm" />
        </div>

        <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b"><tr><th className="px-6 py-4">Student</th><th className="px-6 py-4 text-center">Tests</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
                <tbody className="divide-y">{filteredStudents.map(s => (
                    <tr key={s.id} onClick={() => setViewStudent(s)} className="hover:bg-slate-50 cursor-pointer">
                        <td className="px-6 py-4 font-bold">{s.name}</td>
                        <td className="px-6 py-4 text-center">{classTests.filter(t => t.studentId === s.id).length}</td>
                        <td className="px-6 py-4 text-right">
                            {isAuthorizedStaff && <button onClick={(e) => { e.stopPropagation(); setTargetStudent(s); setShowAddModal(true); }} className="bg-maroon-700 text-white px-2 py-1 rounded text-xs">Add Test</button>}
                        </td>
                    </tr>
                ))}</tbody>
            </table>
        </div>

        {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                <form onSubmit={handleAddSubmit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
                    <h3 className="text-lg font-bold">Add Test Result: {targetStudent?.name}</h3>
                    <input type="text" value={testTitle} onChange={(e) => setTestTitle(e.target.value)} placeholder="Title (e.g. Midterm)" className="w-full border p-2 rounded" required />
                    <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="w-full border p-2 rounded" required />
                    <div className="grid grid-cols-2 gap-2">
                        <input type="number" value={obtainedMarks} onChange={(e) => setObtainedMarks(parseInt(e.target.value))} className="border p-2 rounded" placeholder="Obtained" />
                        <input type="number" value={totalMarks} onChange={(e) => setTotalMarks(parseInt(e.target.value))} className="border p-2 rounded" placeholder="Total" />
                    </div>
                    <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} className="w-full border p-2 rounded" />
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-100 py-2 rounded">Cancel</button>
                        <button type="submit" className="flex-1 bg-maroon-700 text-white py-2 rounded">Save</button>
                    </div>
                </form>
            </div>
        )}
    </div>
  );
};
