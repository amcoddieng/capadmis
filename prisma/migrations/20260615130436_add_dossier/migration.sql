-- CreateTable
CREATE TABLE "dossier" (
    "id" SERIAL NOT NULL,
    "code_dossier" TEXT NOT NULL,
    "etudiant_id" INTEGER NOT NULL,
    "conseiller_admission_id" INTEGER,
    "conseiller_visa_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dossier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dossier_code_dossier_key" ON "dossier"("code_dossier");

-- CreateIndex
CREATE UNIQUE INDEX "dossier_etudiant_id_key" ON "dossier"("etudiant_id");

-- AddForeignKey
ALTER TABLE "dossier" ADD CONSTRAINT "dossier_etudiant_id_fkey" FOREIGN KEY ("etudiant_id") REFERENCES "etudiant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossier" ADD CONSTRAINT "dossier_conseiller_admission_id_fkey" FOREIGN KEY ("conseiller_admission_id") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossier" ADD CONSTRAINT "dossier_conseiller_visa_id_fkey" FOREIGN KEY ("conseiller_visa_id") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
