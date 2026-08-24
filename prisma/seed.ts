import { PrismaClient, CourseLevel, CourseStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);
  const teacher = await prisma.user.upsert({
    where: { email: "professor@lumina.local" },
    update: {},
    create: { name: "Marina Costa", email: "professor@lumina.local", passwordHash, role: Role.TEACHER, bio: "Especialista em dados e aprendizagem aplicada." },
  });

  await prisma.course.upsert({
    where: { slug: "excel-para-analise-de-dados" },
    update: {},
    create: {
      title: "Excel para análise de dados",
      slug: "excel-para-analise-de-dados",
      description: "Aprenda a transformar planilhas em decisões claras com uma metodologia prática.",
      category: "Dados",
      level: CourseLevel.INTERMEDIATE,
      durationMinutes: 1080,
      status: CourseStatus.PUBLISHED,
      teacherId: teacher.id,
      modules: { create: [{ title: "Primeiros passos", position: 1, lessons: { create: [{ title: "Introdução", type: "VIDEO", position: 1, durationSeconds: 420 }] } }] },
    },
  });
}

main().finally(() => prisma.$disconnect());
