import mongoose, { Schema, Document } from 'mongoose';

export enum LessonStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export interface ILesson extends Document {
  ownerTeacherId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  status: LessonStatus;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>(
  {
    ownerTeacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(LessonStatus),
      default: LessonStatus.DRAFT,
    },
  },
  { timestamps: true }
);

lessonSchema.index({ ownerTeacherId: 1, createdAt: -1 });
lessonSchema.index({ status: 1, createdAt: -1 });

export const Lesson = mongoose.model<ILesson>('Lesson', lessonSchema);
