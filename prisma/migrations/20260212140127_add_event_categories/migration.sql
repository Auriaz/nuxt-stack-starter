-- AlterTable
ALTER TABLE "CalendarEvent" ADD COLUMN     "categoryId" INTEGER;

-- CreateTable
CREATE TABLE "event_categories" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "teamId" INTEGER,
    "label" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "icon" TEXT NOT NULL DEFAULT 'i-lucide-calendar',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_categories_userId_idx" ON "event_categories"("userId");

-- CreateIndex
CREATE INDEX "event_categories_teamId_idx" ON "event_categories"("teamId");

-- CreateIndex
CREATE INDEX "event_categories_isSystem_idx" ON "event_categories"("isSystem");

-- CreateIndex
CREATE UNIQUE INDEX "event_categories_slug_userId_teamId_key" ON "event_categories"("slug", "userId", "teamId");

-- CreateIndex
CREATE INDEX "CalendarEvent_categoryId_idx" ON "CalendarEvent"("categoryId");

-- AddForeignKey
ALTER TABLE "event_categories" ADD CONSTRAINT "event_categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_categories" ADD CONSTRAINT "event_categories_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "event_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
