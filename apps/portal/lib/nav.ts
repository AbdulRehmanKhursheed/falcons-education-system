import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CalendarCheck,
  Receipt,
  GraduationCap,
  UsersRound,
  ChartLine,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
  /** Roles allowed to see this item. Empty = visible to all signed-in users. */
  roles?: Array<'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'PARENT' | 'ACCOUNTANT'>;
};

export type NavSection = {
  label: string;
  number: string;
  items: NavItem[];
};

export const navigation: NavSection[] = [
  {
    label: 'Overview',
    number: '01',
    items: [
      { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    ],
  },
  {
    label: 'School',
    number: '02',
    items: [
      { href: '/students',    label: 'Students',    Icon: Users },
      { href: '/admissions',  label: 'Admissions',  Icon: ClipboardList },
      { href: '/attendance',  label: 'Attendance',  Icon: CalendarCheck },
      { href: '/assessments', label: 'Assessments', Icon: ChartLine, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'] },
    ],
  },
  {
    label: 'Finance',
    number: '03',
    items: [
      { href: '/fees', label: 'Fees · Invoices', Icon: Receipt, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'] },
    ],
  },
  {
    label: 'People',
    number: '04',
    items: [
      { href: '/teachers', label: 'Teachers', Icon: GraduationCap, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
      { href: '/parents',  label: 'Parents',  Icon: UsersRound,    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
    ],
  },
  {
    label: 'Settings',
    number: '05',
    items: [
      { href: '/settings', label: 'Settings', Icon: Settings, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
    ],
  },
];

export function flatNav(): NavItem[] {
  return navigation.flatMap((section) => section.items);
}
