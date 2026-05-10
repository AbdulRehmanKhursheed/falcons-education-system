/**
 * Mock data for Phase 1 — replaced with real Prisma queries in Phase 2.
 * Kept in a single file so it's easy to grep for `TODO mock` when wiring up
 * real data sources.
 */

export const kpis = {
  totalStudents: 142,
  attendanceToday: 91.4,        // %
  outstandingDues: 287_500,     // PKR
  openApplications: 18,
  studentsTrend: +6,            // last 30 days
  attendanceTrend: -1.3,
  duesTrend: -42_000,
  applicationsTrend: +5,
};

export const attendanceSeries = [
  { day: 'Mon', present: 132, absent: 8,  late: 2 },
  { day: 'Tue', present: 128, absent: 11, late: 3 },
  { day: 'Wed', present: 134, absent: 6,  late: 2 },
  { day: 'Thu', present: 130, absent: 10, late: 2 },
  { day: 'Fri', present: 126, absent: 13, late: 3 },
  { day: 'Sat', present: 92,  absent: 5,  late: 1 },
];

export const feesSeries = [
  { month: 'Dec', collected: 1_240_000, expected: 1_300_000 },
  { month: 'Jan', collected: 1_180_000, expected: 1_300_000 },
  { month: 'Feb', collected: 1_320_000, expected: 1_340_000 },
  { month: 'Mar', collected: 1_280_000, expected: 1_360_000 },
  { month: 'Apr', collected: 1_310_000, expected: 1_380_000 },
  { month: 'May', collected: 1_092_500, expected: 1_380_000 },
];

export type Student = {
  id: string;
  rollNo: string;
  name: string;
  classroom: string;
  guardian: string;
  guardianPhone: string;
  attendance30d: number;  // %
  duesPKR: number;
  status: 'active' | 'on-leave' | 'inactive';
};

export const students: Student[] = [
  { id: 's-001', rollNo: 'FES-2026-001', name: 'Ayesha Ahmed',     classroom: 'Class 3',      guardian: 'Tariq Ahmed',    guardianPhone: '+92 300 1234567', attendance30d: 96, duesPKR:      0, status: 'active' },
  { id: 's-002', rollNo: 'FES-2026-002', name: 'Hassan Khan',      classroom: 'Class 5',      guardian: 'Saima Khan',     guardianPhone: '+92 311 9876543', attendance30d: 88, duesPKR:  6_500, status: 'active' },
  { id: 's-003', rollNo: 'FES-2026-003', name: 'Mariam Iqbal',     classroom: 'Nursery',      guardian: 'Imran Iqbal',    guardianPhone: '+92 333 2233445', attendance30d: 92, duesPKR:      0, status: 'active' },
  { id: 's-004', rollNo: 'FES-2026-004', name: 'Bilal Rashid',     classroom: 'Class 1',      guardian: 'Asma Rashid',    guardianPhone: '+92 321 4455667', attendance30d: 78, duesPKR: 12_000, status: 'on-leave' },
  { id: 's-005', rollNo: 'FES-2026-005', name: 'Zainab Saeed',     classroom: 'Montessori',   guardian: 'Sajid Saeed',    guardianPhone: '+92 345 5566778', attendance30d: 98, duesPKR:      0, status: 'active' },
  { id: 's-006', rollNo: 'FES-2026-006', name: 'Hamza Pervez',     classroom: 'Class 2',      guardian: 'Naseem Pervez',  guardianPhone: '+92 312 7788990', attendance30d: 84, duesPKR:  4_200, status: 'active' },
  { id: 's-007', rollNo: 'FES-2026-007', name: 'Eman Farooq',      classroom: 'KG',           guardian: 'Adnan Farooq',   guardianPhone: '+92 300 1122334', attendance30d: 95, duesPKR:      0, status: 'active' },
  { id: 's-008', rollNo: 'FES-2026-008', name: 'Usman Tariq',      classroom: 'Class 4',      guardian: 'Rabia Tariq',    guardianPhone: '+92 333 9988776', attendance30d: 91, duesPKR:      0, status: 'active' },
  { id: 's-009', rollNo: 'FES-2026-009', name: 'Fatima Qureshi',   classroom: 'Class 6',      guardian: 'Babar Qureshi',  guardianPhone: '+92 321 5544332', attendance30d: 87, duesPKR:  8_750, status: 'active' },
  { id: 's-010', rollNo: 'FES-2026-010', name: 'Ali Hamza',        classroom: 'Class 3',      guardian: 'Nida Hamza',     guardianPhone: '+92 345 4433221', attendance30d: 93, duesPKR:      0, status: 'active' },
  { id: 's-011', rollNo: 'FES-2026-011', name: 'Hira Sultan',      classroom: 'Montessori',   guardian: 'Khalid Sultan',  guardianPhone: '+92 312 6677889', attendance30d: 89, duesPKR:      0, status: 'active' },
  { id: 's-012', rollNo: 'FES-2026-012', name: 'Saad Mahmood',     classroom: 'Class 5',      guardian: 'Yasmin Mahmood', guardianPhone: '+92 300 8877665', attendance30d: 76, duesPKR: 15_000, status: 'inactive' },
];

export type Application = {
  id: string;
  applicantName: string;
  childAge: string;
  programInterest: string;
  parentPhone: string;
  submittedDate: string;       // ISO
  stage: 'received' | 'interview' | 'approved' | 'enrolled' | 'declined';
  source: 'website' | 'whatsapp' | 'walk-in' | 'referral';
};

export const applications: Application[] = [
  { id: 'a-101', applicantName: 'Aiza Sheikh',       childAge: '3 yrs 4 mo', programInterest: 'Montessori Level',   parentPhone: '+92 333 1111222', submittedDate: '2026-05-09', stage: 'received',  source: 'website'  },
  { id: 'a-102', applicantName: 'Rayan Akhtar',      childAge: '6 yrs',      programInterest: 'Class 1',            parentPhone: '+92 311 3333444', submittedDate: '2026-05-08', stage: 'interview', source: 'whatsapp' },
  { id: 'a-103', applicantName: 'Iqra Bashir',       childAge: '2 yrs 9 mo', programInterest: 'Nursery',            parentPhone: '+92 300 5555666', submittedDate: '2026-05-07', stage: 'interview', source: 'website'  },
  { id: 'a-104', applicantName: 'Umer Saif',         childAge: '8 yrs',      programInterest: 'Class 3',            parentPhone: '+92 321 7777888', submittedDate: '2026-05-06', stage: 'approved',  source: 'walk-in'  },
  { id: 'a-105', applicantName: 'Nimra Faisal',      childAge: '5 yrs',      programInterest: 'KG',                 parentPhone: '+92 345 2222111', submittedDate: '2026-05-05', stage: 'approved',  source: 'referral' },
  { id: 'a-106', applicantName: 'Ahsan Mehmood',     childAge: '10 yrs',     programInterest: 'Class 5',            parentPhone: '+92 312 4444555', submittedDate: '2026-05-04', stage: 'enrolled',  source: 'whatsapp' },
  { id: 'a-107', applicantName: 'Salma Rauf',        childAge: '4 yrs',      programInterest: 'Montessori Level',   parentPhone: '+92 333 6666777', submittedDate: '2026-05-03', stage: 'received',  source: 'website'  },
  { id: 'a-108', applicantName: 'Daniyal Hashmi',    childAge: '9 yrs',      programInterest: 'Class 4',            parentPhone: '+92 311 8888999', submittedDate: '2026-05-02', stage: 'enrolled',  source: 'walk-in'  },
];

export const recentActivity = [
  { id: 1, kind: 'admission', text: 'New application from Aiza Sheikh',         meta: 'Montessori Level · 3y 4m', time: '12 min ago' },
  { id: 2, kind: 'fee',       text: 'Invoice paid · Ali Hamza',                  meta: 'May fees · ₨8,500',         time: '38 min ago' },
  { id: 3, kind: 'attendance',text: '3 absences flagged in Class 5',              meta: 'Today',                      time: '1 hr ago'   },
  { id: 4, kind: 'admission', text: 'Interview scheduled · Rayan Akhtar',         meta: 'Class 1 · Thu 16:00',        time: '2 hr ago'   },
  { id: 5, kind: 'assessment',text: 'Montessori observation logged · Mariam I.', meta: 'Sensorial · refined work',   time: '3 hr ago'   },
  { id: 6, kind: 'fee',       text: 'Reminder sent · 4 parents with dues',        meta: 'Auto · WhatsApp',            time: 'Today'      },
];
