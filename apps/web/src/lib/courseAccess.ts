import type { CourseDetail } from '../types/catalog';

/** Curso liberado para estudo (matrícula na trilha cobre gratuitos; extras exigem matrícula no curso). */
export function courseAccessible(c: CourseDetail): boolean {
  if (c.accessible !== undefined) return c.accessible;
  return c.isFree;
}
