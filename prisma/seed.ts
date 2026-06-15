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

async function main() {
  const existing = await prisma.personnel.findFirst({
    where: { role: "superadmin" },
  });

  if (existing) {
    console.log("Superadmin already exists — skipping seed.");
    return;
  }

  const code = await generateUniqueCode();
  const hashedPassword = await bcrypt.hash("superadmin123", 10);

  const superadmin = await prisma.personnel.create({
    data: {
      prenom: "Super",
      nom: "Admin",
      code,
      email: "superadmin@capadmis.com",
      mdp: hashedPassword,
      role: "superadmin",
    },
  });

  console.log(`Superadmin créé — code: ${superadmin.code}, email: ${superadmin.email}`);
  console.log("Mot de passe par défaut : superadmin123 (à changer en production)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
