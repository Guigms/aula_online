import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session || !["TEACHER", "ADMIN"].includes(session.role)) return NextResponse.json({ error: "Acesso de professor necessário." }, { status: 403 });

  const courses = await prisma.course.findMany({ where: session.role === "ADMIN" ? {} : { teacherId: session.userId }, include: { modules: { include: { lessons: { select: { id: true } } } }, enrollments: { select: { id: true, progress: true, status: true, completedAt: true } }, _count: { select: { enrollments: true } } }, orderBy: { updatedAt: "desc" } });
  const totalStudents = courses.reduce((sum, course) => sum + course._count.enrollments, 0);
  const lessons = courses.reduce((sum, course) => sum + course.modules.reduce((moduleSum, module) => moduleSum + module.lessons.length, 0), 0);
  const enrollments = courses.flatMap((course) => course.enrollments);
  const averageProgress = enrollments.length ? Math.round(enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0) / enrollments.length) : 0;
  const completedStudents = enrollments.filter((enrollment) => enrollment.status === "COMPLETED" || enrollment.completedAt).length;
  return NextResponse.json({ data: { stats: { courses: courses.length, published: courses.filter((course) => course.status === "PUBLISHED").length, drafts: courses.filter((course) => course.status === "DRAFT").length, students: totalStudents, lessons, averageProgress, completedStudents }, courses: courses.map((course) => ({ id: course.id, title: course.title, status: course.status, students: course._count.enrollments, averageProgress: course.enrollments.length ? Math.round(course.enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0) / course.enrollments.length) : 0, lessons: course.modules.reduce((sum, module) => sum + module.lessons.length, 0) })) } });
}
