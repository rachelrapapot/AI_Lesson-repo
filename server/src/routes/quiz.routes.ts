import { Router } from 'express';
import { getQuizByLesson, generateQuiz, updateQuiz, deleteQuiz } from '../controllers/quiz.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate, validateObjectId } from '../middleware/validate';
import { validateGenerateQuiz, validateUpdateQuiz } from '../validators/quiz.validators';
import { UserRole } from '../types';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);

router.get('/lesson/:lessonId', validateObjectId('lessonId'), getQuizByLesson);
router.post('/generate', requireRole(UserRole.TEACHER), aiLimiter, validate(validateGenerateQuiz), generateQuiz);
router.patch('/:id', requireRole(UserRole.TEACHER), validateObjectId('id'), validate(validateUpdateQuiz), updateQuiz);
router.delete('/:id', requireRole(UserRole.TEACHER), validateObjectId('id'), deleteQuiz);

export const quizRoutes = router;
