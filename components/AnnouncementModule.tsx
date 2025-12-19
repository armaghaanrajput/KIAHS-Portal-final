
import React, { useState } from 'react';
import { Announcement, User, UserRole } from '../types';
import { generateAnnouncement } from '../services/geminiService';
import { Calendar, Sparkles, Loader2, Plus, X, Trash2 } from 'lucide-react';
import { getLahoreDate } from '../constants';

interface AnnouncementModuleProps {
  announcements: Announcement[];
  onAddAnnouncement: (announcement: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
  currentUser: User;
}

export const AnnouncementModule: React.FC<AnnouncementModuleProps> = ({ announcements, onAddAnnouncement, onDeleteAnnouncement, currentUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const isAdmin = currentUser.role === UserRole.ADMIN;
  const canCreate = isAdmin;

  const handleGenerate = async () => {
    if (!newTopic) return;
    setIsGenerating(true);
    const content = await generateAnnouncement(newTopic);
    setNewContent(content);
    if (!newTitle) setNewTitle(newTopic);
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    onAddAnnouncement({
      id: `a-${Date.now()}`,
      title: newTitle,
      content: newContent,
      date: getLahoreDate(), 
      author: currentUser.name,
      isImportant: false
    });
    setShowModal(false);
    setNewTopic('');
    setNewTitle('');
    setNewContent('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Announcements</h2>
          <p className="text-slate-500">Latest news and updates from the administration.</p>
        </div>
        {canCreate && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-maroon-700 hover:bg-maroon-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>New Announcement</span>
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {announcements.map((ann) => (
          <div key={ann.id} className={`bg-white rounded-xl p-6 shadow-sm border ${ann.isImportant ? 'border-l-4 border-l-red-500 border-slate-200' : 'border-slate-200'} hover:shadow-md transition-shadow relative group`}>
             {isAdmin && (
              <button 
                onClick={() => onDeleteAnnouncement(ann.id)}
                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Announcement"
              >
                <Trash2 size={16} />
              </button>
            )}
            <div className="flex justify-between items-start mb-3 pr-8">
              <span className="text-xs font-semibold text-slate-400 flex items-center">
                <Calendar size={12} className="mr-1" /> {ann.date}
              </span>
              {ann.isImportant && (
                <span className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">Important</span>
              )}
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">{ann.title}</h3>
            <p className="text-slate-600 text-sm line-clamp-4 whitespace-pre-line">{ann.content}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">By {ann.author}</span>
              <button className="text-maroon-700 text-sm font-medium hover:underline">Read more</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && canCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Create Announcement</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-maroon-50 p-4 rounded-lg border border-maroon-100">
                <label className="block text-sm font-semibold text-maroon-900 mb-2 flex items-center gap-2">
                  <Sparkles size={16} className="text-maroon-600" />
                  AI Assistant
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="E.g., Winter vacation dates, Exam postponement..."
                    className="flex-1 border border-maroon-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-maroon-500 outline-none"
                  />
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !newTopic}
                    className="bg-maroon-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-maroon-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : 'Draft'}
                  </button>
                </div>
                <p className="text-xs text-maroon-400 mt-2">Enter a topic and let Gemini draft a professional announcement for you.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input 
                    type="text" 
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maroon-700 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                  <textarea 
                    required
                    rows={8}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maroon-700 outline-none transition-all"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-maroon-700 text-white rounded-lg font-medium hover:bg-maroon-800 shadow-md transition-colors"
                  >
                    Post Announcement
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
