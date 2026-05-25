import mongoose from 'mongoose';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_TITLE_LENGTH = 200;
export const MAX_NAME_LENGTH = 100;

export function isValidObjectId(id: unknown): id is string {
  return typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);
}

export function validateEmail(email: unknown): string | null {
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return 'Invalid email format';
  }
  return null;
}

export function validatePassword(password: unknown): string | null {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
}

export function validateName(name: unknown): string | null {
  if (typeof name !== 'string' || name.trim().length === 0) {
    return 'Name cannot be empty';
  }
  if (name.trim().length > MAX_NAME_LENGTH) {
    return `Name must be at most ${MAX_NAME_LENGTH} characters`;
  }
  return null;
}

export function validateLessonFields(title: unknown, content: unknown): string | null {
  if (typeof title !== 'string' || title.trim().length === 0) {
    return 'Title is required';
  }
  if (title.trim().length > MAX_TITLE_LENGTH) {
    return `Title must be at most ${MAX_TITLE_LENGTH} characters`;
  }
  if (typeof content !== 'string' || content.trim().length === 0) {
    return 'Content is required';
  }
  return null;
}

export interface QuestionInput {
  questionText: string;
  options: [string, string, string, string];
  correctAnswerIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export function validateQuestions(questions: unknown): string | null {
  if (!Array.isArray(questions) || questions.length === 0) {
    return 'questions must be a non-empty array';
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q || typeof q !== 'object') {
      return `Question ${i + 1} is invalid`;
    }

    const item = q as Record<string, unknown>;

    if (typeof item.questionText !== 'string' || !item.questionText.trim()) {
      return `Question ${i + 1}: questionText is required`;
    }

    if (!Array.isArray(item.options) || item.options.length !== 4) {
      return `Question ${i + 1}: must have exactly 4 options`;
    }

    for (let j = 0; j < 4; j++) {
      if (typeof item.options[j] !== 'string' || !item.options[j].trim()) {
        return `Question ${i + 1}, option ${j + 1}: must be a non-empty string`;
      }
    }

    const correctIndex = Number(item.correctAnswerIndex);
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
      return `Question ${i + 1}: correctAnswerIndex must be 0, 1, 2, or 3`;
    }

    if (typeof item.explanation !== 'string' || !item.explanation.trim()) {
      return `Question ${i + 1}: explanation is required`;
    }
  }

  return null;
}
