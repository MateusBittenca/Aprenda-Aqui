export type TrackSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  tagline: string | null;
  orderIndex: number;
  _count: { courses: number; lessons?: number };
  /** Só em GET /me/tracks — todas as aulas da trilha concluídas. */
  completed?: boolean;
};

/** Catálogo (loja): todas as trilhas + se o usuário já está matriculado. */
export type TrackCatalogItem = TrackSummary & { enrolled: boolean };

export type LessonRef = {
  id: string;
  slug: string;
  title: string;
  estimatedMinutes: number;
  orderIndex: number;
  _count: { exercises: number };
};

export type ModuleDetail = {
  id: string;
  slug: string;
  title: string;
  orderIndex: number;
  lessons: LessonRef[];
};

export type CourseDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  orderIndex: number;
  modules: ModuleDetail[];
};

export type TrackDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  tagline: string | null;
  orderIndex: number;
  courses: CourseDetail[];
};

export type CourseCatalogItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  isFree: boolean;
  moduleCount: number;
  lessonCount: number;
  track: { id: string; title: string; slug: string; orderIndex: number };
  /** Matrícula na trilha inteira (libera todos os cursos gratuitos). */
  trackEnrolled: boolean;
  enrolled: boolean;
  enrolledAt: string | null;
};

export type ExerciseType = 'MULTIPLE_CHOICE' | 'CODE_FILL' | 'CODE_EDITOR';

export type LessonExercise = {
  id: string;
  type: ExerciseType;
  title: string;
  prompt: string;
  orderIndex: number;
  xpReward: number;
  gemReward: number;
  solved: boolean;
  payload: Record<string, unknown>;
};

export type LessonDetail = {
  id: string;
  slug: string;
  title: string;
  objective: string | null;
  contentMd: string;
  estimatedMinutes: number;
  orderIndex: number;
  track: { id: string; slug: string; title: string };
  course: { id: string; slug: string; title: string };
  module: { id: string; slug: string; title: string };
  exercises: LessonExercise[];
};
