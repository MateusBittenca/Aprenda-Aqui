import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { useAuthHydration, useAuthStore } from '../stores/authStore';

export type EnrolledCourse = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  track: { id: string; slug: string; title: string };
  enrolledAt: string;
  progress: { completed: number; total: number; pct: number };
};

export function useEnrolledCourses() {
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const hydrated = useAuthHydration();

  return useQuery({
    queryKey: ['me', userId ?? '', 'enrolled-courses'],
    queryFn: () => apiFetch<EnrolledCourse[]>('/me/enrolled-courses', { token: token! }),
    enabled: hydrated && !!token && !!userId,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
