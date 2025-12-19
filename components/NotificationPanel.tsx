
import React from 'react';
import { AppNotification } from '../types';
import { X, Check, Trash2, Bell, Info, MessageSquareWarning, CalendarClock } from 'lucide-react';

interface NotificationPanelProps {
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onDelete: (id: string) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
  notifications, 
  isOpen, 
  onClose, 
  onMarkRead,
  onClearAll,
  onDelete
}) => {
  if (!isOpen) return null;

  const sortedNotifications = [...notifications].sort((a, b) => {
    // Sort by unread first, then date
    if (a.read === b.read) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return a.read ? 1 : -1;
  });

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'ANNOUNCEMENT': return <Info size={16} className="text-blue-500" />;
      case 'COMPLAINT': return <MessageSquareWarning size={16} className="text-orange-500" />;
      case 'SYSTEM': return <CalendarClock size={16} className="text-maroon-500" />;
      default: return <Bell size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="absolute top-16 right-4 z-40 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in origin-top-right">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-2">
           <Bell size={18} className="text-maroon-700 dark:text-maroon-400" />
           <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
           <span className="bg-maroon-100 text-maroon-800 text-xs px-2 py-0.5 rounded-full font-bold">
             {notifications.filter(n => !n.read).length}
           </span>
        </div>
        <div className="flex items-center gap-2">
            {notifications.length > 0 && (
                <button 
                    onClick={onClearAll}
                    className="text-xs text-slate-400 hover:text-red-500 underline decoration-dotted"
                >
                    Clear All
                </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={18} />
            </button>
        </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto">
        {sortedNotifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center">
            <Bell size={32} className="mb-2 opacity-20" />
            <p className="text-sm">No new notifications.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedNotifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative group ${!notif.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
              >
                <div className="flex gap-3">
                  <div className="mt-1 shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h4 className={`text-sm font-semibold mb-1 truncate ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {notif.title}
                        </h4>
                        {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5 ml-2"></span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">{notif.date}</span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             {!notif.read && (
                                <button 
                                    onClick={() => onMarkRead(notif.id)}
                                    className="p-1 text-slate-400 hover:text-blue-600 rounded"
                                    title="Mark as read"
                                >
                                    <Check size={14} />
                                </button>
                             )}
                             <button 
                                onClick={() => onDelete(notif.id)}
                                className="p-1 text-slate-400 hover:text-red-500 rounded"
                                title="Delete"
                             >
                                <Trash2 size={14} />
                             </button>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
