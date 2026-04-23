import { useState } from 'react';
import { Gem, Gift, Loader2, Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';
import { useDailyGift, useClaimDailyGift } from '../hooks/useDailyGift';
import { fireConfetti } from '../lib/confetti';
import { playCorrect } from '../lib/sounds';
import { useUiPreferences } from '../stores/uiPreferencesStore';

/**
 * Card do presente diário. Aparece no topo do Dashboard quando `canClaim === true`
 * e ficamos escondidos caso contrário (não polui o dashboard com "já reclamou").
 * Mostra o ciclo de 7 dias para dar noção de escalada e recompensa futura.
 */
export function DailyGiftCard() {
  const { data, isLoading, isError } = useDailyGift();
  const claim = useClaimDailyGift();
  const soundEnabled = useUiPreferences((s) => s.soundEnabled);
  const [justClaimed, setJustClaimed] = useState<number | null>(null);

  if (isLoading || isError || !data) return null;
  if (!data.canClaim && !justClaimed) return null;

  const cycleLength = data.cycleAmounts.length;
  const currentDay = justClaimed ?? data.dayInCycle;
  const displayAmount = justClaimed != null ? data.cycleAmounts[justClaimed - 1] : data.amount;

  const handleClaim = async () => {
    try {
      const result = await claim.mutateAsync();
      setJustClaimed(result.dayInCycle);
      fireConfetti();
      if (soundEnabled) playCorrect();
      toast.success(`+${result.amount} gemas resgatadas!`);
    } catch {
      toast.error('Não foi possível resgatar o presente. Tente de novo.');
    }
  };

  return (
    <section
      aria-labelledby="daily-gift-title"
      className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-surface-container-lowest p-5 shadow-elevated animate-sheet-up sm:p-6"
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-sky-100/80" aria-hidden />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary-container/30" aria-hidden />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span
            className={twMerge(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary',
              !justClaimed && 'animate-pop',
            )}
          >
            {justClaimed ? (
              <Check className="h-6 w-6 text-emerald-600" aria-hidden />
            ) : (
              <Gift className="h-6 w-6" aria-hidden />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              {justClaimed ? 'Presente resgatado' : 'Presente diário'}
            </p>
            <h2 id="daily-gift-title" className="mt-0.5 text-lg font-black text-on-surface sm:text-xl">
              {justClaimed ? `+${displayAmount} gemas no saldo!` : `${displayAmount} gemas esperando por você`}
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              {justClaimed
                ? 'Volte amanhã para não perder o ciclo e liberar a recompensa do próximo dia.'
                : data.willResetCycle
                  ? 'Você perdeu o ciclo — começamos de novo no dia 1. Mantenha o hábito!'
                  : currentDay === cycleLength
                    ? 'Último dia do ciclo — a maior recompensa está aqui hoje.'
                    : 'Abra o app todo dia para subir o ciclo e ganhar cada vez mais.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={claim.isPending || !!justClaimed}
          onClick={handleClaim}
          className="press-tactile focus-ring-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lifted transition duration-300 ease-ios-out hover:bg-primary-dim disabled:opacity-70"
        >
          {claim.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : justClaimed ? (
            <Check className="h-4 w-4" aria-hidden />
          ) : (
            <Gem className="h-4 w-4" aria-hidden />
          )}
          {justClaimed ? 'Resgatado' : claim.isPending ? 'Resgatando…' : `Resgatar +${displayAmount}`}
        </button>
      </div>

      <ol
        className="relative mt-5 grid grid-cols-7 gap-1.5"
        role="list"
        aria-label="Ciclo de 7 dias do presente diário"
      >
        {data.cycleAmounts.map((amount, index) => {
          const day = index + 1;
          const done = day < currentDay;
          const current = day === currentDay;
          return (
            <li
              key={day}
              className={twMerge(
                'flex flex-col items-center rounded-xl border px-1 py-2 text-center transition',
                done && 'border-emerald-200 bg-emerald-50 text-emerald-700',
                current && !justClaimed && 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20',
                current && justClaimed && 'border-emerald-300 bg-emerald-100 text-emerald-800',
                !done && !current && 'border-slate-200 bg-white text-slate-500',
              )}
            >
              <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">D{day}</span>
              <span className="mt-0.5 flex items-center gap-0.5 text-sm font-black tabular-nums">
                {done || (current && justClaimed) ? (
                  <Check className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <>
                    <Gem className="h-3 w-3" aria-hidden />
                    {amount}
                  </>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
