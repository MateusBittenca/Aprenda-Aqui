import confetti from 'canvas-confetti';

export function fireConfetti() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#3b82f6', '#22d3ee', '#a855f7', '#f59e0b', '#10b981'],
  });
}

export function fireLevelUpConfetti() {
  const count = 200;
  const defaults = { origin: { y: 0.7 } };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
  }

  fire(0.25, { spread: 26, startVelocity: 55, colors: ['#f59e0b', '#fbbf24'] });
  fire(0.2, { spread: 60, colors: ['#3b82f6', '#60a5fa'] });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#a855f7', '#c084fc'] });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#10b981'] });
  fire(0.1, { spread: 120, startVelocity: 45, colors: ['#f43f5e'] });
}
