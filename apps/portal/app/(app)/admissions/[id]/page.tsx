import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Phone,
  MessageCircle,
  Mail,
  Globe,
  MapPin,
  UsersRound,
  CalendarClock,
  ClipboardList,
  FileText,
  ArrowUpRight,
  Cake,
  GraduationCap,
  User as UserIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/format';
import { requireRole } from '@/lib/auth-helpers';
import {
  getApplicationDetail,
  getApplicationActivity,
  getClassroomsForConversion,
} from '@/lib/queries/application-detail';
import { ApplicationDetailTimeline } from '@/components/data/ApplicationDetailTimeline';
import { ApplicationDetailActions } from '@/components/data/ApplicationDetailActions';
import { ApplicationDetailDocuments } from '@/components/data/ApplicationDetailDocuments';
import { ApplicationDetailActivity } from '@/components/data/ApplicationDetailActivity';

export const metadata = { title: 'Application detail' };

const stageTone: Record<string, Parameters<typeof Chip>[0]['tone']> = {
  RECEIVED: 'neutral',
  INTERVIEW: 'info',
  APPROVED: 'brand',
  ENROLLED: 'success',
  DECLINED: 'danger',
  WITHDRAWN: 'danger',
};

const stageLabel: Record<string, string> = {
  RECEIVED: 'Received',
  INTERVIEW: 'Interview',
  APPROVED: 'Approved',
  ENROLLED: 'Enrolled',
  DECLINED: 'Declined',
  WITHDRAWN: 'Withdrawn',
};

const programLabel: Record<string, string> = {
  NURSERY: 'Nursery',
  MONTESSORI: 'Montessori',
  KINDERGARTEN: 'Kindergarten',
  PRIMARY: 'Primary',
  EVENING_COACHING: 'Evening coaching',
  SATURDAY_COACHING: 'Saturday coaching',
  COMPUTER_COURSE: 'Computer course',
};

const sourceIcon: Record<string, typeof Globe> = {
  WEBSITE: Globe,
  WHATSAPP: MessageCircle,
  WALK_IN: MapPin,
  REFERRAL: UsersRound,
  PHONE: Phone,
};

const sourceLabel: Record<string, string> = {
  WEBSITE: 'Website',
  WHATSAPP: 'WhatsApp',
  WALK_IN: 'Walk-in',
  REFERRAL: 'Referral',
  PHONE: 'Phone',
};

function waLink(phone: string): string {
  let digits = phone.replace(/\D+/g, '');
  if (digits.startsWith('03')) digits = '92' + digits.slice(1);
  if (digits.startsWith('00')) digits = digits.slice(2);
  return `https://wa.me/${digits}`;
}

function calcAge(dobIso: string | null): number | null {
  if (!dobIso) return null;
  const dob = new Date(dobIso);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return Math.max(0, age);
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);
  const { id } = await params;

  const [app, activity, classrooms] = await Promise.all([
    getApplicationDetail(id),
    getApplicationActivity(id),
    getClassroomsForConversion(),
  ]);

  if (!app) notFound();

  const SourceIcon = sourceIcon[app.source] ?? Globe;
  const age = calcAge(app.dateOfBirth);

  return (
    <>
      <div className="mb-3">
        <Link
          href="/admissions"
          className="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-3 h-3" strokeWidth={2} />
          Admissions
        </Link>
      </div>

      <PageHeader
        eyebrow={`Admissions · ${stageLabel[app.stage] ?? app.stage}`}
        title={app.applicantName}
        description={`Application submitted ${formatDate(app.submittedAt)} via ${sourceLabel[app.source] ?? app.source}.`}
        actions={
          app.studentId && (
            <Link
              href={`/students/${app.studentId}`}
              className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors"
            >
              View student record
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Applicant + parent */}
        <Card className="lg:col-span-2">
          <CardHeader
            eyebrow="Application"
            title="Applicant details"
            action={
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
                <SourceIcon className="w-3 h-3" strokeWidth={1.75} />
                {sourceLabel[app.source] ?? app.source}
              </span>
            }
          />
          <div className="px-5 py-5">
            <div className="flex items-start gap-5 mb-5">
              <Avatar name={app.applicantName} size="lg" />
              <div className="min-w-0">
                <p className="font-display text-2xl text-ink leading-tight" style={{ fontVariationSettings: '"opsz" 24' }}>
                  {app.applicantName}
                </p>
                <p className="text-[12.5px] text-ink-muted mt-1">
                  {programLabel[app.programInterest] ?? app.programInterest}
                  {app.studentRollNo && (
                    <>
                      <span className="mx-1.5 text-ink-faint">·</span>
                      <span className="font-mono tabular">Roll {app.studentRollNo}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
              <Field label="Age" Icon={Cake}>
                {app.childAge}
                {age !== null && (
                  <span className="text-ink-faint"> · {age} yrs</span>
                )}
              </Field>
              <Field label="Date of birth" Icon={Cake}>
                {app.dateOfBirth ? formatDate(app.dateOfBirth) : '—'}
              </Field>
              <Field label="Program interest" Icon={GraduationCap}>
                {programLabel[app.programInterest] ?? app.programInterest}
              </Field>
              <Field label="Submitted" Icon={CalendarClock}>
                {formatDate(app.submittedAt)}
              </Field>
            </dl>

            <hr className="my-5 border-line-soft" />

            <h4 className="eyebrow text-ink-faint mb-3">Parent / guardian</h4>
            <div className="flex flex-col gap-1.5 text-[13px]">
              <p className="inline-flex items-center gap-2 text-ink font-semibold">
                <UserIcon className="w-3.5 h-3.5 text-ink-faint" strokeWidth={1.75} />
                {app.parentName}
              </p>
              <a
                href={`tel:${app.parentPhone}`}
                className="inline-flex items-center gap-2 font-mono text-ink-soft hover:text-ink tabular"
              >
                <Phone className="w-3.5 h-3.5 text-ink-faint" strokeWidth={1.75} />
                {app.parentPhone}
              </a>
              <a
                href={waLink(app.parentPhone)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-mono text-success hover:text-ink tabular"
              >
                <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.75} />
                WhatsApp
              </a>
              {app.parentEmail && (
                <a
                  href={`mailto:${app.parentEmail}`}
                  className="inline-flex items-center gap-2 text-ink-soft hover:text-ink truncate"
                >
                  <Mail className="w-3.5 h-3.5 text-ink-faint" strokeWidth={1.75} />
                  <span className="truncate">{app.parentEmail}</span>
                </a>
              )}
            </div>

            {app.notes && (
              <>
                <hr className="my-5 border-line-soft" />
                <h4 className="eyebrow text-ink-faint mb-2">Notes from parent</h4>
                <p className="text-[13px] text-ink-soft whitespace-pre-wrap">
                  {app.notes}
                </p>
              </>
            )}
          </div>
        </Card>

        {/* Pipeline + actions */}
        <Card>
          <CardHeader
            eyebrow="Pipeline"
            title="Stage workflow"
            meta="Move this application forward"
            action={<Chip tone={stageTone[app.stage] ?? 'neutral'}>{stageLabel[app.stage] ?? app.stage}</Chip>}
          />
          <ApplicationDetailTimeline current={app.stage} />
          <ApplicationDetailActions
            applicationId={app.id}
            stage={app.stage}
            interviewAt={app.interviewAt}
            interviewNotes={app.interviewNotes}
            studentId={app.studentId}
            classrooms={classrooms}
          />
        </Card>
      </div>

      {/* Documents + Activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader
            eyebrow="Files"
            title="Documents"
            meta={`${app.documents.length} attached`}
            action={<FileText className="w-4 h-4 text-accent" strokeWidth={1.5} />}
          />
          <ApplicationDetailDocuments
            applicationId={app.id}
            documents={app.documents}
          />
        </Card>

        <Card>
          <CardHeader
            eyebrow="Audit log"
            title="Activity"
            meta="Last 5 events"
            action={<ClipboardList className="w-4 h-4 text-accent" strokeWidth={1.5} />}
          />
          <ApplicationDetailActivity entries={activity} />
        </Card>
      </div>
    </>
  );
}

function Field({
  label,
  Icon,
  children,
}: {
  label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="eyebrow text-ink-faint flex items-center gap-1.5">
        <Icon className="w-3 h-3" strokeWidth={1.75} />
        {label}
      </dt>
      <dd className="text-ink mt-0.5">{children}</dd>
    </div>
  );
}
