import { queryErrorMessage } from '../../lib/errors';

export function ErrorState({
  title,
  error,
  hint,
}: {
  title: string;
  error: unknown;
  hint?: React.ReactNode;
}) {
  return (
    <div
      className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50/80 p-6 text-center shadow-sm"
      role="alert"
      aria-live="assertive"
    >
      <p className="font-semibold text-red-800">{title}</p>
      <p className="mt-2 text-sm text-red-700">{queryErrorMessage(error)}</p>
      {hint ? <div className="mt-4 text-sm text-slate-600">{hint}</div> : null}
    </div>
  );
}
