-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "performerName" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'Solo';
