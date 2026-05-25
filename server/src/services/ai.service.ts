import { GoogleGenerativeAI } from '@google/generative-ai';
import { ILesson } from '../models/Lesson';
import { IQuestion } from '../models/QuestionSet';
import { config } from '../config/env';
import { AppError } from '../utils/AppError';

export type Difficulty = 'easy' | 'medium' | 'hard';

const difficultyDescriptions: Record<Difficulty, string> = {
  easy: 'basic recall and simple comprehension — suitable for beginners',
  medium: 'application and analysis — requires understanding of concepts',
  hard: 'synthesis and evaluation — requires deep understanding and multi-step reasoning',
};

function buildPrompt(lesson: ILesson, numberOfQuestions: number, difficulty: Difficulty): string {
  return `You are an educational quiz generator for math lessons.
Generate exactly ${numberOfQuestions} multiple-choice questions for the following lesson.

Difficulty level: ${difficulty} (${difficultyDescriptions[difficulty]})

Lesson Title: ${lesson.title}
Lesson Content: ${lesson.content}

Return ONLY a valid JSON array (no markdown, no code fences, no extra text).
Each element must be an object with exactly these fields:
- "questionText": string — the question
- "options": array of exactly 4 strings — possible answers
- "correctAnswerIndex": number 0-3 — index of the correct option
- "explanation": string — brief explanation of why the answer is correct

Example format:
[{"questionText":"What is 2+2?","options":["3","4","5","6"],"correctAnswerIndex":1,"explanation":"2+2 equals 4"}]`;
}

function repairJson(raw: string): string {
  let cleaned = raw.trim();

  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  const arrayStart = cleaned.indexOf('[');
  const arrayEnd = cleaned.lastIndexOf(']');
  if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
    cleaned = cleaned.slice(arrayStart, arrayEnd + 1);
  }

  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
  cleaned = cleaned.replace(/([{,]\s*)([\w]+)\s*:/g, '$1"$2":');

  return cleaned;
}

function validateQuestions(data: unknown): IQuestion[] {
  if (!Array.isArray(data)) {
    throw new Error('Response is not an array');
  }

  if (data.length === 0) {
    throw new Error('Response array is empty');
  }

  return data.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`Question ${index + 1} is not an object`);
    }

    const q = item as Record<string, unknown>;

    if (typeof q.questionText !== 'string' || !q.questionText.trim()) {
      throw new Error(`Question ${index + 1} missing questionText`);
    }

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Question ${index + 1} must have exactly 4 options`);
    }

    for (let i = 0; i < 4; i++) {
      if (typeof q.options[i] !== 'string' || !q.options[i].trim()) {
        throw new Error(`Question ${index + 1}, option ${i + 1} is invalid`);
      }
    }

    const correctIndex = Number(q.correctAnswerIndex);
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
      throw new Error(`Question ${index + 1} has invalid correctAnswerIndex`);
    }

    if (typeof q.explanation !== 'string' || !q.explanation.trim()) {
      throw new Error(`Question ${index + 1} missing explanation`);
    }

    return {
      questionText: q.questionText.trim(),
      options: q.options.map((o: string) => o.trim()) as [string, string, string, string],
      correctAnswerIndex: correctIndex as 0 | 1 | 2 | 3,
      explanation: q.explanation.trim(),
    };
  });
}

function parseAndValidate(raw: string): IQuestion[] {
  try {
    const parsed = JSON.parse(raw);
    return validateQuestions(parsed);
  } catch {
    const repaired = repairJson(raw);
    const parsed = JSON.parse(repaired);
    return validateQuestions(parsed);
  }
}

export const generateQuizQuestions = async (
  lesson: ILesson,
  numberOfQuestions: number,
  difficulty: Difficulty = 'medium'
): Promise<IQuestion[]> => {
  if (!config.geminiApiKey) {
    throw new AppError('Quiz generation is not configured', 503);
  }

  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = buildPrompt(lesson, numberOfQuestions, difficulty);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Gemini returned an empty response');
      }

      return parseAndValidate(text);
    } catch (error) {
      console.error(`Gemini attempt ${attempt + 1} failed:`, error instanceof Error ? error.message : error);
      if (attempt === 0) {
        continue;
      }
    }
  }

  throw new AppError('Failed to generate valid questions. Please try again.', 502);
};
