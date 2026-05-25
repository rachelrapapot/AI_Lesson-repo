export const queryKeys = {
  lessons: {
    all: ['lessons'] as const,
    my: ['lessons', 'my'] as const,
    published: ['lessons', 'published'] as const,
    publishedDetail: (id: string) => ['lessons', 'published', id] as const,
    detail: (id: string) => ['lessons', id] as const,
  },
  quizzes: {
    byLesson: (lessonId: string) => ['quizzes', 'lesson', lessonId] as const,
  },
  auth: {
    me: ['auth', 'me'] as const,
  },
};
