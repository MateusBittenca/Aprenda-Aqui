import type { EnrolledCourse } from '../hooks/useEnrolledCourses';

/**
 * Escolhe o curso mais natural para "continuar":
 *   1º) em progresso (0 < pct < 100) mais recente por matrícula
 *   2º) caso nenhum esteja em progresso, o último matriculado com pct < 100
 *   3º) null se tudo já está concluído ou não há matrículas.
 */
export function pickResumeCourse(list: EnrolledCourse[]): EnrolledCourse | null {
  const active = list.filter((c) => c.progress.pct > 0 && c.progress.pct < 100);
  const pool = active.length > 0 ? active : list.filter((c) => c.progress.pct < 100);
  if (pool.length === 0) return null;
  return [...pool].sort(
    (a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime(),
  )[0];
}
