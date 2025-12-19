
export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  STAFF = 'STAFF'
}

export type NotificationType = 'ANNOUNCEMENT' | 'COMPLAINT' | 'SYSTEM';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: NotificationType;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  password?: string;
  isSuspended?: boolean;
  email?: string;
  // New fields for Student segregation
  classYear?: string; // e.g. "1st Year", "2nd Year"
  batch?: string;     // e.g. "2023-2027"
  notifications?: AppNotification[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  isImportant: boolean;
}

export interface Complaint {
  id: string;
  subject: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  date: string;
  priority?: 'Low' | 'Medium' | 'High';
  category?: string;
  // Track author details for Admin visibility
  authorName?: string;
  authorId?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Online';
  role: UserRole;
  officeReachedTime?: string;
  classYear?: string; // To filter attendance sheets
  batch?: string;
}

export interface TimeTableSlot {
  id: string;
  day: string;
  time: string;
  subject: string;
  instructor: string;
  room: string;
  classYear?: string; // Which class this slot belongs to
  batch?: string;
  program?: string;   // e.g. "DPT", "BSCS"
}

export interface ClassTest {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  title: string; // e.g. "Weekly Test 1"
  totalMarks: number;
  obtainedMarks: number;
  date: string;
  classYear: string;
  batch: string;
  department: string;
  instructorId: string; // Who marked it
}

export interface LeaveApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantRole: UserRole;
  classYear?: string; // Only for students
  department: string;
  dateFrom: string;
  dateTo: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
  rejectionReason?: string;
}

export type ViewState = 'DASHBOARD' | 'ATTENDANCE' | 'TIMETABLE' | 'ANNOUNCEMENTS' | 'COMPLAINTS' | 'USERS' | 'PROFILE' | 'PROGRESS_REPORT' | 'ACADEMIC_MANAGEMENT';

// Dashboard Customization Types
export type DashboardWidgetType = 'stats' | 'announcements' | 'schedule' | 'welcome';
export type StatType = 'students' | 'staff' | 'announcements' | 'complaints';
export type AppTheme = 'light' | 'dark';

export interface DashboardPreferences {
  theme: AppTheme;
  widgets: DashboardWidgetType[]; // Order determines layout
  visibleStats: StatType[];
}
