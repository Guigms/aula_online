"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Download,
  FileText,
  Menu,
  Play,
  Sparkles,
  X,
} from "lucide-react";

type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  teacher: { name: string };
  modules: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      type: string;
      durationSeconds: number | null;
    }[];
  }[];
};

export default function CoursePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [completed, setCompleted] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenu, setOpenMenu] = useState(false);
  const [enrollmentState, setEnrollmentState] = useState<
    "unknown" | "enrolled" | "available"
  >("unknown");
  const [enrollmentMessage, setEnrollmentMessage] = useState("");
  const lessons = course?.modules.flatMap((module) => module.lessons) || [];
  const currentLesson = lessons[0];
  const doneCount = completed.filter(Boolean).length;

  useEffect(() => {
    void fetch(`/api/courses/${params.slug}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          setError(result.error || "Curso não encontrado.");
          setLoading(false);
          return;
        }
        setCourse(result.data);
        setCompleted(
          result.data.modules.flatMap((module: Course["modules"][number]) =>
            module.lessons.map(() => false),
          ),
        );
        setLoading(false);
        void fetch("/api/enrollments").then(async (enrollmentResponse) => {
          if (!enrollmentResponse.ok) {
            setEnrollmentState("available");
            return;
          }
          const enrollmentResult = await enrollmentResponse.json();
          setEnrollmentState(
            enrollmentResult.data.some(
              (item: { courseId: string }) => item.courseId === result.data.id,
            )
              ? "enrolled"
              : "available",
          );
        });
      })
      .catch(() => {
        setError("Não foi possível carregar o curso.");
        setLoading(false);
      });
  }, [params.slug]);

  function markComplete() {
    if (!course || !currentLesson) return;
    void fetch(`/api/lessons/${currentLesson.id}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });
    setCompleted((items) =>
      items.map((item, index) => (index === 0 ? true : item)),
    );
  }

  async function enroll() {
    if (!course) return;
    const response = await fetch(`/api/courses/${course.id}/enroll`, {
      method: "POST",
    });
    if (response.status === 401) {
      router.push(`/login?next=/cursos/${course.slug}`);
      return;
    }
    const result = await response.json();
    if (!response.ok) {
      setEnrollmentMessage(
        result.error || "Não foi possível realizar a matrícula.",
      );
      return;
    }
    setEnrollmentState("enrolled");
    setEnrollmentMessage(
      "Matrícula realizada. Seu progresso será salvo automaticamente.",
    );
  }

  if (loading)
    return (
      <main className="learning-page">
        <div className="loading-screen">Carregando curso...</div>
      </main>
    );
  if (error || !course || !currentLesson)
    return (
      <main className="learning-page">
        <div className="loading-screen">
          {error || "Este curso ainda não possui aulas."}
        </div>
      </main>
    );

  return (
    <main className="learning-page">
      <header className="learning-header">
        <a className="brand" href="/">
          <span className="brand-mark">
            <Sparkles size={17} />
          </span>{" "}
          lumina<span className="brand-dot">.</span>
        </a>
        <div className="learning-breadcrumb">
          <a href="/">Meu aprendizado</a>
          <ArrowRight size={14} />
          <strong>{course.title}</strong>
        </div>
        <button
          className="learning-menu"
          onClick={() => setOpenMenu(!openMenu)}
          aria-label="Abrir conteúdo"
        >
          <Menu size={20} />
        </button>
      </header>
      <div className="learning-layout">
        <section className="lesson-main">
          <a className="back-link" href="/">
            <ArrowLeft size={15} /> Voltar para meus cursos
          </a>
          <div className="video-stage">
            <div className="video-copy">
              <span className="video-kicker">
                AULA 01 · {course.teacher.name.toUpperCase()}
              </span>
              <h1>{currentLesson.title}</h1>
              <p>
                Decisões mais inteligentes começam com uma base bem organizada.
              </p>
            </div>
            <button className="video-play" aria-label="Reproduzir aula">
              <Play fill="currentColor" size={23} />
            </button>
            <div className="video-time">08:42 / 14:30</div>
            <div className="video-controls">
              <span style={{ width: "61%" }} />
            </div>
          </div>
          <div className="lesson-heading">
            <div>
              <span className="lesson-type">AULA EM VÍDEO</span>
              <h2>{currentLesson.title}</h2>
              <p>{course.description}</p>
            </div>
            <div className="lesson-actions">
              {enrollmentState === "available" && (
                <button className="enroll-button" onClick={enroll}>
                  Matricular-se <ArrowRight size={15} />
                </button>
              )}
              {enrollmentState === "enrolled" && (
                <button
                  className={
                    completed[0] ? "complete-button done" : "complete-button"
                  }
                  onClick={markComplete}
                >
                  {completed[0] ? <Check size={16} /> : null}
                  {completed[0] ? "Aula concluída" : "Marcar como concluída"}
                </button>
              )}
            </div>
          </div>
          {enrollmentMessage && (
            <p className="enrollment-message">{enrollmentMessage}</p>
          )}
          <div className="lesson-tabs">
            <button className="tab-active">Sobre esta aula</button>
            <button>Materiais</button>
            <button>Anotações</button>
          </div>
          <div className="lesson-content">
            <p>
              Nesta aula, vamos transformar uma planilha dispersa em uma
              estrutura pronta para análise. Você vai entender quais colunas
              importam, como padronizar informações e onde evitar retrabalho.
            </p>
            <div className="material-row">
              <div className="material-icon">
                <FileText size={19} />
              </div>
              <div>
                <strong>Materiais do curso</strong>
                <span>Arquivos disponibilizados pelo professor</span>
              </div>
              <button aria-label="Baixar material">
                <Download size={17} />
              </button>
            </div>
          </div>
        </section>
        <aside className={openMenu ? "course-outline open" : "course-outline"}>
          <div className="outline-top">
            <div>
              <span className="eyebrow">SEU PROGRESSO</span>
              <strong>{Math.round((doneCount / lessons.length) * 100)}%</strong>
            </div>
            <button
              onClick={() => setOpenMenu(false)}
              className="close-outline"
              aria-label="Fechar conteúdo"
            >
              <X size={18} />
            </button>
          </div>
          <div className="outline-progress">
            <span style={{ width: `${(doneCount / lessons.length) * 100}%` }} />
          </div>
          <div className="outline-title">
            <div>
              <span className="eyebrow">CONTEÚDO DO CURSO</span>
              <h2>{course.title}</h2>
            </div>
            <BookOpen size={19} />
          </div>
          <div className="module-heading">
            <span>CONTEÚDO DO CURSO</span>
            <ChevronDown size={15} />
          </div>
          <div className="lesson-list">
            {course.modules
              .flatMap((module) => module.lessons)
              .map((lesson, index) => (
                <button
                  key={lesson.id}
                  className={
                    index === 2 ? "outline-lesson current" : "outline-lesson"
                  }
                  onClick={() => index === 2 && setOpenMenu(false)}
                >
                  <span
                    className={
                      completed[index]
                        ? "lesson-status checked"
                        : "lesson-status"
                    }
                  >
                    {completed[index] ? (
                      <Check size={12} />
                    ) : index === 2 ? (
                      <Play size={10} fill="currentColor" />
                    ) : null}
                  </span>
                  <span>
                    <strong>{lesson.title}</strong>
                    <small>
                      {lesson.durationSeconds
                        ? `${Math.ceil(lesson.durationSeconds / 60)} min`
                        : "Aula"}
                    </small>
                  </span>
                </button>
              ))}
          </div>
          <div className="outline-footer">
            <span>Próxima aula</span>
            <button aria-label="Próxima aula">
              <ArrowRight size={17} />
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
