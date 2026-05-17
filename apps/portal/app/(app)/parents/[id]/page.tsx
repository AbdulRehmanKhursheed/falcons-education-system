import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowUpRight,
  Phone,
  MessageCircle,
  Mail,
  Briefcase,
  IdCard,
  MapPin,
  Users as UsersIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { ParentEditForm } from '@/components/data/ParentEditForm';
import {
  maskCnic,
  telLink,
  waLink,
} from '@/components/data/ParentContactHelpers';
import { getGuardianDetail } from '@/lib/queries/parents';
import { formatPKR, formatPercent } from '@/lib/format';
import { requireRole } from '@/lib/auth-helpers';

export const metadata = { title: 'Guardian' };

const relationTone: Record<string, Parameters<typeof Chip>[0]['tone']> = {
  Father: 'info',
  Mother: 'accent',
  Guardian: 'brand',
};

export default async function GuardianDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);
  const { id } = await params;
  const guardian = await getGuardianDetail(id);
  if (!guardian) notFound();

  const canEdit =
    session.user.role === 'SUPER_ADMIN' || session.user.role === 'SCHOOL_ADMIN';

  const childNamesPreview = guardian.children
    .slice(0, 2)
    .map((c) => c.name.split(' ')[0])
    .join(', ');
  const waMessage = `Assalam-o-Alaikum ${guardian.fullName}, this is Falcons Education System regarding ${
    childNamesPreview || 'your child'
  }.`;
  const waHref = waLink(guardian.whatsapp ?? guardian.phone, waMessage);
  const telHref = telLink(guardian.phone);

  return (
    <>
      <PageHeader
        eyebrow="Section · 04 / Parents"
        title={guardian.fullName}
        description={`${guardian.relation} · ${
          guardian.children.length
        } linked ${guardian.children.length === 1 ? 'child' : 'children'}`}
        actions={
          <Link
            href="/parents"
            className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Back to parents
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile card */}
        <Card className="lg:col-span-1 flex flex-col">
          <div className="p-6 flex flex-col items-center text-center border-b border-line-soft">
            <Avatar
              name={guardian.fullName}
              size="lg"
              className="!h-16 !w-16 !text-base"
            />
            <h2
              className="mt-4 font-display text-xl text-ink"
              style={{ fontVariationSettings: '"opsz" 24' }}
            >
              {guardian.fullName}
            </h2>
            <div className="mt-2 flex items-center gap-1.5">
              <Chip tone={relationTone[guardian.relation] ?? 'neutral'}>
                {guardian.relation}
              </Chip>
              {guardian.isPrimary && <Chip tone="success">Primary</Chip>}
            </div>
          </div>

          <dl className="px-5 py-4 space-y-3 text-[12.5px]">
            <Row Icon={Phone} label="Phone">
              {telHref ? (
                <a
                  href={telHref}
                  className="font-mono text-[12px] tabular text-ink hover:underline decoration-line decoration-1 underline-offset-[5px]"
                >
                  {guardian.phone}
                </a>
              ) : (
                <span className="font-mono text-[12px] tabular">
                  {guardian.phone}
                </span>
              )}
            </Row>
            <Row Icon={MessageCircle} label="WhatsApp">
              {guardian.whatsapp ? (
                <a
                  href={waLink(guardian.whatsapp) ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-[12px] tabular text-success hover:underline decoration-success/40 underline-offset-[5px]"
                >
                  {guardian.whatsapp}
                  <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
                </a>
              ) : (
                <span className="text-ink-faint">—</span>
              )}
            </Row>
            <Row Icon={Mail} label="Email">
              <span className="font-mono text-[12px] tabular truncate block">
                {guardian.email ?? '—'}
              </span>
            </Row>
            <Row Icon={Briefcase} label="Occupation">
              {guardian.occupation ?? '—'}
            </Row>
            <Row Icon={IdCard} label="CNIC">
              <span className="font-mono text-[12px] tabular">
                {maskCnic(guardian.cnic)}
              </span>
            </Row>
            <Row Icon={MapPin} label="Address">
              <span className="leading-snug">{guardian.address ?? '—'}</span>
            </Row>
          </dl>

          {/* Communication log */}
          {(waHref || telHref) && (
            <div className="px-5 py-4 border-t border-line-soft flex flex-col gap-2">
              <p className="eyebrow text-ink-faint">Quick contact</p>
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between gap-2 rounded-md border border-line bg-surface-2 px-3 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-success-soft hover:text-success hover:border-success/30 transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
                    Send WhatsApp
                  </span>
                  <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
                </a>
              )}
              {telHref && (
                <a
                  href={telHref}
                  className="inline-flex items-center justify-between gap-2 rounded-md border border-line bg-surface-2 px-3 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-ink hover:text-paper hover:border-ink transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" strokeWidth={2} />
                    Tap to call
                  </span>
                  <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
                </a>
              )}
            </div>
          )}
        </Card>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Children */}
          <Card>
            <CardHeader
              eyebrow={`${guardian.children.length} linked ${
                guardian.children.length === 1 ? 'child' : 'children'
              }`}
              title="Children"
              meta="Roll no, classroom, 30-day attendance and outstanding dues"
              action={<UsersIcon className="w-4 h-4 text-accent" strokeWidth={1.5} />}
            />
            {guardian.children.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-[13px] text-ink-faint italic">
                  No children linked to this guardian yet.
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5">
                {guardian.children.map((c) => (
                  <li
                    key={c.id}
                    className="bg-surface border border-line-soft rounded-md p-4 hover:border-line-strong transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar name={c.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ink truncate text-[13.5px]">
                          {c.name}
                        </p>
                        <p className="font-mono text-[11px] text-ink-faint tabular mt-0.5">
                          {c.rollNo}
                        </p>
                      </div>
                      {c.isPrimary && (
                        <Chip tone="success" className="!py-0">
                          Primary
                        </Chip>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-line-soft">
                      <Stat label="Class" value={c.classroom} />
                      <Stat
                        label="Attend."
                        value={formatPercent(c.attendance30d, 0)}
                        tone={
                          c.attendance30d >= 90
                            ? 'success'
                            : c.attendance30d >= 75
                            ? 'warn'
                            : 'danger'
                        }
                      />
                      <Stat
                        label="Dues"
                        value={c.duesPKR > 0 ? formatPKR(c.duesPKR) : '—'}
                        tone={c.duesPKR > 0 ? 'danger' : undefined}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Edit form */}
          {canEdit && (
            <Card>
              <CardHeader
                eyebrow="Admin"
                title="Edit contact information"
                meta="Updates are audit-logged"
              />
              <div className="px-5 py-5">
                <ParentEditForm
                  guardianId={guardian.id}
                  initial={{
                    phone: guardian.phone,
                    whatsapp: guardian.whatsapp,
                    email: guardian.email,
                    occupation: guardian.occupation,
                    address: guardian.address,
                  }}
                />
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function Row({
  Icon,
  label,
  children,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <Icon
        className="w-3.5 h-3.5 text-ink-faint shrink-0 mt-0.5"
        strokeWidth={1.75}
      />
      <div className="min-w-0 flex-1">
        <dt className="eyebrow text-ink-faint mb-0.5">{label}</dt>
        <dd className="text-ink-soft text-[13px] min-w-0">{children}</dd>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'success' | 'warn' | 'danger';
}) {
  const colorClass =
    tone === 'success'
      ? 'text-success'
      : tone === 'warn'
        ? 'text-warn'
        : tone === 'danger'
          ? 'text-danger'
          : 'text-ink';
  return (
    <div>
      <p className="eyebrow text-ink-faint mb-1">{label}</p>
      <p className={`text-[12.5px] font-semibold tabular truncate ${colorClass}`}>
        {value}
      </p>
    </div>
  );
}
