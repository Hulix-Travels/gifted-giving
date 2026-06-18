import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Rating,
  Chip
} from '@mui/material';
import ForwardArrowEndIcon from './ui/ForwardArrowEndIcon';
import StorySubmission from './StorySubmission';
import ApiErrorState from './ApiErrorState';
import SectionHeader from './ui/SectionHeader';
import CtaPanel from './ui/CtaPanel';
import { sectionSurface, siteCard } from '../theme/styles';
import { successStoriesAPI } from '../services/api';
import { formatStoryAttribution } from '../utils/formatStoryMeta';

function StoryCard({ story }) {
  const attribution = formatStoryAttribution(story);

  return (
    <Card
      sx={{
        ...siteCard,
        minWidth: { xs: 280, sm: 320 },
        maxWidth: 360,
        flex: '0 0 auto',
        scrollSnapAlign: 'start',
        boxShadow: 'var(--shadow-sm)',
        '&:hover': { boxShadow: 'var(--shadow-md)' }
      }}
    >
      <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {story.category && (
          <Chip
            label={story.category}
            size="small"
            sx={{
              alignSelf: 'flex-start',
              mb: 1.5,
              height: 24,
              fontWeight: 600,
              fontSize: '0.7rem',
              backgroundColor: 'var(--light-green)',
              color: 'var(--primary-green)'
            }}
          />
        )}
        <Rating
          value={story.rating || 5}
          readOnly
          size="small"
          sx={{ color: 'var(--accent-green)', mb: 1.5 }}
        />
        <Typography
          variant="body2"
          sx={{
            flexGrow: 1,
            mb: 2.5,
            lineHeight: 1.7,
            color: 'var(--gray)'
          }}
        >
          &ldquo;{story.content}&rdquo;
        </Typography>
        <Box sx={{ pt: 1.5, borderTop: '1px solid var(--color-border)' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--primary-green)' }}>
            {story.author || 'Anonymous'}
          </Typography>
          {attribution && (
            <Typography variant="caption" sx={{ color: 'var(--gray)', display: 'block', mt: 0.25 }}>
              {attribution}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

function ShareStoryCta({ onOpen }) {
  return (
    <CtaPanel
      title="Share your story"
      description="Been impacted by our work? We'd love to hear from you."
    >
      <Button
        variant="contained"
        color="primary"
        size="large"
        endIcon={<ForwardArrowEndIcon />}
        onClick={onOpen}
        sx={{ textTransform: 'none', fontWeight: 600, px: 3 }}
      >
        Submit your story
      </Button>
    </CtaPanel>
  );
}

export default function Testimonials() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await successStoriesAPI.getAll({ limit: 20, status: 'approved' });
      setStories(data.stories || []);
    } catch {
      setStories([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  return (
    <Box id="stories" sx={sectionSurface}>
      <Container maxWidth="lg">
        <SectionHeader
          title="Success stories"
          subtitle="Voices from families and communities touched by our programs."
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: 'var(--accent-green)' }} />
          </Box>
        ) : error ? (
          <ApiErrorState
            title="Stories unavailable"
            message="We couldn't load success stories right now. Please try again."
            onRetry={fetchStories}
          />
        ) : (
          <>
            {stories.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body1" sx={{ color: 'var(--gray)', mb: 1 }}>
                  No published stories yet.
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  overflowX: 'auto',
                  pb: 1,
                  scrollSnapType: 'x mandatory',
                  '&::-webkit-scrollbar': { height: 6 },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'var(--color-border)',
                    borderRadius: 3
                  }
                }}
              >
                {stories.map((story, index) => (
                  <StoryCard key={story._id || index} story={story} />
                ))}
              </Box>
            )}

            <ShareStoryCta onOpen={() => setStoryDialogOpen(true)} />
          </>
        )}
      </Container>

      <StorySubmission open={storyDialogOpen} onClose={() => setStoryDialogOpen(false)} />
    </Box>
  );
}
