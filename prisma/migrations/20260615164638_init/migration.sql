/*
  Warnings:

  - The values [INSCRIPTION] on the enum `TypeCodeTemporaire` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `email` on the `code_temporaire` table. All the data in the column will be lost.
  - You are about to drop the column `expire_a` on the `code_temporaire` table. All the data in the column will be lost.
  - You are about to drop the column `utilise` on the `code_temporaire` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `code_temporaire` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date_expiration` to the `code_temporaire` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TypeCodeTemporaire_new" AS ENUM ('modification_mot_de_passe', 'modification_infos_etudiant');
ALTER TABLE "code_temporaire" ALTER COLUMN "type" TYPE "TypeCodeTemporaire_new" USING ("type"::text::"TypeCodeTemporaire_new");
ALTER TYPE "TypeCodeTemporaire" RENAME TO "TypeCodeTemporaire_old";
ALTER TYPE "TypeCodeTemporaire_new" RENAME TO "TypeCodeTemporaire";
DROP TYPE "public"."TypeCodeTemporaire_old";
COMMIT;

-- DropIndex
DROP INDEX "code_temporaire_email_type_idx";

-- AlterTable
ALTER TABLE "code_temporaire" DROP COLUMN "email",
DROP COLUMN "expire_a",
DROP COLUMN "utilise",
ADD COLUMN     "date_expiration" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "etudiant_id" INTEGER,
ADD COLUMN     "personnel_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "code_temporaire_code_key" ON "code_temporaire"("code");

-- AddForeignKey
ALTER TABLE "code_temporaire" ADD CONSTRAINT "code_temporaire_etudiant_id_fkey" FOREIGN KEY ("etudiant_id") REFERENCES "etudiant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_temporaire" ADD CONSTRAINT "code_temporaire_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
