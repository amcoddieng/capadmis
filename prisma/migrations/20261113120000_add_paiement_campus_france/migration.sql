-- CreateTable
CREATE TABLE "paiement_campus_france" (
    "id" SERIAL NOT NULL,
    "code_dossier" TEXT NOT NULL,
    "montant" INTEGER NOT NULL DEFAULT 85000,
    "recu" TEXT,
    "date_depot" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paiement_campus_france_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "paiement_campus_france_code_dossier_key" ON "paiement_campus_france"("code_dossier");

-- CreateIndex
CREATE UNIQUE INDEX "paiement_campus_france_recu_key" ON "paiement_campus_france"("recu");

-- AddForeignKey
ALTER TABLE "paiement_campus_france" ADD CONSTRAINT "paiement_campus_france_code_dossier_fkey" FOREIGN KEY ("code_dossier") REFERENCES "dossier"("code_dossier") ON DELETE CASCADE ON UPDATE CASCADE;
