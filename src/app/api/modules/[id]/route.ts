import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const moduleSchema = z.object({ title: z.string().trim().min(2).max(120), description: z.string().max(1000).optional() });

async function access(moduleId: string) {
  const session = await getSession();
  if (!session || !["TEACHER", "ADMIN"].includes(session.role)) return { error: NextResponse.json({ error: "Acesso de professor necessário." }, { status: 403 }) };
  const courseModule = await prisma.module.findUnique({ where: { id: moduleId }, select: { id: true, course: { select: { teacherId: true } } } });
  if (!courseModule || (session.role !== "ADMIN" && courseModule.course.teacherId !== session.userId)) return { error: NextResponse.json({ error: "Módulo não encontrado ou sem permissão." }, { status: 404 }) };
  return { courseModule };
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; const allowed = await access(id); if ("error" in allowed) return allowed.error;
  const parsed = moduleSchema.partial().safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  return NextResponse.json({ data: await prisma.module.update({ where: { id }, data: parsed.data }) });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; const allowed = await access(id); if ("error" in allowed) return allowed.error;
  await prisma.module.delete({ where: { id } }); return NextResponse.json({ data: { deleted: true } });
}
