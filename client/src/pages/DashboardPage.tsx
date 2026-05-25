import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useMyLessons, useDeleteLesson, useUpdateLessonStatus } from '../hooks/useLessons';
import { LessonStatus } from '../types';
import type { Lesson } from '../types';

function DashboardSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Skeleton variant="text" width={200} height={48} />
        <Skeleton variant="rounded" width={140} height={36} />
      </Box>
      <Grid container spacing={3}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
            <Skeleton variant="rounded" height={220} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: lessons, isLoading, isError } = useMyLessons();
  const deleteMutation = useDeleteLesson();
  const statusMutation = useUpdateLessonStatus();
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);
  const [statusTargetId, setStatusTargetId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget._id, {
        onSuccess: () => setDeleteTarget(null),
      });
    }
  };

  const handleToggleStatus = (lesson: Lesson) => {
    const newStatus = lesson.status === LessonStatus.DRAFT
      ? LessonStatus.PUBLISHED
      : LessonStatus.DRAFT;
    setStatusTargetId(lesson._id);
    statusMutation.mutate(
      { id: lesson._id, status: newStatus },
      { onSettled: () => setStatusTargetId(null) }
    );
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Failed to load lessons. Please try again.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h2">My Lessons</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage and organize your lesson content
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/lessons/new')}
          size="large"
        >
          New Lesson
        </Button>
      </Box>

      {!lessons || lessons.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Typography variant="h3" color="text.secondary" gutterBottom>
              No lessons yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create your first lesson to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/lessons/new')}
            >
              Create Lesson
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {lessons.map((lesson) => {
            const isUpdatingStatus = statusMutation.isPending && statusTargetId === lesson._id;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={lesson._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          flexGrow: 1,
                          marginInlineEnd: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {lesson.title}
                      </Typography>
                      <Chip
                        label={lesson.status}
                        size="small"
                        sx={{
                          bgcolor: lesson.status === LessonStatus.PUBLISHED ? '#d1fae5' : '#fef3c7',
                          color: lesson.status === LessonStatus.PUBLISHED ? '#065f46' : '#92400e',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.6,
                    }}>
                      {lesson.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                      {new Date(lesson.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ px: 2.5, pb: 2, pt: 0, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/lessons/${lesson._id}/edit`)}
                      disabled={deleteMutation.isPending}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleToggleStatus(lesson)}
                      disabled={isUpdatingStatus || deleteMutation.isPending}
                      startIcon={isUpdatingStatus ? <CircularProgress size={14} /> : undefined}
                    >
                      {isUpdatingStatus
                        ? 'Updating...'
                        : lesson.status === LessonStatus.DRAFT
                          ? 'Publish'
                          : 'Unpublish'}
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteTarget(lesson)}
                      disabled={statusMutation.isPending || deleteMutation.isPending}
                      sx={{ marginInlineStart: 'auto' }}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog open={!!deleteTarget} onClose={() => !deleteMutation.isPending && setDeleteTarget(null)}>
        <DialogTitle>Delete Lesson</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This will also delete all associated questions. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
