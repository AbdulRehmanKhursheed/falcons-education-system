-- CreateEnum
CREATE TYPE "CoachingLevel" AS ENUM ('MATRIC_9', 'MATRIC_10', 'FSC_1', 'FSC_2', 'O_LEVEL', 'A_LEVEL', 'MDCAT', 'ECAT', 'GENERAL');

-- CreateEnum
CREATE TYPE "CoachingWeekday" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- CreateEnum
CREATE TYPE "CoachingEnrollmentStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'DROPPED');

-- CreateTable
CREATE TABLE "CoachingBatch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "level" "CoachingLevel" NOT NULL,
    "weekdays" "CoachingWeekday"[],
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "teacherId" TEXT,
    "monthlyFee" DECIMAL(12,2) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 20,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachingBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachingEnrollment" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "CoachingEnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedOn" DATE NOT NULL,
    "leftOn" DATE,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachingEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachingAttendance" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "remark" TEXT,
    "markedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachingAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoachingBatch_isActive_idx" ON "CoachingBatch"("isActive");

-- CreateIndex
CREATE INDEX "CoachingBatch_subject_idx" ON "CoachingBatch"("subject");

-- CreateIndex
CREATE INDEX "CoachingBatch_level_idx" ON "CoachingBatch"("level");

-- CreateIndex
CREATE INDEX "CoachingEnrollment_batchId_status_idx" ON "CoachingEnrollment"("batchId", "status");

-- CreateIndex
CREATE INDEX "CoachingEnrollment_studentId_idx" ON "CoachingEnrollment"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "CoachingEnrollment_batchId_studentId_key" ON "CoachingEnrollment"("batchId", "studentId");

-- CreateIndex
CREATE INDEX "CoachingAttendance_batchId_date_idx" ON "CoachingAttendance"("batchId", "date");

-- CreateIndex
CREATE INDEX "CoachingAttendance_date_status_idx" ON "CoachingAttendance"("date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CoachingAttendance_batchId_studentId_date_key" ON "CoachingAttendance"("batchId", "studentId", "date");

-- AddForeignKey
ALTER TABLE "CoachingBatch" ADD CONSTRAINT "CoachingBatch_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingEnrollment" ADD CONSTRAINT "CoachingEnrollment_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "CoachingBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingEnrollment" ADD CONSTRAINT "CoachingEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingAttendance" ADD CONSTRAINT "CoachingAttendance_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "CoachingBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingAttendance" ADD CONSTRAINT "CoachingAttendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingAttendance" ADD CONSTRAINT "CoachingAttendance_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
