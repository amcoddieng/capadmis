CREATE TABLE "checklist_dossier" (
    "id" SERIAL NOT NULL,
    "code_dossier" TEXT NOT NULL,
    "verifier_documents" BOOLEAN NOT NULL DEFAULT false,
    "creer_adresse_mail" BOOLEAN NOT NULL DEFAULT false,
    "creer_dossier_etudes_en_france" BOOLEAN NOT NULL DEFAULT false,
    "remplir_informations_personnelles" BOOLEAN NOT NULL DEFAULT false,
    "faire_choix_formations" BOOLEAN NOT NULL DEFAULT false,
    "rediger_motivations" BOOLEAN NOT NULL DEFAULT false,
    "verifier_entierement_dossier" BOOLEAN NOT NULL DEFAULT false,
    "soumettre_dossier" BOOLEAN NOT NULL DEFAULT false,
    "paiement_frais" BOOLEAN NOT NULL DEFAULT false,
    "choisir_date_entretien" BOOLEAN NOT NULL DEFAULT false,
    "coaching_preparation_entretien" BOOLEAN NOT NULL DEFAULT false,
    "valider_choix_definitif" BOOLEAN NOT NULL DEFAULT false,
    "telecharger_accord_inscription" BOOLEAN NOT NULL DEFAULT false,
    "remplir_formulaire_visa" BOOLEAN NOT NULL DEFAULT false,
    "rassembler_documents" BOOLEAN NOT NULL DEFAULT false,
    "prendre_rendez_depot" BOOLEAN NOT NULL DEFAULT false,
    "recevoir_mail_fin_procedure" BOOLEAN NOT NULL DEFAULT false,
    "deposer_dossier_visa" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_dossier_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "checklist_dossier_code_dossier_key" ON "checklist_dossier"("code_dossier");

ALTER TABLE "checklist_dossier" ADD CONSTRAINT "checklist_dossier_code_dossier_fkey" FOREIGN KEY ("code_dossier") REFERENCES "dossier"("code_dossier") ON DELETE CASCADE ON UPDATE CASCADE;
