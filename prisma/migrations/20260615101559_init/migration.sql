-- CreateTable
CREATE TABLE "etudiant" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mdp" TEXT NOT NULL,
    "sexe" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "payes" TEXT NOT NULL,
    "date_de_naissance" TIMESTAMP(3) NOT NULL,
    "lieu_de_naissance" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etudiant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "etudiant_email_key" ON "etudiant"("email");
