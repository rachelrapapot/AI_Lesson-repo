import { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { Lesson, LessonStatus } from '../models/Lesson';
import { QuestionSet } from '../models/QuestionSet';
import { AuthRequest } from '../types';

export const getPublishedLessons = asyncHandler(async (req, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
  const skip = (page - 1) * limit;

  const [lessons, total] = await Promise.all([
    Lesson.find({ status: LessonStatus.PUBLISHED })
      .populate('ownerTeacherId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Lesson.countDocuments({ status: LessonStatus.PUBLISHED }),
  ]);

  const lessonsWithPreview = lessons.map((lesson) => ({
    ...lesson,
    contentPreview: lesson.content.substring(0, 200),
  }));

  res.json({
    success: true,
    data: lessonsWithPreview,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const getPublishedLessonById = asyncHandler(async (req, res: Response) => {
  const lesson = await Lesson.findOne({
    _id: req.params.id,
    status: LessonStatus.PUBLISHED,
  })
    .populate('ownerTeacherId', 'name')
    .lean();

  if (!lesson) {
    res.status(404).json({ success: false, error: 'Lesson not found' });
    return;
  }

  res.json({ success: true, data: lesson });
});

export const getMyLessons = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
  const skip = (page - 1) * limit;

  const [lessons, total] = await Promise.all([
    Lesson.find({ ownerTeacherId: req.user!._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Lesson.countDocuments({ ownerTeacherId: req.user!._id }),
  ]);

  res.json({
    success: true,
    data: lessons,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const getLessonById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) {
    res.status(404).json({ success: false, error: 'Lesson not found' });
    return;
  }

  if (lesson.ownerTeacherId.toString() !== req.user!._id.toString()) {
    res.status(403).json({ success: false, error: 'Not authorized to access this lesson' });
    return;
  }

  res.json({ success: true, data: lesson });
});

export const createLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, content } = req.body;

  const lesson = await Lesson.create({
    ownerTeacherId: req.user!._id,
    title: title.trim(),
    content: content.trim(),
    status: LessonStatus.DRAFT,
  });

  res.status(201).json({ success: true, data: lesson });
});

export const updateLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) {
    res.status(404).json({ success: false, error: 'Lesson not found' });
    return;
  }

  if (lesson.ownerTeacherId.toString() !== req.user!._id.toString()) {
    res.status(403).json({ success: false, error: 'Not authorized to update this lesson' });
    return;
  }

  const { title, content } = req.body;
  if (title !== undefined) lesson.title = title.trim();
  if (content !== undefined) lesson.content = content.trim();

  await lesson.save();
  res.json({ success: true, data: lesson });
});

export const updateLessonStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) {
    res.status(404).json({ success: false, error: 'Lesson not found' });
    return;
  }

  if (lesson.ownerTeacherId.toString() !== req.user!._id.toString()) {
    res.status(403).json({ success: false, error: 'Not authorized to update this lesson' });
    return;
  }

  lesson.status = req.body.status;
  await lesson.save();
  res.json({ success: true, data: lesson });
});

export const deleteLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) {
    res.status(404).json({ success: false, error: 'Lesson not found' });
    return;
  }

  if (lesson.ownerTeacherId.toString() !== req.user!._id.toString()) {
    res.status(403).json({ success: false, error: 'Not authorized to delete this lesson' });
    return;
  }

  await QuestionSet.deleteMany({ lessonId: lesson._id });
  await lesson.deleteOne();

  res.json({ success: true, data: {} });
});
