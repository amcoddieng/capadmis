/*
  Warnings:

  - A unique constraint covering the columns `[telephone]` on the table `etudiant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "etudiant" ADD COLUMN     "telephone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "etudiant_telephone_key" ON "etudiant"("telephone");
