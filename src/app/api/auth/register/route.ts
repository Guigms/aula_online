import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Confira os dados informados.", details: parsed.error.flatten() }, { status: 400 });

  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existingUser) return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 409 });

  const user = await prisma.user.create({ data: { name: parsed.data.name, email: parsed.data.email, passwordHash: await hash(parsed.data.password, 12), role: parsed.data.role }, select: { id: true, name: true, email: true, role: true } });
  await createSession({ userId: user.id, role: user.role });
  return NextResponse.json({ data: user }, { status: 201 });
}
