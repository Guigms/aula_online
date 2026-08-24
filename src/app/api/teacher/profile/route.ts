import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({ name: z.string().trim().min(2).max(80), bio: z.string().trim().max(2000).optional(), avatarUrl: z.string().url().optional().or(z.literal("")) });

export async function GET() {
  const session = await getSession();
  if (!session || !["TEACHER", "ADMIN"].includes(session.role)) return NextResponse.json({ error: "Acesso de professor necessário." }, { status: 403 });
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, name: true, email: true, role: true, bio: true, avatarUrl: true, createdAt: true, _count: { select: { courses: true, certificates: true } } } });
  if (!user) return NextResponse.json({ error: "Professor não encontrado." }, { status: 404 });
  const courseStats = await prisma.course.aggregate({ where: session.role === "ADMIN" ? {} : { teacherId: session.userId }, _count: { id: true } });
  return NextResponse.json({ data: { ...user, courseCount: courseStats._count.id } });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || !["TEACHER", "ADMIN"].includes(session.role)) return NextResponse.json({ error: "Acesso de professor necessário." }, { status: 403 });
  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados de perfil inválidos.", details: parsed.error.flatten() }, { status: 400 });
  const user = await prisma.user.update({ where: { id: session.userId }, data: { name: parsed.data.name, bio: parsed.data.bio || null, avatarUrl: parsed.data.avatarUrl || null }, select: { id: true, name: true, email: true, role: true, bio: true, avatarUrl: true } });
  return NextResponse.json({ data: user });
}
