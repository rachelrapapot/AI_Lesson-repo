import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Chip,
  Skeleton,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { usePublishedLessons } from '../hooks/useLessons';

export function StudentDashboardPage() {
  const { data: lessons, isLoading, error } = usePublishedLessons();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Browse Lessons
        </Typography>
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rounded" height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load lessons. Please try again.</Alert>;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Browse Lessons
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Explore lessons created by your teachers
        </Typography>
      </Box>

      {!lessons?.length ? (
        <Alert severity="info">No lessons available yet. Check back soon!</Alert>
      ) : (
        <Grid container spacing={3}>
          {lessons.map((lesson) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={lesson._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(`/student/lessons/${lesson._id}`)}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {lesson.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.6,
                      }}
                    >
                      {lesson.contentPreview}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Chip
                        label={lesson.ownerTeacherId.name}
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: 'primary.light', color: 'primary.dark' }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(lesson.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
