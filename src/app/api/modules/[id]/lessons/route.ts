import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const lessonSchema = z.object({ title: z.string().trim().min(2).max(120), type: z.enum(["VIDEO", "TEXT", "PDF", "MATERIAL", "ASSESSMENT"]), description: z.string().max(2000).optional(), content: z.string().max(20000).optional(), videoUrl: z.string().url().optional(), durationSeconds: z.number().int().positive().optional() });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !["TEACHER", "ADMIN"].includes(session.role)) return NextResponse.json({ error: "Acesso de professor necessário." }, { status: 403 });
  const { id: moduleId } = await context.params;
  const courseModule = await prisma.module.findUnique({ where: { id: moduleId }, select: { course: { select: { teacherId: true } } } });
  if (!courseModule || (session.role !== "ADMIN" && courseModule.course.teacherId !== session.userId)) return NextResponse.json({ error: "Módulo não encontrado ou sem permissão." }, { status: 404 });
  const parsed = lessonSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  const last = await prisma.lesson.findFirst({ where: { moduleId }, orderBy: { position: "desc" }, select: { position: true } });
  const lesson = await prisma.lesson.create({ data: { ...parsed.data, moduleId, position: (last?.position ?? 0) + 1 } });
  return NextResponse.json({ data: lesson }, { status: 201 });
}
