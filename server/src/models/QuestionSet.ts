import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionOption {
  text: string;
}

export interface IQuestion {
  questionText: string;
  options: [string, string, string, string];
  correctAnswerIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface IQuestionSet extends Document {
  lessonId: mongoose.Types.ObjectId;
  formatVersion: number;
  questions: IQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    questionText: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length === 4,
        message: 'Each question must have exactly 4 options',
      },
    },
    correctAnswerIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    explanation: { type: String, required: true },
  },
  { _id: false }
);

const questionSetSchema = new Schema<IQuestionSet>(
  {
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      unique: true,
    },
    formatVersion: { type: Number, required: true, default: 1 },
    questions: { type: [questionSchema], required: true },
  },
  { timestamps: true }
);

export const QuestionSet = mongoose.model<IQuestionSet>('QuestionSet', questionSetSchema);
