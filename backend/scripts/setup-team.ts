/**
 * Cria/atualiza a equipe real da Fabelle SEM apagar nenhum outro dado.
 * Remove fotos de perfil fictícias de todos os usuários.
 *
 * Como rodar (PowerShell, dentro de backend/):
 *   $env:DATABASE_URL="<sua connection string do Neon>"
 *   npx ts-node scripts/setup-team.ts
 *
 * Senha inicial de todos: fabelle2026  (cada um troca depois em "Esqueceu a senha?")
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'fabelle2026';

const TEAM = [
  { name: 'Fabi', email: 'fabi@fabelle.com.br', role: 'ADMIN' },
  { name: 'Janderson', email: 'janderson@fabelle.com.br', role: 'CORRETOR' },
  { name: 'Leandro', email: 'leandro@fabelle.com.br', role: 'CORRETOR' },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const member of TEAM) {
    const user = await prisma.user.upsert({
      where: { email: member.email },
      update: { name: member.name, role: member.role, active: true, photo: null },
      create: {
        name: member.name,
        email: member.email,
        role: member.role,
        passwordHash,
        active: true,
        photo: null,
        commissionRate: member.role === 'CORRETOR' ? 5.0 : 0,
        salesMeta: member.role === 'CORRETOR' ? 1000000 : 0,
      },
    });
    console.log(`✓ ${member.role.padEnd(9)} ${user.name} (${user.email})`);
  }

  // Remove foto fictícia de TODOS os usuários (perfil sem imagem).
  const cleared = await prisma.user.updateMany({
    where: { photo: { not: null } },
    data: { photo: null },
  });
  console.log(`\nFotos de perfil removidas: ${cleared.count}`);
  console.log(`\nSenha inicial de todos: ${DEFAULT_PASSWORD}`);
  console.log('Pronto. Nenhum outro dado foi alterado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
