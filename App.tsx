
import React, { useState, useEffect } from 'react';
import { ViewState, Announcement, Complaint, AttendanceRecord, User, UserRole, TimeTableSlot, DashboardPreferences, DashboardWidgetType, StatType, AppNotification, ClassTest, LeaveApplication } from './types';
import { MOCK_ANNOUNCEMENTS, MOCK_TIMETABLE, INITIAL_COMPLAINTS, INITIAL_ATTENDANCE, ALL_USERS, STUDENT_DEPARTMENTS, FIVE_YEAR_PROGRAMS, STAFF_DEPARTMENTS, MOCK_CLASS_TESTS, INITIAL_LEAVE_APPLICATIONS, getLahoreDate, getLahoreDay, getLahoreTime } from './constants';
import { Navigation } from './components/Navigation';
import { AttendanceModule } from './components/AttendanceModule';
import { AnnouncementModule } from './components/AnnouncementModule';
import { TimetableModule } from './components/TimetableModule';
import { ComplaintModule } from './components/ComplaintModule';
import { UserManagementModule } from './components/UserManagementModule';
import { ProfileModule } from './components/ProfileModule';
import { ProgressReportModule } from './components/ProgressReportModule'; 
import { AcademicManagementModule } from './components/AcademicManagementModule';
import { NotificationPanel } from './components/NotificationPanel';
import { Menu, GraduationCap, School, LogIn, Lock, AlertCircle, Mail, MapPin, Phone, UserPlus, Download, ArrowLeft, Loader2, CheckCircle, Users, Settings, GripVertical, ChevronUp, ChevronDown, Moon, Sun, Layout, CheckSquare, X, Bell, ShieldCheck, RefreshCw, MessageSquareWarning } from 'lucide-react';

// Contact Information Constants
const CONTACT_INFO = {
  email: "info@kiahs.edu.pk",
  address: "34-KM Main Feroz Pur Road Mustafabad Lalyani",
  phone: "+92-311-4926339"
};

// Persistence Helper
const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (e) {
    console.error("Failed to load from storage", e);
    return fallback;
  }
};

interface LoginScreenProps {
  onLogin: (user: User) => void;
  users: User[];
  onRegister: (user: User) => void;
  installPrompt: any;
  onInstall: () => void;
  studentDepartments: string[];
  staffDepartments: string[];
  fiveYearPrograms: string[];
  availableBatches: string[];
}

const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLogin, 
  users, 
  onRegister, 
  installPrompt, 
  onInstall,
  studentDepartments,
  staffDepartments,
  fiveYearPrograms,
  availableBatches
}) => {
  const [view, setView] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT'>('LOGIN');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Security State
  const [failedAttempts, setFailedAttempts] = useState(() => {
    return parseInt(localStorage.getItem('kiahs_failed_attempts') || '0');
  });
  const [lockoutUntil, setLockoutUntil] = useState(() => {
    return parseInt(localStorage.getItem('kiahs_lockout_until') || '0');
  });
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Captcha State
  const [captchaChallenge, setCaptchaChallenge] = useState({ q: '', a: '' });
  const [captchaInput, setCaptchaInput] = useState('');
  const [showCaptcha, setShowCaptcha] = useState(false);

  // Registration states
  const [regName, setRegName] = useState('');
  const [regIdSuffix, setRegIdSuffix] = useState(''); 
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>(UserRole.STUDENT);
  const [regDept, setRegDept] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regClassYear, setRegClassYear] = useState('1st Year');
  const [regBatch, setRegBatch] = useState(''); 

  // Recovery states
  const [recoveryEmail, setRecoveryEmail] = useState('');

  // Hexagon Clip Path Style
  const hexagonStyle = { clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)' };

  useEffect(() => {
    if (lockoutUntil > Date.now()) {
      const interval = setInterval(() => {
        const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
        if (remaining <= 0) {
          setLockoutUntil(0);
          setFailedAttempts(0);
          localStorage.removeItem('kiahs_lockout_until');
          localStorage.setItem('kiahs_failed_attempts', '0');
          clearInterval(interval);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutUntil]);

  useEffect(() => {
    if (failedAttempts >= 3) {
      if (!captchaChallenge.q) generateCaptcha();
      setShowCaptcha(true);
    } else {
      setShowCaptcha(false);
    }
    localStorage.setItem('kiahs_failed_attempts', failedAttempts.toString());
  }, [failedAttempts]);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    setCaptchaChallenge({
      q: `${num1} + ${num2}`,
      a: (num1 + num2).toString()
    });
    setCaptchaInput('');
  };

  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const getStrengthLabel = (score: number) => {
    switch(score) {
      case 0: return 'None';
      case 1: return 'Very Weak';
      case 2: return 'Weak';
      case 3: return 'Medium';
      case 4: return 'Strong';
      default: return 'None';
    }
  };

  const getStrengthColor = (score: number) => {
    switch(score) {
      case 0: return 'bg-slate-200';
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      default: return 'bg-slate-200';
    }
  };

  const getStrengthTextColor = (score: number) => {
    switch(score) {
      case 0: return 'text-slate-400';
      case 1: return 'text-red-600';
      case 2: return 'text-orange-600';
      case 3: return 'text-yellow-600';
      case 4: return 'text-green-600';
      default: return 'text-slate-400';
    }
  };

  useEffect(() => {
    if (regDept && regRole === UserRole.STUDENT) {
       if (availableBatches.length > 0) setRegBatch(availableBatches[0]);
       setRegClassYear('1st Year');
    }
  }, [regDept, regRole, availableBatches]);

  const getClassOptions = (dept: string) => {
    if (!dept) return ["1st Year"];
    const isFiveYear = fiveYearPrograms.includes(dept);
    const options = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
    if (isFiveYear) options.push("5th Year");
    return options;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (lockoutUntil > Date.now()) return;

    if (showCaptcha && captchaInput !== captchaChallenge.a) {
        setError('Incorrect CAPTCHA.');
        generateCaptcha();
        return;
    }

    const user = users.find(u => u.id === userId);
    const isValidPassword = user?.password ? user.password === password : password === '1234';

    if (user && isValidPassword) {
      if (user.isSuspended) {
        setError('Your account is suspended.');
        return;
      }
      setFailedAttempts(0);
      onLogin(user);
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 5) {
        const lockoutEnd = Date.now() + 30000;
        setLockoutUntil(lockoutEnd);
        localStorage.setItem('kiahs_lockout_until', lockoutEnd.toString());
      } else {
        setError('Invalid ID or Password.');
        if (showCaptcha) generateCaptcha();
      }
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!regName || !regIdSuffix || !regPassword || !regEmail || !regDept) {
      setError('Please fill in all fields.');
      return;
    }
    if (calculatePasswordStrength(regPassword) < 3) {
      setError('Password must be at least "Medium" strength (include numbers and symbols).');
      return;
    }

    const fullRegId = `KIAHS-member-${regIdSuffix}`;
    if (users.find(u => u.id === fullRegId)) {
      setError('User ID already exists.');
      return;
    }

    const newUser: User = {
      id: fullRegId,
      name: regName,
      role: regRole,
      department: regDept,
      password: regPassword,
      email: regEmail,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(regName)}&background=random`,
      isSuspended: false,
      classYear: regRole === UserRole.STUDENT ? regClassYear : undefined,
      batch: regRole === UserRole.STUDENT ? regBatch : undefined,
      notifications: []
    };
    onRegister(newUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {installPrompt && (
        <button onClick={onInstall} className="fixed top-4 right-4 bg-maroon-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium hover:bg-maroon-800 transition-all z-50 animate-bounce">
          <Download size={16} />
          Install App
        </button>
      )}

      <div className="mb-8 text-center max-w-lg">
        <div className="w-28 h-28 bg-gold-500 flex items-center justify-center mx-auto mb-4 shadow-xl" style={hexagonStyle}>
            <div className="w-[104px] h-[104px] bg-white flex items-center justify-center" style={hexagonStyle}>
               <GraduationCap size={64} className="text-maroon-700" />
            </div>
        </div>
        <h1 className="text-3xl font-extrabold text-maroon-900 tracking-tight">KIAHS Portal</h1>
        <p className="text-maroon-700 font-semibold mt-1">Kasur Institute of Allied Health Sciences</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden">
        {view !== 'FORGOT' && (
          <div className="flex border-b border-slate-100">
            <button onClick={() => { setView('LOGIN'); setError(''); }} className={`flex-1 py-4 text-sm font-semibold transition-colors ${view === 'LOGIN' ? 'bg-maroon-50 text-maroon-800 border-b-2 border-maroon-700' : 'text-slate-500 hover:text-slate-700'}`}>Sign In</button>
            <button onClick={() => { setView('SIGNUP'); setError(''); }} className={`flex-1 py-4 text-sm font-semibold transition-colors ${view === 'SIGNUP' ? 'bg-maroon-50 text-maroon-800 border-b-2 border-maroon-700' : 'text-slate-500 hover:text-slate-700'}`}>Sign Up</button>
          </div>
        )}

        {view === 'FORGOT' && (
           <div className="p-4 border-b border-slate-100 bg-maroon-50 flex items-center gap-2">
             <button onClick={() => setView('LOGIN')} className="text-slate-500 hover:text-maroon-700 p-1"><ArrowLeft size={20} /></button>
             <h2 className="text-lg font-bold text-maroon-800">Account Recovery</h2>
           </div>
        )}

        <div className="p-8">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2 border border-red-200"><AlertCircle size={16} />{error}</div>}
          {successMsg && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm flex items-start gap-2 border border-green-200"><CheckCircle size={16} />{successMsg}</div>}

          {view === 'LOGIN' && (
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">User ID</label>
                        <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="e.g. KIAHS-member-101" disabled={lockoutUntil > Date.now()} className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-maroon-700 outline-none transition-all disabled:bg-slate-100" required />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-slate-700">Password</label>
                            <button type="button" onClick={() => setView('FORGOT')} className="text-xs font-medium text-maroon-600 hover:underline">Forgot Password?</button>
                        </div>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={lockoutUntil > Date.now()} className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-maroon-700 outline-none transition-all disabled:bg-slate-100" required />
                    </div>

                    {showCaptcha && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <label className="block text-xs font-bold text-slate-600 mb-1">Security Check</label>
                            <div className="flex items-center gap-3">
                                <div className="bg-white border border-slate-300 px-3 py-2 rounded font-mono font-bold text-lg tracking-widest text-slate-700 select-none">{captchaChallenge.q} = ?</div>
                                <input type="number" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} placeholder="Ans" className="flex-1 border border-slate-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-maroon-700" required />
                                <button type="button" onClick={generateCaptcha} className="text-slate-400 hover:text-maroon-700"><RefreshCw size={18} /></button>
                            </div>
                        </div>
                    )}
                    
                    <button type="submit" disabled={lockoutUntil > Date.now()} className={`w-full text-white font-semibold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 ${lockoutUntil > Date.now() ? 'bg-slate-400 cursor-not-allowed' : 'bg-maroon-700 hover:bg-maroon-800'}`}>
                        {lockoutUntil > Date.now() ? <><Lock size={18} />Locked ({timeLeft}s)</> : <><Lock size={18} />Sign In</>}
                    </button>
                </form>
          )}

          {view === 'SIGNUP' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="John Doe" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-maroon-700 outline-none" required />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">User ID Number</label>
                  <input type="text" value={regIdSuffix} onChange={(e) => setRegIdSuffix(e.target.value.replace(/\D/g,''))} placeholder="101" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-maroon-700 outline-none" required />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select value={regRole} onChange={(e) => setRegRole(e.target.value as UserRole)} className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none bg-white">
                      <option value={UserRole.STUDENT}>Student</option>
                      <option value={UserRole.STAFF}>Staff</option>
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{regRole === UserRole.STUDENT ? 'Program' : 'Department'}</label>
                  <select value={regDept} onChange={(e) => setRegDept(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none bg-white" required>
                      <option value="" disabled>Select</option>
                      {(regRole === UserRole.STUDENT ? studentDepartments : staffDepartments).map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                      ))}
                  </select>
              </div>
              {regRole === UserRole.STUDENT && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-maroon-50 rounded-lg border border-maroon-100">
                    <div>
                        <label className="block text-xs font-semibold text-maroon-800 mb-1">Class</label>
                        <select value={regClassYear} onChange={(e) => setRegClassYear(e.target.value)} className="w-full border border-maroon-200 rounded px-2 py-1.5 text-sm outline-none">
                            {getClassOptions(regDept).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-maroon-800 mb-1">Batch</label>
                        <select value={regBatch} onChange={(e) => setRegBatch(e.target.value)} className="w-full border border-maroon-200 rounded px-2 py-1.5 text-sm outline-none">
                            {availableBatches.length > 0 ? (
                              availableBatches.map(b => <option key={b} value={b}>{b}</option>)
                            ) : (
                              <option value="">No Batches Defined</option>
                            )}
                        </select>
                    </div>
                  </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="you@example.com" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-maroon-700 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Create a password" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-maroon-700 outline-none" required />
                <div className="flex justify-between items-center mt-2 px-0.5">
                    <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                        {[1, 2, 3, 4].map((step) => (
                            <div 
                                key={step} 
                                className={`h-full flex-1 transition-all duration-300 ${
                                    calculatePasswordStrength(regPassword) >= step 
                                        ? getStrengthColor(calculatePasswordStrength(regPassword)) 
                                        : 'bg-slate-200'
                                }`}
                            ></div>
                        ))}
                    </div>
                    <span className={`text-[9px] font-bold ml-2 uppercase tracking-tighter ${getStrengthTextColor(calculatePasswordStrength(regPassword))}`}>
                        {getStrengthLabel(calculatePasswordStrength(regPassword))}
                    </span>
                </div>
              </div>
              <button type="submit" className="w-full bg-maroon-700 hover:bg-maroon-800 text-white font-semibold py-3 rounded-lg shadow-md flex items-center justify-center gap-2"><UserPlus size={18} />Create Account</button>
            </form>
          )}

          {view === 'FORGOT' && (
            <form onSubmit={(e) => { e.preventDefault(); setSuccessMsg('If an account exists, a link has been sent.'); }} className="space-y-6">
                <p className="text-sm text-slate-600">Enter your email address to reset your password.</p>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input type="email" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} placeholder="name@kiahs.edu.pk" className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-maroon-700" required />
                </div>
                <button type="submit" className="w-full bg-maroon-700 hover:bg-maroon-800 text-white font-semibold py-3 rounded-lg shadow-md flex items-center justify-center gap-2"><Mail size={18} />Send Recovery Link</button>
            </form>
          )}
        </div>
      </div>
      
      <div className="w-full max-w-md mt-8">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">Contact Us</h3>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-maroon-700"></div>
          <div className="flex items-start gap-3">
            <div className="bg-maroon-50 p-2 rounded-full mt-0.5"><Mail size={16} className="text-maroon-700" /></div>
            <div><p className="text-xs font-semibold text-slate-400">Email</p><a href={`mailto:${CONTACT_INFO.email}`} className="text-sm font-medium text-slate-800 hover:text-maroon-700">{CONTACT_INFO.email}</a></div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-maroon-50 p-2 rounded-full mt-0.5"><Phone size={16} className="text-maroon-700" /></div>
            <div><p className="text-xs font-semibold text-slate-400">Phone</p><a href={`tel:${CONTACT_INFO.phone}`} className="text-sm font-medium text-slate-800 hover:text-maroon-700">{CONTACT_INFO.phone}</a></div>
          </div>
        </div>
      </div>
      <p className="mt-8 text-slate-400 text-xs text-center">© 2024 Kasur Institute of Allied Health Sciences</p>
    </div>
  );
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Dynamic Academic State
  const [studentDepartments, setStudentDepartments] = useState<string[]>(() => loadFromStorage('kiahs_student_depts', STUDENT_DEPARTMENTS));
  const [staffDepartments, setStaffDepartments] = useState<string[]>(() => loadFromStorage('kiahs_staff_depts', STAFF_DEPARTMENTS));
  const [fiveYearPrograms, setFiveYearPrograms] = useState<string[]>(() => loadFromStorage('kiahs_five_year_programs', FIVE_YEAR_PROGRAMS));
  const [availableBatches, setAvailableBatches] = useState<string[]>(() => loadFromStorage('kiahs_available_batches', ['2023-2027', '2024-2028', '2025-2029', '2025-2030']));

  // Data States
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('kiahs_users', ALL_USERS));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadFromStorage('kiahs_announcements', MOCK_ANNOUNCEMENTS));
  const [complaints, setComplaints] = useState<Complaint[]>(() => loadFromStorage('kiahs_complaints', INITIAL_COMPLAINTS));
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => loadFromStorage('kiahs_attendance', INITIAL_ATTENDANCE));
  const [timetable, setTimetable] = useState<TimeTableSlot[]>(() => loadFromStorage('kiahs_timetable', MOCK_TIMETABLE));
  const [classTests, setClassTests] = useState<ClassTest[]>(() => loadFromStorage('kiahs_class_tests', MOCK_CLASS_TESTS));
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>(() => loadFromStorage('kiahs_leaves', INITIAL_LEAVE_APPLICATIONS));
  const [showNotifications, setShowNotifications] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Persistence
  useEffect(() => { localStorage.setItem('kiahs_student_depts', JSON.stringify(studentDepartments)); }, [studentDepartments]);
  useEffect(() => { localStorage.setItem('kiahs_staff_depts', JSON.stringify(staffDepartments)); }, [staffDepartments]);
  useEffect(() => { localStorage.setItem('kiahs_five_year_programs', JSON.stringify(fiveYearPrograms)); }, [fiveYearPrograms]);
  useEffect(() => { localStorage.setItem('kiahs_available_batches', JSON.stringify(availableBatches)); }, [availableBatches]);
  useEffect(() => { localStorage.setItem('kiahs_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('kiahs_announcements', JSON.stringify(announcements)); }, [announcements]);
  useEffect(() => { localStorage.setItem('kiahs_complaints', JSON.stringify(complaints)); }, [complaints]);
  useEffect(() => { localStorage.setItem('kiahs_attendance', JSON.stringify(attendanceRecords)); }, [attendanceRecords]);
  useEffect(() => { localStorage.setItem('kiahs_timetable', JSON.stringify(timetable)); }, [timetable]);
  useEffect(() => { localStorage.setItem('kiahs_class_tests', JSON.stringify(classTests)); }, [classTests]);
  useEffect(() => { localStorage.setItem('kiahs_leaves', JSON.stringify(leaveApplications)); }, [leaveApplications]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => { if (choiceResult.outcome === 'accepted') setInstallPrompt(null); });
    }
  };

  const renderDashboard = () => {
    // Determine dynamic greeting based on Lahore time
    const timeStr = getLahoreTime(); // "HH:MM"
    const hour = parseInt(timeStr.split(':')[0]);
    let greeting = 'Good Evening';
    if (hour >= 5 && hour < 12) greeting = 'Good Morning';
    else if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';

    // Get real day for schedule preview
    const todayName = getLahoreDay();

    return (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-r from-maroon-800 to-maroon-600 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-1">{greeting}, {currentUser?.name}!</h2>
            <p className="opacity-90">Welcome back to the KIAHS Portal. Today is {todayName}, {getLahoreDate()}.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                  <Users size={24} className="text-maroon-600 mb-2" />
                  <span className="text-2xl font-bold text-slate-800">{users.filter(u => u.role === UserRole.STUDENT).length}</span>
                  <span className="text-xs text-slate-500">Students</span>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                  <School size={24} className="text-maroon-600 mb-2" />
                  <span className="text-2xl font-bold text-slate-800">{users.filter(u => u.role === UserRole.STAFF).length}</span>
                  <span className="text-xs text-slate-500">Staff</span>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                  <AlertCircle size={24} className="text-orange-500 mb-2" />
                  <span className="text-2xl font-bold text-slate-800">{complaints.filter(c => c.status === 'Pending').length}</span>
                  <span className="text-xs text-slate-500">Pending Issues</span>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                  <Bell size={24} className="text-blue-500 mb-2" />
                  <span className="text-2xl font-bold text-slate-800">{announcements.length}</span>
                  <span className="text-xs text-slate-500">Announcements</span>
               </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Layout size={18} className="text-maroon-700" />
                    Today's Schedule ({todayName})
                </h3>
                <div className="space-y-3">
                    {timetable.filter(t => t.day === todayName && (currentUser.role === UserRole.STUDENT ? t.program === currentUser.department && t.classYear === currentUser.classYear : true)).slice(0, 3).map(slot => (
                        <div key={slot.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-xs font-bold text-maroon-700">{slot.time}</p>
                            <p className="font-semibold text-slate-800">{slot.subject}</p>
                            <p className="text-xs text-slate-500">{slot.room} • {slot.instructor}</p>
                        </div>
                    ))}
                    {timetable.filter(t => t.day === todayName).length === 0 && (
                        <p className="text-sm text-slate-400 italic">No classes scheduled for today.</p>
                    )}
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <MessageSquareWarning size={18} className="text-maroon-700" />
                    Recent Announcements
                </h3>
                <div className="space-y-3">
                    {announcements.slice(0, 3).map(ann => (
                        <div key={ann.id} className="pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                            <p className="font-semibold text-slate-800 text-sm">{ann.title}</p>
                            <p className="text-xs text-slate-500 line-clamp-1">{ann.content}</p>
                        </div>
                    ))}
                    {announcements.length === 0 && (
                        <p className="text-sm text-slate-400 italic">No announcements posted yet.</p>
                    )}
                </div>
            </div>
          </div>
        </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return renderDashboard();
      case 'ATTENDANCE':
        return <AttendanceModule attendanceRecords={attendanceRecords} onUpdateAttendance={setAttendanceRecords} currentUser={currentUser!} users={users} leaveApplications={leaveApplications} onAddLeave={(l) => setLeaveApplications([l, ...leaveApplications])} onUpdateLeaveStatus={(id, s, r) => setLeaveApplications(leaveApplications.map(l => l.id === id ? { ...l, status: s, rejectionReason: r } : l))} studentDepartments={studentDepartments} staffDepartments={staffDepartments} fiveYearPrograms={fiveYearPrograms} availableBatches={availableBatches} />;
      case 'ANNOUNCEMENTS':
        return <AnnouncementModule announcements={announcements} onAddAnnouncement={(a) => setAnnouncements([a, ...announcements])} onDeleteAnnouncement={(id) => setAnnouncements(announcements.filter(a => a.id !== id))} currentUser={currentUser!} />;
      case 'TIMETABLE':
        return <TimetableModule timetable={timetable} onAddSlot={(s) => setTimetable([...timetable, s])} onDeleteSlot={(id) => setTimetable(timetable.filter(t => t.id !== id))} currentUser={currentUser!} studentDepartments={studentDepartments} fiveYearPrograms={fiveYearPrograms} availableBatches={availableBatches} />;
      case 'PROGRESS_REPORT':
        return <ProgressReportModule currentUser={currentUser!} users={users} classTests={classTests} onAddTest={(t) => setClassTests([t, ...classTests])} onDeleteTest={(id) => setClassTests(classTests.filter(t => t.id !== id))} studentDepartments={studentDepartments} fiveYearPrograms={fiveYearPrograms} availableBatches={availableBatches} />;
      case 'COMPLAINTS':
        return <ComplaintModule complaints={complaints} onAddComplaint={(c) => setComplaints([c, ...complaints])} onUpdateStatus={(id, s) => setComplaints(complaints.map(c => c.id === id ? { ...c, status: s } : c))} currentUser={currentUser!} />;
      case 'USERS':
         return <UserManagementModule users={users} onToggleSuspension={(id) => setUsers(users.map(u => u.id === id ? { ...u, isSuspended: !u.isSuspended } : u))} onUpdateUserRole={(id, r) => setUsers(users.map(u => u.id === id ? { ...u, role: r } : u))} onUpdateUserAvatar={(id, a) => setUsers(users.map(u => u.id === id ? { ...u, avatar: a } : u))} onDeleteUser={(id) => setUsers(users.filter(u => u.id !== id))} currentUser={currentUser!} />;
      case 'PROFILE':
        return <ProfileModule targetUser={currentUser!} currentUser={currentUser!} onUpdateUser={(u) => { setUsers(users.map(existing => existing.id === u.id ? u : existing)); if (currentUser.id === u.id) setCurrentUser(u); }} studentDepartments={studentDepartments} staffDepartments={staffDepartments} fiveYearPrograms={fiveYearPrograms} />;
      case 'ACADEMIC_MANAGEMENT':
        return <AcademicManagementModule studentDepartments={studentDepartments} staffDepartments={staffDepartments} fiveYearPrograms={fiveYearPrograms} onUpdateStudentDepts={setStudentDepartments} onUpdateStaffDepts={setStaffDepartments} onUpdateFiveYearPrograms={setFiveYearPrograms} availableBatches={availableBatches} onUpdateBatches={setAvailableBatches} />;
      default:
        return renderDashboard();
    }
  };

  if (!currentUser) return <LoginScreen onLogin={setCurrentUser} users={users} onRegister={(u) => setUsers([...users, u])} installPrompt={installPrompt} onInstall={handleInstallClick} studentDepartments={studentDepartments} staffDepartments={staffDepartments} fiveYearPrograms={fiveYearPrograms} availableBatches={availableBatches} />;

  const unreadCount = (currentUser.notifications || []).filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Navigation currentView={currentView} onNavigate={setCurrentView} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} currentUser={currentUser} onLogout={() => setCurrentUser(null)} installPrompt={installPrompt} onInstall={handleInstallClick} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileOpen(true)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
            <h1 className="text-xl font-bold text-slate-800 capitalize">{currentView.toLowerCase().replace('_', ' ')}</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative">
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                </button>
                <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} notifications={currentUser.notifications || []} onMarkRead={(id) => { const upd = (currentUser.notifications || []).map(n => n.id === id ? { ...n, read: true } : n); const updatedUser = { ...currentUser, notifications: upd }; setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u)); setCurrentUser(updatedUser); }} onClearAll={() => { const updatedUser = { ...currentUser, notifications: [] }; setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u)); setCurrentUser(updatedUser); }} onDelete={(id) => { const upd = (currentUser.notifications || []).filter(n => n.id !== id); const updatedUser = { ...currentUser, notifications: upd }; setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u)); setCurrentUser(updatedUser); }} />
             </div>
             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                <div className="w-6 h-6 rounded-full bg-maroon-700 text-white flex items-center justify-center text-xs font-bold">{currentUser.name.charAt(0)}</div>
                <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">{currentUser.name}</span>
             </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8"><div className="max-w-7xl mx-auto">{renderContent()}</div></main>
      </div>
    </div>
  );
};

export default App;
