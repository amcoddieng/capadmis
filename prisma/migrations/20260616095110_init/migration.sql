-- AlterEnum
ALTER TYPE "StatusDossier" ADD VALUE 'non_demarre';

-- AlterTable
ALTER TABLE "dossier" ALTER COLUMN "status" SET DEFAULT 'non_demarre';
