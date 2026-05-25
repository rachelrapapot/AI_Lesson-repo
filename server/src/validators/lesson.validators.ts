import { Request } from 'express';
import { LessonStatus } from '../models/Lesson';
import { MAX_TITLE_LENGTH } from '../utils/validation';

export function validateCreateLesson(req: Request): string | null {
  const { title, content } = req.body;

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

export function validateUpdateLesson(req: Request): string | null {
  const { title, content } = req.body;

  if (title === undefined && content === undefined) {
    return 'At least one of title or content is required';
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return 'Title cannot be empty';
    }
    if (title.trim().length > MAX_TITLE_LENGTH) {
      return `Title must be at most ${MAX_TITLE_LENGTH} characters`;
    }
  }

  if (content !== undefined && (typeof content !== 'string' || content.trim().length === 0)) {
    return 'Content cannot be empty';
  }

  return null;
}

export function validateUpdateLessonStatus(req: Request): string | null {
  const { status } = req.body;

  if (!status || !Object.values(LessonStatus).includes(status)) {
    return 'Invalid status. Must be "draft" or "published"';
  }

  return null;
}
