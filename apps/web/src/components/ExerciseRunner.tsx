import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Check, Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';
import type { LessonExercise } from '../types/catalog';
import { apiFetch, ApiError } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { MacEditorChrome } from './MacEditorChrome';

export type SubmitResult = {
  correct: boolean;
  explanation: string;
  xpGained: number;
  gemsGained: number;
  alreadySolved: boolean;
  rewardsApplied: boolean;
  lessonCompleted?: boolean;
  leveledUp?: boolean;
  newLevel?: number;
};

type Props = {
  exercise: LessonExercise;
  onAfterSubmit: (r: SubmitResult) => void;
};

export function ExerciseRunner({ exercise, onAfterSubmit }: Props) {
  const token = useAuthStore((s) => s.token);
  const [loading, setLoading] = useState(false);

  const submit = async (body: Record<string, unknown>) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiFetch<SubmitResult>(`/exercises/${exercise.id}/submit`, {
        method: 'POST',
        token,
        body: JSON.stringify(body),
      });
      onAfterSubmit(res);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Não foi possível enviar a resposta. Tente de novo.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (exercise.type === 'MULTIPLE_CHOICE') {
    return (
      <MultipleChoiceView
        exercise={exercise}
        loading={loading}
        onPick={(i) => submit({ selectedIndex: i })}
      />
    );
  }
  if (exercise.type === 'CODE_FILL') {
    return (
      <CodeFillView exercise={exercise} loading={loading} onSubmit={(blanks) => submit({ blanks })} />
    );
  }
  return (
    <CodeEditorView exercise={exercise} loading={loading} onSubmit={(code) => submit({ code })} />
  );
}

function MultipleChoiceView({
  exercise,
  loading,
  onPick,
}: {
  exercise: LessonExercise;
  loading: boolean;
  onPick: (i: number) => void;
}) {
  const options = (exercise.payload.options as string[]) ?? [];

  if (exercise.solved) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-900">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
          <Check className="h-5 w-5" aria-hidden />
        </span>
        Você já dominou este desafio!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900">{exercise.title}</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{exercise.prompt}</p>
      </div>
      {options.map((opt, i) => (
        <button
          key={i}
          type="button"
          disabled={loading}
          onClick={() => onPick(i)}
          className="group flex w-full items-start gap-4 rounded-2xl border-2 border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 active:scale-[0.99] disabled:opacity-60"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-black text-white shadow-md transition group-hover:scale-105">
            {String.fromCharCode(65 + i)}
          </span>
          <span className="pt-0.5 text-sm font-medium leading-snug text-slate-800">{opt}</span>
        </button>
      ))}
      {loading && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-indigo-50 py-3 text-sm font-medium text-indigo-700">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Verificando sua resposta…
        </div>
      )}
    </div>
  );
}

function CodeFillView({
  exercise,
  loading,
  onSubmit,
}: {
  exercise: LessonExercise;
  loading: boolean;
  onSubmit: (blanks: Record<string, string>) => void;
}) {
  const template = exercise.payload.template as string;
  const blanks = exercise.payload.blanks as { id: string }[];
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(blanks.map((b) => [b.id, ''])),
  );

  if (exercise.solved) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-900">
        <Check className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
        Lacunas já preenchidas corretamente!
      </div>
    );
  }

  const parts: React.ReactNode[] = [];
  const re = /\{\{(\w+)\}\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  const codeTextClass = 'font-mono text-[13px] leading-6 text-[#d4d4d4]';
  const blankInputClass =
    'mx-0.5 inline-flex h-6 min-h-6 min-w-[4ch] max-w-[10rem] shrink-0 items-center rounded border border-[#454545] bg-[#2d2d2d] px-1.5 font-mono text-[13px] leading-none text-[#f3f3f3] outline-none ring-0 transition placeholder:text-[#6b6b6b] focus:border-[#007fd4] focus:ring-1 focus:ring-[#007fd4]/50';

  while ((m = re.exec(template)) !== null) {
    if (m.index > last) {
      parts.push(
        <span key={`t-${key++}`} className={codeTextClass}>
          {template.slice(last, m.index)}
        </span>,
      );
    }
    const id = m[1];
    parts.push(
      <input
        key={`b-${id}`}
        aria-label={`Lacuna ${id}`}
        className={blankInputClass}
        value={values[id] ?? ''}
        onChange={(e) => setValues((v) => ({ ...v, [id]: e.target.value }))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit(values);
        }}
      />,
    );
    last = m.index + m[0].length;
  }
  if (last < template.length) {
    parts.push(
      <span key={`t-${key++}`} className={codeTextClass}>
        {template.slice(last)}
      </span>,
    );
  }

  const footer = (
    <div className="flex items-center justify-between gap-3 border-t border-black/[0.08] bg-[#f0f0f0] px-3 py-2.5">
      <span className="text-[11px] text-slate-500">Preencha e envie</span>
      <button
        type="button"
        disabled={loading}
        onClick={() => onSubmit(values)}
        className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-1.5 text-[13px] font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Play className="h-3.5 w-3.5" aria-hidden />}
        {loading ? 'Verificando…' : 'Verificar'}
      </button>
    </div>
  );

  return (
    <MacEditorChrome title={exercise.title} footer={footer}>
      <div className="border-b border-slate-200/90 bg-slate-50 px-4 py-3">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{exercise.prompt}</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-0 gap-y-1.5 bg-[#1e1e1e] px-4 py-3.5">
        {parts}
      </div>
    </MacEditorChrome>
  );
}

function CodeEditorView({
  exercise,
  loading,
  onSubmit,
}: {
  exercise: LessonExercise;
  loading: boolean;
  onSubmit: (code: string) => void;
}) {
  const starter = (exercise.payload.starterCode as string) ?? '';
  const [code, setCode] = useState(starter);
  const loadingRef = useRef(loading);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  if (exercise.solved) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-900">
        <Check className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
        Código já validado!
      </div>
    );
  }

  const footer = (
    <div className="flex items-center justify-between gap-3 border-t border-black/[0.08] bg-[#f0f0f0] px-3 py-2.5">
      <span className="text-[11px] text-slate-500">
        <kbd className="rounded border border-slate-300 bg-white px-1 py-0.5 font-mono text-[10px] text-slate-600">
          Ctrl
        </kbd>
        <span className="mx-0.5">+</span>
        <kbd className="rounded border border-slate-300 bg-white px-1 py-0.5 font-mono text-[10px] text-slate-600">
          Enter
        </kbd>
        <span className="ml-1.5">para enviar</span>
      </span>
      <button
        type="button"
        disabled={loading}
        onClick={() => onSubmit(code)}
        className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-1.5 text-[13px] font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Play className="h-3.5 w-3.5" aria-hidden />}
        {loading ? 'Executando…' : 'Executar'}
      </button>
    </div>
  );

  return (
    <MacEditorChrome title={exercise.title} footer={footer}>
      <div className="border-b border-slate-200/90 bg-slate-50 px-4 py-3">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{exercise.prompt}</p>
      </div>
      <div className="bg-[#1e1e1e]">
        <Editor
          height="280px"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(v) => setCode(v ?? '')}
          onMount={(editor, monaco) => {
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
              if (loadingRef.current) return;
              onSubmit(editor.getValue());
            });
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            padding: { top: 12, bottom: 12 },
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            renderLineHighlight: 'line',
            scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
          }}
        />
      </div>
    </MacEditorChrome>
  );
}
