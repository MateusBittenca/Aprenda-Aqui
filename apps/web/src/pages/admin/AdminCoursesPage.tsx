import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError, apiFetch, requireToken } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import type { CatalogCourseSummary } from '../../types/catalog';
import { PageLoader } from '../../components/ui/PageLoader';
import { ErrorState } from '../../components/ui/ErrorState';

const field = 'mt-1 w-full rounded-xl border border-white/[0.08] bg-[#0b0f19] px-3 py-2.5 text-white outline-none ring-amber-500/40 focus:ring-2 placeholder:text-slate-600';
const fieldMono = `${field} font-mono text-sm`;
const lbl = 'block text-sm font-medium text-slate-400';

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function AdminCoursesPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['catalog', 'courses', 'admin'],
    queryFn: () => apiFetch<CatalogCourseSummary[]>('/catalog/courses'),
  });

  if (isLoading) return <PageLoader label="Carregando cursos…" />;
  if (isError || !data) return <ErrorState title="Não foi possível carregar os cursos." error={error ?? new Error()} />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Catálogo</h1>
        <p className="mt-1 text-sm text-slate-400">Gerencie cursos, módulos e aulas.</p>
      </div>

      <section className="rounded-2xl border border-dashed border-amber-500/25 bg-amber-500/[0.03] p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4 text-amber-400" aria-hidden />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Novo curso</h2>
        </div>
        <CreateCourseForm />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Cursos <span className="text-slate-600">({data.length})</span>
          </h2>
        </div>
        {data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] py-10 text-center text-sm text-slate-500">
            Nenhum curso cadastrado ainda.
          </div>
        ) : (
          <ul className="space-y-2">
            {data.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/admin/courses/${c.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#0f1419] px-5 py-4 transition hover:border-amber-500/30 hover:bg-[#121820]"
                >
                  <BookOpen className="h-5 w-5 shrink-0 text-amber-400/60" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white">{c.title}</p>
                    {c.tagline && <p className="mt-0.5 truncate text-sm text-slate-400">{c.tagline}</p>}
                  </div>
                  <span className="shrink-0 rounded-lg bg-[#0b0f19] px-2.5 py-1 text-xs font-semibold text-slate-500">
                    {c._count.modules} módulo{c._count.modules !== 1 ? 's' : ''}
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-600 transition group-hover:text-amber-400" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CreateCourseForm() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch('/admin/courses', {
        method: 'POST',
        token: requireToken(token),
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          tagline: tagline.trim() || null,
          description: description.trim() || null,
        }),
      }),
    onSuccess: () => {
      toast.success('Curso criado');
      setTitle('');
      setSlug('');
      setTagline('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['catalog', 'courses', 'admin'] });
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : 'Erro ao criar curso'),
  });

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
      <div className="sm:col-span-2">
        <label className={lbl}>
          Título *
          <input
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slug) setSlug(slugify(e.target.value));
            }}
            placeholder="ex.: React na prática"
            className={field}
          />
        </label>
      </div>
      <div>
        <label className={lbl}>
          Slug (URL) *
          <input required value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="ex.: react-na-pratica" className={fieldMono} />
        </label>
      </div>
      <div>
        <label className={lbl}>
          Tagline
          <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Uma linha de destaque" className={field} />
        </label>
      </div>
      <div className="sm:col-span-2">
        <label className={lbl}>
          Descrição
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={field} />
        </label>
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-900/25 transition hover:bg-amber-500 disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {mutation.isPending ? 'Criando…' : 'Criar curso'}
        </button>
      </div>
    </form>
  );
}
