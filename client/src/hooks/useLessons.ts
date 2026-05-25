import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonService } from '../services/lesson.service';
import { queryKeys } from '../lib/queryKeys';
import type { LessonStatus } from '../types';

export const useMyLessons = () =>
  useQuery({
    queryKey: queryKeys.lessons.my,
    queryFn: lessonService.getMyLessons,
  });

export const useLessons = useMyLessons;

export const useLesson = (id: string) =>
  useQuery({
    queryKey: queryKeys.lessons.detail(id),
    queryFn: () => lessonService.getById(id),
    enabled: !!id,
  });

export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; content: string }) => lessonService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons.my });
    },
  });
};

export const useUpdateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; content?: string } }) =>
      lessonService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons.my });
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons.detail(variables.id) });
    },
  });
};

export const useUpdateLessonStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LessonStatus }) =>
      lessonService.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons.my });
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons.detail(variables.id) });
    },
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lessonService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons.my });
    },
  });
};

export const usePublishedLessons = () =>
  useQuery({
    queryKey: queryKeys.lessons.published,
    queryFn: lessonService.getPublished,
  });

export const usePublishedLesson = (id: string) =>
  useQuery({
    queryKey: queryKeys.lessons.publishedDetail(id),
    queryFn: () => lessonService.getPublishedById(id),
    enabled: !!id,
  });
