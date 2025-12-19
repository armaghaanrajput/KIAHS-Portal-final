
import { User, UserRole, Announcement, TimeTableSlot, AttendanceRecord, Complaint, ClassTest, LeaveApplication } from './types';

// Timezone Utility for Lahore, Pakistan
export const getLahoreDate = () => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
};

export const getLahoreTime = () => {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date());
};

export const getLahoreDay = () => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    weekday: 'long'
  }).format(new Date());
};

// Using a placeholder that matches the Maroon (#800000) and Gold (#FFD700) scheme.
export const APP_LOGO = "https://placehold.co/512x512/800000/FFD700.png?text=KIAHS+Edu";

export const CURRENT_USER: User = {
  id: 'Armaghaanrajput',
  name: 'Armaghaan Rajput',
  role: UserRole.ADMIN,
  department: 'Administration',
  avatar: 'https://ui-avatars.com/api/?name=Armaghaan+Rajput&background=800000&color=fff',
  password: 'ASasqwqw1212@',
  email: 'admin@kiahs.edu.pk'
};

const COMMON_PASSWORD = 'ASasqwqw1212@';

// Departments and Programs
export const STUDENT_DEPARTMENTS = [
  'MBBS',
  'DPT',
  'BS MLT',
  'BS OTT',
  'BS RIT',
  'BS Optometry',
  'BS Nutrition',
  'BS Psychology'
];

export const FIVE_YEAR_PROGRAMS = [
  'MBBS',
  'DPT'
];

export const STAFF_DEPARTMENTS = [
  'Administration',
  'Faculty',
  'Accounts',
  'IT Support',
  'Student Affairs',
  'Security',
  'Maintenance',
  'Admission Staff',
  'Teaching Staff'
];

// --- Helper to Generate Bulk Students (ID 211 to 329 = 119 students) ---
const generateBulkStudents = (startId: number, count: number): User[] => {
  const students: User[] = [];
  const firstNames = ['Ahmed', 'Sara', 'Mohammad', 'Fatima', 'Ali', 'Zainab', 'Hassan', 'Ayesha', 'Omar', 'Mariam', 'Bilal', 'Hina', 'Usman', 'Khadija', 'Hamza', 'Rabia'];
  const lastNames = ['Khan', 'Ahmed', 'Ali', 'Butt', 'Sheikh', 'Riaz', 'Malik', 'Hussain', 'Iqbal', 'Mir', 'Nawaz', 'Shah', 'Rana', 'Tariq', 'Gul'];

  for (let i = 0; i < count; i++) {
    const idNum = startId + i;
    const deptIndex = i % STUDENT_DEPARTMENTS.length;
    const dept = STUDENT_DEPARTMENTS[deptIndex];
    const isFiveYear = FIVE_YEAR_PROGRAMS.includes(dept);
    const maxYears = isFiveYear ? 5 : 4;
    const yearIndex = (i % maxYears); 
    const classYear = `${yearIndex + 1}${yearIndex === 0 ? 'st' : yearIndex === 1 ? 'nd' : yearIndex === 2 ? 'rd' : 'th'} Year`;
    const startYear = 2025 - yearIndex;
    const endYear = startYear + maxYears;
    const batch = `${startYear}-${endYear}`;
    const fName = firstNames[idNum % firstNames.length];
    const lName = lastNames[(idNum * 2) % lastNames.length];
    const fullName = `${fName} ${lName} ${idNum}`; 

    students.push({
      id: `KIAHS-member-${idNum}`,
      name: fullName,
      role: UserRole.STUDENT,
      department: dept,
      classYear: classYear,
      batch: batch,
      email: `${fName.toLowerCase()}.${idNum}@kiahs.edu.pk`,
      password: COMMON_PASSWORD,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
      isSuspended: false
    });
  }
  return students;
};

const MANUAL_STUDENTS: User[] = [
  { id: 'KIAHS-member-142', name: 'Muhammad Ali', role: UserRole.STUDENT, department: 'MBBS', classYear: '1st Year', batch: '2025-2030', email: 'ali.142@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Muhammad+Ali&background=random', isSuspended: false },
  { id: 'KIAHS-member-143', name: 'Fatima Bibi', role: UserRole.STUDENT, department: 'DPT', classYear: '1st Year', batch: '2025-2030', email: 'fatima.143@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Fatima+Bibi&background=random', isSuspended: false },
  { id: 'KIAHS-member-144', name: 'Zain Ahmed', role: UserRole.STUDENT, department: 'BS MLT', classYear: '1st Year', batch: '2025-2029', email: 'zain.144@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Zain+Ahmed&background=random', isSuspended: false },
  { id: 'KIAHS-member-145', name: 'Ayesha Khan', role: UserRole.STUDENT, department: 'BS OTT', classYear: '2nd Year', batch: '2024-2028', email: 'ayesha.145@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Ayesha+Khan&background=random', isSuspended: false },
  { id: 'KIAHS-member-146', name: 'Omar Farooq', role: UserRole.STUDENT, department: 'BS RIT', classYear: '1st Year', batch: '2025-2029', email: 'omar.146@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Omar+Farooq&background=random', isSuspended: false },
  { id: 'KIAHS-member-147', name: 'Sadia Malik', role: UserRole.STUDENT, department: 'BS Optometry', classYear: '2nd Year', batch: '2024-2028', email: 'sadia.147@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Sadia+Malik&background=random', isSuspended: false },
  { id: 'KIAHS-member-148', name: 'Bilal Hussain', role: UserRole.STUDENT, department: 'BS Nutrition', classYear: '3rd Year', batch: '2023-2027', email: 'bilal.148@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Bilal+Hussain&background=random', isSuspended: false },
];

export const MOCK_STUDENTS: User[] = [
    ...MANUAL_STUDENTS,
    ...generateBulkStudents(149, 180) 
];

const FULL_MOCK_STUDENTS = [
    ...MANUAL_STUDENTS,
    ...generateBulkStudents(211, 119)
];

export const MOCK_STAFF: User[] = [
  { id: 'KIAHS-member-162', name: 'Dr. Abdul Rehman', role: UserRole.STAFF, department: 'Teaching Staff', email: 'abdul.rehman@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Dr+Abdul+Rehman&background=random', isSuspended: false },
  { id: 'KIAHS-member-163', name: 'Dr. Salma Hayek', role: UserRole.STAFF, department: 'Teaching Staff', email: 'salma.hayek@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Dr+Salma+Hayek&background=random', isSuspended: false },
  { id: 'KIAHS-member-164', name: 'Prof. Javed Sheikh', role: UserRole.STAFF, department: 'Teaching Staff', email: 'javed.sheikh@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Prof+Javed+Sheikh&background=random', isSuspended: false },
  { id: 'KIAHS-member-165', name: 'Dr. Fareeha Pervaiz', role: UserRole.STAFF, department: 'Teaching Staff', email: 'fareeha.pervaiz@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Dr+Fareeha+Pervaiz&background=random', isSuspended: false },
  { id: 'KIAHS-member-166', name: 'Mr. Kashif Mehmood', role: UserRole.STAFF, department: 'Teaching Staff', email: 'kashif.mehmood@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Mr+Kashif+Mehmood&background=random', isSuspended: false },
  { id: 'KIAHS-member-170', name: 'Dr. Ayesha Siddiqa', role: UserRole.STAFF, department: 'Teaching Staff', email: 'ayesha.siddiqa@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Dr+Ayesha+Siddiqa&background=random', isSuspended: false },
  { id: 'KIAHS-member-171', name: 'Mr. Bilal Ahmed', role: UserRole.STAFF, department: 'Teaching Staff', email: 'bilal.ahmed@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Mr+Bilal+Ahmed&background=random', isSuspended: false },
  { id: 'KIAHS-member-207', name: 'Dr. Hameed Gul', role: UserRole.STAFF, department: 'Teaching Staff', email: 'hameed.gul@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Dr+Hameed+Gul&background=random', isSuspended: false },
  { id: 'KIAHS-member-208', name: 'Ms. Fariha Shah', role: UserRole.STAFF, department: 'Teaching Staff', email: 'fariha.shah@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Ms+Fariha+Shah&background=random', isSuspended: false },
  { id: 'KIAHS-member-209', name: 'Dr. Tauseef Ahmed', role: UserRole.STAFF, department: 'Teaching Staff', email: 'tauseef.ahmed@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Dr+Tauseef+Ahmed&background=random', isSuspended: false },
  { id: 'KIAHS-member-210', name: 'Mr. Rizwan Ullah', role: UserRole.STAFF, department: 'Teaching Staff', email: 'rizwan.ullah@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Mr+Rizwan+Ullah&background=random', isSuspended: false },
  { id: 'KIAHS-member-167', name: 'Mr. Adnan Siddiqui', role: UserRole.STAFF, department: 'Admission Staff', email: 'adnan.siddiqui@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Adnan+Siddiqui&background=random', isSuspended: false },
  { id: 'KIAHS-member-168', name: 'Ms. Saba Qamar', role: UserRole.STAFF, department: 'Admission Staff', email: 'saba.qamar@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Saba+Qamar&background=random', isSuspended: false },
  { id: 'KIAHS-member-169', name: 'Mr. Humayun Saeed', role: UserRole.ADMIN, department: 'Administration', email: 'humayun.saeed@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Humayun+Saeed&background=random', isSuspended: false },
  { id: 'KIAHS-member-211', name: 'Mr. Asif Munir', role: UserRole.STAFF, department: 'Accounts', email: 'asif.munir@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Asif+Munir&background=random' },
  { id: 'KIAHS-member-212', name: 'Ms. Nida Pasha', role: UserRole.STAFF, department: 'Accounts', email: 'nida.pasha@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Nida+Pasha&background=random' },
  { id: 'KIAHS-member-213', name: 'Mr. Zeeshan Ali', role: UserRole.STAFF, department: 'IT Support', email: 'zeeshan.ali@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Zeeshan+Ali&background=random' },
  { id: 'KIAHS-member-214', name: 'Mr. Fahad Mustafa', role: UserRole.STAFF, department: 'IT Support', email: 'fahad.it@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Fahad+Mustafa&background=random' },
  { id: 'KIAHS-member-215', name: 'Ms. Hina Dilpazeer', role: UserRole.STAFF, department: 'Student Affairs', email: 'hina.dilpazeer@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Hina+Dilpazeer&background=random' },
  { id: 'KIAHS-member-216', name: 'Mr. Wasim Abbas', role: UserRole.STAFF, department: 'Student Affairs', email: 'wasim.abbas@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Wasim+Abbas&background=random' },
  { id: 'KIAHS-member-217', name: 'Mr. Riaz Guard', role: UserRole.STAFF, department: 'Security', email: 'riaz.security@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Riaz+Guard&background=random' },
  { id: 'KIAHS-member-218', name: 'Mr. Akram Guard', role: UserRole.STAFF, department: 'Security', email: 'akram.security@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Akram+Guard&background=random' },
  { id: 'KIAHS-member-219', name: 'Mr. Latif Technician', role: UserRole.STAFF, department: 'Maintenance', email: 'latif.maint@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Latif+Technician&background=random' },
  { id: 'KIAHS-member-220', name: 'Prof. Dr. Hamza Ali', role: UserRole.STAFF, department: 'Faculty', email: 'hamza.ali@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Dr+Hamza+Ali&background=random' },
  { id: 'KIAHS-member-221', name: 'Dr. Samina Peerzada', role: UserRole.STAFF, department: 'Faculty', email: 'samina.peerzada@kiahs.edu.pk', password: COMMON_PASSWORD, avatar: 'https://ui-avatars.com/api/?name=Dr+Samina+Peerzada&background=random' },
];

export const ALL_USERS: User[] = [CURRENT_USER, ...FULL_MOCK_STUDENTS, ...MOCK_STAFF];

const generatePastAttendance = (allUsers: User[]): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date(); 
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0) continue; 
    
    const dateStr = date.toISOString().split('T')[0];
    allUsers.forEach(user => {
      const rand = Math.random();
      let status: 'Present' | 'Absent' | 'Late' = 'Present';
      let time = '';
      if (rand > 0.95) status = 'Absent';
      else if (rand > 0.85) {
        status = 'Late';
        const h = 9 + Math.floor(Math.random() * 2);
        const m = Math.floor(Math.random() * 60);
        time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      } else {
        const m = 30 + Math.floor(Math.random() * 30);
        time = `08:${m}`;
      }
      if (status === 'Absent') time = '';
      records.push({
        id: `att-gen-${user.id}-${dateStr}`,
        userId: user.id, userName: user.name, date: dateStr, status: status, role: user.role, classYear: user.classYear, batch: user.batch, officeReachedTime: time
      });
    });
  }
  return records;
};

const generateBusyTimetable = (staff: User[]) => {
  const slots = [{ time: '09:00 - 10:30', period: 1 }, { time: '11:00 - 12:30', period: 2 }, { time: '13:00 - 14:30', period: 3 }];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const rooms = ['Hall A', 'Hall B', 'Hall C', 'Lab 1', 'Lab 2', 'Lab 3', 'Auditorium', 'Room 101', 'Room 102'];
  const subjects = ['Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Pharmacology', 'Community Medicine', 'Surgery', 'Medicine', 'Kinesiology', 'Biomechanics'];
  const timetable: TimeTableSlot[] = [];
  let idCounter = 1;
  const teachers = staff.filter(u => u.department === 'Teaching Staff');
  teachers.forEach((teacher, tIndex) => {
    days.forEach(day => {
      slots.forEach((slot, sIndex) => {
        const deptIndex = (tIndex + sIndex) % STUDENT_DEPARTMENTS.length;
        const dept = STUDENT_DEPARTMENTS[deptIndex];
        const classNum = ((sIndex + tIndex) % 5) + 1;
        const isFiveYear = FIVE_YEAR_PROGRAMS.includes(dept);
        const maxYears = isFiveYear ? 5 : 4;
        const finalClassNum = classNum > maxYears ? 1 : classNum;
        const classYear = finalClassNum === 1 ? '1st Year' : finalClassNum === 2 ? '2nd Year' : finalClassNum === 3 ? '3rd Year' : `${finalClassNum}th Year`;
        const currentYear = 2025;
        const startYear = currentYear - (finalClassNum - 1);
        const endYear = startYear + maxYears;
        const batch = `${startYear}-${endYear}`;
        timetable.push({
          id: `t-gen-${idCounter++}`, day, time: slot.time, subject: subjects[(tIndex + sIndex) % subjects.length], instructor: teacher.name, room: rooms[(tIndex + sIndex) % rooms.length], classYear, batch, program: dept
        });
      });
    });
  });
  return timetable;
};

const generateRandomClassTests = (students: User[], teachers: User[]) => {
  const tests: ClassTest[] = [];
  const subjects = ['Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'English', 'Islamic Studies', 'Computer Skills', 'Kinesiology', 'Pharmacology'];
  const teachingStaff = teachers.filter(t => t.department === 'Teaching Staff');
  const anchorDate = new Date();
  students.forEach(student => {
    for(let i=1; i<=4; i++) {
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const teacher = teachingStaff[Math.floor(Math.random() * teachingStaff.length)];
        const total = 50;
        const obtained = Math.floor(Math.random() * (49 - 15 + 1)) + 15; 
        const d = new Date(anchorDate);
        d.setDate(d.getDate() - (i * 7));
        tests.push({
            id: `test-gen-${student.id}-${i}`, studentId: student.id, studentName: student.name, subject: subject, title: `Weekly Test ${i}`, totalMarks: total, obtainedMarks: obtained, date: d.toISOString().split('T')[0], classYear: student.classYear || '1st Year', batch: student.batch || '2025-2030', department: student.department || 'MBBS', instructorId: teacher ? teacher.id : 'unknown'
        });
    }
  });
  return tests;
};

const generateMockLeaveApplications = (): LeaveApplication[] => {
    return [
        { id: 'l-1', applicantId: 'KIAHS-member-142', applicantName: 'Muhammad Ali', applicantRole: UserRole.STUDENT, classYear: '1st Year', department: 'MBBS', dateFrom: '2025-12-20', dateTo: '2025-12-21', reason: 'Attending cousin\'s wedding ceremony in Lahore.', status: 'Pending', appliedOn: '2025-12-14' },
        { id: 'l-2', applicantId: 'KIAHS-member-143', applicantName: 'Fatima Bibi', applicantRole: UserRole.STUDENT, classYear: '1st Year', department: 'DPT', dateFrom: '2025-12-10', dateTo: '2025-12-12', reason: 'High fever and flu.', status: 'Approved', appliedOn: '2025-12-09' },
        { id: 'l-s1', applicantId: 'KIAHS-member-162', applicantName: 'Dr. Abdul Rehman', applicantRole: UserRole.STAFF, department: 'Teaching Staff', dateFrom: '2025-12-25', dateTo: '2025-12-27', reason: 'Family vacation.', status: 'Pending', appliedOn: '2025-12-15' },
    ];
};

export const MOCK_ANNOUNCEMENTS: Announcement[] = [];
export const MOCK_TIMETABLE: TimeTableSlot[] = generateBusyTimetable(MOCK_STAFF);
export const INITIAL_ATTENDANCE: AttendanceRecord[] = generatePastAttendance(ALL_USERS);
export const MOCK_CLASS_TESTS: ClassTest[] = generateRandomClassTests(FULL_MOCK_STUDENTS, MOCK_STAFF);
export const INITIAL_COMPLAINTS: Complaint[] = [];
export const INITIAL_LEAVE_APPLICATIONS: LeaveApplication[] = generateMockLeaveApplications();
