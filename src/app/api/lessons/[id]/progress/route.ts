import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const progressSchema = z.object({ progress: z.number().int().min(0).max(100).optional(), watchedSeconds: z.number().int().min(0).optional(), completed: z.boolean().optional() });

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  if (session.role !== "STUDENT") return NextResponse.json({ error: "Apenas alunos podem registrar progresso." }, { status: 403 });

  const { id: lessonId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = progressSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Progresso inválido." }, { status: 400 });

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true, module: { select: { courseId: true } } } });
  if (!lesson) return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });
  const enrollment = await prisma.enrollment.findUnique({ where: { studentId_courseId: { studentId: session.userId, courseId: lesson.module.courseId } } });
  if (!enrollment || enrollment.status === "CANCELLED") return NextResponse.json({ error: "Matrícula necessária." }, { status: 403 });

  const now = new Date();
  const progress = await prisma.lessonProgress.upsert({ where: { studentId_lessonId: { studentId: session.userId, lessonId } }, update: { progress: parsed.data.completed ? 100 : parsed.data.progress, watchedSeconds: parsed.data.watchedSeconds, completedAt: parsed.data.completed ? now : undefined, startedAt: now, lastAccessedAt: now }, create: { studentId: session.userId, lessonId, progress: parsed.data.completed ? 100 : parsed.data.progress || 0, watchedSeconds: parsed.data.watchedSeconds || 0, completedAt: parsed.data.completed ? now : null, startedAt: now, lastAccessedAt: now } });
  return NextResponse.json({ data: progress });
}
