import { useState } from 'react';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError, apiFetch, requireToken } from '../../lib/api';
import { useAuthHydration, useAuthStore } from '../../stores/authStore';
import { PageLoader } from '../../components/ui/PageLoader';
import { ErrorState } from '../../components/ui/ErrorState';

type AdminLessonPayload = {
  id: string;
  slug: string;
  title: string;
  objective: string | null;
  contentMd: string;
  estimatedMinutes: number;
  orderIndex: number;
  module: {
    id: string;
    title: string;
    course: {
      id: string;
      slug: string;
      title: string;
    };
  };
  exercises: Array<{ id: string; title: string; type: string }>;
};

const field = 'mt-1 w-full rounded-xl border border-white/[0.08] bg-[#0b0f19] px-3 py-2.5 text-white outline-none ring-amber-500/40 focus:ring-2 placeholder:text-slate-600';
const fieldMono = `${field} font-mono text-sm`;
const lbl = 'block text-sm font-medium text-slate-400';

type EditFormProps = {
  data: AdminLessonPayload;
  lessonId: string;
  token: string | null;
  queryClient: QueryClient;
};

function AdminLessonEditForm({ data, lessonId, token, queryClient }: EditFormProps) {
  const [title, setTitle] = useState(data.title);
  const [slug, setSlug] = useState(data.slug);
  const [objective, setObjective] = useState(data.objective ?? '');
  const [estimatedMinutes, setEstimatedMinutes] = useState(data.estimatedMinutes);
  const [contentMd, setContentMd] = useState(data.contentMd);
  const [preview, setPreview] = useState(false);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/admin/lessons/${lessonId}`, {
        method: 'PATCH',
        token: requireToken(token),
        body: JSON.stringify({ title, slug, objective: objective || null, estimatedMinutes, contentMd }),
      }),
    onSuccess: () => {
      toast.success('Aula salva');
      queryClient.invalidateQueries({ queryKey: ['admin', 'lesson', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'course'] });
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : 'Erro ao salvar'),
  });

  const backTo = `/admin/courses/${data.module.course.slug}`;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" />
          {data.module.course.title} / {data.module.title}
        </Link>
        <h1 className="font-headline mt-3 text-2xl font-bold tracking-tight text-white">Editor de aula</h1>
        <p className="mt-1 text-sm text-slate-500">
          Escreva o conteúdo em <strong className="text-slate-400">Markdown</strong>. As alterações só são aplicadas ao clicar em <em>Salvar</em>.
        </p>
      </div>

      {/* Metainformações */}
      <section className="rounded-2xl border border-white/[0.06] bg-[#0f1419] p-5 sm:p-6">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-500">Metadados</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={lbl}>Título *<input required value={title} onChange={(e) => setTitle(e.target.value)} className={field} /></label>
          </div>
          <div>
            <label className={lbl}>Slug (URL)<input value={slug} onChange={(e) => setSlug(e.target.value)} className={fieldMono} /></label>
          </div>
          <div>
            <label className={lbl}>Duração estimada (min)<input type="number" min={1} value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(Number(e.target.value))} className={field} /></label>
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Objetivo (resumo para o aluno)<textarea value={objective} onChange={(e) => setObjective(e.target.value)} rows={2} className={field} /></label>
          </div>
        </div>
      </section>

      {/* Editor Markdown */}
      <section className="rounded-2xl border border-white/[0.06] bg-[#0f1419] p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Conteúdo Markdown</h2>
          <button
            type="button"
            onClick={() => setPreview((o) => !o)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:text-white"
          >
            <Eye className="h-3.5 w-3.5" />
            {preview ? 'Editar' : 'Prévia'}
          </button>
        </div>
        {preview ? (
          <div
            className="prose prose-invert prose-sm max-w-none min-h-[24rem] rounded-xl border border-white/[0.05] bg-[#0b0f19] p-4"
            dangerouslySetInnerHTML={{
              __html: contentMd.replace(/</g, '&lt;').replace(/\n/g, '<br>'),
            }}
          />
        ) : (
          <textarea
            value={contentMd}
            onChange={(e) => setContentMd(e.target.value)}
            rows={22}
            placeholder="## Título da aula&#10;&#10;Escreva o conteúdo aqui em Markdown..."
            className="mt-1 min-h-[24rem] w-full rounded-xl border border-white/[0.08] bg-[#0b0f19] px-4 py-3 font-mono text-sm leading-relaxed text-slate-200 outline-none ring-amber-500/40 placeholder:text-slate-700 focus:ring-2"
            spellCheck={false}
          />
        )}
        <p className="mt-2 text-xs text-slate-600">{contentMd.length} caracteres · {contentMd.split('\n').length} linhas</p>
      </section>

      {/* Exercícios */}
      {data.exercises.length > 0 && (
        <section className="rounded-2xl border border-white/[0.06] bg-[#0f1419] p-5 sm:p-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            Exercícios <span className="text-slate-600">({data.exercises.length})</span>
          </h2>
          <ul className="space-y-1.5">
            {data.exercises.map((ex) => (
              <li key={ex.id} className="flex items-center gap-3 rounded-lg border border-white/[0.05] px-3 py-2 text-sm text-slate-300">
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide text-slate-400">{ex.type.replace('_', ' ')}</span>
                <span className="truncate">{ex.title}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-600">A criação/edição de exercícios via API ainda não está no painel. Use o banco de dados ou seed para adicionar novos exercícios.</p>
        </section>
      )}

      {/* Ações */}
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#0b0f19]/90 p-4 backdrop-blur">
        <button
          type="button"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-amber-900/30 transition hover:bg-amber-500 disabled:opacity-50"
        >
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saveMutation.isPending ? 'Salvando…' : 'Salvar aula'}
        </button>
        <Link
          to={`/app/lessons/${lessonId}`}
          target="_blank"
          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-5 py-2.5 font-semibold text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
        >
          <Eye className="h-4 w-4" />
          Ver como aluno
        </Link>
        <Link to={backTo} className="ml-auto text-sm text-slate-500 hover:text-slate-300">
          ← Voltar ao catálogo
        </Link>
      </div>
    </div>
  );
}

export function AdminLessonEditPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthHydration();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'lesson', lessonId],
    queryFn: () => apiFetch<AdminLessonPayload>(`/admin/lessons/${lessonId}`, { token: requireToken(token) }),
    enabled: hydrated && !!token && !!lessonId,
  });

  if (!lessonId) return null;
  if (!hydrated || isLoading) return <PageLoader label="Carregando aula…" />;
  if (isError) return <ErrorState title="Não foi possível carregar a aula." error={error} />;
  if (!data) return null;

  return (
    <AdminLessonEditForm key={data.id} data={data} lessonId={lessonId} token={token} queryClient={queryClient} />
  );
}
