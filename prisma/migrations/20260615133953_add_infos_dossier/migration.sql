-- CreateEnum
CREATE TYPE "StatusInfosDossier" AS ENUM ('VALIDE', 'EN_ATTENTE', 'INVALIDE');

-- CreateTable
CREATE TABLE "infos_dossier" (
    "id" SERIAL NOT NULL,
    "code_dossier" TEXT NOT NULL,
    "niveau_etude" TEXT NOT NULL,
    "pays_souhaite" TEXT NOT NULL,
    "filieres" TEXT[],
    "nombre_fois_bac" INTEGER NOT NULL,
    "status" "StatusInfosDossier" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "infos_dossier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "infos_dossier_code_dossier_key" ON "infos_dossier"("code_dossier");

-- AddForeignKey
ALTER TABLE "infos_dossier" ADD CONSTRAINT "infos_dossier_code_dossier_fkey" FOREIGN KEY ("code_dossier") REFERENCES "dossier"("code_dossier") ON DELETE CASCADE ON UPDATE CASCADE;
