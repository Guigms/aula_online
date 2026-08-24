import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });

  const enrollments = await prisma.enrollment.findMany({ where: { studentId: session.userId }, include: { course: { include: { teacher: { select: { name: true, avatarUrl: true } }, _count: { select: { modules: true } } } } }, orderBy: { enrolledAt: "desc" } });
  return NextResponse.json({ data: enrollments });
}
