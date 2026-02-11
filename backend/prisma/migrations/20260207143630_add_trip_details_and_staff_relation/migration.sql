/*
  Warnings:

  - You are about to drop the column `cruiseId` on the `Staff` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Staff" DROP CONSTRAINT "Staff_cruiseId_fkey";

-- AlterTable
ALTER TABLE "Cruise" ADD COLUMN     "boardingLocation" TEXT NOT NULL DEFAULT 'Miami',
ADD COLUMN     "destination" TEXT NOT NULL DEFAULT 'Bahamas';

-- AlterTable
ALTER TABLE "Staff" DROP COLUMN "cruiseId";

-- CreateTable
CREATE TABLE "_CruiseToStaff" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CruiseToStaff_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CruiseToStaff_B_index" ON "_CruiseToStaff"("B");

-- AddForeignKey
ALTER TABLE "_CruiseToStaff" ADD CONSTRAINT "_CruiseToStaff_A_fkey" FOREIGN KEY ("A") REFERENCES "Cruise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CruiseToStaff" ADD CONSTRAINT "_CruiseToStaff_B_fkey" FOREIGN KEY ("B") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
