import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCourseSchema } from "@/lib/validators/course";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  const category = request.nextUrl.searchParams.get("category");
  const level = request.nextUrl.searchParams.get("level");

  const courses = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
      ...(category ? { category } : {}),
      ...(level ? { level: level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" } : {}),
      ...(query ? { OR: [{ title: { contains: query } }, { description: { contains: query } }] } : {}),
    },
    include: { teacher: { select: { id: true, name: true, avatarUrl: true } }, _count: { select: { enrollments: true, modules: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: courses });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = createCourseSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos.", details: parsed.error.flatten() }, { status: 400 });

  if (!["TEACHER", "ADMIN"].includes(session.role)) return NextResponse.json({ error: "Apenas professores podem criar cursos." }, { status: 403 });

  const course = await prisma.course.create({ data: { ...parsed.data, teacherId: session.userId } });
  return NextResponse.json({ data: course }, { status: 201 });
}
