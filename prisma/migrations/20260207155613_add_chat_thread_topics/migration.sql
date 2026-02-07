-- CreateTable
CREATE TABLE "ChatThreadTopic" (
    "id" SERIAL NOT NULL,
    "threadId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatThreadTopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatThreadTopic_threadId_idx" ON "ChatThreadTopic"("threadId");

-- CreateIndex
CREATE INDEX "ChatThreadTopic_threadId_order_idx" ON "ChatThreadTopic"("threadId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ChatThreadTopic_threadId_slug_key" ON "ChatThreadTopic"("threadId", "slug");

-- AddForeignKey
ALTER TABLE "ChatThreadTopic" ADD CONSTRAINT "ChatThreadTopic_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ChatThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
