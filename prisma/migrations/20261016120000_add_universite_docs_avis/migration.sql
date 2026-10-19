-- CreateEnum
CREATE TYPE "AvisChoixUniversite" AS ENUM ('CHOIX_VALIDES', 'CHOIX_A_REVOIR');

-- AlterTable
ALTER TABLE "dossier_universite" ADD COLUMN "lettre_motivation" TEXT,
ADD COLUMN "cv" TEXT,
ADD COLUMN "avis_etudiant" "AvisChoixUniversite";
