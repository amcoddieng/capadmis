/*
  Warnings:

  - The values [modification_infos_etudiant] on the enum `TypeCodeTemporaire` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAt` on the `code_temporaire` table. All the data in the column will be lost.
  - You are about to drop the column `etudiant_id` on the `code_temporaire` table. All the data in the column will be lost.
  - You are about to drop the column `personnel_id` on the `code_temporaire` table. All the data in the column will be lost.
  - Added the required column `type_utilisateur` to the `code_temporaire` table without a default value. This is not possible if the table is not empty.
  - Added the required column `utilisateur` to the `code_temporaire` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TypeUtilisateur" AS ENUM ('etudiant', 'personnel');

-- AlterEnum
BEGIN;
CREATE TYPE "TypeCodeTemporaire_new" AS ENUM ('modification_mot_de_passe', 'modification_infos');
ALTER TABLE "code_temporaire" ALTER COLUMN "type" TYPE "TypeCodeTemporaire_new" USING ("type"::text::"TypeCodeTemporaire_new");
ALTER TYPE "TypeCodeTemporaire" RENAME TO "TypeCodeTemporaire_old";
ALTER TYPE "TypeCodeTemporaire_new" RENAME TO "TypeCodeTemporaire";
DROP TYPE "public"."TypeCodeTemporaire_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "code_temporaire" DROP CONSTRAINT "code_temporaire_etudiant_id_fkey";

-- DropForeignKey
ALTER TABLE "code_temporaire" DROP CONSTRAINT "code_temporaire_personnel_id_fkey";

-- DropIndex
DROP INDEX "code_temporaire_code_key";

-- AlterTable
ALTER TABLE "code_temporaire" DROP COLUMN "createdAt",
DROP COLUMN "etudiant_id",
DROP COLUMN "personnel_id",
ADD COLUMN     "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "type_utilisateur" "TypeUtilisateur" NOT NULL,
ADD COLUMN     "utilisateur" TEXT NOT NULL,
ADD COLUMN     "utilise" BOOLEAN NOT NULL DEFAULT false;
