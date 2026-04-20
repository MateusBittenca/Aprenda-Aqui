/** Cor de avatar: paleta fixa; "auto" usa hash determinístico do id. */
const PALETTE = [
  { key: 'blue', bg: 'bg-blue-600', text: 'text-white', ring: 'ring-blue-500' },
  { key: 'violet', bg: 'bg-violet-600', text: 'text-white', ring: 'ring-violet-500' },
  { key: 'emerald', bg: 'bg-emerald-600', text: 'text-white', ring: 'ring-emerald-500' },
  { key: 'rose', bg: 'bg-rose-600', text: 'text-white', ring: 'ring-rose-500' },
  { key: 'amber', bg: 'bg-amber-600', text: 'text-white', ring: 'ring-amber-500' },
  { key: 'cyan', bg: 'bg-cyan-600', text: 'text-white', ring: 'ring-cyan-500' },
  { key: 'pink', bg: 'bg-pink-600', text: 'text-white', ring: 'ring-pink-500' },
  { key: 'indigo', bg: 'bg-indigo-600', text: 'text-white', ring: 'ring-indigo-500' },
] as const;

const KEY_TO_STYLE = Object.fromEntries(PALETTE.map((p) => [p.key, p])) as Record<
  (typeof PALETTE)[number]['key'],
  (typeof PALETTE)[number]
>;

export type AvatarStyle = { bg: string; text: string; ring: string };

export const AVATAR_COLOR_OPTIONS: {
  key: 'auto' | (typeof PALETTE)[number]['key'];
  label: string;
}[] = [
  { key: 'auto', label: 'Automática (pelo seu id)' },
  { key: 'blue', label: 'Azul' },
  { key: 'violet', label: 'Violeta' },
  { key: 'emerald', label: 'Esmeralda' },
  { key: 'rose', label: 'Rosa' },
  { key: 'amber', label: 'Âmbar' },
  { key: 'cyan', label: 'Ciano' },
  { key: 'pink', label: 'Pink' },
  { key: 'indigo', label: 'Índigo' },
];

export function getAvatarStyle(userId: string, colorKey?: string | null): AvatarStyle {
  if (colorKey && colorKey !== 'auto' && KEY_TO_STYLE[colorKey as keyof typeof KEY_TO_STYLE]) {
    const p = KEY_TO_STYLE[colorKey as keyof typeof KEY_TO_STYLE];
    return { bg: p.bg, text: p.text, ring: p.ring };
  }
  const hash = userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const p = PALETTE[hash % PALETTE.length];
  return { bg: p.bg, text: p.text, ring: p.ring };
}
