-- CreateEnum
CREATE TYPE "TypeCodeTemporaire" AS ENUM ('INSCRIPTION');

-- CreateTable
CREATE TABLE "code_temporaire" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "TypeCodeTemporaire" NOT NULL,
    "expire_a" TIMESTAMP(3) NOT NULL,
    "utilise" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "code_temporaire_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "code_temporaire_email_type_idx" ON "code_temporaire"("email", "type");
