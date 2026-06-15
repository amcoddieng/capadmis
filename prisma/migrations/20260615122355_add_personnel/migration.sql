-- CreateEnum
CREATE TYPE "Role" AS ENUM ('superadmin', 'admin', 'conseiller_visa', 'conseiller_admission');

-- CreateTable
CREATE TABLE "personnel" (
    "id" SERIAL NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mdp" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personnel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personnel_code_key" ON "personnel"("code");

-- CreateIndex
CREATE UNIQUE INDEX "personnel_email_key" ON "personnel"("email");
