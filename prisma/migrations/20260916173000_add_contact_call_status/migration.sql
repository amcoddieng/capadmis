ALTER TABLE "contacter_moi" ADD COLUMN "statutAppel" TEXT NOT NULL DEFAULT 'A_APPELER';

UPDATE "contacter_moi" SET "statutAppel" = 'APPELE' WHERE "appele" = true;
