import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const moduleSchema = z.object({ title: z.string().trim().min(2).max(120), description: z.string().max(1000).optional() });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !["TEACHER", "ADMIN"].includes(session.role)) return NextResponse.json({ error: "Acesso de professor necessário." }, { status: 403 });
  const { id: courseId } = await context.params;
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { teacherId: true } });
  if (!course || (session.role !== "ADMIN" && course.teacherId !== session.userId)) return NextResponse.json({ error: "Curso não encontrado ou sem permissão." }, { status: 404 });
  const parsed = moduleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  const last = await prisma.module.findFirst({ where: { courseId }, orderBy: { position: "desc" }, select: { position: true } });
  const createdModule = await prisma.module.create({ data: { ...parsed.data, courseId, position: (last?.position ?? 0) + 1 } });
  return NextResponse.json({ data: createdModule }, { status: 201 });
}
