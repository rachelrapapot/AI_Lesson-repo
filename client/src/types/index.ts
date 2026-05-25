export enum UserRole {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export enum AuthProvider {
  LOCAL = 'local',
}

export enum LessonStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  authProvider: AuthProvider;
  createdAt: string;
}

export interface Lesson {
  _id: string;
  ownerTeacherId: string;
  title: string;
  content: string;
  status: LessonStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PublishedLesson {
  _id: string;
  ownerTeacherId: { _id: string; name: string };
  title: string;
  content: string;
  contentPreview: string;
  status: LessonStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLessonPayload {
  ownerTeacherId: string;
  title: string;
  content: string;
  status?: LessonStatus;
}

export type LessonInput = CreateLessonPayload;

export interface Question {
  questionText: string;
  options: [string, string, string, string];
  correctAnswerIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface QuestionSet {
  _id: string;
  lessonId: string;
  formatVersion: number;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GenerateQuizPayload {
  lessonId: string;
  numberOfQuestions: number;
  difficulty: Difficulty;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
