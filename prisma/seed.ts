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

    const found = await prisma.personnel.findUnique({
      where: { code },
    });

    exists = found !== null;
  } while (exists);

  return code;
}

async function createUser(
  prenom: string,
  nom: string,
  email: string,
  role: string,
  password: string
) {
  const existing = await prisma.personnel.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`${role} existe déjà.`);
    return;
  }

  const code = await generateUniqueCode();
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.personnel.create({
    data: {
      prenom,
      nom,
      code,
      email,
      mdp: hashedPassword,
      role: role as any,
    },
  });

  console.log(
    `${role} créé — code: ${user.code}, email: ${user.email}`
  );
}

async function main() {
  await createUser(
    "Super",
    "Admin",
    "superadmin@capadmis.com",
    "superadmin",
    "superadmin123"
  );

  await createUser(
    "Conseiller",
    "Admission",
    "admission@capadmis.com",
    "conseiller_admission",
    "admission123"
  );

  await createUser(
    "Conseiller",
    "Visa",
    "visa@capadmis.com",
    "conseiller_visa",
    "visa123"
  );

  console.log("Seed terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });