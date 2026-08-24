import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const maxFileSize = 100 * 1024 * 1024;
const allowedTypes = new Map([
  ["application/pdf", "pdf"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"],
  ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["application/zip", "zip"],
]);

async function canManageCourse(courseId: string, userId: string, role: string) {
  if (role === "ADMIN") return true;
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { teacherId: true } });
  return course?.teacherId === userId;
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !["TEACHER", "ADMIN"].includes(session.role)) return NextResponse.json({ error: "Acesso de professor necessário." }, { status: 403 });
  const { id: courseId } = await context.params;
  if (!(await canManageCourse(courseId, session.userId, session.role))) return NextResponse.json({ error: "Curso não encontrado ou sem permissão." }, { status: 404 });

  const formData = await request.formData();
  const title = String(formData.get("title") || "").trim();
  const file = formData.get("file");
  if (!title || title.length > 120 || !(file instanceof File)) return NextResponse.json({ error: "Título e arquivo são obrigatórios." }, { status: 400 });
  if (file.size === 0 || file.size > maxFileSize) return NextResponse.json({ error: "O arquivo deve ter entre 1 byte e 100 MB." }, { status: 413 });
  const extension = allowedTypes.get(file.type);
  if (!extension) return NextResponse.json({ error: "Tipo de arquivo não permitido." }, { status: 415 });

  const filename = `${randomUUID()}.${extension}`;
  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, filename), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
  const material = await prisma.material.create({ data: { title, fileUrl: `/uploads/${filename}`, type: extension, courseId } });
  return NextResponse.json({ data: material }, { status: 201 });
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  const { id: courseId } = await context.params;
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { teacherId: true, status: true } });
  if (!course) return NextResponse.json({ error: "Curso não encontrado." }, { status: 404 });
  const isOwner = await canManageCourse(courseId, session.userId, session.role);
  if (!isOwner) {
    if (session.role !== "STUDENT") return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    const enrollment = await prisma.enrollment.findUnique({ where: { studentId_courseId: { studentId: session.userId, courseId } } });
    if (!enrollment || enrollment.status === "CANCELLED" || course.status !== "PUBLISHED") return NextResponse.json({ error: "Matrícula necessária." }, { status: 403 });
  }
  const materials = await prisma.material.findMany({ where: { courseId }, select: { id: true, title: true, fileUrl: true, type: true, lessonId: true, createdAt: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ data: materials });
}
