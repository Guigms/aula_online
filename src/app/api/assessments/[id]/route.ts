import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const submissionSchema = z.object({ answers: z.array(z.object({ questionId: z.string().min(1), answerId: z.string().min(1) })).min(1) });

async function assessmentForStudent(assessmentId: string, studentId: string) {
  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId }, include: { questions: { include: { answers: { select: { id: true, text: true, isCorrect: true } } } }, lesson: { select: { module: { select: { courseId: true } } } } } });
  if (!assessment) return null;
  const courseId = assessment.courseId ?? assessment.lesson?.module.courseId;
  if (!courseId) return null;
  const enrollment = await prisma.enrollment.findUnique({ where: { studentId_courseId: { studentId, courseId } } });
  return enrollment && enrollment.status !== "CANCELLED" ? { assessment, courseId } : null;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  const { id } = await context.params;
  const result = await assessmentForStudent(id, session.userId);
  if (!result) return NextResponse.json({ error: "Avaliação não encontrada ou acesso negado." }, { status: 404 });

  const attempts = await prisma.assessmentAttempt.count({ where: { assessmentId: id, studentId: session.userId } });
  return NextResponse.json({ data: { ...result.assessment, questions: result.assessment.questions.map(({ answers, ...question }) => ({ ...question, answers: answers.map(({ id, text }) => ({ id, text })) })), attemptsRemaining: Math.max(0, result.assessment.maxAttempts - attempts) } });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") return NextResponse.json({ error: "Apenas alunos autenticados podem responder." }, { status: 401 });
  const { id } = await context.params;
  const result = await assessmentForStudent(id, session.userId);
  if (!result) return NextResponse.json({ error: "Avaliação não encontrada ou acesso negado." }, { status: 404 });

  const attempts = await prisma.assessmentAttempt.count({ where: { assessmentId: id, studentId: session.userId } });
  if (attempts >= result.assessment.maxAttempts) return NextResponse.json({ error: "Limite de tentativas atingido." }, { status: 409 });
  const parsed = submissionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Respostas inválidas." }, { status: 400 });

  const questionMap = new Map(result.assessment.questions.map((question) => [question.id, question]));
  const answeredPoints = parsed.data.answers.reduce((total, answer) => {
    const question = questionMap.get(answer.questionId);
    const correctAnswer = question?.answers.find((item) => item.id === answer.answerId);
    return total + (correctAnswer && "isCorrect" in correctAnswer && correctAnswer.isCorrect ? question?.points ?? 0 : 0);
  }, 0);
  const totalPoints = result.assessment.questions.reduce((total, question) => total + question.points, 0);
  const score = totalPoints ? Math.round((answeredPoints / totalPoints) * 100) : 0;
  const attempt = await prisma.assessmentAttempt.create({ data: { assessmentId: id, studentId: session.userId, score, passed: score >= result.assessment.minimumScore } });
  return NextResponse.json({ data: { ...attempt, score, result: attempt.passed ? "APPROVED" : "FAILED" } }, { status: 201 });
}
