-- CreateEnum
CREATE TYPE "CalendarEventStatus" AS ENUM ('scheduled', 'cancelled');

-- CreateEnum
CREATE TYPE "CalendarEventVisibility" AS ENUM ('private', 'team');

-- CreateEnum
CREATE TYPE "CalendarEventParticipantRole" AS ENUM ('owner', 'attendee');

-- CreateEnum
CREATE TYPE "CalendarEventRsvpStatus" AS ENUM ('invited', 'accepted', 'declined');

-- CreateEnum
CREATE TYPE "CalendarEventReminderChannel" AS ENUM ('in_app');

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "teamId" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "location" TEXT,
    "url" TEXT,
    "status" "CalendarEventStatus" NOT NULL DEFAULT 'scheduled',
    "visibility" "CalendarEventVisibility" NOT NULL DEFAULT 'private',
    "cancelledAt" TIMESTAMP(3),
    "chatThreadId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEventParticipant" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "CalendarEventParticipantRole" NOT NULL DEFAULT 'attendee',
    "rsvpStatus" "CalendarEventRsvpStatus" NOT NULL DEFAULT 'invited',
    "invitedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalendarEventParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEventReminder" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "minutesBefore" INTEGER NOT NULL,
    "channel" "CalendarEventReminderChannel" NOT NULL DEFAULT 'in_app',
    "firedAt" TIMESTAMP(3),

    CONSTRAINT "CalendarEventReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CalendarEvent_ownerId_startAt_idx" ON "CalendarEvent"("ownerId", "startAt");

-- CreateIndex
CREATE INDEX "CalendarEvent_teamId_startAt_idx" ON "CalendarEvent"("teamId", "startAt");

-- CreateIndex
CREATE INDEX "CalendarEvent_status_startAt_idx" ON "CalendarEvent"("status", "startAt");

-- CreateIndex
CREATE INDEX "CalendarEventParticipant_userId_idx" ON "CalendarEventParticipant"("userId");

-- CreateIndex
CREATE INDEX "CalendarEventParticipant_eventId_idx" ON "CalendarEventParticipant"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEventParticipant_eventId_userId_key" ON "CalendarEventParticipant"("eventId", "userId");

-- CreateIndex
CREATE INDEX "CalendarEventReminder_eventId_idx" ON "CalendarEventReminder"("eventId");

-- CreateIndex
CREATE INDEX "CalendarEventReminder_firedAt_idx" ON "CalendarEventReminder"("firedAt");

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEventParticipant" ADD CONSTRAINT "CalendarEventParticipant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CalendarEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEventParticipant" ADD CONSTRAINT "CalendarEventParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEventParticipant" ADD CONSTRAINT "CalendarEventParticipant_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEventReminder" ADD CONSTRAINT "CalendarEventReminder_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CalendarEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
