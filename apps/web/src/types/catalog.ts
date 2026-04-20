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

/** Lista pública GET /catalog/courses */
export type CatalogCourseSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  tagline: string | null;
  orderIndex: number;
  isFree: boolean;
  coverImageUrl: string | null;
  _count: { modules: number; enrollments: number };
};

/** GET /catalog/courses/:id — detalhe para landing */
export type CourseCatalogDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  tagline: string | null;
  coverImageUrl: string | null;
  overviewMd: string | null;
  orderIndex: number;
  isFree: boolean;
  modules: ModuleDetail[];
  enrollmentCount: number;
  stats: {
    lessonCount: number;
    totalMinutes: number;
    exerciseCount: number;
  };
};

/** GET /me/courses/catalog */
export type UserCourseCatalogItem = CatalogCourseSummary & {
  enrolled: boolean;
  canEnrollInCourse: boolean;
};

/** GET /me/courses/:id — curso matriculado (estrutura de estudo) */
export type EnrolledCourseDetail = CourseCatalogDetail;

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
  course: { id: string; slug: string; title: string };
  module: { id: string; slug: string; title: string };
  exercises: LessonExercise[];
};

/** GET /courses (autenticado) — lista para o aluno */
export type CourseListItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  isFree: boolean;
  orderIndex: number;
  moduleCount: number;
  lessonCount: number;
  enrolled: boolean;
  enrolledAt: string | null;
};
