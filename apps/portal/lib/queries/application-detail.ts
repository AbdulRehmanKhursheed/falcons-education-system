/**
 * Application detail queries — used by `/admissions/[id]` and `/admissions/new`.
 *
 * Returns plain serialisable shapes so they pass cleanly into client forms.
 */

import { db } from '@/lib/db';
import type { AuditEntry } from '@/lib/queries/student-detail';

export type ApplicationDocument = {
  id: string;
  label: string;
  url: string;
  mimeType: string | null;
  sizeBytes: number | null;
  uploadedAt: string;
};

export type ApplicationDetail = {
  id: string;
  applicantName: string;
  dateOfBirth: string | null;
  childAge: string;
  programInterest: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string | null;
  source: string;
  stage: string;
  notes: string | null;
  interviewAt: string | null;
  interviewNotes: string | null;
  studentId: string | null;
  studentName: string | null;
  studentRollNo: string | null;
  submittedAt: string;
  updatedAt: string;
  documents: ApplicationDocument[];
};

export async function getApplicationDetail(
  id: string,
): Promise<ApplicationDetail | null> {
  const row = await db.application.findUnique({
    where: { id },
    select: {
      id: true,
      applicantName: true,
      dateOfBirth: true,
      childAge: true,
      programInterest: true,
      parentName: true,
      parentPhone: true,
      parentEmail: true,
      source: true,
      stage: true,
      notes: true,
      interviewAt: true,
      interviewNotes: true,
      studentId: true,
      student: { select: { fullName: true, rollNo: true } },
      submittedAt: true,
      updatedAt: true,
      documents: {
        orderBy: { uploadedAt: 'desc' },
        select: {
          id: true,
          label: true,
          url: true,
          mimeType: true,
          sizeBytes: true,
          uploadedAt: true,
        },
      },
    },
  });

  if (!row) return null;

  return {
    id: row.id,
    applicantName: row.applicantName,
    dateOfBirth: row.dateOfBirth?.toISOString() ?? null,
    childAge: row.childAge,
    programInterest: row.programInterest,
    parentName: row.parentName,
    parentPhone: row.parentPhone,
    parentEmail: row.parentEmail,
    source: row.source,
    stage: row.stage,
    notes: row.notes,
    interviewAt: row.interviewAt?.toISOString() ?? null,
    interviewNotes: row.interviewNotes,
    studentId: row.studentId,
    studentName: row.student?.fullName ?? null,
    studentRollNo: row.student?.rollNo ?? null,
    submittedAt: row.submittedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    documents: row.documents.map((d) => ({
      id: d.id,
      label: d.label,
      url: d.url,
      mimeType: d.mimeType,
      sizeBytes: d.sizeBytes,
      uploadedAt: d.uploadedAt.toISOString(),
    })),
  };
}

export async function getApplicationActivity(id: string): Promise<AuditEntry[]> {
  const rows = await db.auditLog.findMany({
    where: { entityType: 'Application', entityId: id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      action: true,
      diff: true,
      createdAt: true,
      actor: { select: { name: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    actorName: r.actor?.name ?? null,
    diff: r.diff,
    createdAt: r.createdAt.toISOString(),
  }));
}

export type ConversionClassroom = {
  id: string;
  name: string;
  programKind: string;
};

export async function getClassroomsForConversion(): Promise<ConversionClassroom[]> {
  const currentYear = await db.academicYear.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });
  const rows = await db.classroom.findMany({
    where: currentYear ? { academicYearId: currentYear.id } : {},
    orderBy: { name: 'asc' },
    select: { id: true, name: true, programKind: true },
  });
  return rows;
}
