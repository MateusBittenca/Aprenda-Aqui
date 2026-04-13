/**
 * Cria ou atualiza apenas o usuário ADMIN (não apaga cursos nem dados dos alunos).
 * Uso: npm run prisma:seed-admin -w apps/api
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@aprenda.local').toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? process.env.ADMIN_SEED_PASSWORD ?? 'admin123';
  const displayName = process.env.ADMIN_DISPLAY_NAME ?? 'Administrador';

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      displayName,
      role: 'ADMIN',
    },
    update: {
      passwordHash,
      displayName,
      role: 'ADMIN',
    },
  });

  console.log('Conta de administrador pronta.');
  console.log(`  E-mail: ${email}`);
  console.log(`  Senha:  ${password}`);
  console.log('');
  console.log('Entre em: http://localhost:5173/admin/login');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
