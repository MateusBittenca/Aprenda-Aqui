import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

type Me = {
  email: string;
  displayName: string;
  timezone: string;
  createdAt: string;
  xpTotal: number;
  level: number;
  gems: number;
  currentStreak: number;
  longestStreak: number;
};

export function ProfilePage() {
  const token = useAuthStore((s) => s.token);
  const patchUser = useAuthStore((s) => s.patchUser);

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<Me>('/me', { token: token! }),
    enabled: !!token,
  });

  useEffect(() => {
    if (!data) return;
    patchUser({
      xpTotal: data.xpTotal,
      level: data.level,
      gems: data.gems,
      currentStreak: data.currentStreak,
      longestStreak: data.longestStreak,
    });
  }, [data, patchUser]);

  if (isLoading || !data) {
    return <p className="text-slate-500">Carregando perfil…</p>;
  }

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-slate-200/80 bg-white p-8 shadow-soft">
      <h1 className="text-2xl font-bold text-slate-900">{data.displayName}</h1>
      <p className="text-sm text-slate-500">{data.email}</p>
      <dl className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Fuso</dt>
          <dd className="font-medium text-slate-800">{data.timezone}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Membro desde</dt>
          <dd className="font-medium text-slate-800">
            {new Date(data.createdAt).toLocaleDateString('pt-BR')}
          </dd>
        </div>
      </dl>
    </div>
  );
}
