/*
  Warnings:

  - You are about to drop the column `titre` on the `notification` table. All the data in the column will be lost.
  - Added the required column `destination` to the `notification` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('assignation_conseiller_admission', 'assignation_conseiller_visa', 'validation_dossier', 'change_status', 'message_recu', 'demande_document', 'demande_changement_document', 'assignation_dossier');

-- AlterTable
ALTER TABLE "notification" DROP COLUMN "titre",
ADD COLUMN     "destination" TEXT NOT NULL,
ADD COLUMN     "lu" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "type",
ADD COLUMN     "type" "TypeNotification" NOT NULL;
