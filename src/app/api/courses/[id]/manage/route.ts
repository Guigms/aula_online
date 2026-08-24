import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCourseSchema } from "@/lib/validators/course";
import { z } from "zod";

const manageCourseSchema = createCourseSchema.partial().extend({ status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional() });

async function ownedCourse(id: string) {
  const session = await getSession();
  if (!session || !["TEACHER", "ADMIN"].includes(session.role)) return { error: NextResponse.json({ error: "Acesso de professor necessário." }, { status: 403 }) };
  const course = await prisma.course.findUnique({ where: { id }, select: { id: true, teacherId: true } });
  if (!course || (session.role !== "ADMIN" && course.teacherId !== session.userId)) return { error: NextResponse.json({ error: "Curso não encontrado ou sem permissão." }, { status: 404 }) };
  return { session, course };
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const access = await ownedCourse(id);
  if ("error" in access) return access.error;
  const parsed = manageCourseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos.", details: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.status === "PUBLISHED") {
    const structure = await prisma.course.findUnique({ where: { id }, select: { modules: { select: { _count: { select: { lessons: true } } } } } });
    const lessonCount = structure?.modules.reduce((total, module) => total + module._count.lessons, 0) || 0;
    if (!structure?.modules.length || !lessonCount) return NextResponse.json({ error: "Adicione ao menos um módulo e uma aula antes de publicar." }, { status: 409 });
  }
  const course = await prisma.course.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ data: course });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const access = await ownedCourse(id);
  if ("error" in access) return access.error;
  const course = await prisma.course.findUnique({ where: { id }, select: { status: true, _count: { select: { enrollments: true } } } });
  if (course?.status !== "DRAFT" || course._count.enrollments > 0) return NextResponse.json({ error: "Somente rascunhos sem matrículas podem ser excluídos." }, { status: 409 });
  await prisma.course.delete({ where: { id } });
  return NextResponse.json({ data: { deleted: true } });
}
