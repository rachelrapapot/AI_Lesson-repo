import { Router } from 'express';
import {
  getMyLessons,
  getLessonById,
  getPublishedLessons,
  getPublishedLessonById,
  createLesson,
  updateLesson,
  updateLessonStatus,
  deleteLesson,
} from '../controllers/lesson.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate, validateObjectId } from '../middleware/validate';
import {
  validateCreateLesson,
  validateUpdateLesson,
  validateUpdateLessonStatus,
} from '../validators/lesson.validators';
import { UserRole } from '../types';

const router = Router();

router.get('/published', authenticate as any, getPublishedLessons as any);
router.get(
  '/published/:id',
  authenticate as any,
  validateObjectId('id'),
  getPublishedLessonById as any
);

router.use(authenticate as any);
router.use(requireRole(UserRole.TEACHER) as any);

router.get('/my', getMyLessons as any);
router.get('/:id', validateObjectId('id'), getLessonById as any);
router.post('/', validate(validateCreateLesson), createLesson as any);
router.patch('/:id', validateObjectId('id'), validate(validateUpdateLesson), updateLesson as any);
router.patch(
  '/:id/status',
  validateObjectId('id'),
  validate(validateUpdateLessonStatus),
  updateLessonStatus as any
);
router.delete('/:id', validateObjectId('id'), deleteLesson as any);

export const lessonRoutes = router;
