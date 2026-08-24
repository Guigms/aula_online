import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  const certificates = await prisma.certificate.findMany({ where: { studentId: session.userId }, include: { course: { select: { title: true, durationMinutes: true, teacher: { select: { name: true } } } } }, orderBy: { issuedAt: "desc" } });
  return NextResponse.json({ data: certificates });
}
