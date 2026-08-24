import { NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { sendPasswordResetEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  const parsed = forgotPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
  if (user) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
    const resetUrl = `${process.env.APP_URL || new URL(request.url).origin}/redefinir-senha?token=${token}`;
    try {
      const sent = await sendPasswordResetEmail(parsed.data.email, resetUrl);
      if (!sent && process.env.NODE_ENV === "production") return NextResponse.json({ error: "Serviço de e-mail indisponível." }, { status: 503 });
      if (!sent) return NextResponse.json({ message: "Se o e-mail estiver cadastrado, você receberá instruções.", resetUrl });
    } catch {
      if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Não foi possível enviar o e-mail." }, { status: 503 });
    }
  }

  return NextResponse.json({ message: "Se o e-mail estiver cadastrado, você receberá instruções." });
}
