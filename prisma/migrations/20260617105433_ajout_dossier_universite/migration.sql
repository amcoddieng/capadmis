-- CreateEnum
CREATE TYPE "StatutDossierUniversite" AS ENUM ('accepte', 'refuse', 'en_attente');

-- AlterTable
ALTER TABLE "message" ALTER COLUMN "contenu" DROP NOT NULL;

-- CreateTable
CREATE TABLE "dossier_universite" (
    "id" SERIAL NOT NULL,
    "code_dossier" TEXT NOT NULL,
    "filiere" TEXT NOT NULL,
    "universite" TEXT NOT NULL,
    "pays" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "statut" "StatutDossierUniversite" NOT NULL DEFAULT 'en_attente',
    "message_universite" TEXT,
    "date_depot" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dossier_universite_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dossier_universite" ADD CONSTRAINT "dossier_universite_code_dossier_fkey" FOREIGN KEY ("code_dossier") REFERENCES "dossier"("code_dossier") ON DELETE CASCADE ON UPDATE CASCADE;
