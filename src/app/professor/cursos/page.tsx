"use client";
/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable react-hooks/set-state-in-effect */

import { FormEvent, useEffect, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock3,
  FilePlus2,
  Layers3,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";

type Module = {
  id: string;
  title: string;
  position: number;
  _count: { lessons: number };
};
type Course = {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  durationMinutes: number;
  _count: { enrollments: number; modules: number };
  modules: Module[];
};

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("Carregando seus cursos...");
  const [moduleCourseId, setModuleCourseId] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [lessonModuleId, setLessonModuleId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [materialCourseId, setMaterialCourseId] = useState<string | null>(null);
  const [materialMessage, setMaterialMessage] = useState("");

  async function loadCourses() {
    const response = await fetch("/api/teacher/courses");
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Não foi possível carregar seus cursos.");
      return;
    }
    setCourses(result.data);
    setMessage(result.data.length ? "" : "Você ainda não criou nenhum curso.");
  }
  useEffect(() => {
    void loadCourses();
  }, []);

  async function createCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title"));
    const response = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug: title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
        description: String(form.get("description")),
        category: String(form.get("category")),
        level: String(form.get("level")),
        durationMinutes: Number(form.get("durationMinutes")),
      }),
    });
    if (!response.ok) {
      const result = await response.json();
      setMessage(result.error || "Não foi possível criar o curso.");
      return;
    }
    setShowForm(false);
    await loadCourses();
  }

  async function createModule(event: FormEvent<HTMLFormElement>, courseId: string) {
    event.preventDefault();
    const response = await fetch(`/api/courses/${courseId}/modules`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: moduleTitle }) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error || "Não foi possível criar o módulo."); return; }
    setModuleTitle(""); setModuleCourseId(null); setSelected(courseId); await loadCourses();
  }

  async function createLesson(event: FormEvent<HTMLFormElement>, moduleId: string, courseId: string) {
    event.preventDefault();
    const response = await fetch(`/api/modules/${moduleId}/lessons`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: lessonTitle, type: "TEXT" }) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error || "Não foi possível criar a aula."); return; }
    setLessonTitle(""); setLessonModuleId(null); setSelected(courseId); await loadCourses();
  }

  async function uploadMaterial(event: FormEvent<HTMLFormElement>, courseId: string) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/courses/${courseId}/materials`, { method: "POST", body: formData });
    const result = await response.json();
    if (!response.ok) { setMaterialMessage(result.error || "Não foi possível enviar o material."); return; }
    setMaterialMessage("Material enviado com sucesso."); setMaterialCourseId(null); event.currentTarget.reset();
  }

  async function changeCourseStatus(course: Course) {
    const nextStatus = course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const response = await fetch(`/api/courses/${course.id}/manage`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error || "Não foi possível atualizar o curso."); return; }
    setMessage(nextStatus === "PUBLISHED" ? "Curso publicado com sucesso." : "Curso voltou para rascunho.");
    await loadCourses();
  }

  return (
    <main className="teacher-page">
      <header className="teacher-header">
        <a className="brand" href="/">
          <span className="brand-mark">
            <Sparkles size={17} />
          </span>{" "}
          lumina<span className="brand-dot">.</span>
        </a>
        <div>
          <span className="eyebrow">ÁREA DO PROFESSOR</span>
          <h1>Meus cursos</h1>
        </div>
        <div className="teacher-header-actions"><a className="teacher-profile-link" href="/professor/perfil">Meu perfil</a><button
          className="teacher-create"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={17} /> Criar curso
        </button></div>
      </header>
      <section className="teacher-page-body">
        {showForm && (
          <form className="course-form" onSubmit={createCourse}>
            <div>
              <p className="eyebrow">NOVO CONTEÚDO</p>
              <h2>Comece um novo curso</h2>
            </div>
            <label>
              Título
              <input
                name="title"
                placeholder="Ex: Excel para análise de dados"
                required
                minLength={3}
              />
            </label>
            <label>
              Descrição
              <textarea
                name="description"
                placeholder="O que o aluno vai aprender?"
                required
                minLength={20}
              />
            </label>
            <div className="form-row">
              <label>
                Categoria
                <input name="category" placeholder="Dados" required />
              </label>
              <label>
                Nível
                <select name="level" defaultValue="BEGINNER">
                  <option value="BEGINNER">Iniciante</option>
                  <option value="INTERMEDIATE">Intermediário</option>
                  <option value="ADVANCED">Avançado</option>
                </select>
              </label>
              <label>
                Duração (minutos)
                <input
                  name="durationMinutes"
                  type="number"
                  min="1"
                  defaultValue="60"
                  required
                />
              </label>
            </div>
            <button className="teacher-submit">
              Criar rascunho <FilePlus2 size={16} />
            </button>
          </form>
        )}
        {message && (
          <div className="teacher-empty">
            <Layers3 size={25} />
            <strong>{message}</strong>
            {!courses.length && (
              <span>
                Crie seu primeiro curso para começar a adicionar módulos e
                aulas.
              </span>
            )}
          </div>
        )}
        {courses.length > 0 && (
          <div className="teacher-course-list">
            {courses.map((course) => (
              <article className="manage-course" key={course.id}>
                <div className="manage-course-top">
                  <div className="manage-course-icon">
                    <BookOpen size={20} />
                  </div>
                  <div className="manage-course-title">
                    <div>
                      <span
                        className={
                          course.status === "PUBLISHED"
                            ? "status published"
                            : "status"
                        }
                      >
                        {course.status === "PUBLISHED"
                          ? "Publicado"
                          : "Rascunho"}
                      </span>
                      <span className="course-category">{course.category}</span>
                    </div>
                    <h2>{course.title}</h2>
                    <div className="manage-meta">
                      <span>
                        <Users size={14} />
                        {course._count.enrollments} alunos
                      </span>
                      <span>
                        <Layers3 size={14} />
                        {course._count.modules} módulos
                      </span>
                      <span>
                        <Clock3 size={14} />
                        {Math.round(course.durationMinutes / 60)}h
                      </span>
                    </div>
                    <button className="course-status-action" onClick={() => void changeCourseStatus(course)}>{course.status === "PUBLISHED" ? "Despublicar" : "Publicar"}</button>
                  </div>
                  <button
                    className="expand-course"
                    onClick={() =>
                      setSelected(selected === course.id ? null : course.id)
                    }
                    aria-label="Expandir curso"
                  >
                    {selected === course.id ? (
                      <ChevronDown />
                    ) : (
                      <ChevronRight />
                    )}
                  </button>
                </div>
                {selected === course.id && (
                  <div className="module-editor">
                    <div className="module-editor-heading">
                      <strong>Estrutura do curso</strong>
                      <div className="editor-actions"><button type="button" onClick={() => setModuleCourseId(moduleCourseId === course.id ? null : course.id)}>
                        <Plus size={15} /> Adicionar módulo
                      </button><button type="button" onClick={() => setMaterialCourseId(materialCourseId === course.id ? null : course.id)}><Plus size={15} /> Material</button></div>
                    </div>
                    {moduleCourseId === course.id && <form className="module-form" onSubmit={(event) => void createModule(event, course.id)}><input value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} placeholder="Nome do módulo" minLength={2} required /><button type="submit"><Plus size={14} /> Criar</button></form>}
                    {materialCourseId === course.id && <form className="material-form" onSubmit={(event) => void uploadMaterial(event, course.id)}><input name="title" placeholder="Nome do material" required minLength={2} /><label className="material-file-input"><input name="file" type="file" accept=".pdf,.docx,.xlsx,.pptx,.jpg,.jpeg,.png,.zip" required /><span>Selecionar arquivo (até 100 MB)</span></label><button type="submit"><FilePlus2 size={14} /> Enviar</button></form>}
                    {materialMessage && materialCourseId === course.id && <p className="material-message">{materialMessage}</p>}
                    {course.modules.length ? (
                      course.modules.map((module) => (
                        <div key={module.id}>
                        <div className="module-row">
                          <Layers3 size={17} />
                          <span>
                            <strong>
                              {module.position}. {module.title}
                            </strong>
                            <small>{module._count.lessons} aulas</small>
                          </span>
                          <button className="add-lesson-button" type="button" onClick={() => setLessonModuleId(lessonModuleId === module.id ? null : module.id)}><Plus size={14} /> Aula</button>
                        </div>
                        {lessonModuleId === module.id && <form className="lesson-form" onSubmit={(event) => void createLesson(event, module.id, course.id)}><input value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)} placeholder="Título da aula" required minLength={2} /><button type="submit"><Plus size={14} /> Criar</button></form>}
                        </div>
                      ))
                    ) : (
                      <p>Nenhum módulo criado ainda.</p>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
