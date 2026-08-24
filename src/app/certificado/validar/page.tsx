"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Search, Sparkles } from "lucide-react";

type Certificate = { certificateNumber: string; verificationCode: string; issuedAt: string; student: { name: string }; course: { title: string; durationMinutes: number; teacher: { name: string } } };

export default function ValidateCertificatePage() {
  const [code, setCode] = useState("");
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError(""); setCertificate(null);
    const response = await fetch(`/api/certificates/verify/${encodeURIComponent(code.trim())}`);
    const result = await response.json();
    if (!response.ok) setError(result.error || "Certificado não encontrado."); else setCertificate(result.data);
    setLoading(false);
  }

  return <main className="verify-page"><header className="verify-header"><Link className="brand" href="/"><span className="brand-mark"><Sparkles size={17} /></span> lumina<span className="brand-dot">.</span></Link><Link className="back-link" href="/"><ArrowLeft size={15} /> Voltar para a plataforma</Link></header><section className="verify-content"><div className="verify-heading"><span className="verify-seal"><BadgeCheck size={23} /></span><p className="eyebrow">VALIDAÇÃO PÚBLICA</p><h1>Verifique um certificado.</h1><p>Confirme a autenticidade de uma certificação emitida pela Lumina.</p></div><form className="verify-form" onSubmit={handleSubmit}><label>Código de verificação<input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Ex: CERT-2026-000001" required /></label><button className="auth-submit" disabled={loading || !code.trim()}>{loading ? "Verificando..." : "Verificar certificado"}<Search size={17} /></button></form>{error && <div className="verify-error">{error}</div>}{certificate && <div className="certificate-result"><div className="valid-label"><BadgeCheck size={19} /> CERTIFICADO VÁLIDO</div><h2>{certificate.course.title}</h2><div className="certificate-details"><div><span>Aluno</span><strong>{certificate.student.name}</strong></div><div><span>Professor</span><strong>{certificate.course.teacher.name}</strong></div><div><span>Carga horária</span><strong>{Math.round(certificate.course.durationMinutes / 60)} horas</strong></div><div><span>Emitido em</span><strong>{new Date(certificate.issuedAt).toLocaleDateString("pt-BR")}</strong></div></div><p className="certificate-code">Código: {certificate.certificateNumber}</p></div>}</section></main>;
}
