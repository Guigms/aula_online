"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    if (!response.ok) {
      const result = await response.json();
      setError(result.error || "Não foi possível entrar.");
      setLoading(false);
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(next?.startsWith("/") ? next : "/");
  }

  return (
    <main className="auth-page">
      <div className="auth-visual">
        <a className="brand auth-brand" href="/">
          <span className="brand-mark">
            <Sparkles size={17} />
          </span>{" "}
          lumina<span className="brand-dot">.</span>
        </a>
        <div className="auth-quote">
          <span>“</span>
          <h1>Aprender não é acumular. É se tornar capaz.</h1>
          <p>Conhecimento aplicado cria movimento.</p>
        </div>
        <div className="auth-art">
          <div className="auth-sun" />
          <div className="auth-line line-one" />
          <div className="auth-line line-two" />
          <strong>
            KEEP
            <br />
            GOING
          </strong>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <div className="mobile-brand">
            <a className="brand" href="/">
              <span className="brand-mark">
                <Sparkles size={17} />
              </span>{" "}
              lumina<span className="brand-dot">.</span>
            </a>
          </div>
          <p className="eyebrow">BEM-VINDA DE VOLTA</p>
          <h2>Continue sua jornada.</h2>
          <p className="auth-subtitle">
            Entre para retomar seus cursos e seguir avançando.
          </p>
          <form onSubmit={handleSubmit}>
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
              <div className="password-input">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  aria-label="Mostrar senha"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
            <a className="forgot-link" href="/esqueci-senha">
              Esqueceu sua senha?
            </a>
            {error && <p className="form-error">{error}</p>}
            <button className="auth-submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar na Lumina"}
              <ArrowRight size={17} />
            </button>
          </form>
          <p className="signup-copy">
            Ainda não faz parte? <a href="/cadastro">Criar uma conta</a>
          </p>
          <div className="secure-note">
            <LockKeyhole size={14} /> Seus dados estão protegidos
          </div>
        </div>
      </div>
    </main>
  );
}
