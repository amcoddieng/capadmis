-- AlterEnum
ALTER TYPE "StatusVisa" ADD VALUE 'NON_DEMARRER';

-- CreateTable
CREATE TABLE "message" (
    "id" SERIAL NOT NULL,
    "contenu" TEXT NOT NULL,
    "expediteur" TEXT NOT NULL,
    "destinataire" TEXT NOT NULL,
    "vu" BOOLEAN NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);
