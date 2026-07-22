import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

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

async function main() {
  await createPersonnel('Super', 'Admin', 'superadmin@capadmis.com', 'superadmin', 'superadmin123');
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