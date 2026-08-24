"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  BookOpen,
  ChevronDown,
  Clock3,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  Library,
  ListFilter,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Users,
} from "lucide-react";

type Course = {
  title: string;
  teacher: string;
  category: string;
  level: string;
  duration: string;
  lessons: number;
  progress: number;
  color: string;
  badge?: string;
};

type StudentStats = { enrolled: number; inProgress: number; completed: number; certificates: number; overallProgress: number; learnedMinutes: number };

const courses: Course[] = [
  { title: "Excel para análise de dados", teacher: "Marina Costa", category: "Dados", level: "Intermediário", duration: "18h", lessons: 42, progress: 72, color: "coral", badge: "Em alta" },
  { title: "Fundamentos de UX Research", teacher: "Rafael Moura", category: "Design", level: "Iniciante", duration: "12h", lessons: 28, progress: 38, color: "mint" },
  { title: "Liderança que desenvolve", teacher: "Camila Nunes", category: "Negócios", level: "Avançado", duration: "9h", lessons: 19, progress: 0, color: "yellow", badge: "Novo" },
  { title: "Python na prática", teacher: "André Lima", category: "Tecnologia", level: "Intermediário", duration: "24h", lessons: 56, progress: 0, color: "blue" },
];

const navItems = [
  { label: "Visão geral", icon: LayoutDashboard },
  { label: "Meu aprendizado", icon: Library },
  { label: "Explorar cursos", icon: BookOpen },
  { label: "Certificados", icon: FileCheck2 },
];

export default function Home() {
  const [activeNav, setActiveNav] = useState("Visão geral");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [role, setRole] = useState<"Aluno" | "Professor">("Aluno");
  const [showAll, setShowAll] = useState(false);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [studentCourses, setStudentCourses] = useState<{ title: string; progress: number; lastLesson: { title: string } | null; durationMinutes: number }[]>([]);

  useEffect(() => {
    void fetch("/api/dashboard/student").then(async (response) => response.ok ? response.json() : null).then((result) => {
      if (result?.data) { setStudentStats(result.data.stats); setStudentCourses(result.data.courses); }
    });
  }, []);

  const filteredCourses = useMemo(() => courses.filter((course) => {
    const matchesSearch = `${course.title} ${course.teacher}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (category === "Todos" || course.category === category);
  }), [category, search]);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Sparkles size={17} /></span> lumina<span className="brand-dot">.</span></div>
        <div className="workspace-label">ESPAÇO DE TRABALHO</div>
        <div className="role-switcher">
          <div className="avatar avatar-small">MC</div>
          <div><strong>{role === "Aluno" ? "Marina Costa" : "Área do professor"}</strong><span>{role}</span></div>
          <ChevronDown size={15} />
        </div>
        <nav className="main-nav">
          {navItems.map(({ label, icon: Icon }) => <button key={label} className={activeNav === label ? "nav-item active" : "nav-item"} onClick={() => setActiveNav(label)}><Icon size={18} />{label}</button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-label">ACESSO RÁPIDO</div>
          <button className="nav-item"><Settings2 size={18} />Configurações</button>
          <button className="nav-item"><Bell size={18} />Notificações <span className="notification-count">3</span></button>
          <div className="sidebar-note"><div className="note-icon"><GraduationCap size={17} /></div><strong>Aprender muda tudo.</strong><span>Continue construindo seu próximo capítulo.</span></div>
          <div className="profile-row"><div className="avatar">MC</div><div><strong>Marina Costa</strong><span>Plano Pro</span></div><MoreHorizontal size={17} /></div>
        </div>
      </aside>

      <section className="content">
        <header className="topbar"><div className="breadcrumb"><span>Meu espaço</span><ArrowRight size={14} /><strong>{activeNav}</strong></div><div className="top-actions"><button className="icon-button" aria-label="Notificações"><Bell size={19} /><i /></button><button className="profile-button"><span className="avatar avatar-tiny">MC</span><ChevronDown size={15} /></button></div></header>

        <div className="page-body">
          <div className="welcome-row"><div><p className="eyebrow">SEGUNDA-FEIRA, 24 DE AGOSTO</p><h1>Bom dia, Marina <span>✦</span></h1><p className="subtitle">Um pouco de consistência todos os dias leva você mais longe.</p></div><button className="outline-button" onClick={() => setRole(role === "Aluno" ? "Professor" : "Aluno")}><Users size={16} />Ver como {role === "Aluno" ? "professor" : "aluno"}</button></div>

          {role === "Aluno" ? <>
            <div className="stats-grid"><Stat label="Cursos matriculados" value={studentStats ? String(studentStats.enrolled).padStart(2, "0") : "04"} detail={studentStats ? `${studentStats.inProgress} em andamento` : "2 em andamento"} icon={<BookOpen />} tone="coral" /><Stat label="Progresso geral" value={`${studentStats?.overallProgress ?? 56}%`} detail={studentStats ? "Atualizado agora" : "+8% esta semana"} icon={<Sparkles />} tone="mint" /><Stat label="Horas aprendidas" value={studentStats ? `${Math.floor(studentStats.learnedMinutes / 60)}h ${studentStats.learnedMinutes % 60}m` : "38h 20"} detail="Tempo acumulado" icon={<Clock3 />} tone="yellow" /><Stat label="Certificados" value={studentStats ? String(studentStats.certificates).padStart(2, "0") : "02"} detail={studentStats ? `${studentStats.completed} cursos concluídos` : "1 disponível"} icon={<FileCheck2 />} tone="blue" /></div>
            <section className="continue-section"><div className="section-heading"><div><p className="eyebrow">RETOMAR DE ONDE PAROU</p><h2>Seu próximo passo</h2></div><button className="text-button">Abrir curso <ArrowRight size={16} /></button></div><div className="continue-card"><div className="course-art art-coral"><span className="art-label">DATA<br />DRIVEN</span><div className="art-grid" /></div><div className="continue-info"><div className="course-meta"><span className="pill coral-pill">Dados</span><span>•</span><span>Intermediário</span></div><h3>{studentCourses[0]?.title || "Excel para análise de dados"}</h3><p>Você está {studentCourses[0]?.lastLesson ? <>na aula: <strong>{studentCourses[0].lastLesson.title}</strong></> : <>pronto para começar este curso</>}</p><div className="progress-line"><span style={{ width: `${studentCourses[0]?.progress || 72}%` }} /></div><div className="progress-caption"><span>{studentCourses[0]?.progress || 72}% concluído</span><span>{studentCourses[0] ? `${Math.max(0, Math.round((studentCourses[0].durationMinutes * (100 - studentCourses[0].progress)) / 100 / 60))}h restantes` : "11h 40 restantes"}</span></div></div><button className="play-button" aria-label="Continuar curso"><Play size={19} fill="currentColor" /></button></div></section>
          </> : <TeacherSummary />}

          <section className="catalog-section"><div className="section-heading"><div><p className="eyebrow">PARA VOCÊ</p><h2>Explore novos caminhos</h2></div><button className="text-button" onClick={() => setShowAll(!showAll)}>{showAll ? "Ver menos" : "Ver catálogo completo"} <ArrowRight size={16} /></button></div><div className="catalog-toolbar"><div className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cursos ou professores" /></div><div className="filter-buttons">{["Todos", "Dados", "Design", "Negócios", "Tecnologia"].map((item) => <button key={item} className={category === item ? "filter active" : "filter"} onClick={() => setCategory(item)}>{item}</button>)}<button className="filter-icon" aria-label="Mais filtros"><ListFilter size={16} /></button></div></div><div className="course-grid">{filteredCourses.slice(0, showAll ? courses.length : 3).map((course) => <CourseCard key={course.title} course={course} />)}</div>{filteredCourses.length === 0 && <div className="empty-state">Nenhum curso encontrado. Tente outro termo ou categoria.</div>}</section>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value, detail, icon, tone }: { label: string; value: string; detail: string; icon: React.ReactNode; tone: string }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-detail">{detail}</span></div>;
}

function CourseCard({ course }: { course: Course }) {
  return <a className="course-card" href="/cursos/excel-para-analise-de-dados"><div className={`course-art art-${course.color}`}><span className="art-label">{course.category.toUpperCase()}<br /><b>LAB</b></span><span className="card-badge">{course.badge || "Curso"}</span><div className="art-orbit" /></div><div className="course-card-body"><div className="course-meta"><span className="pill">{course.category}</span><span>{course.level}</span></div><h3>{course.title}</h3><p className="teacher">Com {course.teacher}</p><div className="card-footer"><span><Clock3 size={14} />{course.duration}</span><span><BookOpen size={14} />{course.lessons} aulas</span><span className="card-arrow" aria-hidden="true"><ArrowRight size={17} /></span></div></div></a>;
}

function TeacherSummary() {
  return <section className="teacher-summary"><div className="teacher-hero"><div><p className="eyebrow">PAINEL DO PROFESSOR</p><h2>Seu impacto está crescendo.</h2><p>Acompanhe o que está acontecendo nos seus cursos esta semana.</p></div><button className="primary-button"><Plus size={17} />Criar novo curso</button></div><div className="teacher-metrics"><div><span>Cursos publicados</span><strong>08</strong><small>+2 este mês</small></div><div><span>Alunos ativos</span><strong>1.248</strong><small>+12,4%</small></div><div><span>Conclusões</span><strong>384</strong><small>este semestre</small></div><div><span>Nota média</span><strong>4,9</strong><small>de 5,0</small></div></div><div className="mini-chart"><div><span>Alunos por curso</span><strong>1.248 <small>+12,4%</small></strong></div><div className="bars">{[38, 54, 43, 69, 58, 82, 74, 94, 78, 100, 88, 96].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div></div></section>;
}
