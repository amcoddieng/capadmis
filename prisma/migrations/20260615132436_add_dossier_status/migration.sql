-- CreateEnum
CREATE TYPE "StatusDossier" AS ENUM ('EN_COURS_D_ETUDE', 'VALIDE', 'CHANGEMENT_A_APPORTER');

-- CreateEnum
CREATE TYPE "StatusAdmission" AS ENUM ('ADMISSION_EN_COURS', 'ADMISSION_VALIDE', 'ADMISSION_INVALIDE');

-- CreateEnum
CREATE TYPE "StatusVisa" AS ENUM ('DEMANDE_VISA_EN_COURS', 'DEMANDE_VISA_VALIDE', 'DEMANDE_VISA_INVALIDE');

-- AlterTable
ALTER TABLE "dossier" ADD COLUMN     "status" "StatusDossier" NOT NULL DEFAULT 'EN_COURS_D_ETUDE',
ADD COLUMN     "status_admission" "StatusAdmission",
ADD COLUMN     "status_visa" "StatusVisa";
