type LessonLike = { estimatedMinutes: number; _count?: { exercises: number } };
type ModuleLike = { lessons: LessonLike[] };
type CourseLike = { modules: ModuleLike[] };

export function computeTrackStats(courses: CourseLike[]) {
  let lessonCount = 0;
  let totalMinutes = 0;
  let exerciseCount = 0;
  for (const c of courses) {
    for (const m of c.modules) {
      for (const l of m.lessons) {
        lessonCount += 1;
        totalMinutes += l.estimatedMinutes;
        exerciseCount += l._count?.exercises ?? 0;
      }
    }
  }
  return { lessonCount, totalMinutes, exerciseCount };
}

/** Expõe contagem de matrículas e métricas agregadas para o catálogo / detalhe da trilha. */
export function withTrackPresentation<T extends { _count?: { enrollments: number }; courses: CourseLike[] }>(
  track: T,
): Omit<T, '_count'> & {
  enrollmentCount: number;
  stats: { lessonCount: number; totalMinutes: number; exerciseCount: number };
} {
  const { _count, ...rest } = track;
  const stats = computeTrackStats(track.courses);
  return {
    ...(rest as Omit<T, '_count'>),
    enrollmentCount: _count?.enrollments ?? 0,
    stats,
  };
}
