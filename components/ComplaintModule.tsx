
import React, { useState } from 'react';
import { Complaint, User, UserRole } from '../types';
import { analyzeComplaint } from '../services/geminiService';
import { AlertCircle, CheckCircle2, Clock, Loader2, Send, ShieldAlert } from 'lucide-react';
import { getLahoreDate } from '../constants';

interface ComplaintModuleProps {
  complaints: Complaint[];
  onAddComplaint: (complaint: Complaint) => void;
  onUpdateStatus: (id: string, status: Complaint['status']) => void;
  currentUser: User;
}

export const ComplaintModule: React.FC<ComplaintModuleProps> = ({ complaints, onAddComplaint, onUpdateStatus, currentUser }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    setIsSubmitting(true);
    const analysis = await analyzeComplaint(description);

    const newComplaint: Complaint = {
      id: `c-${Date.now()}`,
      subject,
      description,
      status: 'Pending',
      date: getLahoreDate(), 
      priority: analysis.priority,
      category: analysis.category,
      authorName: currentUser.name,
      authorId: currentUser.id
    };

    onAddComplaint(newComplaint);
    setIsSubmitting(false);
    setSubject('');
    setDescription('');
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Complaint Center</h2>
          <p className="text-slate-500">Submit grievances for quick resolution.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief title of the issue"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maroon-700 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed explanation..."
                rows={5}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maroon-700 outline-none resize-none"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-maroon-700 hover:bg-maroon-800 text-white py-2.5 rounded-lg font-medium shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Submit Complaint</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <h3 className="text-lg font-bold text-slate-700">Recent Complaints</h3>
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No complaints submitted yet.
            </div>
          ) : (
            complaints.map((c) => (
              <div key={c.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 sm:gap-6 hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                        <h4 className="font-bold text-slate-800">{c.subject}</h4>
                        {isAdmin && c.authorName && (
                             <div className="flex items-center gap-1 mt-1 text-xs text-maroon-700 bg-maroon-50 px-2 py-0.5 rounded-full w-fit">
                                <ShieldAlert size={10} />
                                <span className="font-semibold">From:</span> {c.authorName}
                             </div>
                        )}
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{c.date}</span>
                  </div>
                  <p className="text-slate-600 text-sm mb-3">{c.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {c.priority && (
                      <span className={`text-xs px-2 py-1 rounded-md font-medium border ${
                        c.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                        c.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        Priority: {c.priority}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex sm:flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-6 min-w-[140px]">
                  {isAdmin ? (
                    <select 
                      value={c.status}
                      onChange={(e) => onUpdateStatus(c.id, e.target.value as Complaint['status'])}
                      className="w-full border rounded px-2 py-1 text-sm outline-none bg-slate-50"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  ) : (
                    <span className="text-sm font-bold">{c.status}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
