import { useQuery } from '@tanstack/react-query';
import { apiFetch, requireToken } from '../lib/api';
import { useAuthHydration, useAuthStore } from '../stores/authStore';

export type EnrolledCourse = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  tagline: string | null;
  lessonPreview: string[];
  /** Primeira aula ainda não concluída (ordem do curso) */
  nextLessonTitle: string | null;
  enrolledAt: string;
  progress: { completed: number; total: number; pct: number };
};

export function useEnrolledCourses() {
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const hydrated = useAuthHydration();

  return useQuery({
    queryKey: ['me', userId ?? '', 'enrolled-courses'],
    queryFn: () => apiFetch<EnrolledCourse[]>('/me/enrolled-courses', { token: requireToken(token) }),
    enabled: hydrated && !!token && !!userId,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
