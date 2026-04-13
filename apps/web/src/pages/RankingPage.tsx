import { Link } from 'react-router-dom';
import { Medal, Sparkles, Trophy } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useMe } from '../hooks/useMe';
import { PageLoader } from '../components/ui/PageLoader';
import { ErrorState } from '../components/ui/ErrorState';

export function RankingPage() {
  const { data: lb, isLoading, isError, error } = useLeaderboard();
  const { data: me } = useMe({});

  if (isLoading) return <PageLoader label="Carregando ranking…" />;
  if (isError) return <ErrorState title="Não foi possível carregar o ranking." error={error} />;
  if (!lb) return null;

  const inTop = me ? lb.top.some((u) => u.id === me.id) : false;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-700 ring-1 ring-amber-200">
          <Trophy className="h-3.5 w-3.5" /> Ranking global
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
          Top Aprendizes
        </h1>
        <p className="mt-2 text-slate-500">
          {lb.total} aluno{lb.total !== 1 ? 's' : ''} competindo
          {me && !inTop && <> · você está em <strong className="text-slate-700">#{lb.myRank}</strong></>}
        </p>
      </div>

      {/* Pódio top-3 */}
      {lb.top.length >= 3 && (
        <div className="flex items-end justify-center gap-3 pt-4">
          {/* 2º */}
          <PodiumCard entry={lb.top[1]} rank={2} myId={me?.id} />
          {/* 1º */}
          <PodiumCard entry={lb.top[0]} rank={1} myId={me?.id} />
          {/* 3º */}
          <PodiumCard entry={lb.top[2]} rank={3} myId={me?.id} />
        </div>
      )}

      {/* Tabela completa */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-soft">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <Medal className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Classificação completa</h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {lb.top.map((entry, i) => {
            const rank = i + 1;
            const isMe = entry.id === me?.id;
            const rowClass = `flex items-center gap-3 px-4 py-3 ${isMe ? 'bg-blue-50 ring-2 ring-inset ring-blue-400/30' : 'hover:bg-slate-50'}`;
            const rowInner = (
              <>
                <RankBadge rank={rank} />
                <Avatar userId={entry.id} displayName={entry.displayName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className={`truncate font-semibold ${isMe ? 'text-blue-800' : 'text-slate-800'}`}>
                    {entry.displayName}
                    {isMe && (
                      <span className="ml-1.5 text-[10px] font-black uppercase tracking-wide text-blue-600">você</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    Nv. {entry.level}
                    {entry.currentStreak > 0 && <span className="ml-2">🔥 {entry.currentStreak}d</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black tabular-nums text-slate-900">{entry.xpTotal.toLocaleString('pt-BR')}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">XP</p>
                </div>
              </>
            );
            return (
              <li key={entry.id}>
                {isMe ? (
                  <div className={rowClass}>{rowInner}</div>
                ) : (
                  <Link to={`/app/users/${entry.id}`} className={`${rowClass} block`}>
                    {rowInner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {/* Posição do usuário se não estiver no top */}
        {me && !inTop && (
          <div className="border-t-2 border-dashed border-slate-200">
            <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 ring-2 ring-inset ring-blue-400/30">
              <RankBadge rank={lb.myRank} />
              <Avatar userId={me.id} displayName={me.displayName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="truncate font-semibold text-blue-800">
                  {me.displayName}
                  <span className="ml-1.5 text-[10px] font-black uppercase tracking-wide text-blue-600">você</span>
                </p>
                <p className="text-xs text-slate-500">Nv. {me.level}</p>
              </div>
              <div className="text-right">
                <p className="font-black tabular-nums text-slate-900">{me.xpTotal.toLocaleString('pt-BR')}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">XP</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Motivational tip */}
      <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 text-center">
        <Sparkles className="mx-auto h-5 w-5 text-blue-500" />
        <p className="mt-2 text-sm font-medium text-blue-800">
          Complete aulas e exercícios para ganhar XP e subir no ranking!
          {me && lb.myRank > 1 && ` Você está a ${lb.top[Math.min(lb.myRank - 2, lb.top.length - 1)]?.xpTotal - me.xpTotal > 0 ? lb.top[Math.min(lb.myRank - 2, lb.top.length - 1)]?.xpTotal - me.xpTotal : '??'} XP do ${lb.myRank - 1}º lugar.`}
        </p>
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const style =
    rank === 1
      ? 'bg-amber-100 text-amber-700 font-black text-base'
      : rank === 2
        ? 'bg-slate-100 text-slate-700 font-black text-base'
        : rank === 3
          ? 'bg-orange-100 text-orange-700 font-black text-base'
          : 'bg-transparent text-slate-400 font-semibold text-sm';

  const label = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

  return (
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${style}`}>
      {label}
    </span>
  );
}

function PodiumCard({
  entry,
  rank,
  myId,
}: {
  entry: { id: string; displayName: string; xpTotal: number; level: number };
  rank: number;
  myId?: string;
}) {
  const isMe = entry.id === myId;
  const heights = { 1: 'h-32', 2: 'h-20', 3: 'h-16' };
  const podiumH = heights[rank as 1 | 2 | 3];
  const order = rank === 1 ? 'order-2 scale-105' : rank === 2 ? 'order-1' : 'order-3';

  return (
    <div className={`flex flex-col items-center gap-2 ${order}`}>
      <Avatar userId={entry.id} displayName={entry.displayName} size="lg" className={isMe ? 'ring-4 ring-blue-400 ring-offset-2' : ''} />
      <p className="max-w-[80px] truncate text-center text-xs font-bold text-slate-800">
        {entry.displayName.split(' ')[0]}
      </p>
      <p className="text-xs font-semibold text-slate-500">{entry.xpTotal} XP</p>
      <div
        className={`w-16 rounded-t-xl ${podiumH} flex items-end justify-center pb-2 ${
          rank === 1 ? 'bg-amber-100' : rank === 2 ? 'bg-slate-100' : 'bg-orange-50'
        }`}
      >
        <span className="text-xl">{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</span>
      </div>
    </div>
  );
}
