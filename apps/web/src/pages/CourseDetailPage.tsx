import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { apiFetch, ApiError, requireToken } from '../lib/api';
import { useAuthHydration, useAuthStore } from '../stores/authStore';
import type { EnrolledCourseDetail } from '../types/catalog';
import { getCourseVisual } from '../config/trackVisuals';
import { EnrolledCourseHero } from '../components/EnrolledCourseHero';
import { EnrolledCourseProgram } from '../components/EnrolledCourseProgram';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';
import { useProgress } from '../hooks/useProgress';

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const hydrated = useAuthHydration();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['me', userId ?? '', 'course', courseId],
    queryFn: () => apiFetch<EnrolledCourseDetail>(`/me/courses/${courseId}`, { token: requireToken(token) }),
    enabled: !!courseId && hydrated && !!token && !!userId,
  });

  const { completedLessonIds } = useProgress();

  if (!courseId) return null;
  if (!hydrated || isLoading) return <PageLoader label="Carregando curso…" />;

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <ErrorState
        title={notFound ? 'Curso indisponível.' : 'Não foi possível carregar o curso.'}
        error={error}
        hint={
          notFound ? (
            <p>
              Matricule-se no curso pelo catálogo em{' '}
              <Link to="/app/courses" className="font-semibold text-primary underline-offset-4 hover:underline">
                Cursos
              </Link>{' '}
              para ver o conteúdo aqui.
            </p>
          ) : undefined
        }
      />
    );
  }

  if (!data) return null;

  const visual = getCourseVisual(data.slug);
  const allLessons = data.modules.flatMap((m) => m.lessons);
  const completedCount = allLessons.filter((l) => completedLessonIds.has(l.id)).length;
  const totalLessons = allLessons.length;
  const coursePct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const heroImage = data.coverImageUrl || visual.heroCover || null;

  return (
    <div
      className="space-y-10 pb-10 [background:radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.1),transparent_52%),radial-gradient(ellipse_at_bottom_left,rgba(129,39,207,0.06),transparent_48%)]"
    >
      <EnrolledCourseHero
        data={data}
        visual={visual}
        heroImage={heroImage}
        completedCount={completedCount}
        totalLessons={totalLessons}
        coursePct={coursePct}
        completedLessonIds={completedLessonIds}
        secondaryAction={{ to: '/app/my-courses', label: 'Todos os meus cursos' }}
      />
      <EnrolledCourseProgram
        modules={data.modules}
        completedLessonIds={completedLessonIds}
        visual={visual}
      />
    </div>
  );
}
