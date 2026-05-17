/**
 * Prisma seed — Phase 2 (expanded).
 *
 * Goal: every page in the portal looks alive on first boot. No empty states
 * unless they're intentional. Every filter chip has data. Detail pages have
 * something to show.
 *
 * Creates demo data so the portal is usable end-to-end:
 *   - 5 demo users (one per role) + 4 extra teacher users
 *     · 2 teacher users seeded as INACTIVE so the "Inactive" filter has rows
 *   - 3 academic years (2024-25, 2025-26, 2026-27 · current)
 *   - 9 classrooms in the current year
 *   - 5 Teacher records (3 active homerooms, 2 inactive)
 *   - 32 Guardians + 30 Students with primary-guardian links
 *     · 1 sibling family (one guardian linked to two students)
 *     · 3 non-parent "Guardian" relations so the relation chip has all 3 values
 *     · whatsapp distinct from phone for ~half; CNICs on a few
 *   - Enrollments (one per student into their classroom)
 *   - Student statuses: 1 ON_LEAVE, 28 ACTIVE, 1 INACTIVE
 *   - FeeStructures (Monthly per classroom + quarterly + one-time + inactive)
 *   - 6 months of invoices (~180) with realistic status mix:
 *     · older months PAID, latest month mixes PAID / OVERDUE / PARTIALLY_PAID /
 *       ISSUED / CANCELLED so every filter chip has rows
 *     · 1 PAID invoice with 2–3 split payments across methods
 *   - Attendance: last 30 days × all enrollments (~900 rows)
 *     · today: a couple unmarked, some SICK / EXCUSED, others PRESENT/ABSENT/LATE
 *   - 9 Applications: stages cover the pipeline, one with interview scheduled,
 *     one ENROLLED linked to a real student, 2 documents on one app
 *   - 25+ Assessments: Montessori observations + per-subject Class 3 grades +
 *     partial Class 4/5 grades; assessedBy = homeroom teacher when available
 *   - 8 Announcements: pinned ALL, STAFF_ONLY, PARENTS_ONLY, CLASSROOM, CUSTOM
 *   - Audit log entries scoped to each active teacher for the detail panel
 *
 * Demo credentials (also documented in apps/portal/NOTE.md):
 *   admin@falconseducationsystem.com      / Falcons@Admin1     (SUPER_ADMIN)
 *   principal@falconseducationsystem.com  / Falcons@Principal1 (SCHOOL_ADMIN)
 *   teacher@falconseducationsystem.com    / Falcons@Teacher1   (TEACHER)
 *   accounts@falconseducationsystem.com   / Falcons@Accounts1  (ACCOUNTANT)
 *   parent@falconseducationsystem.com     / Falcons@Parent1    (PARENT)
 *
 * Run: `npm run db:seed` (after `npm run db:migrate`).
 *
 * Idempotent — every write uses `upsert` (or `findFirst` + create) keyed on a
 * stable natural key so re-running is safe.
 */

import {
  PrismaClient,
  Role,
  ProgramKind,
  StudentStatus,
  ApplicationStage,
  ApplicationSource,
  AttendanceStatus,
  InvoiceStatus,
  PaymentMethod,
  AssessmentKind,
  AnnouncementAudience,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function gradeFor(scorePct: number): string {
  if (scorePct >= 90) return 'A+';
  if (scorePct >= 80) return 'A';
  if (scorePct >= 70) return 'B+';
  if (scorePct >= 60) return 'B';
  if (scorePct >= 50) return 'C';
  return 'F';
}

function currentTermLabel(now = new Date()): string {
  // Mirrors lib/queries/assessments.ts: Jan–Apr Term 1, May–Aug Term 2, Sep–Dec Term 3.
  const m = now.getMonth();
  const year = now.getFullYear();
  const term = m <= 3 ? 1 : m <= 7 ? 2 : 3;
  return `Term ${term} · ${year}`;
}

async function main() {
  // ── Users ─────────────────────────────────────────────────────────────
  const userSeeds: Array<{ email: string; name: string; role: Role; password: string }> = [
    { email: 'admin@falconseducationsystem.com',     name: 'Falcons Admin',    role: Role.SUPER_ADMIN,  password: 'Falcons@Admin1' },
    { email: 'principal@falconseducationsystem.com', name: 'Sara Principal',   role: Role.SCHOOL_ADMIN, password: 'Falcons@Principal1' },
    { email: 'teacher@falconseducationsystem.com',   name: 'Anaya Khan',       role: Role.TEACHER,      password: 'Falcons@Teacher1' },
    { email: 'accounts@falconseducationsystem.com',  name: 'Imran Accountant', role: Role.ACCOUNTANT,   password: 'Falcons@Accounts1' },
    { email: 'parent@falconseducationsystem.com',    name: 'Demo Parent',      role: Role.PARENT,       password: 'Falcons@Parent1' },
  ];

  const users: Record<string, { id: string; email: string }> = {};
  for (const u of userSeeds) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, active: true },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash,
        active: true,
      },
    });
    users[u.role] = created;
  }
  console.log(`✓ Seeded ${userSeeds.length} demo users`);

  // Extra teacher users (for homeroom assignments).
  // teacher2..teacher5; the last two are seeded INACTIVE so the "Inactive"
  // filter chip on the Teachers page has data on first load.
  const extraTeacherUserSeeds: Array<{ idx: number; name: string; active: boolean }> = [
    { idx: 2, name: 'Mehwish Tariq',  active: true  },
    { idx: 3, name: 'Hina Saeed',     active: true  },
    { idx: 4, name: 'Asma Rauf',      active: false },
    { idx: 5, name: 'Tahir Iqbal',    active: false },
  ];
  const extraTeacherUsers: Array<{ id: string; active: boolean }> = [];
  for (const t of extraTeacherUserSeeds) {
    const email = `teacher${t.idx}@falconseducationsystem.com`;
    const passwordHash = await bcrypt.hash(`Falcons@Teacher${t.idx}`, 12);
    const u = await prisma.user.upsert({
      where: { email },
      update: { name: t.name, active: t.active },
      create: {
        email,
        name: t.name,
        role: Role.TEACHER,
        passwordHash,
        active: t.active,
      },
    });
    extraTeacherUsers.push({ id: u.id, active: t.active });
  }

  // ── Academic years (historical + current) ────────────────────────────
  const academicYears = [
    {
      name: '2024-25',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-03-31'),
      isCurrent: false,
    },
    {
      name: '2025-26',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2026-03-31'),
      isCurrent: false,
    },
    {
      name: '2026-27',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      isCurrent: true,
    },
  ];
  let currentYear: { id: string; name: string } | null = null;
  for (const ay of academicYears) {
    const row = await prisma.academicYear.upsert({
      where: { name: ay.name },
      update: { isCurrent: ay.isCurrent, startDate: ay.startDate, endDate: ay.endDate },
      create: ay,
    });
    if (ay.isCurrent) currentYear = row;
  }
  if (!currentYear) throw new Error('Current academic year not seeded');
  console.log(`✓ ${academicYears.length} academic years (current · ${currentYear.name})`);

  // ── Classrooms (in the current year) ─────────────────────────────────
  const classroomSeeds: Array<{ name: string; kind: ProgramKind }> = [
    { name: 'Nursery',      kind: ProgramKind.NURSERY },
    { name: 'Montessori A', kind: ProgramKind.MONTESSORI },
    { name: 'KG',           kind: ProgramKind.KINDERGARTEN },
    { name: 'Class 1',      kind: ProgramKind.PRIMARY },
    { name: 'Class 2',      kind: ProgramKind.PRIMARY },
    { name: 'Class 3',      kind: ProgramKind.PRIMARY },
    { name: 'Class 4',      kind: ProgramKind.PRIMARY },
    { name: 'Class 5',      kind: ProgramKind.PRIMARY },
    { name: 'Class 6',      kind: ProgramKind.PRIMARY },
  ];

  const classrooms: Record<string, { id: string }> = {};
  for (const c of classroomSeeds) {
    const row = await prisma.classroom.upsert({
      where: { academicYearId_name: { academicYearId: currentYear.id, name: c.name } },
      update: {},
      create: { academicYearId: currentYear.id, name: c.name, programKind: c.kind },
    });
    classrooms[c.name] = row;
  }
  console.log(`✓ ${classroomSeeds.length} classrooms`);

  // ── Teachers ────────────────────────────────────────────────────────
  // teacher1 (primary login) + teacher2..teacher5.
  // Of these, teacher4 and teacher5 are inactive (see extraTeacherUserSeeds).
  const teacherUserMeta = [
    { userId: users[Role.TEACHER].id, active: true,  qualification: 'B.Ed · Montessori Diploma' },
    ...extraTeacherUsers.map((u) => ({
      userId: u.id,
      active: u.active,
      qualification: 'B.Ed',
    })),
  ];

  const teacherRecords: Array<{ id: string; userId: string; isActive: boolean }> = [];
  for (const tm of teacherUserMeta) {
    const t = await prisma.teacher.upsert({
      where: { userId: tm.userId },
      update: { isActive: tm.active },
      create: {
        userId: tm.userId,
        qualification: tm.qualification,
        joinedAt: new Date('2024-04-01'),
        isActive: tm.active,
      },
    });
    teacherRecords.push({ id: t.id, userId: tm.userId, isActive: tm.active });
  }
  console.log(`✓ ${teacherRecords.length} teacher profiles (${teacherRecords.filter((t) => t.isActive).length} active)`);

  // Assign homerooms only from ACTIVE teachers.
  const activeTeachers = teacherRecords.filter((t) => t.isActive);
  const homeroomPlan: Record<string, string> = {
    'Class 1': activeTeachers[0].id,
    'Class 2': activeTeachers[1 % activeTeachers.length].id,
    'Class 3': activeTeachers[0].id,       // primary teacher login → Class 3
    'Class 4': activeTeachers[2 % activeTeachers.length].id,
    'Class 5': activeTeachers[1 % activeTeachers.length].id,
    'Montessori A': activeTeachers[0].id,
  };
  for (const [className, teacherId] of Object.entries(homeroomPlan)) {
    await prisma.classroom.update({
      where: { id: classrooms[className].id },
      data: { homeroomTeacherId: teacherId },
    });
  }
  // Map className → assessedById (User id of homeroom teacher) for assessments.
  const homeroomUserByClass: Record<string, string> = {};
  for (const [className, teacherId] of Object.entries(homeroomPlan)) {
    const t = teacherRecords.find((r) => r.id === teacherId);
    if (t) homeroomUserByClass[className] = t.userId;
  }

  // ── Guardians + Students (30 each) ──────────────────────────────────
  const familyNames = [
    'Ahmed', 'Khan', 'Iqbal', 'Rashid', 'Saeed', 'Pervez', 'Farooq', 'Tariq',
    'Qureshi', 'Hamza', 'Sultan', 'Mahmood', 'Sheikh', 'Akhtar', 'Bashir',
    'Saif', 'Faisal', 'Mehmood', 'Rauf', 'Hashmi', 'Malik', 'Butt', 'Cheema',
    'Awan', 'Gondal', 'Bajwa', 'Dar', 'Sial', 'Khalid', 'Aslam',
  ];
  const childFirstNames = [
    'Ayesha', 'Hassan', 'Mariam', 'Bilal', 'Zainab', 'Hamza', 'Eman', 'Usman',
    'Fatima', 'Ali', 'Hira', 'Saad', 'Aiza', 'Rayan', 'Iqra', 'Umer',
    'Nimra', 'Ahsan', 'Salma', 'Daniyal', 'Khadija', 'Yousuf', 'Anaya',
    'Ibrahim', 'Hadia', 'Zayan', 'Maha', 'Talha', 'Sara', 'Faizan',
  ];
  const parentFirstNames = [
    'Tariq', 'Saima', 'Imran', 'Asma', 'Sajid', 'Naseem', 'Adnan', 'Rabia',
    'Babar', 'Nida', 'Khalid', 'Yasmin', 'Tahir', 'Bushra', 'Salman',
    'Rukhsana', 'Faraz', 'Mahnoor', 'Hamid', 'Sumaira', 'Nadeem', 'Farah',
    'Junaid', 'Rida', 'Asad', 'Kiran', 'Bilqees', 'Waqas', 'Hina', 'Yasir',
  ];
  const occupations = [
    'Government employee', 'Shopkeeper', 'Doctor', 'Teacher', 'Engineer',
    'Homemaker', 'Driver', 'Accountant', 'Pharmacist', 'Tailor',
  ];

  const classNames = Object.keys(classrooms);

  type StudentData = {
    id: string;
    rollNo: string;
    fullName: string;
    classroomId: string;
    classroomName: string;
  };
  const students: StudentData[] = [];
  const guardianIds: string[] = [];

  for (let i = 0; i < 30; i++) {
    const last = pick(familyNames, i);
    const childFirst = pick(childFirstNames, i);
    const parentFirst = pick(parentFirstNames, i);
    const fullName = `${childFirst} ${last}`;
    const guardianName = `${parentFirst} ${last}`;
    const phoneBase = String(3001000000 + i * 137);
    const phone = `+92 ${phoneBase.slice(0, 3)} ${phoneBase.slice(3, 7)}${phoneBase.slice(7)}`;
    // Half of guardians: whatsapp distinct from phone. A few: whatsapp null.
    let whatsapp: string | null;
    if (i % 4 === 0) {
      whatsapp = null;
    } else if (i % 2 === 0) {
      // Different number for whatsapp
      const waBase = String(3211000000 + i * 211);
      whatsapp = `+92 ${waBase.slice(0, 3)} ${waBase.slice(3, 7)}${waBase.slice(7)}`;
    } else {
      whatsapp = phone;
    }

    // Relation mix: most Father/Mother, a few non-parent Guardian.
    let relation: string;
    if (i === 7 || i === 16 || i === 24) {
      relation = 'Guardian';
    } else {
      relation = i % 2 === 0 ? 'Father' : 'Mother';
    }

    // A few CNICs (13-digit raw — UI masks display).
    const cnic = i < 6 ? `${37405}${String(1000000 + i * 13579).slice(0, 7)}${i % 10}` : null;

    const className = pick(classNames, i);
    const rollNo = `FES-2026-${String(i + 1).padStart(3, '0')}`;

    const guardian = await prisma.guardian.upsert({
      where: { id: `seed-guardian-${i}` },
      update: {
        fullName: guardianName,
        relation,
        phone,
        whatsapp,
        cnic,
        occupation: pick(occupations, i),
      },
      create: {
        id: `seed-guardian-${i}`,
        fullName: guardianName,
        relation,
        phone,
        whatsapp,
        email: i >= 24 ? `${parentFirst.toLowerCase()}.${last.toLowerCase()}@example.com` : null,
        cnic,
        occupation: pick(occupations, i),
        address: i < 10 ? `House ${i + 12}, Street ${i + 4}, Rawalpindi` : null,
        isPrimary: true,
      },
    });
    guardianIds.push(guardian.id);

    // Student status: 1 ON_LEAVE, 1 INACTIVE, rest ACTIVE.
    let status: StudentStatus;
    if (i === 11) status = StudentStatus.ON_LEAVE;
    else if (i === 22) status = StudentStatus.INACTIVE;
    else status = StudentStatus.ACTIVE;

    const dob = new Date(2018 + (i % 8), i % 12, (i % 27) + 1);
    const student = await prisma.student.upsert({
      where: { rollNo },
      update: { fullName, firstName: childFirst, lastName: last, status },
      create: {
        rollNo,
        firstName: childFirst,
        lastName: last,
        fullName,
        dateOfBirth: dob,
        gender: i % 2 === 0 ? 'female' : 'male',
        status,
        admissionDate: new Date('2026-04-15'),
      },
    });

    await prisma.studentGuardian.upsert({
      where: {
        studentId_guardianId: { studentId: student.id, guardianId: guardian.id },
      },
      update: { isPrimary: true },
      create: {
        studentId: student.id,
        guardianId: guardian.id,
        isPrimary: true,
      },
    });

    const classroom = classrooms[className];
    await prisma.enrollment.upsert({
      where: {
        studentId_classroomId: { studentId: student.id, classroomId: classroom.id },
      },
      update: {},
      create: {
        studentId: student.id,
        classroomId: classroom.id,
        enrolledAt: new Date('2026-04-15'),
      },
    });

    students.push({
      id: student.id,
      rollNo,
      fullName,
      classroomId: classroom.id,
      classroomName: className,
    });
  }
  console.log(`✓ ${students.length} students with guardians + enrollments`);

  // ── Sibling: link guardian 0 to a second student (idx 15, different class) ─
  if (students.length >= 16) {
    const siblingGuardianId = `seed-guardian-0`;
    const siblingStudent = students[15];
    await prisma.studentGuardian.upsert({
      where: {
        studentId_guardianId: {
          studentId: siblingStudent.id,
          guardianId: siblingGuardianId,
        },
      },
      update: { isPrimary: false },
      create: {
        studentId: siblingStudent.id,
        guardianId: siblingGuardianId,
        isPrimary: false,
      },
    });
    console.log(`✓ Linked sibling family (guardian 0 → 2 students)`);
  }

  // ── FeeStructures ──────────────────────────────────────────────────
  const feeAmounts: Record<string, number> = {
    Nursery: 6500,
    'Montessori A': 7000,
    KG: 7500,
    'Class 1': 8000,
    'Class 2': 8200,
    'Class 3': 8500,
    'Class 4': 8800,
    'Class 5': 9000,
    'Class 6': 9500,
  };
  const feeStructures: Record<string, { id: string; amount: number }> = {};
  for (const [name, amount] of Object.entries(feeAmounts)) {
    const fs = await prisma.feeStructure.upsert({
      where: { id: `fs-${name.replace(/\s+/g, '-').toLowerCase()}` },
      update: { amount },
      create: {
        id: `fs-${name.replace(/\s+/g, '-').toLowerCase()}`,
        classroomId: classrooms[name].id,
        name: `Monthly · ${name}`,
        amount,
        frequency: 'monthly',
        active: true,
      },
    });
    feeStructures[name] = { id: fs.id, amount };
  }
  // Quarterly Activity Fund (active) and one-time Admission Fee (inactive)
  // attached to Class 3 so the Settings + Fees pages show variety.
  await prisma.feeStructure.upsert({
    where: { id: 'fs-class-3-activity-quarterly' },
    update: {},
    create: {
      id: 'fs-class-3-activity-quarterly',
      classroomId: classrooms['Class 3'].id,
      name: 'Activity Fund · Quarterly',
      amount: 3000,
      frequency: 'quarterly',
      active: true,
    },
  });
  await prisma.feeStructure.upsert({
    where: { id: 'fs-class-3-admission-onetime' },
    update: {},
    create: {
      id: 'fs-class-3-admission-onetime',
      classroomId: classrooms['Class 3'].id,
      name: 'Admission Fee · one-time',
      amount: 15000,
      frequency: 'one-time',
      active: false,
    },
  });
  console.log(`✓ ${Object.keys(feeStructures).length + 2} fee structures (incl. quarterly + one-time inactive)`);

  // ── Invoices: last 6 months × 30 students ──────────────────────────
  const now = new Date();
  const monthBuckets: Array<{ year: number; month: number; key: string }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthBuckets.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    });
  }

  const accountantId = users[Role.ACCOUNTANT].id;
  const adminId = users[Role.SUPER_ADMIN].id;
  let invoiceCount = 0;
  let paymentCount = 0;

  // Track invoice ids so we can split payments on a few PAID rows later.
  const paidInvoicesForSplit: Array<{ id: string; amount: number; year: number; month: number }> = [];
  let firstPaidInvoiceIdLatestMonth: string | null = null;

  for (let mi = 0; mi < monthBuckets.length; mi++) {
    const mb = monthBuckets[mi];
    const isLatest = mi === monthBuckets.length - 1;
    const dueDate = new Date(mb.year, mb.month, 10);

    for (let si = 0; si < students.length; si++) {
      const s = students[si];
      const fee = feeStructures[s.classroomName];
      const invoiceNo = `INV-${mb.key.replace('-', '-')}-${String(si + 1).padStart(4, '0')}`;

      // Status mix:
      //   Older months → PAID
      //   Latest month:
      //     · si 0–2  → PARTIALLY_PAID
      //     · si 3–5  → ISSUED (future-ish due, not paid)
      //     · si 6    → CANCELLED
      //     · si 7–22 → PAID (~16 rows)
      //     · si 23–29 → OVERDUE (7 rows)
      let status: InvoiceStatus;
      let amountPaid = 0;
      let dueDateForRow = dueDate;

      if (!isLatest) {
        status = InvoiceStatus.PAID;
        amountPaid = fee.amount;
      } else if (si <= 2) {
        status = InvoiceStatus.PARTIALLY_PAID;
        amountPaid = Math.round(fee.amount / 2);
      } else if (si <= 5) {
        status = InvoiceStatus.ISSUED;
        amountPaid = 0;
        // Push due date 7 days into the future to look truly outstanding.
        const future = new Date(now);
        future.setDate(future.getDate() + 7);
        dueDateForRow = future;
      } else if (si === 6) {
        status = InvoiceStatus.CANCELLED;
        amountPaid = 0;
      } else if (si <= 22) {
        status = InvoiceStatus.PAID;
        amountPaid = fee.amount;
      } else {
        status = InvoiceStatus.OVERDUE;
        amountPaid = 0;
      }

      const invoice = await prisma.invoice.upsert({
        where: { invoiceNo },
        update: {
          status,
          amountPaid,
          dueDate: dueDateForRow,
        },
        create: {
          invoiceNo,
          studentId: s.id,
          feeStructureId: fee.id,
          monthYear: mb.key,
          amount: fee.amount,
          discount: 0,
          total: fee.amount,
          amountPaid,
          status,
          dueDate: dueDateForRow,
          issuedAt: new Date(mb.year, mb.month, 1),
        },
      });
      invoiceCount++;

      // Track for later split-payment seeding.
      if (status === InvoiceStatus.PAID) {
        paidInvoicesForSplit.push({
          id: invoice.id,
          amount: fee.amount,
          year: mb.year,
          month: mb.month,
        });
        if (isLatest && firstPaidInvoiceIdLatestMonth === null && si === 7) {
          firstPaidInvoiceIdLatestMonth = invoice.id;
        }
      }

      // Single payment for older PAID rows (idempotent — only if no payment yet).
      if (status === InvoiceStatus.PAID && !isLatest) {
        const existingPayments = await prisma.payment.count({
          where: { invoiceId: invoice.id },
        });
        if (existingPayments === 0) {
          await prisma.payment.create({
            data: {
              invoiceId: invoice.id,
              amount: fee.amount,
              method: pick(
                [
                  PaymentMethod.CASH,
                  PaymentMethod.BANK_TRANSFER,
                  PaymentMethod.JAZZCASH,
                  PaymentMethod.EASYPAISA,
                ],
                si,
              ),
              paidAt: new Date(mb.year, mb.month, 8 + (si % 15)),
              recordedById: accountantId,
            },
          });
          paymentCount++;
        }
      }

      // For PARTIALLY_PAID rows, create the half payment row.
      if (status === InvoiceStatus.PARTIALLY_PAID) {
        const existingPayments = await prisma.payment.count({
          where: { invoiceId: invoice.id },
        });
        if (existingPayments === 0) {
          await prisma.payment.create({
            data: {
              invoiceId: invoice.id,
              amount: amountPaid,
              method: PaymentMethod.JAZZCASH,
              reference: `JZ${mb.key}${si}`,
              paidAt: new Date(mb.year, mb.month, 12),
              recordedById: accountantId,
              notes: 'Half payment received; balance pending',
            },
          });
          paymentCount++;
        }
      }

      // For latest-month PAID rows (other than the split target), create one payment.
      if (status === InvoiceStatus.PAID && isLatest && invoice.id !== firstPaidInvoiceIdLatestMonth) {
        const existingPayments = await prisma.payment.count({
          where: { invoiceId: invoice.id },
        });
        if (existingPayments === 0) {
          await prisma.payment.create({
            data: {
              invoiceId: invoice.id,
              amount: fee.amount,
              method: pick(
                [
                  PaymentMethod.CASH,
                  PaymentMethod.BANK_TRANSFER,
                  PaymentMethod.JAZZCASH,
                  PaymentMethod.EASYPAISA,
                ],
                si,
              ),
              paidAt: new Date(mb.year, mb.month, 5 + (si % 20)),
              recordedById: accountantId,
            },
          });
          paymentCount++;
        }
      }
    }
  }

  // Split-payment invoice: pick the tracked latest-month PAID one and add
  // three payment rows with different methods that sum to total.
  if (firstPaidInvoiceIdLatestMonth) {
    const existing = await prisma.payment.count({
      where: { invoiceId: firstPaidInvoiceIdLatestMonth },
    });
    if (existing === 0) {
      const inv = paidInvoicesForSplit.find((p) => p.id === firstPaidInvoiceIdLatestMonth);
      if (inv) {
        const p1 = Math.round(inv.amount * 0.4);
        const p2 = Math.round(inv.amount * 0.35);
        const p3 = inv.amount - p1 - p2;
        await prisma.payment.create({
          data: {
            invoiceId: inv.id,
            amount: p1,
            method: PaymentMethod.CASH,
            paidAt: new Date(inv.year, inv.month, 3),
            recordedById: accountantId,
            notes: 'First instalment',
          },
        });
        await prisma.payment.create({
          data: {
            invoiceId: inv.id,
            amount: p2,
            method: PaymentMethod.EASYPAISA,
            reference: `EP-${inv.year}${inv.month}-001`,
            paidAt: new Date(inv.year, inv.month, 9),
            recordedById: accountantId,
            notes: 'Second instalment',
          },
        });
        await prisma.payment.create({
          data: {
            invoiceId: inv.id,
            amount: p3,
            method: PaymentMethod.BANK_TRANSFER,
            reference: `HBL-${inv.year}${inv.month}-9912`,
            paidAt: new Date(inv.year, inv.month, 14),
            recordedById: accountantId,
            notes: 'Final settlement',
          },
        });
        paymentCount += 3;
      }
    }
  }
  console.log(`✓ ${invoiceCount} invoices · ${paymentCount} payments`);

  // ── Attendance: last 30 days × all enrollments ──────────────────────
  const teacherUserId = users[Role.TEACHER].id;
  const today0 = new Date();
  today0.setHours(0, 0, 0, 0);
  let attendanceCount = 0;

  // Today: leave students 0 and 1 UNMARKED so "Mark all present" has work.
  // Today: students 2 SICK, 3 EXCUSED, 4 LATE, rest a realistic mix.
  // Student 11 is ON_LEAVE → skip marking attendance for that student entirely.
  // Student 22 is INACTIVE → also skip attendance for that student.
  const skipAttendanceStudentIdx = new Set<number>([11, 22]);

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const d = new Date(today0);
    d.setDate(d.getDate() - dayOffset);
    // Skip weekends? Keep simple — include all days so the charts have 30 buckets.

    for (let si = 0; si < students.length; si++) {
      if (skipAttendanceStudentIdx.has(si)) continue;

      // Today edge cases
      if (dayOffset === 0) {
        if (si === 0 || si === 1) continue; // unmarked
      }

      const s = students[si];

      let status: AttendanceStatus;
      if (dayOffset === 0 && si === 2) status = AttendanceStatus.SICK;
      else if (dayOffset === 0 && si === 3) status = AttendanceStatus.EXCUSED;
      else if (dayOffset === 0 && si === 4) status = AttendanceStatus.LATE;
      else {
        const r = (si * 31 + dayOffset * 7) % 100;
        if (r < 84) status = AttendanceStatus.PRESENT;
        else if (r < 92) status = AttendanceStatus.ABSENT;
        else if (r < 96) status = AttendanceStatus.LATE;
        else if (r < 98) status = AttendanceStatus.SICK;
        else status = AttendanceStatus.EXCUSED;
      }

      await prisma.attendance.upsert({
        where: {
          studentId_date: { studentId: s.id, date: d },
        },
        update: { status },
        create: {
          studentId: s.id,
          classroomId: s.classroomId,
          date: d,
          status,
          markedById: teacherUserId,
        },
      });
      attendanceCount++;
    }
  }
  console.log(`✓ ${attendanceCount} attendance records (30 days)`);

  // ── Applications ────────────────────────────────────────────────────
  // Existing 8 + 1 new INTERVIEW with notes + interviewAt.
  const applicationSeeds: Array<{
    id: string;
    applicantName: string;
    childAge: string;
    programInterest: ProgramKind;
    parentName: string;
    parentPhone: string;
    stage: ApplicationStage;
    source: ApplicationSource;
    interviewAt?: Date;
    interviewNotes?: string;
    studentId?: string;
  }> = [
    { id: 'app-101', applicantName: 'Aiza Sheikh',    childAge: '3 yrs 4 mo', programInterest: ProgramKind.MONTESSORI,   parentName: 'Naveed Sheikh', parentPhone: '+92 333 1111222', stage: ApplicationStage.RECEIVED,  source: ApplicationSource.WEBSITE  },
    { id: 'app-102', applicantName: 'Rayan Akhtar',   childAge: '6 yrs',      programInterest: ProgramKind.PRIMARY,      parentName: 'Saima Akhtar',  parentPhone: '+92 311 3333444', stage: ApplicationStage.INTERVIEW, source: ApplicationSource.WHATSAPP },
    { id: 'app-103', applicantName: 'Iqra Bashir',    childAge: '2 yrs 9 mo', programInterest: ProgramKind.NURSERY,      parentName: 'Faisal Bashir', parentPhone: '+92 300 5555666', stage: ApplicationStage.INTERVIEW, source: ApplicationSource.WEBSITE  },
    { id: 'app-104', applicantName: 'Umer Saif',      childAge: '8 yrs',      programInterest: ProgramKind.PRIMARY,      parentName: 'Sajid Saif',    parentPhone: '+92 321 7777888', stage: ApplicationStage.APPROVED,  source: ApplicationSource.WALK_IN  },
    { id: 'app-105', applicantName: 'Nimra Faisal',   childAge: '5 yrs',      programInterest: ProgramKind.KINDERGARTEN, parentName: 'Asma Faisal',   parentPhone: '+92 345 2222111', stage: ApplicationStage.APPROVED,  source: ApplicationSource.REFERRAL },
    {
      id: 'app-106', applicantName: 'Ahsan Mehmood',  childAge: '10 yrs',     programInterest: ProgramKind.PRIMARY,      parentName: 'Adnan Mehmood', parentPhone: '+92 312 4444555', stage: ApplicationStage.ENROLLED,  source: ApplicationSource.WHATSAPP,
      studentId: students[17]?.id, // link to a real seeded student
    },
    { id: 'app-107', applicantName: 'Salma Rauf',     childAge: '4 yrs',      programInterest: ProgramKind.MONTESSORI,   parentName: 'Rabia Rauf',    parentPhone: '+92 333 6666777', stage: ApplicationStage.RECEIVED,  source: ApplicationSource.WEBSITE  },
    { id: 'app-108', applicantName: 'Daniyal Hashmi', childAge: '9 yrs',      programInterest: ProgramKind.PRIMARY,      parentName: 'Babar Hashmi',  parentPhone: '+92 311 8888999', stage: ApplicationStage.ENROLLED,  source: ApplicationSource.WALK_IN  },
    {
      id: 'app-109',
      applicantName: 'Hadia Awan',
      childAge: '7 yrs',
      programInterest: ProgramKind.PRIMARY,
      parentName: 'Salman Awan',
      parentPhone: '+92 333 9988776',
      stage: ApplicationStage.INTERVIEW,
      source: ApplicationSource.WEBSITE,
      interviewAt: (() => {
        const d = new Date(today0);
        d.setDate(d.getDate() + 3);
        d.setHours(11, 0, 0, 0);
        return d;
      })(),
      interviewNotes:
        'Confident speaker, has attended Class 1 at a Federal Govt school. Parents emphasised Urdu fluency. Recommend Class 2 placement assessment.',
    },
  ];
  for (let i = 0; i < applicationSeeds.length; i++) {
    const a = applicationSeeds[i];
    const submittedAt = new Date(today0);
    submittedAt.setDate(submittedAt.getDate() - i);
    await prisma.application.upsert({
      where: { id: a.id },
      update: {
        stage: a.stage,
        interviewAt: a.interviewAt ?? null,
        interviewNotes: a.interviewNotes ?? null,
        studentId: a.studentId ?? null,
      },
      create: {
        id: a.id,
        applicantName: a.applicantName,
        childAge: a.childAge,
        programInterest: a.programInterest,
        parentName: a.parentName,
        parentPhone: a.parentPhone,
        stage: a.stage,
        source: a.source,
        interviewAt: a.interviewAt ?? null,
        interviewNotes: a.interviewNotes ?? null,
        studentId: a.studentId ?? null,
        submittedAt,
      },
    });
  }
  console.log(`✓ ${applicationSeeds.length} applications`);

  // Documents on app-109 (interview scheduled).
  const documentSeeds = [
    {
      id: 'doc-109-birth',
      applicationId: 'app-109',
      label: 'Birth certificate',
      url: 'https://example.com/birth.pdf',
      mimeType: 'application/pdf',
    },
    {
      id: 'doc-109-report',
      applicationId: 'app-109',
      label: 'Previous report card',
      url: 'https://example.com/report.pdf',
      mimeType: 'application/pdf',
    },
  ];
  for (const d of documentSeeds) {
    await prisma.document.upsert({
      where: { id: d.id },
      update: {},
      create: d,
    });
  }
  console.log(`✓ ${documentSeeds.length} application documents`);

  // ── Assessments ─────────────────────────────────────────────────────
  const termLabel = currentTermLabel(now);

  // Helpers to find a student in a specific class.
  function studentsInClass(name: string): StudentData[] {
    return students.filter((s) => s.classroomName === name && s.id);
  }

  // Pick an assessedBy User id — homeroom teacher if known, else fall back
  // to the primary teacher login.
  function assessedByFor(className: string): string {
    return homeroomUserByClass[className] ?? teacherUserId;
  }

  // ─ Montessori observations (Nursery + Montessori A + KG) ─
  const montessoriAreas = ['Practical Life', 'Sensorial', 'Language', 'Math', 'Cultural', 'Social', 'Motor'];
  const montessoriMilestones: Record<string, string[]> = {
    'Practical Life': [
      'Independently pours water without spilling',
      'Buttons and unbuttons own coat',
      'Carries tray with two hands across the room',
    ],
    'Sensorial': [
      'Sequences pink tower 1-10 without prompt',
      'Matches colour tablets in correct shades',
      'Identifies textures using touch alone (eyes closed)',
    ],
    'Language': [
      'Recognises all sandpaper letters a–z',
      'Forms 3-letter phonetic words with movable alphabet',
      'Listens attentively to 5-minute read-aloud',
    ],
    'Math': [
      'Sequences number rods 1-10',
      'Counts spindles into spindle boxes (0-9)',
      'Associates teen numbers with bead bars 11-19',
    ],
    'Cultural': [
      'Names continents on the world puzzle map',
      'Identifies parts of a flower with vocabulary cards',
      'Sorts living vs non-living objects with explanation',
    ],
    'Social': [
      'Waits turn during group circle work',
      'Returns materials neatly to shelf after use',
      'Resolves minor conflicts using words, not actions',
    ],
    'Motor': [
      'Walks the line carrying a bell silently',
      'Cuts along curved lines with scissors',
      'Threads beads onto string with steady hands',
    ],
  };

  const earlyYearsClasses = ['Nursery', 'Montessori A', 'KG'];
  let assessmentCount = 0;
  // Build a list of observations: ~15 across early-years classes.
  const observationPlan: Array<{ student: StudentData; area: string; milestone: string; idx: number }> = [];
  let obsIdx = 0;
  for (const cls of earlyYearsClasses) {
    const list = studentsInClass(cls);
    // Up to 5 observations per class (skip if class has fewer students).
    for (let i = 0; i < Math.min(5, list.length); i++) {
      const area = pick(montessoriAreas, obsIdx);
      const milestone = pick(montessoriMilestones[area], obsIdx);
      observationPlan.push({ student: list[i], area, milestone, idx: obsIdx });
      obsIdx++;
    }
  }

  for (const o of observationPlan) {
    const id = `seed-obs-${o.idx}`;
    const assessedAt = new Date(today0);
    assessedAt.setDate(assessedAt.getDate() - (o.idx * 2));
    await prisma.assessment.upsert({
      where: { id },
      update: {
        area: o.area,
        milestone: o.milestone,
        term: termLabel,
      },
      create: {
        id,
        studentId: o.student.id,
        kind: AssessmentKind.MONTESSORI_OBSERVATION,
        term: termLabel,
        area: o.area,
        milestone: o.milestone,
        notes:
          o.idx % 3 === 0
            ? 'Demonstrated independently with confidence; ready to move to the next material.'
            : o.idx % 3 === 1
              ? 'Required minor guidance at first; second attempt was independent.'
              : null,
        assessedAt,
        assessedById: assessedByFor(o.student.classroomName),
      },
    });
    assessmentCount++;
  }

  // ─ Primary grades — full set for Class 3, partial for Class 4 + 5 ─
  const subjects = ['Math', 'Urdu', 'English'];
  const class3Students = studentsInClass('Class 3');
  const class4Students = studentsInClass('Class 4');
  const class5Students = studentsInClass('Class 5');

  const primaryAssessmentPlans: Array<{ student: StudentData; subject: string; idx: number; scoreSeed: number }> = [];
  let primIdx = 0;
  // Class 3: every student × every subject (full term)
  for (const s of class3Students) {
    for (const subj of subjects) {
      primaryAssessmentPlans.push({ student: s, subject: subj, idx: primIdx, scoreSeed: primIdx });
      primIdx++;
    }
  }
  // Class 4 + 5: ~3 students × 2 subjects each (variety)
  for (const s of class4Students.slice(0, 3)) {
    for (const subj of subjects.slice(0, 2)) {
      primaryAssessmentPlans.push({ student: s, subject: subj, idx: primIdx, scoreSeed: primIdx });
      primIdx++;
    }
  }
  for (const s of class5Students.slice(0, 3)) {
    for (const subj of subjects.slice(0, 2)) {
      primaryAssessmentPlans.push({ student: s, subject: subj, idx: primIdx, scoreSeed: primIdx });
      primIdx++;
    }
  }

  for (const plan of primaryAssessmentPlans) {
    const id = `seed-grade-${plan.idx}`;
    // Spread scores 45–95 deterministically.
    const score = 45 + ((plan.scoreSeed * 13) % 51); // 45..95
    const scoreMax = 100;
    const grade = gradeFor(score);
    const assessedAt = new Date(today0);
    assessedAt.setDate(assessedAt.getDate() - (plan.idx % 14));
    await prisma.assessment.upsert({
      where: { id },
      update: {
        score,
        scoreMax,
        grade,
        subject: plan.subject,
        term: termLabel,
      },
      create: {
        id,
        studentId: plan.student.id,
        kind: AssessmentKind.PRIMARY_GRADE,
        term: termLabel,
        subject: plan.subject,
        score,
        scoreMax,
        grade,
        assessedAt,
        assessedById: assessedByFor(plan.student.classroomName),
      },
    });
    assessmentCount++;
  }
  console.log(`✓ ${assessmentCount} assessments (observations + grades)`);

  // ── Announcements ───────────────────────────────────────────────────
  const expiresInSevenDays = new Date(today0);
  expiresInSevenDays.setDate(expiresInSevenDays.getDate() + 7);

  const announcementSeeds: Array<{
    id: string;
    title: string;
    body: string;
    pinned: boolean;
    audience: AnnouncementAudience;
    classroomId?: string;
    expiresAt?: Date;
  }> = [
    {
      id: 'ann-1',
      title: 'Mid-term assessment week begins',
      body: 'Mid-term assessments start on Friday. Please review the schedule on the parent portal.',
      pinned: false,
      audience: AnnouncementAudience.ALL,
    },
    {
      id: 'ann-2',
      title: 'Parent-teacher meeting · Saturday 10am',
      body: 'A reminder that PT meetings are this Saturday, 10:00 – 12:00 at the school.',
      pinned: false,
      audience: AnnouncementAudience.PARENTS_ONLY,
    },
    {
      id: 'ann-3',
      title: '2026 session admissions are open',
      body: 'New applications now welcome for Nursery through Class 6. Walk-ins encouraged.',
      pinned: false,
      audience: AnnouncementAudience.ALL,
    },
    {
      id: 'ann-4',
      title: 'Eid holidays — school closed Apr 11–14',
      body: 'School will remain closed for Eid-ul-Fitr from April 11 through April 14. Classes resume Monday April 15.',
      pinned: true,
      audience: AnnouncementAudience.ALL,
    },
    {
      id: 'ann-5',
      title: 'Staff meeting Friday 2:30 PM',
      body: 'All teaching staff to gather in the staff room at 2:30 PM Friday for term review.',
      pinned: false,
      audience: AnnouncementAudience.STAFF_ONLY,
    },
    {
      id: 'ann-6',
      title: 'Fee due reminder — pay by 10th',
      body: 'Monthly fees are due by the 10th of each month. JazzCash, EasyPaisa, bank transfer all accepted at the accounts desk.',
      pinned: false,
      audience: AnnouncementAudience.PARENTS_ONLY,
    },
    {
      id: 'ann-7',
      title: 'Class 3 — bring science workbook',
      body: 'Class 3 students should bring their science workbook tomorrow for the chapter on plants.',
      pinned: false,
      audience: AnnouncementAudience.CLASSROOM,
      classroomId: classrooms['Class 3'].id,
    },
    {
      id: 'ann-8',
      title: 'Summer camp registration open',
      body: 'Limited seats — Summer Camp (June 1–14) registration open for current students and siblings. WhatsApp the office to reserve.',
      pinned: false,
      audience: AnnouncementAudience.CUSTOM,
      expiresAt: expiresInSevenDays,
    },
  ];
  for (const ann of announcementSeeds) {
    await prisma.announcement.upsert({
      where: { id: ann.id },
      update: {
        audience: ann.audience,
        classroomId: ann.classroomId ?? null,
        expiresAt: ann.expiresAt ?? null,
        pinned: ann.pinned,
      },
      create: {
        id: ann.id,
        title: ann.title,
        body: ann.body,
        audience: ann.audience,
        classroomId: ann.classroomId ?? null,
        postedById: adminId,
        pinned: ann.pinned,
        expiresAt: ann.expiresAt ?? null,
      },
    });
  }
  console.log(`✓ ${announcementSeeds.length} announcements`);

  // ── Audit log ───────────────────────────────────────────────────────
  // Baseline operational rows plus a few per active teacher so the Teacher
  // detail "Recent activity" panel renders content.
  const auditSeeds: Array<{ id: string; actorId: string; action: string; entityType: string; entityId: string }> = [
    { id: 'audit-1', actorId: adminId,        action: 'user.create',               entityType: 'User',         entityId: users[Role.SUPER_ADMIN].id },
    { id: 'audit-2', actorId: adminId,        action: 'academic_year.activate',    entityType: 'AcademicYear', entityId: currentYear.id },
    { id: 'audit-3', actorId: accountantId,   action: 'invoice.batch_generate',    entityType: 'Invoice',      entityId: 'batch' },
    { id: 'audit-4', actorId: teacherUserId,  action: 'attendance.mark',           entityType: 'Attendance',   entityId: 'today' },
    { id: 'audit-5', actorId: adminId,        action: 'announcement.publish',      entityType: 'Announcement', entityId: 'ann-4' },
    { id: 'audit-6', actorId: adminId,        action: 'application.stage_change',  entityType: 'Application',  entityId: 'app-104' },
  ];

  // Per active-teacher audit rows
  const teacherActions = ['attendance.mark', 'assessment.create', 'homework.create'];
  let teacherAuditIdx = 0;
  for (const t of activeTeachers) {
    for (let i = 0; i < 3; i++) {
      auditSeeds.push({
        id: `audit-teacher-${teacherAuditIdx}`,
        actorId: t.userId,
        action: pick(teacherActions, i),
        entityType: i === 0 ? 'Attendance' : i === 1 ? 'Assessment' : 'Homework',
        entityId: `seed-${teacherAuditIdx}`,
      });
      teacherAuditIdx++;
    }
  }

  for (const a of auditSeeds) {
    await prisma.auditLog.upsert({
      where: { id: a.id },
      update: {},
      create: a,
    });
  }
  console.log(`✓ ${auditSeeds.length} audit log entries`);

  console.log('\nSeed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
