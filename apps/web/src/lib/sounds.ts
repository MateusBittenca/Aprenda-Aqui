/**
 * Sons curtos Apple-style gerados em runtime via Web Audio API.
 * Zero assets, zero dependências. Opt-in via `useUiPreferences.soundEnabled`.
 *
 * Princípios:
 * - Cada som é curto (≤ 600ms) para não atrapalhar leitura/flow.
 * - Volumes conservadores; nunca passa de 0.12 de gain.
 * - `AudioContext` é lazy e reutilizado entre chamadas (Safari/iOS cobram cada new).
 * - `ensureRunning()` cobre o caso de o contexto ter nascido suspenso (política de
 *   autoplay dos navegadores); só funciona após uma interação do usuário.
 */

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (_ctx) return _ctx;
  const AC: typeof AudioContext | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  _ctx = new AC();
  return _ctx;
}

async function ensureRunning(ctx: AudioContext) {
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      /* ignore: browser não autorizou ainda */
    }
  }
}

type NoteOpts = {
  freq: number;
  startAt: number;
  duration: number;
  /** Volume pico entre 0 e 1. */
  peak?: number;
  type?: OscillatorType;
};

function playNote(ctx: AudioContext, { freq, startAt, duration, peak = 0.08, type = 'sine' }: NoteOpts) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startAt);

  /** Envelope ADSR simples: attack rápido, decay suave — som "limpo" tipo iOS. */
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(peak, startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  osc.connect(gain).connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

/** Acerto: dois tons ascendentes curtos (ding-dong alegre, 260ms total). */
export async function playCorrect() {
  const ctx = getCtx();
  if (!ctx) return;
  await ensureRunning(ctx);
  const t = ctx.currentTime;
  playNote(ctx, { freq: 880, startAt: t, duration: 0.12, peak: 0.09, type: 'sine' });
  playNote(ctx, { freq: 1318.51, startAt: t + 0.08, duration: 0.18, peak: 0.1, type: 'sine' });
}

/** Erro: um bip baixo e suave (sem ser ansiogênico), 180ms. */
export async function playWrong() {
  const ctx = getCtx();
  if (!ctx) return;
  await ensureRunning(ctx);
  const t = ctx.currentTime;
  playNote(ctx, { freq: 220, startAt: t, duration: 0.18, peak: 0.07, type: 'triangle' });
}

/** Level up: arpejo C–E–G–C uma oitava acima, celebratório, 500ms. */
export async function playLevelUp() {
  const ctx = getCtx();
  if (!ctx) return;
  await ensureRunning(ctx);
  const t = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    playNote(ctx, {
      freq,
      startAt: t + i * 0.09,
      duration: 0.2,
      peak: 0.1,
      type: 'sine',
    });
  });
}
