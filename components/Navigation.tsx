
import React from 'react';
import { ViewState, User, UserRole } from '../types';
import { APP_LOGO } from '../constants';
import { LayoutDashboard, CalendarCheck, CalendarDays, Bell, MessageSquareWarning, LogOut, UserCircle, Users, Download, GraduationCap, ChevronRight, TrendingUp, ShieldAlert } from 'lucide-react';

interface NavigationProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  currentUser: User;
  onLogout: () => void;
  installPrompt: any;
  onInstall: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentView, 
  onNavigate, 
  isMobileOpen, 
  setIsMobileOpen, 
  currentUser,
  onLogout,
  installPrompt,
  onInstall
}) => {
  const navItems: { id: ViewState; label: string; icon: React.ReactNode; adminOnly?: boolean; staffAllowed?: boolean }[] = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'ATTENDANCE', label: 'Attendance', icon: <CalendarCheck size={20} /> },
    { id: 'TIMETABLE', label: 'Time Table', icon: <CalendarDays size={20} /> },
    { id: 'PROGRESS_REPORT', label: 'Progress Report', icon: <TrendingUp size={20} /> },
    { id: 'ANNOUNCEMENTS', label: 'Announcements', icon: <Bell size={20} /> },
    { id: 'COMPLAINTS', label: 'Complaint Center', icon: <MessageSquareWarning size={20} /> },
    { id: 'ACADEMIC_MANAGEMENT', label: 'Academics', icon: <ShieldAlert size={20} />, adminOnly: true },
    { id: 'USERS', label: 'Users', icon: <Users size={20} />, adminOnly: true },
  ];

  // Logic to show/hide items
  const filteredItems = navItems.filter(item => {
      // 1. Admin sees everything
      if (currentUser.role === UserRole.ADMIN) return true;
      
      // 2. Admin Only items hidden from others
      if (item.adminOnly) return false;

      // 3. Progress Report: Visible to Students, Admin, and Teaching Staff.
      // Hidden for non-teaching staff (like admission, security etc) unless they are admin.
      if (item.id === 'PROGRESS_REPORT') {
          if (currentUser.role === UserRole.STUDENT) return true;
          if (currentUser.role === UserRole.STAFF && (currentUser.department === 'Teaching Staff' || currentUser.department === 'Faculty')) return true;
          return false; // Hide for other staff
      }

      return true;
  });

  // Hexagon Clip Path Style
  const hexagonStyle = { clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)' };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-maroon-700 dark:bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-screen shadow-xl flex flex-col border-r border-maroon-800 dark:border-slate-800
      `}>
        <div className="p-6 border-b border-maroon-800 dark:border-slate-800 flex items-center space-x-3 bg-maroon-800 dark:bg-slate-950">
          {/* Hexagonal Logo Container */}
          <div className="w-10 h-10 bg-gold-400 flex items-center justify-center shadow-sm" style={hexagonStyle}>
             <div className="w-[36px] h-[36px] bg-white flex items-center justify-center" style={hexagonStyle}>
                <GraduationCap size={24} className="text-maroon-700" />
             </div>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-gold-100">KIAHS</h1>
            <p className="text-xs text-maroon-200 dark:text-slate-400">Portal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsMobileOpen(false);
              }}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                ${currentView === item.id 
                  ? 'bg-maroon-900 dark:bg-slate-800 text-white shadow-md border-l-4 border-gold-500' 
                  : 'text-maroon-100 dark:text-slate-400 hover:bg-maroon-600 dark:hover:bg-slate-800 hover:text-white'}
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          
          {installPrompt && (
            <button
              onClick={onInstall}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium text-gold-300 hover:bg-maroon-600 dark:hover:bg-slate-800 hover:text-gold-200 mt-4"
            >
              <Download size={20} />
              <span>Install App</span>
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-maroon-800 dark:border-slate-800 bg-maroon-800 dark:bg-slate-950">
          <button
            onClick={() => {
               onNavigate('PROFILE');
               setIsMobileOpen(false);
            }} 
            className={`flex items-center space-x-3 mb-4 px-2 w-full text-left rounded-lg p-2 transition-colors ${currentView === 'PROFILE' ? 'bg-maroon-900 dark:bg-slate-800' : 'hover:bg-maroon-600 dark:hover:bg-slate-800'}`}
          >
            <div className="bg-maroon-600 dark:bg-slate-800 p-2 rounded-full border border-maroon-500 dark:border-slate-700 shrink-0">
               {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
               ) : (
                  <UserCircle size={20} className="text-gold-200"/>
               )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-maroon-200 dark:text-slate-400 truncate capitalize">
                  View Profile
              </p>
            </div>
            <ChevronRight size={16} className="text-maroon-300" />
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 bg-maroon-900 dark:bg-slate-800 hover:bg-maroon-950 dark:hover:bg-slate-700 text-maroon-100 dark:text-slate-300 hover:text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium border border-maroon-700 dark:border-slate-700"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};
