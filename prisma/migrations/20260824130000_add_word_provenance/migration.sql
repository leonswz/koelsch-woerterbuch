-- AlterTable
ALTER TABLE "Word"
ADD COLUMN "aliases" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "partOfSpeech" TEXT,
ADD COLUMN "notes" TEXT,
ADD COLUMN "reviewStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN "source" TEXT,
ADD COLUMN "sourceUrl" TEXT,
ADD COLUMN "sourceLicense" TEXT,
ADD COLUMN "uncertain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "sources" JSONB,
ADD COLUMN "importedAt" TIMESTAMP(3),
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Word_reviewStatus_idx" ON "Word"("reviewStatus");
