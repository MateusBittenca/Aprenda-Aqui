import { twMerge } from 'tailwind-merge';
import { getAvatarStyle } from '../lib/avatar';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZE: Record<Size, string> = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-14 w-14 text-xl',
  xl: 'h-20 w-20 text-3xl',
};

export function Avatar({
  userId,
  displayName,
  size = 'md',
  className,
}: {
  userId: string;
  displayName: string;
  size?: Size;
  className?: string;
}) {
  const style = getAvatarStyle(userId);
  const initial = displayName.charAt(0).toUpperCase();
  return (
    <span
      className={twMerge(
        'inline-flex shrink-0 items-center justify-center rounded-2xl font-black select-none',
        SIZE[size],
        style.bg,
        style.text,
        className,
      )}
      aria-hidden
    >
      {initial}
    </span>
  );
}
