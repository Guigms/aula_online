"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export default function RegisterPage() {
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        role,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || "Não foi possível criar a conta.");
      setLoading(false);
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next");
    window.location.href = role === "TEACHER" ? "/professor/cursos" : (next?.startsWith("/") ? next : "/");
  }

  return (
    <main className="register-page">
      <div className="register-top">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Sparkles size={17} />
          </span>{" "}
          lumina<span className="brand-dot">.</span>
        </Link>
        <span>
          Já possui uma conta? <Link href="/login">Entrar</Link>
        </span>
      </div>
      <div className="register-card">
        <div className="register-intro">
          <p className="eyebrow">COMECE AGORA</p>
          <h1>Seu próximo capítulo começa aqui.</h1>
          <p>Escolha como você quer participar da Lumina.</p>
          <div className="register-art">
            <span>
              LEARN
              <br />
              <b>
                BY
                <br />
                DOING
              </b>
            </span>
            <div />
          </div>
        </div>
        <form className="register-form" onSubmit={handleSubmit}>
          <h2>Criar sua conta</h2>
          <p className="auth-subtitle">É gratuito para começar.</p>
          <div className="role-options">
            <button
              type="button"
              className={
                role === "STUDENT" ? "role-option selected" : "role-option"
              }
              onClick={() => setRole("STUDENT")}
            >
              <GraduationCap size={18} />
              <span>
                <strong>Sou aluno</strong>
                <small>Quero aprender e evoluir</small>
              </span>
            </button>
            <button
              type="button"
              className={
                role === "TEACHER" ? "role-option selected" : "role-option"
              }
              onClick={() => setRole("TEACHER")}
            >
              <BriefcaseBusiness size={18} />
              <span>
                <strong>Sou professor</strong>
                <small>Quero compartilhar conhecimento</small>
              </span>
            </button>
          </div>
          <label>
            Nome completo
            <input
              name="name"
              placeholder="Como podemos chamar você?"
              required
              minLength={2}
            />
          </label>
          <label>
            E-mail
            <input
              name="email"
              type="email"
              placeholder="voce@exemplo.com"
              required
            />
          </label>
          <label>
            Senha
            <input
              name="password"
              type="password"
              placeholder="Mínimo de 8 caracteres"
              required
              minLength={8}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="auth-submit" disabled={loading}>
            {loading ? "Criando conta..." : "Criar minha conta"}
            <ArrowRight size={17} />
          </button>
          <p className="terms-copy">
            Ao continuar, você concorda com os termos de uso da Lumina.
          </p>
        </form>
      </div>
    </main>
  );
}
