import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, ChevronRight, Loader2, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError, apiFetch, requireToken } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import type { CourseCatalogDetail } from '../../types/catalog';
import { PageLoader } from '../../components/ui/PageLoader';
import { ErrorState } from '../../components/ui/ErrorState';

const field = 'mt-1 w-full rounded-xl border border-white/[0.08] bg-[#0b0f19] px-3 py-2.5 text-white outline-none ring-amber-500/40 focus:ring-2 placeholder:text-slate-600';
const fieldMono = `${field} font-mono text-sm`;
const label = 'block text-sm font-medium text-slate-400';

export function AdminCourseContentPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'course', courseId] });
    queryClient.invalidateQueries({ queryKey: ['catalog', 'courses', 'admin'] });
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'course', courseId],
    queryFn: () => apiFetch<CourseCatalogDetail>(`/catalog/courses/${courseId}`),
    enabled: !!courseId,
  });

  if (!courseId) return null;
  if (isLoading) return <PageLoader label="Carregando curso…" />;
  if (isError) return <ErrorState title="Não foi possível carregar o curso." error={error} />;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div className="border-b border-white/[0.06] pb-6">
        <Link to="/admin/courses" className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:underline">
          ← Catálogo
        </Link>
        <h1 className="font-headline mt-3 text-3xl font-bold tracking-tight text-white">{data.title}</h1>
        {data.tagline && <p className="mt-1 text-slate-400">{data.tagline}</p>}
      </div>

      <Card title="Editar curso" icon={<Save className="h-4 w-4" />}>
        <CourseFullEditForm
          key={data.id}
          courseId={data.id}
          initial={{
            title: data.title,
            tagline: data.tagline,
            description: data.description,
          }}
          onSaved={invalidate}
        />
      </Card>

      <section className="rounded-2xl border border-white/[0.06] bg-[#0f1419] p-5 sm:p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Conteúdo</p>
            <h2 className="font-headline mt-1 text-xl font-bold tracking-tight text-white">Módulos e aulas</h2>
            {data.description && <p className="mt-1 text-sm text-slate-400">{data.description}</p>}
          </div>
          <span className="shrink-0 rounded-lg border border-white/[0.06] bg-[#0b0f19] px-2.5 py-1 text-xs font-semibold text-slate-400">
            {data.modules.length} módulo{data.modules.length !== 1 ? 's' : ''}
          </span>
        </div>

        {data.modules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.08] p-8 text-center text-sm text-slate-500">
            Nenhum módulo ainda. Adicione o primeiro abaixo.
          </div>
        ) : (
          data.modules.map((mod) => (
            <div key={mod.id} className="rounded-xl border border-white/[0.05] bg-[#0b0f19]">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05]">
                <BookOpen className="h-3.5 w-3.5 text-amber-400/70" aria-hidden />
                <h3 className="text-sm font-bold text-slate-200">{mod.title}</h3>
                <span className="ml-auto text-xs text-slate-500">{mod.lessons.length} aula{mod.lessons.length !== 1 ? 's' : ''}</span>
              </div>

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

              <div className="border-t border-white/[0.05] px-4 py-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Nova aula neste módulo</p>
                <CreateLessonForm moduleId={mod.id} onCreated={invalidate} />
              </div>
            </div>
          ))
        )}

        <div className="rounded-xl border border-dashed border-white/[0.08] px-4 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Novo módulo</p>
          <CreateModuleForm courseId={data.id} onCreated={invalidate} />
        </div>
      </section>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/[0.06] bg-[#0f1419] p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2 text-amber-400/80">
        {icon}
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function CourseFullEditForm({
  courseId,
  initial,
  onSaved,
}: {
  courseId: string;
  initial: { title: string; tagline: string | null; description: string | null };
  onSaved: () => void;
}) {
  const token = useAuthStore((s) => s.token);
  const [title, setTitle] = useState(initial.title);
  const [tagline, setTagline] = useState(initial.tagline ?? '');
  const [description, setDescription] = useState(initial.description ?? '');

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch(`/admin/courses/${courseId}`, {
        method: 'PATCH',
        token: requireToken(token),
        body: JSON.stringify({ title, tagline: tagline || null, description: description || null }),
      }),
    onSuccess: () => {
      toast.success('Curso salvo');
      onSaved();
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : 'Erro ao salvar'),
  });

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
      <div className="sm:col-span-2">
        <label className={label}>
          Título *
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className={field} />
        </label>
      </div>
      <div>
        <label className={label}>
          Tagline
          <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Uma linha de destaque" className={field} />
        </label>
      </div>
      <div>
        <label className={label}>
          Descrição
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={field} />
        </label>
      </div>
      <div className="sm:col-span-2">
        <SaveButton pending={mutation.isPending} label="Salvar curso" />
      </div>
    </form>
  );
}

function CreateModuleForm({ courseId, onCreated }: { courseId: string; onCreated: () => void }) {
  const token = useAuthStore((s) => s.token);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch('/admin/modules', {
        method: 'POST',
        token: requireToken(token),
        body: JSON.stringify({ courseId, slug: slug.trim(), title: title.trim() }),
      }),
    onSuccess: () => {
      toast.success('Módulo criado');
      setTitle('');
      setSlug('');
      onCreated();
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : 'Erro ao criar módulo'),
  });

  return (
    <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
      <label className={`${label} min-w-[160px] flex-1`}>
        Título *
        <input
          required
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slug) setSlug(slugify(e.target.value));
          }}
          className={field}
        />
      </label>
      <label className={`${label} min-w-[130px] flex-1`}>
        Slug *
        <input required value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="ex.: intro" className={fieldMono} />
      </label>
      <button
        type="submit"
        disabled={mutation.isPending}
        className="mb-0.5 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.10] disabled:opacity-50"
      >
        {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Adicionar
      </button>
    </form>
  );
}

function CreateLessonForm({ moduleId, onCreated }: { moduleId: string; onCreated: () => void }) {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(3);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch<{ id: string }>('/admin/lessons', {
        method: 'POST',
        token: requireToken(token),
        body: JSON.stringify({ moduleId, slug: slug.trim(), title: title.trim(), estimatedMinutes }),
      }),
    onSuccess: (lesson) => {
      toast.success('Aula criada — abrindo editor…');
      setTitle('');
      setSlug('');
      setEstimatedMinutes(3);
      setOpen(false);
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
        Título *
        <input
          required
          autoFocus
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slug) setSlug(slugify(e.target.value));
          }}
          className={field}
        />
      </label>
      <label className={`${label} min-w-[130px] flex-1`}>
        Slug *
        <input required value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="ex.: introducao" className={fieldMono} />
      </label>
      <label className={`${label} w-28`}>
        Duração (min)
        <input type="number" min={1} value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(Number(e.target.value))} className={field} />
      </label>
      <div className="mb-0.5 flex gap-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar e editar'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-white/[0.08] px-3 py-2.5 text-sm text-slate-400 hover:text-white">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function SaveButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#1e2530] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-[#252d3a] disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-amber-400" />}
      {pending ? 'Salvando…' : label}
    </button>
  );
}
