import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session || !["TEACHER", "ADMIN"].includes(session.role)) return NextResponse.json({ error: "Acesso de professor necessário." }, { status: 403 });
  const courses = await prisma.course.findMany({ where: session.role === "ADMIN" ? {} : { teacherId: session.userId }, include: { _count: { select: { enrollments: true, modules: true } }, modules: { orderBy: { position: "asc" }, include: { _count: { select: { lessons: true } } } } }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ data: courses });
}
