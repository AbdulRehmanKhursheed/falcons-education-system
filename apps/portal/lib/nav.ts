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
  Megaphone,
  Bell,
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

/**
 * Role-aware flat nav for shortcuts (Cmd-K palette, search-as-you-type, etc).
 * Items without a `roles` array are visible to every signed-in user, matching
 * the Sidebar's filter rule.
 */
export type AppRole =
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'TEACHER'
  | 'PARENT'
  | 'ACCOUNTANT';

export function filterNavByRole(role: AppRole): NavItem[] {
  return flatNav().filter((item) => !item.roles || item.roles.includes(role));
}

/**
 * Parent portal nav — flat (no role gating). Per-child entries are not
 * listed here because they are dynamic; ParentSidebar renders them from a
 * live query against the linked Guardian → Student chain.
 */
export const parentNavigation: NavSection[] = [
  {
    label: 'Home',
    number: '01',
    items: [
      { href: '/parent/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    ],
  },
  {
    label: 'School',
    number: '02',
    items: [
      { href: '/parent/announcements', label: 'Announcements', Icon: Megaphone },
    ],
  },
];

export const parentNotificationsNav: NavItem = {
  href: '/parent/dashboard',
  label: 'Notifications',
  Icon: Bell,
};
