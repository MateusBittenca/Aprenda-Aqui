import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, ChevronRight, Loader2, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError, apiFetch } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import type { TrackDetail } from '../../types/catalog';
import { PageLoader } from '../../components/ui/PageLoader';
import { ErrorState } from '../../components/ui/ErrorState';

// ─── Field helpers ────────────────────────────────────────────────────────────

const field = 'mt-1 w-full rounded-xl border border-white/[0.08] bg-[#0b0f19] px-3 py-2.5 text-white outline-none ring-amber-500/40 focus:ring-2 placeholder:text-slate-600';
const fieldMono = `${field} font-mono text-sm`;
const label = 'block text-sm font-medium text-slate-400';

// ─── Main page ────────────────────────────────────────────────────────────────

export function AdminTrackContentPage() {
  const { trackId } = useParams<{ trackId: string }>();
  const queryClient = useQueryClient();

  const invalidateTrack = () => {
    queryClient.invalidateQueries({ queryKey: ['track', trackId, 'admin'] });
    queryClient.invalidateQueries({ queryKey: ['tracks'] });
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['track', trackId, 'admin'],
    queryFn: () => apiFetch<TrackDetail>(`/tracks/${trackId}`),
    enabled: !!trackId,
  });

  if (!trackId) return null;
  if (isLoading) return <PageLoader label="Carregando trilha…" />;
  if (isError) return <ErrorState title="Não foi possível carregar a trilha." error={error} />;
  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Breadcrumb + título */}
      <div className="border-b border-white/[0.06] pb-6">
        <Link to="/admin/tracks" className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:underline">
          ← Catálogo
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">{data.title}</h1>
        {data.tagline && <p className="mt-1 text-slate-400">{data.tagline}</p>}
      </div>

      {/* Editar trilha */}
      <Card title="Editar trilha" icon={<Save className="h-4 w-4" />}>
        <TrackEditForm key={data.id} trackId={data.slug} initial={{ title: data.title, tagline: data.tagline, description: data.description }} />
      </Card>

      {/* Criar curso */}
      <Card title="Novo curso nesta trilha" icon={<Plus className="h-4 w-4" />} accent>
        <p className="mb-4 text-xs text-slate-500">
          Slug em minúsculas e hífens (ex.: <code className="text-slate-300">react-avancado</code>). Cursos gratuitos matriculam todos os alunos automaticamente.
        </p>
        <CreateCourseForm dbTrackId={data.id} onCreated={invalidateTrack} />
      </Card>

      {/* Lista de cursos */}
      {data.courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center text-sm text-slate-500">
          Nenhum curso criado ainda. Use o formulário acima para adicionar o primeiro.
        </div>
      ) : (
        data.courses.map((course) => (
          <section key={course.id} className="rounded-2xl border border-white/[0.06] bg-[#0f1419] p-5 sm:p-6 space-y-6">
            {/* Cabeçalho do curso */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Curso</p>
                <h2 className="mt-1 text-xl font-bold text-white">{course.title}</h2>
                {course.description && <p className="mt-1 text-sm text-slate-400">{course.description}</p>}
              </div>
              <span className="shrink-0 rounded-lg border border-white/[0.06] bg-[#0b0f19] px-2.5 py-1 text-xs font-semibold text-slate-400">
                {course.modules.length} módulo{course.modules.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Editar curso */}
            <details className="group rounded-xl border border-white/[0.05] bg-[#0b0f19]">
              <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-slate-400 group-open:text-white">
                ✏️ Editar metadados do curso
              </summary>
              <div className="border-t border-white/[0.06] px-4 py-4">
                <CourseEditForm key={course.id} courseId={course.id} initial={{ title: course.title, description: course.description }} />
              </div>
            </details>

            {/* Módulos */}
            {course.modules.map((mod) => (
              <div key={mod.id} className="rounded-xl border border-white/[0.05] bg-[#0b0f19]">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05]">
                  <BookOpen className="h-3.5 w-3.5 text-amber-400/70" aria-hidden />
                  <h3 className="text-sm font-bold text-slate-200">{mod.title}</h3>
                  <span className="ml-auto text-xs text-slate-500">{mod.lessons.length} aula{mod.lessons.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Aulas do módulo */}
                {mod.lessons.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-slate-500">Nenhuma aula neste módulo.</p>
                ) : (
                  <ul className="divide-y divide-white/[0.04]">
                    {mod.lessons.map((lesson) => (
                      <li key={lesson.id}>
                        <Link
                          to={`/admin/lessons/${lesson.id}/edit`}
                          className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.03] hover:text-white"
                        >
                          <span className="truncate">{lesson.title}</span>
                          <span className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
                            <span>{lesson._count.exercises} ex.</span>
                            <span>{lesson.estimatedMinutes} min</span>
                            <ChevronRight className="h-4 w-4 text-slate-600" aria-hidden />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Criar aula */}
                <div className="border-t border-white/[0.05] px-4 py-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Nova aula neste módulo</p>
                  <CreateLessonForm moduleId={mod.id} onCreated={invalidateTrack} />
                </div>
              </div>
            ))}

            {/* Criar módulo */}
            <div className="rounded-xl border border-dashed border-white/[0.08] px-4 py-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Novo módulo neste curso</p>
              <CreateModuleForm courseId={course.id} onCreated={invalidateTrack} />
            </div>
          </section>
        ))
      )}
    </div>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function Card({ title, icon, children, accent }: { title: string; icon?: React.ReactNode; children: React.ReactNode; accent?: boolean }) {
  return (
    <section className={`rounded-2xl p-5 sm:p-6 ${accent ? 'border border-dashed border-amber-500/25 bg-amber-500/[0.03]' : 'border border-white/[0.06] bg-[#0f1419]'}`}>
      <div className="mb-4 flex items-center gap-2 text-amber-400/80">
        {icon}
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">{title}</h2>
      </div>
      {children}
    </section>
  );
}

// ─── TrackEditForm ────────────────────────────────────────────────────────────

function TrackEditForm({ trackId, initial }: {
  trackId: string;
  initial: { title: string; tagline: string | null; description: string | null };
}) {
  const token = useAuthStore((s) => s.token);
  const [title, setTitle] = useState(initial.title);
  const [tagline, setTagline] = useState(initial.tagline ?? '');
  const [description, setDescription] = useState(initial.description ?? '');

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch(`/admin/tracks/${trackId}`, {
        method: 'PATCH',
        token: token!,
        body: JSON.stringify({ title, tagline: tagline || null, description: description || null }),
      }),
    onSuccess: () => toast.success('Trilha salva'),
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : 'Erro ao salvar'),
  });

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
      <div className="sm:col-span-2">
        <label className={label}>Título *<input required value={title} onChange={(e) => setTitle(e.target.value)} className={field} /></label>
      </div>
      <div>
        <label className={label}>Tagline<input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Uma linha de destaque" className={field} /></label>
      </div>
      <div>
        <label className={label}>Descrição<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={field} /></label>
      </div>
      <div className="sm:col-span-2">
        <SaveButton pending={mutation.isPending} label="Salvar trilha" />
      </div>
    </form>
  );
}

// ─── CourseEditForm ───────────────────────────────────────────────────────────

function CourseEditForm({ courseId, initial }: {
  courseId: string;
  initial: { title: string; description: string | null };
}) {
  const token = useAuthStore((s) => s.token);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description ?? '');

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch(`/admin/courses/${courseId}`, {
        method: 'PATCH',
        token: token!,
        body: JSON.stringify({ title, description: description || null }),
      }),
    onSuccess: () => toast.success('Curso salvo'),
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : 'Erro ao salvar'),
  });

  return (
    <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
      <label className={label}>Título *<input required value={title} onChange={(e) => setTitle(e.target.value)} className={field} /></label>
      <label className={label}>Descrição<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={field} /></label>
      <SaveButton pending={mutation.isPending} label="Salvar curso" />
    </form>
  );
}

// ─── CreateCourseForm ─────────────────────────────────────────────────────────

function CreateCourseForm({ dbTrackId, onCreated }: { dbTrackId: string; onCreated: () => void }) {
  const token = useAuthStore((s) => s.token);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isFree, setIsFree] = useState(true);

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch('/admin/courses', {
        method: 'POST',
        token: token!,
        body: JSON.stringify({ trackId: dbTrackId, slug: slug.trim(), title: title.trim(), description: description.trim() || null, isFree }),
      }),
    onSuccess: () => {
      toast.success('Curso criado');
      setTitle(''); setSlug(''); setDescription(''); setIsFree(true);
      onCreated();
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : 'Erro ao criar curso'),
  });

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
      <div className="sm:col-span-2">
        <label className={label}>Título *<input required value={title} onChange={(e) => { setTitle(e.target.value); if (!slug) setSlug(slugify(e.target.value)); }} className={field} /></label>
      </div>
      <div>
        <label className={label}>Slug (URL) *<input required value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="ex.: react-avancado" className={fieldMono} /></label>
      </div>
      <div className="flex items-center gap-2 sm:pt-6">
        <input type="checkbox" id="isFree" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="h-4 w-4 rounded border-slate-600 accent-amber-500" />
        <label htmlFor="isFree" className="text-sm text-slate-400">Gratuito (matrícula automática)</label>
      </div>
      <div className="sm:col-span-2">
        <label className={label}>Descrição<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={field} /></label>
      </div>
      <div className="sm:col-span-2">
        <CreateButton pending={mutation.isPending} label="Criar curso" />
      </div>
    </form>
  );
}

// ─── CreateModuleForm ─────────────────────────────────────────────────────────

function CreateModuleForm({ courseId, onCreated }: { courseId: string; onCreated: () => void }) {
  const token = useAuthStore((s) => s.token);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch('/admin/modules', {
        method: 'POST',
        token: token!,
        body: JSON.stringify({ courseId, slug: slug.trim(), title: title.trim() }),
      }),
    onSuccess: () => {
      toast.success('Módulo criado');
      setTitle(''); setSlug('');
      onCreated();
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : 'Erro ao criar módulo'),
  });

  return (
    <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
      <label className={`${label} min-w-[160px] flex-1`}>
        Título *<input required value={title} onChange={(e) => { setTitle(e.target.value); if (!slug) setSlug(slugify(e.target.value)); }} className={field} />
      </label>
      <label className={`${label} min-w-[130px] flex-1`}>
        Slug *<input required value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="ex.: intro" className={fieldMono} />
      </label>
      <button type="submit" disabled={mutation.isPending} className="mb-0.5 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.10] disabled:opacity-50">
        {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Adicionar
      </button>
    </form>
  );
}

// ─── CreateLessonForm ─────────────────────────────────────────────────────────

function CreateLessonForm({ moduleId, onCreated }: { moduleId: string; onCreated: () => void }) {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(3);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch<{ id: string }>('/admin/lessons', {
        method: 'POST',
        token: token!,
        body: JSON.stringify({ moduleId, slug: slug.trim(), title: title.trim(), estimatedMinutes }),
      }),
    onSuccess: (lesson) => {
      toast.success('Aula criada — abrindo editor…');
      setTitle(''); setSlug(''); setEstimatedMinutes(3); setOpen(false);
      onCreated();
      navigate(`/admin/lessons/${lesson.id}/edit`);
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : 'Erro ao criar aula'),
  });

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-dashed border-white/[0.10] px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-amber-500/40 hover:text-amber-300"
      >
        <Plus className="h-3.5 w-3.5" />
        Adicionar aula
      </button>
    );
  }

  return (
    <form ref={formRef} className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
      <label className={`${label} min-w-[160px] flex-1`}>
        Título *<input required autoFocus value={title} onChange={(e) => { setTitle(e.target.value); if (!slug) setSlug(slugify(e.target.value)); }} className={field} />
      </label>
      <label className={`${label} min-w-[130px] flex-1`}>
        Slug *<input required value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="ex.: introducao" className={fieldMono} />
      </label>
      <label className={`${label} w-28`}>
        Duração (min)<input type="number" min={1} value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(Number(e.target.value))} className={field} />
      </label>
      <div className="flex gap-2 mb-0.5">
        <button type="submit" disabled={mutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:opacity-50">
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar e editar'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-white/[0.08] px-3 py-2.5 text-sm text-slate-400 hover:text-white">
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ─── Shared button helpers ────────────────────────────────────────────────────

function SaveButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-[#1e2530] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-[#252d3a] disabled:opacity-50 border border-white/[0.06]">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-amber-400" />}
      {pending ? 'Salvando…' : label}
    </button>
  );
}

function CreateButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-900/25 transition hover:bg-amber-500 disabled:opacity-50">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      {pending ? 'Criando…' : label}
    </button>
  );
}

// ─── Util ─────────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
