import { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { QuestionSet } from '../models/QuestionSet';
import { generateQuizQuestions, Difficulty } from '../services/ai.service';
import { Lesson } from '../models/Lesson';
import { AuthRequest } from '../types';
import { AppError } from '../utils/AppError';
import { isValidObjectId } from '../utils/validation';

export const getQuizByLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
  const lesson = await Lesson.findById(req.params.lessonId);
  if (!lesson) {
    res.status(404).json({ success: false, error: 'Lesson not found' });
    return;
  }

  const isOwner = req.user && lesson.ownerTeacherId.toString() === req.user._id.toString();
  if (!isOwner && lesson.status !== 'published') {
    res.status(403).json({ success: false, error: 'Lesson is not published' });
    return;
  }

  const questionSet = await QuestionSet.findOne({ lessonId: req.params.lessonId });
  res.json({ success: true, data: questionSet });
});

export const generateQuiz = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { lessonId, numberOfQuestions = 5, difficulty = 'medium' } = req.body;

  if (!isValidObjectId(lessonId)) {
    res.status(400).json({ success: false, error: 'Invalid lessonId' });
    return;
  }

  const numQuestions = Math.min(Math.max(Number(numberOfQuestions), 1), 10);
  const validDifficulties: Difficulty[] = ['easy', 'medium', 'hard'];
  const diff: Difficulty = validDifficulties.includes(difficulty) ? difficulty : 'medium';

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    res.status(404).json({ success: false, error: 'Lesson not found' });
    return;
  }

  if (lesson.ownerTeacherId.toString() !== req.user!._id.toString()) {
    res.status(403).json({ success: false, error: 'You can only generate questions for your own lessons' });
    return;
  }

  let questions;
  try {
    questions = await generateQuizQuestions(lesson, numQuestions, diff);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
      return;
    }
    console.error('AI quiz generation failed:', error);
    res.status(502).json({
      success: false,
      error: 'Failed to generate questions. Please try again.',
    });
    return;
  }

  const questionSet = await QuestionSet.findOneAndUpdate(
    { lessonId },
    {
      lessonId,
      questions,
      formatVersion: 1,
    },
    { upsert: true, new: true }
  );

  res.status(201).json({ success: true, data: questionSet });
});

export const updateQuiz = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { questions } = req.body;

  const questionSet = await QuestionSet.findById(req.params.id);
  if (!questionSet) {
    res.status(404).json({ success: false, error: 'Question set not found' });
    return;
  }

  const lesson = await Lesson.findById(questionSet.lessonId);
  if (!lesson || lesson.ownerTeacherId.toString() !== req.user!._id.toString()) {
    res.status(403).json({ success: false, error: 'You can only edit questions for your own lessons' });
    return;
  }

  questionSet.questions = questions;
  await questionSet.save();

  res.json({ success: true, data: questionSet });
});

export const deleteQuiz = asyncHandler(async (req: AuthRequest, res: Response) => {
  const questionSet = await QuestionSet.findById(req.params.id);
  if (!questionSet) {
    res.status(404).json({ success: false, error: 'Question set not found' });
    return;
  }

  const lesson = await Lesson.findById(questionSet.lessonId);
  if (!lesson || lesson.ownerTeacherId.toString() !== req.user!._id.toString()) {
    res.status(403).json({ success: false, error: 'You can only delete questions for your own lessons' });
    return;
  }

  await QuestionSet.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
});
