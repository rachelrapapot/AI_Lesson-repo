import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizService } from '../services/quiz.service';
import { queryKeys } from '../lib/queryKeys';
import type { GenerateQuizPayload, Question } from '../types';

export const useQuizByLesson = (lessonId: string) =>
  useQuery({
    queryKey: queryKeys.quizzes.byLesson(lessonId),
    queryFn: () => quizService.getByLesson(lessonId),
    enabled: !!lessonId,
  });

export const useGenerateQuiz = (lessonId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<GenerateQuizPayload, 'lessonId'>) =>
      quizService.generate({ lessonId, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.quizzes.byLesson(lessonId),
      });
    },
  });
};

export const useUpdateQuiz = (lessonId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, questions }: { id: string; questions: Question[] }) =>
      quizService.update(id, questions),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.quizzes.byLesson(lessonId),
      });
    },
  });
};
