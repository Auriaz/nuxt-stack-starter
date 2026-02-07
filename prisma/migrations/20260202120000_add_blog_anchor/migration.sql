-- CreateTable
CREATE TABLE "BlogAnchor" (
    "id" SERIAL NOT NULL,
    "blogPostId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "icon" TEXT,
    "target" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogAnchor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlogAnchor_blogPostId_idx" ON "BlogAnchor"("blogPostId");

-- AddForeignKey
ALTER TABLE "BlogAnchor" ADD CONSTRAINT "BlogAnchor_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
