/** Cor de avatar determinística baseada no id do usuário. */
const PALETTE = [
  { bg: 'bg-blue-600', text: 'text-white', ring: 'ring-blue-500' },
  { bg: 'bg-violet-600', text: 'text-white', ring: 'ring-violet-500' },
  { bg: 'bg-emerald-600', text: 'text-white', ring: 'ring-emerald-500' },
  { bg: 'bg-rose-600', text: 'text-white', ring: 'ring-rose-500' },
  { bg: 'bg-amber-600', text: 'text-white', ring: 'ring-amber-500' },
  { bg: 'bg-cyan-600', text: 'text-white', ring: 'ring-cyan-500' },
  { bg: 'bg-pink-600', text: 'text-white', ring: 'ring-pink-500' },
  { bg: 'bg-indigo-600', text: 'text-white', ring: 'ring-indigo-500' },
] as const;

export type AvatarStyle = (typeof PALETTE)[number];

export function getAvatarStyle(userId: string): AvatarStyle {
  const hash = userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}
