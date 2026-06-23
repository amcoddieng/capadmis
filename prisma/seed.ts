import "dotenv/config";
import { PrismaClient, StatusDossier, StatusAdmission, StatusVisa, StatutDossierUniversite } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const STATUS_DOSSIER: StatusDossier[] = ['non_demarre', 'EN_COURS_D_ETUDE', 'VALIDE', 'CHANGEMENT_A_APPORTER'];
const STATUS_ADMISSION: (StatusAdmission | null)[] = ['ADMISSION_EN_COURS', 'ADMISSION_VALIDE', 'ADMISSION_INVALIDE', null];
const STATUS_VISA: (StatusVisa | null)[] = ['NON_DEMARRER', 'DEMANDE_VISA_EN_COURS', 'DEMANDE_VISA_VALIDE', 'DEMANDE_VISA_INVALIDE', null];
const STATUT_UNIV: StatutDossierUniversite[] = ['en_attente', 'accepte', 'refuse'];

async function generateUniqueCode(): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code: string;
  let exists: boolean;
  do {
    code = Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
    const found = await prisma.personnel.findUnique({ where: { code } });
    exists = found !== null;
  } while (exists);
  return code;
}

async function generateUniqueDossierCode(): Promise<string> {
  let code: string;
  let exists: boolean;
  do {
    code = String(Math.floor(10000000 + Math.random() * 90000000));
    const found = await prisma.dossier.findUnique({ where: { code_dossier: code } });
    exists = found !== null;
  } while (exists);
  return code;
}

async function createPersonnel(
  prenom: string,
  nom: string,
  email: string,
  role: 'superadmin' | 'admin' | 'conseiller_admission' | 'conseiller_visa',
  password: string
) {
  const existing = await prisma.personnel.findUnique({ where: { email } });
  if (existing) { console.log(`${role} ${email} existe déjà.`); return null; }
  const code = await generateUniqueCode();
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.personnel.create({
    data: { prenom, nom, code, email, mdp: hashedPassword, role },
  });
  console.log(`${role} créé — code: ${user.code}, email: ${user.email}`);
  return user;
}

async function createEtudiantWithDossier(
  index: number,
  consAdmissionIds: number[],
  consVisaIds: number[]
) {
  const prenoms = ['Moussa', 'Aminata', 'Fatou', 'Ousmane', 'Mariama', 'Ibrahima', 'Aïcha', 'Abdoulaye', 'Kadiatou', 'Mamadou', 'Seynabou', 'Babacar', 'Ndeye', 'Amadou', 'Awa', 'Cheikh', 'Ramatoulaye', 'Pape', 'Diatou', 'Modou', 'Sokhna', 'Alioune', 'Coumba', 'Lamine', 'Yacine', 'Saliou', 'Mame', 'Thierno', 'Anta', 'Djibril'];
  const noms = ['Diallo', 'Ndiaye', 'Sow', 'Fall', 'Diop', 'Ba', 'Gueye', 'Faye', 'Sy', 'Thiam', 'Cissé', 'Baldé', 'Seck', 'Samb', 'Camara', 'Dione', 'Mbaye', 'Lo', 'Sall', 'Niang', 'Tall', 'Wade', 'Sarr', 'Toure', 'Kane', 'Mendy', 'Sagna', 'Sakho', 'Traore', 'Kebe'];
  const villes = ['Dakar', 'Thiès', 'Saint-Louis', 'Touba', 'Kaolack', 'Ziguinchor', 'Mbour', 'Rufisque', 'Louga', 'Tambacounda'];
  const pays = 'Sénégal';

  const prenom = prenoms[index % prenoms.length];
  const nom = noms[index % noms.length];
  const email = `etudiant${index + 1}@capadmis.com`;

  const existing = await prisma.etudiant.findUnique({ where: { email } });
  if (existing) { console.log(`Étudiant ${email} existe déjà.`); return; }

  const hashedPassword = await bcrypt.hash('etudiant123', 10);
  const etudiant = await prisma.etudiant.create({
    data: {
      nom,
      prenom,
      email,
      mdp: hashedPassword,
      sexe: index % 2 === 0 ? 'M' : 'F',
      ville: villes[index % villes.length],
      payes: pays,
      date_de_naissance: new Date(1995 + (index % 10), (index % 12), 15),
      lieu_de_naissance: villes[(index + 3) % villes.length],
    },
  });

  const code_dossier = await generateUniqueDossierCode();

  // Assignation aléatoire
  const hasConsAdm = Math.random() > 0.2;
  const hasConsVisa = Math.random() > 0.3;
  const consAdmId = hasConsAdm ? consAdmissionIds[Math.floor(Math.random() * consAdmissionIds.length)] : null;
  const consVisaId = hasConsVisa ? consVisaIds[Math.floor(Math.random() * consVisaIds.length)] : null;

  const status = STATUS_DOSSIER[Math.floor(Math.random() * STATUS_DOSSIER.length)];
  const status_admission = STATUS_ADMISSION[Math.floor(Math.random() * STATUS_ADMISSION.length)];
  const status_visa = STATUS_VISA[Math.floor(Math.random() * STATUS_VISA.length)];

  const dossier = await prisma.dossier.create({
    data: {
      code_dossier,
      etudiant_id: etudiant.id,
      conseiller_admission_id: consAdmId,
      conseiller_visa_id: consVisaId,
      status,
      status_admission,
      status_visa,
    },
  });

  // Créer 0 à 3 dossiers universitaires
  const nbUniv = Math.floor(Math.random() * 4);
  const filieres = ['Génie Logiciel', 'Médecine', 'Droit', 'Économie', 'Agronomie', 'Architecture', 'Pharmacie', ' sciences politiques'];
  const univs = ['Université Paris-Saclay', 'Sorbonne Université', 'Université de Montréal', 'Université Cheikh Anta Diop', 'Université de Lyon', 'Université Laval'];
  const regions = ['Île-de-France', 'Occitanie', 'Québec', 'Dakar', 'Auvergne-Rhône-Alpes'];

  for (let u = 0; u < nbUniv; u++) {
    await prisma.dossier_universite.create({
      data: {
        code_dossier,
        filiere: filieres[(index + u) % filieres.length],
        universite: univs[(index + u) % univs.length],
        pays: ['France', 'Canada', 'Sénégal'][(index + u) % 3],
        ville: ['Paris', 'Orsay', 'Montréal', 'Dakar', 'Lyon'][(index + u) % 5],
        region: regions[(index + u) % regions.length],
        statut: STATUT_UNIV[Math.floor(Math.random() * STATUT_UNIV.length)],
        message_universite: Math.random() > 0.7 ? 'En attente de documents complémentaires' : null,
      },
    });
  }

  console.log(`Étudiant ${index + 1} créé — ${email} — dossier ${code_dossier}`);
}

async function main() {
  // 1 superadmin
  await createPersonnel('Super', 'Admin', 'superadmin@capadmis.com', 'superadmin', 'superadmin123');

  // 2 admins
  await createPersonnel('Admin', 'Principal', 'admin1@capadmis.com', 'admin', 'admin123');
  await createPersonnel('Admin', 'Secondaire', 'admin2@capadmis.com', 'admin', 'admin123');

  // 3 conseillers admission
  const consAdm = [];
  for (let i = 1; i <= 3; i++) {
    const u = await createPersonnel(`ConsAdm${i}`, 'Admission', `consadm${i}@capadmis.com`, 'conseiller_admission', 'cons123');
    if (u) consAdm.push(u.id);
  }

  // 3 conseillers visa
  const consVisa = [];
  for (let i = 1; i <= 3; i++) {
    const u = await createPersonnel(`ConsVisa${i}`, 'Visa', `consvisa${i}@capadmis.com`, 'conseiller_visa', 'cons123');
    if (u) consVisa.push(u.id);
  }

  // 30 étudiants avec dossiers
  for (let i = 0; i < 30; i++) {
    await createEtudiantWithDossier(i, consAdm, consVisa);
  }

  console.log('Seed terminé avec succès.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });