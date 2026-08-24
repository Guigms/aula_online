"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, Sparkles } from "lucide-react";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(""); setMessage(""); setResetUrl("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email") }) });
    const result = await response.json();
    if (!response.ok) setError(result.error || "Informe um e-mail válido."); else { setMessage(result.message); setResetUrl(result.resetUrl || ""); }
    setLoading(false);
  }

  return <main className="simple-auth-page"><Link className="brand" href="/"><span className="brand-mark"><Sparkles size={17} /></span> lumina<span className="brand-dot">.</span></Link><section className="simple-auth-card"><div className="simple-auth-icon"><Mail size={20} /></div><p className="eyebrow">RECUPERAÇÃO DE ACESSO</p><h1>Esqueceu sua senha?</h1><p>Informe seu e-mail e enviaremos as instruções para criar uma nova senha.</p><form onSubmit={handleSubmit}><label>E-mail<input name="email" type="email" placeholder="voce@exemplo.com" required /></label>{error && <p className="form-error">{error}</p>}{message && <p className="success-message">{message}</p>}{resetUrl && <Link className="dev-reset-link" href={resetUrl}>Abrir link de redefinição (ambiente local)</Link>}<button className="auth-submit" disabled={loading}>{loading ? "Enviando..." : "Enviar instruções"}<ArrowRight size={17} /></button></form><Link className="back-link" href="/login">Voltar para o login</Link></section></main>;
}
