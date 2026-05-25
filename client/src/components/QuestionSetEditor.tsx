import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  CheckCircle as CorrectIcon,
} from '@mui/icons-material';
import type { Question, QuestionSet } from '../types';

interface QuestionSetEditorProps {
  questionSet: QuestionSet;
  onSave: (questions: Question[]) => void;
  isSaving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
}

export function QuestionSetEditor({
  questionSet,
  onSave,
  isSaving,
  saveError,
  saveSuccess,
}: QuestionSetEditorProps) {
  const [questions, setQuestions] = useState<Question[]>(questionSet.questions);
  const [expanded, setExpanded] = useState<number | false>(0);
  const [validationErrors, setValidationErrors] = useState<string | null>(null);

  useEffect(() => {
    setQuestions(questionSet.questions);
  }, [questionSet]);

  const updateQuestion = (index: number, field: keyof Question, value: unknown) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setValidationErrors(null);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const options = [...updated[questionIndex].options] as [string, string, string, string];
      options[optionIndex] = value;
      updated[questionIndex] = { ...updated[questionIndex], options };
      return updated;
    });
    setValidationErrors(null);
  };

  const validateQuestions = (): string | null => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        return `Question ${i + 1}: Question text is required`;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          return `Question ${i + 1}, Option ${j + 1}: Option text cannot be empty`;
        }
      }
      if (!q.explanation.trim()) {
        return `Question ${i + 1}: Explanation is required`;
      }
    }
    return null;
  };

  const handleSave = () => {
    const error = validateQuestions();
    if (error) {
      setValidationErrors(error);
      return;
    }
    setValidationErrors(null);
    onSave(questions);
  };

  const hasChanges = JSON.stringify(questions) !== JSON.stringify(questionSet.questions);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Questions ({questions.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {saveError && (
        <Alert severity="error">{saveError}</Alert>
      )}

      {validationErrors && (
        <Alert severity="warning">{validationErrors}</Alert>
      )}

      {saveSuccess && !hasChanges && (
        <Alert severity="success" icon={<CorrectIcon />}>
          Questions saved successfully!
        </Alert>
      )}

      {questions.map((question, qIndex) => (
        <Accordion
          key={qIndex}
          expanded={expanded === qIndex}
          onChange={(_, isExpanded) => setExpanded(isExpanded ? qIndex : false)}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              overflow: 'hidden',
              '& .MuiAccordionSummary-content': {
                minWidth: 0,
                overflow: 'hidden',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', minWidth: 0, overflow: 'hidden', marginInlineEnd: 2 }}>
              <Chip label={`Q${qIndex + 1}`} size="small" color="primary" variant="outlined" sx={{ flexShrink: 0 }} />
              <Tooltip title={question.questionText || 'Untitled question'} placement="top" arrow>
                <Typography
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {question.questionText || 'Untitled question'}
                </Typography>
              </Tooltip>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Question Text"
                value={question.questionText}
                onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />

              <FormControl component="fieldset">
                <FormLabel>Options (select the correct answer)</FormLabel>
                <RadioGroup
                  value={question.correctAnswerIndex}
                  onChange={(e) => updateQuestion(qIndex, 'correctAnswerIndex', Number(e.target.value))}
                >
                  {question.options.map((option, oIndex) => (
                    <Box key={oIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <FormControlLabel
                        value={oIndex}
                        control={<Radio />}
                        label=""
                        sx={{ m: 0, minWidth: 42 }}
                      />
                      <TextField
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        fullWidth
                        size="small"
                        placeholder={`Option ${oIndex + 1}`}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: question.correctAnswerIndex === oIndex ? 'success.50' : undefined,
                          },
                        }}
                      />
                    </Box>
                  ))}
                </RadioGroup>
              </FormControl>

              <TextField
                label="Explanation"
                value={question.explanation}
                onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      {questions.length > 3 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      )}
    </Box>
  );
}
