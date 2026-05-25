import { Request } from 'express';
import { IUser } from '../models/User';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
}

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

export interface UserType {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  authProvider: AuthProvider;
  createdAt: string;
}

export interface LessonType {
  _id: string;
  ownerTeacherId: string;
  title: string;
  content: string;
  status: LessonStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionType {
  questionText: string;
  options: [string, string, string, string];
  correctAnswerIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface QuestionSetType {
  _id: string;
  lessonId: string;
  formatVersion: number;
  questions: QuestionType[];
  createdAt: string;
  updatedAt: string;
}
