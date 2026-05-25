import { Request } from 'express';
import { validateQuestions, isValidObjectId } from '../utils/validation';

const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export function validateGenerateQuiz(req: Request): string | null {
  const { lessonId, numberOfQuestions, difficulty } = req.body;

  if (!lessonId) {
    return 'lessonId is required';
  }

  if (!isValidObjectId(lessonId)) {
    return 'Invalid lessonId';
  }

  if (numberOfQuestions !== undefined) {
    const num = Number(numberOfQuestions);
    if (!Number.isInteger(num) || num < 1 || num > 10) {
      return 'numberOfQuestions must be an integer between 1 and 10';
    }
  }

  if (difficulty !== undefined && !VALID_DIFFICULTIES.includes(difficulty)) {
    return 'difficulty must be "easy", "medium", or "hard"';
  }

  return null;
}

export function validateUpdateQuiz(req: Request): string | null {
  const { questions } = req.body;

  if (!questions) {
    return 'questions array is required';
  }

  return validateQuestions(questions);
}
