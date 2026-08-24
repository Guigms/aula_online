"use client";
/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @next/next/no-img-element */

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, BadgeCheck, BookOpen, CalendarDays, Mail, Save, ShieldCheck, Sparkles } from "lucide-react";

type Profile = { id: string; name: string; email: string; role: "TEACHER" | "ADMIN"; bio: string | null; avatarUrl: string | null; createdAt: string; courseCount: number };

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [message, setMessage] = useState("Carregando perfil...");
  const [saving, setSaving] = useState(false);

  useEffect(() => { void fetch("/api/teacher/profile").then(async (response) => { const result = await response.json(); if (!response.ok) { setMessage(result.error || "Não foi possível carregar o perfil."); return; } setProfile(result.data); setName(result.data.name); setBio(result.data.bio || ""); setAvatarUrl(result.data.avatarUrl || ""); setMessage(""); }); }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    const response = await fetch("/api/teacher/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, bio, avatarUrl }) });
    const result = await response.json();
    setMessage(response.ok ? "Perfil atualizado com sucesso." : result.error || "Não foi possível salvar o perfil.");
    if (response.ok) setProfile((current) => current ? { ...current, ...result.data } : current);
    setSaving(false);
  }

  if (!profile) return <main className="teacher-page"><div className="loading-screen">{message}</div></main>;
  return <main className="teacher-page"><header className="teacher-header"><a className="brand" href="/"><span className="brand-mark"><Sparkles size={17} /></span> lumina<span className="brand-dot">.</span></a><div><span className="eyebrow">ÁREA DO PROFESSOR</span><h1>Perfil profissional</h1></div><a className="teacher-back" href="/professor/cursos"><ArrowLeft size={15} /> Meus cursos</a></header><section className="profile-page-body"><div className="profile-hero"><div className="profile-avatar">{profile.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : profile.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><div><p className="eyebrow">IDENTIDADE VERIFICADA</p><h2>{profile.name}</h2><p>{profile.bio || "Adicione uma biografia profissional para apresentar sua experiência."}</p></div><span className="verified-badge"><BadgeCheck size={15} /> Professor</span></div><div className="profile-grid"><form className="profile-form" onSubmit={saveProfile}><div className="profile-section-title"><div><p className="eyebrow">SUA PRESENÇA</p><h2>Informações profissionais</h2></div><Save size={18} /></div><label>Nome de exibição<input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={80} /></label><label>Biografia<textarea value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Conte aos alunos sobre sua experiência..." maxLength={2000} /></label><label>URL da foto de perfil<input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} type="url" placeholder="https://..." /></label>{message && <p className="success-message">{message}</p>}<button className="teacher-submit" disabled={saving}>{saving ? "Salvando..." : "Salvar alterações"}<Save size={15} /></button></form><aside className="profile-security"><div className="profile-section-title"><div><p className="eyebrow">CONTROLE DE ACESSO</p><h2>Dados da conta</h2></div><ShieldCheck size={19} /></div><div className="account-detail"><Mail size={16} /><span><small>E-mail de acesso</small><strong>{profile.email}</strong></span></div><div className="account-detail"><ShieldCheck size={16} /><span><small>Nível de acesso</small><strong>{profile.role === "ADMIN" ? "Administrador" : "Professor"}</strong></span></div><div className="account-detail"><CalendarDays size={16} /><span><small>Membro desde</small><strong>{new Date(profile.createdAt).toLocaleDateString("pt-BR")}</strong></span></div><div className="account-detail"><BookOpen size={16} /><span><small>Cursos criados</small><strong>{profile.courseCount}</strong></span></div><div className="security-note"><ShieldCheck size={16} /><span>Seu e-mail e nível de acesso não podem ser alterados por esta tela.</span></div></aside></div></section></main>;
}
