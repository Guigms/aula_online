import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") return NextResponse.json({ error: "Acesso de aluno necessário." }, { status: 403 });

  const enrollments = await prisma.enrollment.findMany({ where: { studentId: session.userId, status: { not: "CANCELLED" } }, include: { course: { include: { teacher: { select: { id: true, name: true, avatarUrl: true } }, modules: { include: { lessons: { select: { id: true, title: true, durationSeconds: true } } } } } } }, orderBy: { enrolledAt: "desc" } });
  const lessonIds = enrollments.flatMap((enrollment) => enrollment.course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)));
  const progressRows = await prisma.lessonProgress.findMany({ where: { studentId: session.userId, lessonId: { in: lessonIds } }, include: { lesson: { select: { id: true, title: true, module: { select: { courseId: true } } } } }, orderBy: { lastAccessedAt: "desc" } });
  const progressByCourse = new Map<string, typeof progressRows>();
  for (const row of progressRows) { const courseId = row.lesson.module.courseId; progressByCourse.set(courseId, [...(progressByCourse.get(courseId) || []), row]); }

  const courses = enrollments.map((enrollment) => {
    const lessons = enrollment.course.modules.flatMap((module) => module.lessons);
    const rows = progressByCourse.get(enrollment.courseId) || [];
    const completed = rows.filter((row) => row.completedAt).length;
    const progress = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
    return { id: enrollment.course.id, title: enrollment.course.title, slug: enrollment.course.slug, category: enrollment.course.category, teacher: enrollment.course.teacher, durationMinutes: enrollment.course.durationMinutes, status: enrollment.status, progress, lastLesson: rows[0]?.lesson || null, completedLessons: completed, totalLessons: lessons.length };
  });
  const totalLessons = courses.reduce((sum, course) => sum + course.totalLessons, 0);
  const completedLessons = courses.reduce((sum, course) => sum + course.completedLessons, 0);
  const learnedMinutes = courses.reduce((sum, course) => sum + Math.round((course.durationMinutes * course.progress) / 100), 0);
  return NextResponse.json({ data: { stats: { enrolled: courses.length, inProgress: courses.filter((course) => course.progress > 0 && course.progress < 100).length, completed: courses.filter((course) => course.progress === 100).length, certificates: await prisma.certificate.count({ where: { studentId: session.userId } }), overallProgress: totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0, learnedMinutes }, courses } });
}
