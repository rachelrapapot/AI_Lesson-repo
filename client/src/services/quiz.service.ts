import { apiClient } from './api';
import type { QuestionSet, GenerateQuizPayload, Question } from '../types';

export const quizService = {
  getByLesson: async (lessonId: string): Promise<QuestionSet | null> => {
    const res = await apiClient.get(`/quiz/lesson/${lessonId}`);
    return res.data.data;
  },

  generate: async (payload: GenerateQuizPayload): Promise<QuestionSet> => {
    const res = await apiClient.post('/quiz/generate', payload);
    return res.data.data;
  },

  update: async (id: string, questions: Question[]): Promise<QuestionSet> => {
    const res = await apiClient.patch(`/quiz/${id}`, { questions });
    return res.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/quiz/${id}`);
  },
};
