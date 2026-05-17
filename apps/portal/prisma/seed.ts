/**
 * Prisma seed — Phase 2.
 *
 * Creates demo data so the portal is usable end-to-end:
 *   - 5 demo users (one per role)
 *   - 3 extra anonymous teacher users (homeroom assignments)
 *   - 9 classrooms across the academic year 2026-27
 *   - 5 Teacher records
 *   - 30 Guardians + 30 Students with primary-guardian links
 *   - Enrollments (one per student into their classroom)
 *   - FeeStructures (Monthly, per classroom)
 *   - 6 months of invoices (180 total) — older PAID, latest mix PAID/OVERDUE
 *   - Payments for the PAID invoices
 *   - 6 days of Attendance (~90% PRESENT, 6% ABSENT, 4% LATE)
 *   - 8 Applications spread across the pipeline stages
 *   - 3 Announcements
 *   - 5–6 AuditLog entries
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
 * Idempotent — every write uses `upsert` keyed on a stable natural key.
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
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
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

  // Extra anonymous teacher users (for homeroom assignments)
  const extraTeacherUsers: Array<{ id: string }> = [];
  for (let i = 2; i <= 5; i++) {
    const email = `teacher${i}@falconseducationsystem.com`;
    const passwordHash = await bcrypt.hash(`Falcons@Teacher${i}`, 12);
    const u = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: `Teacher ${i}`,
        role: Role.TEACHER,
        passwordHash,
        active: true,
      },
    });
    extraTeacherUsers.push(u);
  }

  // ── Academic year ────────────────────────────────────────────────────
  const ay = await prisma.academicYear.upsert({
    where: { name: '2026-27' },
    update: { isCurrent: true },
    create: {
      name: '2026-27',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      isCurrent: true,
    },
  });
  console.log(`✓ Academic year · ${ay.name}`);

  // ── Classrooms ───────────────────────────────────────────────────────
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
      where: { academicYearId_name: { academicYearId: ay.id, name: c.name } },
      update: {},
      create: { academicYearId: ay.id, name: c.name, programKind: c.kind },
    });
    classrooms[c.name] = row;
  }
  console.log(`✓ ${classroomSeeds.length} classrooms`);

  // ── Teachers ────────────────────────────────────────────────────────
  const teacherUserIds = [users[Role.TEACHER].id, ...extraTeacherUsers.map((u) => u.id)];
  const teacherRecords: Array<{ id: string }> = [];
  for (let i = 0; i < teacherUserIds.length; i++) {
    const t = await prisma.teacher.upsert({
      where: { userId: teacherUserIds[i] },
      update: { isActive: true },
      create: {
        userId: teacherUserIds[i],
        qualification: i === 0 ? 'B.Ed · Montessori Diploma' : 'B.Ed',
        joinedAt: new Date('2024-04-01'),
        isActive: true,
      },
    });
    teacherRecords.push(t);
  }
  console.log(`✓ ${teacherRecords.length} teacher profiles`);

  // Assign homerooms to Class 1–6 (skip first 3 non-primary classrooms)
  const primaryClasses = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6'];
  for (let i = 0; i < primaryClasses.length; i++) {
    await prisma.classroom.update({
      where: { id: classrooms[primaryClasses[i]].id },
      data: { homeroomTeacherId: pick(teacherRecords, i).id },
    });
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

  const classNames = Object.keys(classrooms);

  type StudentData = { id: string; rollNo: string; classroomId: string; classroomName: string };
  const students: StudentData[] = [];

  for (let i = 0; i < 30; i++) {
    const last = pick(familyNames, i);
    const childFirst = pick(childFirstNames, i);
    const parentFirst = pick(parentFirstNames, i);
    const fullName = `${childFirst} ${last}`;
    const guardianName = `${parentFirst} ${last}`;
    const phone = `+92 3${String((i * 7) % 5)}${String((i * 3) % 10)} ${String(1000000 + i * 12345).slice(0, 7)}`;
    const className = pick(classNames, i);
    const rollNo = `FES-2026-${String(i + 1).padStart(3, '0')}`;

    // Guardian
    const guardian = await prisma.guardian.upsert({
      where: { id: `seed-guardian-${i}` },
      update: { fullName: guardianName, phone },
      create: {
        id: `seed-guardian-${i}`,
        fullName: guardianName,
        relation: i % 2 === 0 ? 'Father' : 'Mother',
        phone,
        whatsapp: phone,
        email: i < 5 ? null : null,
        isPrimary: true,
      },
    });

    // Student
    const dob = new Date(2018 + (i % 8), i % 12, (i % 27) + 1);
    const student = await prisma.student.upsert({
      where: { rollNo },
      update: { fullName, firstName: childFirst, lastName: last },
      create: {
        rollNo,
        firstName: childFirst,
        lastName: last,
        fullName,
        dateOfBirth: dob,
        gender: i % 2 === 0 ? 'female' : 'male',
        status: StudentStatus.ACTIVE,
        admissionDate: new Date('2026-04-15'),
      },
    });

    // Link guardian (idempotent upsert via composite key)
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

    // Enrollment
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
      classroomId: classroom.id,
      classroomName: className,
    });
  }
  console.log(`✓ ${students.length} students with guardians + enrollments`);

  // ── FeeStructures (one Monthly per classroom) ──────────────────────
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
  console.log(`✓ ${Object.keys(feeStructures).length} fee structures`);

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
  let invoiceCount = 0;
  let paymentCount = 0;

  for (let mi = 0; mi < monthBuckets.length; mi++) {
    const mb = monthBuckets[mi];
    const isLatest = mi === monthBuckets.length - 1;
    const dueDate = new Date(mb.year, mb.month, 10);

    for (let si = 0; si < students.length; si++) {
      const s = students[si];
      const fee = feeStructures[s.classroomName];
      const invoiceNo = `INV-${mb.key.replace('-', '-')}-${String(si + 1).padStart(4, '0')}`;

      // Older months → PAID. Latest month: ~70% PAID, 30% OVERDUE.
      const paid = isLatest ? si % 10 < 7 : true;
      const status: InvoiceStatus = paid ? InvoiceStatus.PAID : InvoiceStatus.OVERDUE;
      const amount = fee.amount;
      const amountPaid = paid ? amount : 0;

      const invoice = await prisma.invoice.upsert({
        where: { invoiceNo },
        update: {},
        create: {
          invoiceNo,
          studentId: s.id,
          feeStructureId: fee.id,
          monthYear: mb.key,
          amount,
          discount: 0,
          total: amount,
          amountPaid,
          status,
          dueDate,
          issuedAt: new Date(mb.year, mb.month, 1),
        },
      });
      invoiceCount++;

      if (paid) {
        // Idempotent — create one payment per invoice
        const existingPayments = await prisma.payment.count({
          where: { invoiceId: invoice.id },
        });
        if (existingPayments === 0) {
          await prisma.payment.create({
            data: {
              invoiceId: invoice.id,
              amount,
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
    }
  }
  console.log(`✓ ${invoiceCount} invoices · ${paymentCount} payments`);

  // ── Attendance: last 6 days × all enrollments ───────────────────────
  const teacherUserId = users[Role.TEACHER].id;
  const today0 = new Date();
  today0.setHours(0, 0, 0, 0);
  let attendanceCount = 0;

  for (let dayOffset = 5; dayOffset >= 0; dayOffset--) {
    const d = new Date(today0);
    d.setDate(d.getDate() - dayOffset);

    for (let si = 0; si < students.length; si++) {
      const s = students[si];
      const r = (si * 31 + dayOffset * 7) % 100;
      let status: AttendanceStatus;
      if (r < 90) status = AttendanceStatus.PRESENT;
      else if (r < 96) status = AttendanceStatus.ABSENT;
      else status = AttendanceStatus.LATE;

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
  console.log(`✓ ${attendanceCount} attendance records`);

  // ── Applications (8) ────────────────────────────────────────────────
  const applicationSeeds = [
    { id: 'app-101', applicantName: 'Aiza Sheikh',    childAge: '3 yrs 4 mo', programInterest: ProgramKind.MONTESSORI, parentName: 'Naveed Sheikh', parentPhone: '+92 333 1111222', stage: ApplicationStage.RECEIVED,  source: ApplicationSource.WEBSITE  },
    { id: 'app-102', applicantName: 'Rayan Akhtar',   childAge: '6 yrs',      programInterest: ProgramKind.PRIMARY,    parentName: 'Saima Akhtar',  parentPhone: '+92 311 3333444', stage: ApplicationStage.INTERVIEW, source: ApplicationSource.WHATSAPP },
    { id: 'app-103', applicantName: 'Iqra Bashir',    childAge: '2 yrs 9 mo', programInterest: ProgramKind.NURSERY,    parentName: 'Faisal Bashir', parentPhone: '+92 300 5555666', stage: ApplicationStage.INTERVIEW, source: ApplicationSource.WEBSITE  },
    { id: 'app-104', applicantName: 'Umer Saif',      childAge: '8 yrs',      programInterest: ProgramKind.PRIMARY,    parentName: 'Sajid Saif',    parentPhone: '+92 321 7777888', stage: ApplicationStage.APPROVED,  source: ApplicationSource.WALK_IN  },
    { id: 'app-105', applicantName: 'Nimra Faisal',   childAge: '5 yrs',      programInterest: ProgramKind.KINDERGARTEN, parentName: 'Asma Faisal', parentPhone: '+92 345 2222111', stage: ApplicationStage.APPROVED,  source: ApplicationSource.REFERRAL },
    { id: 'app-106', applicantName: 'Ahsan Mehmood',  childAge: '10 yrs',     programInterest: ProgramKind.PRIMARY,    parentName: 'Adnan Mehmood', parentPhone: '+92 312 4444555', stage: ApplicationStage.ENROLLED,  source: ApplicationSource.WHATSAPP },
    { id: 'app-107', applicantName: 'Salma Rauf',     childAge: '4 yrs',      programInterest: ProgramKind.MONTESSORI, parentName: 'Rabia Rauf',    parentPhone: '+92 333 6666777', stage: ApplicationStage.RECEIVED,  source: ApplicationSource.WEBSITE  },
    { id: 'app-108', applicantName: 'Daniyal Hashmi', childAge: '9 yrs',      programInterest: ProgramKind.PRIMARY,    parentName: 'Babar Hashmi',  parentPhone: '+92 311 8888999', stage: ApplicationStage.ENROLLED,  source: ApplicationSource.WALK_IN  },
  ];
  for (const a of applicationSeeds) {
    const daysAgo = applicationSeeds.indexOf(a);
    const submittedAt = new Date(today0);
    submittedAt.setDate(submittedAt.getDate() - daysAgo);
    await prisma.application.upsert({
      where: { id: a.id },
      update: { stage: a.stage },
      create: {
        id: a.id,
        applicantName: a.applicantName,
        childAge: a.childAge,
        programInterest: a.programInterest,
        parentName: a.parentName,
        parentPhone: a.parentPhone,
        stage: a.stage,
        source: a.source,
        submittedAt,
      },
    });
  }
  console.log(`✓ ${applicationSeeds.length} applications`);

  // ── Announcements ───────────────────────────────────────────────────
  const adminId = users[Role.SUPER_ADMIN].id;
  const announcementSeeds = [
    { id: 'ann-1', title: 'Mid-term assessment week begins',        body: 'Mid-term assessments start on Friday. Please review the schedule on the parent portal.', pinned: true  },
    { id: 'ann-2', title: 'Parent-teacher meeting · Saturday 10am', body: 'A reminder that PT meetings are this Saturday, 10:00 – 12:00 at the school.',          pinned: false },
    { id: 'ann-3', title: '2026 session admissions are open',       body: 'New applications now welcome for Nursery through Class 6. Walk-ins encouraged.',       pinned: false },
  ];
  for (const ann of announcementSeeds) {
    await prisma.announcement.upsert({
      where: { id: ann.id },
      update: {},
      create: {
        id: ann.id,
        title: ann.title,
        body: ann.body,
        audience: 'ALL',
        postedById: adminId,
        pinned: ann.pinned,
      },
    });
  }
  console.log(`✓ ${announcementSeeds.length} announcements`);

  // ── Audit log ───────────────────────────────────────────────────────
  const auditSeeds = [
    { id: 'audit-1', actorId: adminId,        action: 'user.create',               entityType: 'User',         entityId: users[Role.SUPER_ADMIN].id },
    { id: 'audit-2', actorId: adminId,        action: 'academic_year.activate',    entityType: 'AcademicYear', entityId: ay.id },
    { id: 'audit-3', actorId: accountantId,   action: 'invoice.batch_generate',    entityType: 'Invoice',      entityId: 'batch' },
    { id: 'audit-4', actorId: teacherUserId,  action: 'attendance.mark',           entityType: 'Attendance',   entityId: 'today' },
    { id: 'audit-5', actorId: adminId,        action: 'announcement.publish',      entityType: 'Announcement', entityId: 'ann-1' },
    { id: 'audit-6', actorId: adminId,        action: 'application.stage_change',  entityType: 'Application',  entityId: 'app-104' },
  ];
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
