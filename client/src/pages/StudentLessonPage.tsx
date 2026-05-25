import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Skeleton,
  Alert,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  RadioButtonUnchecked as UncheckedIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { usePublishedLesson } from '../hooks/useLessons';
import { useQuizByLesson } from '../hooks/useQuiz';
import type { Question } from '../types';

interface QuestionState {
  selectedIndex: number | null;
  locked: boolean;
}

function QuizQuestion({
  question,
  index,
  state,
  onAnswer,
}: {
  question: Question;
  index: number;
  state: QuestionState;
  onAnswer: (questionIndex: number, optionIndex: number) => void;
}) {
  const { selectedIndex, locked } = state;
  const isAnswered = locked;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        mb: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'border-color 0.2s',
        '&:hover': { borderColor: 'primary.light' },
      }}
    >
      <Tooltip title={question.questionText} placement="top" arrow disableHoverListener={question.questionText.length < 80}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word',
          }}
        >
          {index + 1}. {question.questionText}
        </Typography>
      </Tooltip>

      <List disablePadding>
        {question.options.map((option, optIdx) => {
          const isSelected = selectedIndex === optIdx;
          const isCorrect = optIdx === question.correctAnswerIndex;

          let bgColor = 'transparent';
          let textColor = 'text.primary';
          if (isAnswered) {
            if (isCorrect) {
              bgColor = '#d1fae5';
              textColor = '#065f46';
            } else if (isSelected && !isCorrect) {
              bgColor = '#fee2e2';
              textColor = '#991b1b';
            }
          }

          return (
            <ListItemButton
              key={optIdx}
              onClick={() => !locked && onAnswer(index, optIdx)}
              disabled={locked}
              sx={{
                mb: 1,
                borderRadius: 2,
                border: '1px solid',
                borderColor: isAnswered
                  ? isCorrect
                    ? 'success.main'
                    : isSelected
                      ? 'error.main'
                      : 'divider'
                  : isSelected
                    ? 'primary.main'
                    : 'divider',
                bgcolor: bgColor,
                color: textColor,
                transition: 'all 0.15s ease-in-out',
                '&:hover': {
                  bgcolor: isAnswered ? bgColor : 'action.hover',
                  transform: isAnswered ? 'none' : 'scale(1.01)',
                },
                '&.Mui-disabled': {
                  opacity: 1,
                  bgcolor: bgColor,
                  color: textColor,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {isAnswered ? (
                  isCorrect ? (
                    <CheckCircleIcon color="success" />
                  ) : isSelected ? (
                    <CancelIcon color="error" />
                  ) : (
                    <UncheckedIcon color="disabled" />
                  )
                ) : (
                  <UncheckedIcon color={isSelected ? 'primary' : 'disabled'} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={option}
                slotProps={{
                  primary: {
                    sx: {
                      wordBreak: 'break-word',
                      whiteSpace: 'normal',
                    },
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Collapse in={isAnswered}>
        <Paper
          sx={{
            p: 2,
            mt: 1,
            bgcolor: 'grey.50',
            borderInlineStart: '4px solid',
            borderColor: 'info.main',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Explanation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {question.explanation}
          </Typography>
        </Paper>
      </Collapse>
    </Paper>
  );
}

function QuizSection({ lessonId }: { lessonId: string }) {
  const { data: quiz, isLoading } = useQuizByLesson(lessonId);

  const [answers, setAnswers] = useState<QuestionState[]>([]);

  const initAnswers = useCallback(
    (length: number) => Array.from({ length }, () => ({ selectedIndex: null, locked: false })),
    []
  );

  if (isLoading) {
    return <Skeleton variant="rounded" height={200} />;
  }

  if (!quiz || !quiz.questions?.length) {
    return null;
  }

  const currentAnswers = answers.length === quiz.questions.length ? answers : initAnswers(quiz.questions.length);

  const handleAnswer = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => {
      const next = prev.length === quiz.questions.length ? [...prev] : initAnswers(quiz.questions.length);
      if (next[questionIndex].locked) return prev;
      next[questionIndex] = { selectedIndex: optionIndex, locked: true };
      return next;
    });
  };

  const answeredCount = currentAnswers.filter((a) => a.locked).length;
  const correctCount = currentAnswers.filter(
    (a, i) => a.locked && a.selectedIndex === quiz.questions[i].correctAnswerIndex
  ).length;
  const allAnswered = answeredCount === quiz.questions.length;

  const handleReset = () => {
    setAnswers(initAnswers(quiz.questions.length));
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Divider sx={{ mb: 3 }} />
      <Typography variant="h5" sx={{ mb: 3 }}>
        Quiz
      </Typography>

      {quiz.questions.map((question, idx) => (
        <QuizQuestion
          key={idx}
          question={question}
          index={idx}
          state={currentAnswers[idx]}
          onAnswer={handleAnswer}
        />
      ))}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 3,
          p: 2.5,
          borderRadius: 3,
          bgcolor: allAnswered
            ? correctCount === quiz.questions.length
              ? '#d1fae5'
              : 'grey.100'
            : 'grey.50',
          border: '1px solid',
          borderColor: allAnswered
            ? correctCount === quiz.questions.length
              ? 'success.main'
              : 'divider'
            : 'divider',
        }}
      >
        <Typography variant="h6">
          {allAnswered
            ? `You got ${correctCount} out of ${quiz.questions.length} correct`
            : `${answeredCount} of ${quiz.questions.length} answered`}
        </Typography>
        {allAnswered && (
          <Button variant="outlined" onClick={handleReset}>
            Try Again
          </Button>
        )}
      </Box>
    </Box>
  );
}

export function StudentLessonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: lesson, isLoading, error } = usePublishedLesson(id!);

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rounded" height={400} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (error || !lesson) {
    return <Alert severity="error">Lesson not found or not available.</Alert>;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/student')}
        sx={{ mb: 2 }}
      >
        Back to Lessons
      </Button>

      <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
          {lesson.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            By {lesson.ownerTeacherId.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(lesson.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ lineHeight: 1.8, '& h1': { typography: 'h4', mt: 3, mb: 1 }, '& h2': { typography: 'h5', mt: 2.5, mb: 1 }, '& h3': { typography: 'h6', mt: 2, mb: 1 }, '& p': { mb: 1.5, color: 'text.secondary' }, '& strong': { fontWeight: 600, color: 'text.primary' }, '& ul, & ol': { pl: 3 } }}>
          <ReactMarkdown>{lesson.content}</ReactMarkdown>
        </Box>

        <QuizSection lessonId={lesson._id} />
      </Paper>
    </Box>
  );
}
