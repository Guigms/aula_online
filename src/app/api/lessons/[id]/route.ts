import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const lessonSchema = z.object({ title: z.string().trim().min(2).max(120), description: z.string().max(2000).optional(), content: z.string().max(20000).optional(), videoUrl: z.string().url().optional(), durationSeconds: z.number().int().positive().optional(), type: z.enum(["VIDEO", "TEXT", "PDF", "MATERIAL", "ASSESSMENT"]).optional() });

async function access(lessonId: string) {
  const session = await getSession();
  if (!session || !["TEACHER", "ADMIN"].includes(session.role)) return { error: NextResponse.json({ error: "Acesso de professor necessário." }, { status: 403 }) };
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { module: { select: { course: { select: { teacherId: true } } } } } });
  if (!lesson || (session.role !== "ADMIN" && lesson.module.course.teacherId !== session.userId)) return { error: NextResponse.json({ error: "Aula não encontrada ou sem permissão." }, { status: 404 }) };
  return { lesson };
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; const allowed = await access(id); if ("error" in allowed) return allowed.error;
  const parsed = lessonSchema.partial().safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  return NextResponse.json({ data: await prisma.lesson.update({ where: { id }, data: parsed.data }) });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; const allowed = await access(id); if ("error" in allowed) return allowed.error;
  await prisma.lesson.delete({ where: { id } }); return NextResponse.json({ data: { deleted: true } });
}
