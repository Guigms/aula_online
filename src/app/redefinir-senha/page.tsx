"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password: form.get("password") }) });
    const result = await response.json();
    if (!response.ok) setError(result.error || "Não foi possível alterar a senha."); else setMessage(result.message);
    setLoading(false);
  }

  return <main className="simple-auth-page"><Link className="brand" href="/"><span className="brand-mark"><Sparkles size={17} /></span> lumina<span className="brand-dot">.</span></Link><section className="simple-auth-card"><div className="simple-auth-icon"><LockKeyhole size={20} /></div><p className="eyebrow">NOVA SENHA</p><h1>Crie uma senha nova.</h1><p>Escolha uma senha forte para proteger seu acesso à Lumina.</p><form onSubmit={handleSubmit}><label>Nova senha<input name="password" type="password" minLength={8} placeholder="Mínimo de 8 caracteres" required /></label>{error && <p className="form-error">{error}</p>}{message && <p className="success-message">{message}</p>}<button className="auth-submit" disabled={loading || !token}>{loading ? "Salvando..." : "Alterar senha"}<ArrowRight size={17} /></button></form><Link className="back-link" href="/login">Voltar para o login</Link></section></main>;
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="simple-auth-page" />}><ResetPasswordForm /></Suspense>;
}
