import { apiClient } from './api';
import type { Lesson, LessonStatus, PublishedLesson } from '../types';

interface CreateLessonPayload {
  title: string;
  content: string;
}

interface UpdateLessonPayload {
  title?: string;
  content?: string;
}

export const lessonService = {
  getMyLessons: async (): Promise<Lesson[]> => {
    const res = await apiClient.get('/lessons/my');
    return res.data.data;
  },

  getById: async (id: string): Promise<Lesson> => {
    const res = await apiClient.get(`/lessons/${id}`);
    return res.data.data;
  },

  create: async (data: CreateLessonPayload): Promise<Lesson> => {
    const res = await apiClient.post('/lessons', data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateLessonPayload): Promise<Lesson> => {
    const res = await apiClient.patch(`/lessons/${id}`, data);
    return res.data.data;
  },

  updateStatus: async (id: string, status: LessonStatus): Promise<Lesson> => {
    const res = await apiClient.patch(`/lessons/${id}/status`, { status });
    return res.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/lessons/${id}`);
  },

  getPublished: async (): Promise<PublishedLesson[]> => {
    const res = await apiClient.get('/lessons/published');
    return res.data.data;
  },

  getPublishedById: async (id: string): Promise<PublishedLesson> => {
    const res = await apiClient.get(`/lessons/published/${id}`);
    return res.data.data;
  },
};
