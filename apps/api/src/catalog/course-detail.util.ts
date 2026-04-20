type LessonLike = { estimatedMinutes: number; _count?: { exercises: number } };
type ModuleLike = { lessons: LessonLike[] };

export function computeCourseStats(modules: ModuleLike[]) {
  let lessonCount = 0;
  let totalMinutes = 0;
  let exerciseCount = 0;
  for (const m of modules) {
    for (const l of m.lessons) {
      lessonCount += 1;
      totalMinutes += l.estimatedMinutes;
      exerciseCount += l._count?.exercises ?? 0;
    }
  }
  return { lessonCount, totalMinutes, exerciseCount };
}

/** Métricas agregadas e contagem de matrículas para catálogo / detalhe do curso. */
export function withCoursePresentation<
  T extends { _count?: { enrollments: number }; modules: ModuleLike[] },
>(
  course: T,
): Omit<T, '_count'> & {
  enrollmentCount: number;
  stats: { lessonCount: number; totalMinutes: number; exerciseCount: number };
} {
  const { _count, ...rest } = course;
  const stats = computeCourseStats(course.modules);
  return {
    ...(rest as Omit<T, '_count'>),
    enrollmentCount: _count?.enrollments ?? 0,
    stats,
  };
}
