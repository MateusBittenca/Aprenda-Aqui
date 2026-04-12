import { useState } from 'react';
import Editor from '@monaco-editor/react';
import type { LessonExercise } from '../types/catalog';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

export type SubmitResult = {
  correct: boolean;
  explanation: string;
  xpGained: number;
  gemsGained: number;
  alreadySolved: boolean;
  rewardsApplied: boolean;
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
  return (
    <div className="flex flex-col gap-3">
      {options.map((opt, i) => (
        <button
          key={i}
          type="button"
          disabled={loading}
          onClick={() => onPick(i)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-800 shadow-sm transition hover:border-blue-400 hover:bg-blue-50/50 disabled:opacity-60"
        >
          {opt}
        </button>
      ))}
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

  const parts: React.ReactNode[] = [];
  const re = /\{\{(\w+)\}\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(template)) !== null) {
    if (m.index > last) {
      parts.push(
        <span key={`t-${key++}`} className="font-mono text-sm">
          {template.slice(last, m.index)}
        </span>,
      );
    }
    const id = m[1];
    parts.push(
      <input
        key={`b-${id}`}
        className="mx-0.5 inline-block w-28 rounded border border-blue-300 bg-white px-1 py-0.5 font-mono text-sm outline-none ring-blue-400 focus:ring-2"
        value={values[id] ?? ''}
        onChange={(e) => setValues((v) => ({ ...v, [id]: e.target.value }))}
      />,
    );
    last = m.index + m[0].length;
  }
  if (last < template.length) {
    parts.push(
      <span key={`t-${key++}`} className="font-mono text-sm">
        {template.slice(last)}
      </span>,
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-mono leading-relaxed">
        {parts}
      </div>
      <button
        type="button"
        disabled={loading}
        onClick={() => onSubmit(values)}
        className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-60"
      >
        Verificar
      </button>
    </div>
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

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-inner">
        <Editor
          height="200px"
          defaultLanguage="javascript"
          theme="vs-light"
          value={code}
          onChange={(v) => setCode(v ?? '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
        />
      </div>
      <p className="text-xs text-slate-500">
        Escreva uma expressão JavaScript que seja avaliada para a resposta esperada.
      </p>
      <button
        type="button"
        disabled={loading}
        onClick={() => onSubmit(code)}
        className="rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60"
      >
        Executar e verificar
      </button>
    </div>
  );
}
