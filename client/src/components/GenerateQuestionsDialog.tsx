import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { AutoAwesome as GenerateIcon } from '@mui/icons-material';
import type { Difficulty } from '../types';

interface GenerateQuestionsDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (difficulty: Difficulty, numberOfQuestions: number) => void;
  isLoading: boolean;
  error: string | null;
}

export function GenerateQuestionsDialog({
  open,
  onClose,
  onGenerate,
  isLoading,
  error,
}: GenerateQuestionsDialogProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);

  const handleGenerate = () => {
    onGenerate(difficulty, numberOfQuestions);
  };

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <GenerateIcon color="primary" />
        Generate Questions with AI
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          {error && (
            <Alert severity="error">{error}</Alert>
          )}

          <FormControl fullWidth>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficulty}
              label="Difficulty"
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              disabled={isLoading}
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Typography gutterBottom>
              Number of questions: <strong>{numberOfQuestions}</strong>
            </Typography>
            <Slider
              value={numberOfQuestions}
              onChange={(_, value) => setNumberOfQuestions(value as number)}
              min={1}
              max={10}
              step={1}
              marks
              disabled={isLoading}
              valueLabelDisplay="auto"
            />
          </Box>

          {isLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
                Generating questions... This may take a few seconds.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleGenerate}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : <GenerateIcon />}
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
