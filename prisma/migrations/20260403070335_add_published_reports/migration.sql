-- CreateTable
CREATE TABLE "PublishedReport" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reportType" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedById" INTEGER NOT NULL,

    CONSTRAINT "PublishedReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PublishedReport" ADD CONSTRAINT "PublishedReport_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
