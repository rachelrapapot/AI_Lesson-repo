import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  AutoAwesome as GenerateIcon,
} from '@mui/icons-material';
import { useLesson, useCreateLesson, useUpdateLesson } from '../hooks/useLessons';
import { useQuizByLesson, useGenerateQuiz, useUpdateQuiz } from '../hooks/useQuiz';
import { GenerateQuestionsDialog } from '../components/GenerateQuestionsDialog';
import { QuestionSetEditor } from '../components/QuestionSetEditor';
import { UnsavedChangesDialog } from '../components/UnsavedChangesDialog';
import { useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard';
import type { Difficulty, Question } from '../types';

export function LessonEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: existingLesson, isLoading } = useLesson(id || '');
  const createMutation = useCreateLesson();
  const updateMutation = useUpdateLesson();

  const { data: questionSet, isLoading: isLoadingQuiz } = useQuizByLesson(id || '');
  const generateMutation = useGenerateQuiz(id || '');
  const updateQuizMutation = useUpdateQuiz(id || '');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; content?: string }>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const hasSubmittedRef = useRef(false);

  const isDirty = useMemo(() => {
    if (hasSubmittedRef.current) return false;
    if (isEditing && existingLesson) {
      return title !== existingLesson.title || content !== existingLesson.content;
    }
    return title.trim() !== '' || content.trim() !== '';
  }, [title, content, isEditing, existingLesson]);

  const { isBlocked, guardedNavigate, confirmNavigation, cancelNavigation } = useUnsavedChangesGuard(isDirty);

  useEffect(() => {
    if (existingLesson) {
      setTitle(existingLesson.title);
      setContent(existingLesson.content);
    } else if (!isEditing) {
      setTitle('');
      setContent('');
      setGenerateDialogOpen(false);
      setGenerateError(null);
      setSaveSuccess(false);
      setFieldErrors({});
      setTouched({});
    }
  }, [existingLesson, isEditing]);

  const MAX_TITLE_LENGTH = 200;

  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'title':
        if (!value.trim()) return 'Lesson title is required';
        if (value.trim().length > MAX_TITLE_LENGTH) return `Title must be at most ${MAX_TITLE_LENGTH} characters`;
        return undefined;
      case 'content':
        if (!value.trim()) return 'Lesson content is required';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = field === 'title' ? title : content;
    setFieldErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      title: validateField('title', title),
      content: validateField('content', content),
    };
    setFieldErrors(newErrors);
    setTouched({ title: true, content: true });
    return !newErrors.title && !newErrors.content;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditing && id) {
      updateMutation.mutate(
        { id, data: { title, content } },
        {
          onSuccess: () => {
            hasSubmittedRef.current = true;
            navigate('/dashboard');
          },
        }
      );
    } else {
      createMutation.mutate(
        { title, content },
        {
          onSuccess: () => {
            hasSubmittedRef.current = true;
            navigate('/dashboard');
          },
        }
      );
    }
  };

  const handleGenerate = (difficulty: Difficulty, numberOfQuestions: number) => {
    setGenerateError(null);
    generateMutation.mutate(
      { difficulty, numberOfQuestions },
      {
        onSuccess: () => {
          setGenerateDialogOpen(false);
        },
        onError: (error) => {
          setGenerateError(
            error instanceof Error ? error.message : 'Failed to generate questions. Please try again.'
          );
        },
      }
    );
  };

  const handleSaveQuestions = (questions: Question[]) => {
    if (!questionSet) return;
    setSaveSuccess(false);
    updateQuizMutation.mutate(
      { id: questionSet._id, questions },
      {
        onSuccess: () => setSaveSuccess(true),
      }
    );
  };

  const mutation = isEditing ? updateMutation : createMutation;

  if (isEditing && isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => guardedNavigate('/dashboard')}
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h2" gutterBottom>
            {isEditing ? 'Edit Lesson' : 'Create New Lesson'}
          </Typography>

          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {mutation.error?.message || 'Something went wrong'}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Lesson Title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (touched.title) setFieldErrors((prev) => ({ ...prev, title: validateField('title', e.target.value) }));
                }}
                onBlur={() => handleBlur('title')}
                error={touched.title && !!fieldErrors.title}
                helperText={touched.title && fieldErrors.title}
                fullWidth
                placeholder="Enter a descriptive title for your lesson"
              />
              <TextField
                label="Lesson Content"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (touched.content) setFieldErrors((prev) => ({ ...prev, content: validateField('content', e.target.value) }));
                }}
                onBlur={() => handleBlur('content')}
                error={touched.content && !!fieldErrors.content}
                helperText={touched.content && fieldErrors.content}
                fullWidth
                multiline
                minRows={12}
                maxRows={30}
                placeholder="Write your lesson content here..."
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => guardedNavigate('/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  disabled={mutation.isPending || !title.trim() || !content.trim()}
                >
                  {mutation.isPending
                    ? 'Saving...'
                    : isEditing
                      ? 'Save Changes'
                      : 'Create Lesson'}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

      {isEditing && (
        <>
          <Divider sx={{ my: 4 }} />

          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">
                  AI-Generated Questions
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={generateMutation.isPending ? <CircularProgress size={16} /> : <GenerateIcon />}
                  onClick={() => {
                    setGenerateError(null);
                    setGenerateDialogOpen(true);
                  }}
                  disabled={generateMutation.isPending}
                >
                  {questionSet ? 'Regenerate Questions' : 'Generate Questions'}
                </Button>
              </Box>

              {isLoadingQuiz && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              )}

              {!isLoadingQuiz && !questionSet && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    No questions generated yet. Use AI to generate multiple-choice questions based on your lesson content.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={generateMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <GenerateIcon />}
                    onClick={() => {
                      setGenerateError(null);
                      setGenerateDialogOpen(true);
                    }}
                    disabled={generateMutation.isPending}
                  >
                    Generate Questions
                  </Button>
                </Box>
              )}

              {!isLoadingQuiz && questionSet && (
                <QuestionSetEditor
                  questionSet={questionSet}
                  onSave={handleSaveQuestions}
                  isSaving={updateQuizMutation.isPending}
                  saveError={updateQuizMutation.isError
                    ? (updateQuizMutation.error?.message || 'Failed to save')
                    : null}
                  saveSuccess={saveSuccess}
                />
              )}
            </CardContent>
          </Card>

          <GenerateQuestionsDialog
            open={generateDialogOpen}
            onClose={() => setGenerateDialogOpen(false)}
            onGenerate={handleGenerate}
            isLoading={generateMutation.isPending}
            error={generateError}
          />
        </>
      )}

      <UnsavedChangesDialog
        open={isBlocked}
        onStay={cancelNavigation}
        onLeave={confirmNavigation}
      />
    </Box>
  );
}
