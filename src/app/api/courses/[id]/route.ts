import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const course = await prisma.course.findFirst({
    where: { status: "PUBLISHED", OR: [{ id }, { slug: id }] },
    include: {
      teacher: { select: { id: true, name: true, bio: true, avatarUrl: true } },
      modules: { orderBy: { position: "asc" }, include: { lessons: { orderBy: { position: "asc" }, select: { id: true, title: true, type: true, durationSeconds: true, position: true } } } },
      _count: { select: { enrollments: true, modules: true, assessments: true } },
    },
  });

  if (!course) return NextResponse.json({ error: "Curso não encontrado." }, { status: 404 });
  return NextResponse.json({ data: course });
}
