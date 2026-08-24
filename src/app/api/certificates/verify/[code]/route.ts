import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const certificate = await prisma.certificate.findUnique({ where: { verificationCode: code }, include: { student: { select: { name: true } }, course: { select: { title: true, durationMinutes: true, teacher: { select: { name: true } } } } } });
  if (!certificate) return NextResponse.json({ valid: false, error: "Certificado não encontrado." }, { status: 404 });
  return NextResponse.json({ valid: true, data: certificate });
}
