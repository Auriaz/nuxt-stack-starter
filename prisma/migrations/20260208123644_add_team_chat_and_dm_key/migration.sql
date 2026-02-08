/*
  Warnings:

  - A unique constraint covering the columns `[dmKey]` on the table `ChatThread` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "ChatThreadType" ADD VALUE 'team';

-- AlterTable
ALTER TABLE "ChatThread" ADD COLUMN     "dmKey" TEXT,
ADD COLUMN     "teamId" INTEGER;

-- CreateIndex
CREATE INDEX "ChatThread_teamId_idx" ON "ChatThread"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatThread_dmKey_key" ON "ChatThread"("dmKey");

-- AddForeignKey
ALTER TABLE "ChatThread" ADD CONSTRAINT "ChatThread_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
