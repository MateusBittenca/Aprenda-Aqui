/** Chaves aceitas por PATCH /me e pelo campo User.avatarColorKey */
export const AVATAR_COLOR_KEYS = [
  'auto',
  'blue',
  'violet',
  'emerald',
  'rose',
  'amber',
  'cyan',
  'pink',
  'indigo',
] as const;

export type AvatarColorKey = (typeof AVATAR_COLOR_KEYS)[number];
