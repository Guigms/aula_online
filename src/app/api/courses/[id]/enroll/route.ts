import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  if (session.role !== "STUDENT") return NextResponse.json({ error: "Apenas alunos podem se matricular." }, { status: 403 });

  const { id: courseId } = await context.params;
  const course = await prisma.course.findFirst({ where: { id: courseId, status: "PUBLISHED" }, select: { id: true } });
  if (!course) return NextResponse.json({ error: "Curso não encontrado ou indisponível." }, { status: 404 });

  const enrollment = await prisma.enrollment.upsert({ where: { studentId_courseId: { studentId: session.userId, courseId } }, update: { status: "ACTIVE" }, create: { studentId: session.userId, courseId } });
  return NextResponse.json({ data: enrollment }, { status: 201 });
}
