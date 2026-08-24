import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { randomBytes } from "node:crypto";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") return NextResponse.json({ error: "Apenas alunos autenticados podem emitir certificados." }, { status: 401 });
  const { id: courseId } = await context.params;
  const enrollment = await prisma.enrollment.findUnique({ where: { studentId_courseId: { studentId: session.userId, courseId } }, include: { course: { include: { modules: { include: { lessons: { select: { id: true } } } }, assessments: { select: { id: true, minimumScore: true } } } }, student: { select: { name: true } } } });
  if (!enrollment || enrollment.status === "CANCELLED") return NextResponse.json({ error: "Matrícula não encontrada." }, { status: 404 });

  const lessonIds = enrollment.course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id));
  const completedLessons = await prisma.lessonProgress.count({ where: { studentId: session.userId, lessonId: { in: lessonIds }, completedAt: { not: null } } });
  if (completedLessons < lessonIds.length) return NextResponse.json({ error: "Conclua todas as aulas antes de emitir o certificado." }, { status: 409 });
  const passedAssessments = await prisma.assessmentAttempt.findMany({ where: { studentId: session.userId, assessmentId: { in: enrollment.course.assessments.map((assessment) => assessment.id) }, passed: true }, distinct: ["assessmentId"] });
  if (passedAssessments.length < enrollment.course.assessments.length) return NextResponse.json({ error: "Atinga a nota mínima de todas as avaliações." }, { status: 409 });

  const certificate = await prisma.certificate.upsert({ where: { studentId_courseId: { studentId: session.userId, courseId } }, update: {}, create: { studentId: session.userId, courseId, certificateNumber: `CERT-${new Date().getFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`, verificationCode: randomBytes(12).toString("hex") }, include: { course: { select: { title: true, durationMinutes: true, teacher: { select: { name: true } } } }, student: { select: { name: true } } } });
  await prisma.enrollment.update({ where: { id: enrollment.id }, data: { status: "COMPLETED", progress: 100, completedAt: certificate.issuedAt } });
  return NextResponse.json({ data: { ...certificate, verificationUrl: `/certificado/validar?code=${certificate.verificationCode}` } }, { status: 201 });
}
