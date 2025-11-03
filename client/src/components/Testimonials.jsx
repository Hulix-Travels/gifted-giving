import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, CircularProgress, Button, Grid, Avatar, Rating } from '@mui/material';
import { FormatQuote as FormatQuoteIcon, Star, ArrowForward } from '@mui/icons-material';
import StorySubmission from './StorySubmission';

export default function Testimonials() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${API_BASE_URL}/success-stories?limit=20&status=approved`)
      .then(res => res.json())
      .then(data => {
        setStories(data.stories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenStoryDialog = () => {
    setStoryDialogOpen(true);
  };

  const handleCloseStoryDialog = () => {
    setStoryDialogOpen(false);
  };

  return (
    <Box 
      id="stories" 
      sx={{ 
        py: { xs: 8, md: 12 }, 
        background: 'linear-gradient(135deg, var(--light-gray) 0%, var(--white) 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 70% 30%, rgba(0,255,140,0.05) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth={false} sx={{ position: 'relative', zIndex: 2, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Section Title */}
        <Box sx={{ textAlign: 'center', mb: 8, maxWidth: 1200, mx: 'auto' }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 800,
              color: 'var(--primary-green)',
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
          Success Stories
        </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'var(--gray)',
              maxWidth: 600,
              mx: 'auto',
              fontSize: '1.2rem',
              lineHeight: 1.6
            }}
          >
            Real stories from real people whose lives have been transformed
          </Typography>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : stories.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h6" sx={{ color: 'var(--gray)', mb: 2 }}>
              No stories yet.
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--gray)' }}>
              Be the first to share your success story!
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                overflowX: 'auto',
                gap: 4,
                py: 2,
                px: { xs: 2, sm: 3, md: 4 },
                scrollSnapType: 'x mandatory',
                width: '100%',
                '&::-webkit-scrollbar': {
                  height: 8,
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(0,0,0,0.1)',
                  borderRadius: 4,
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'var(--primary-green)',
                  borderRadius: 4,
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'var(--dark-green)',
                },
              }}
            >
              {stories.map((story, index) => (
                <Card
                  key={story._id || index}
                  sx={{
                    minWidth: 320,
                    maxWidth: 400,
                    flex: '0 0 auto',
                    p: 4,
                    bgcolor: '#fff',
                    boxShadow: 3,
                    position: 'relative',
                    scrollSnapAlign: 'start',
                    borderRadius: 4,
                    '&:hover': { 
                      boxShadow: 6,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FormatQuoteIcon 
                    sx={{ 
                      fontSize: 60, 
                      color: 'rgba(0, 255, 140, 0.1)', 
                      position: 'absolute',
                      top: 16,
                      left: 24
                    }} 
                  />
                  <CardContent sx={{ pt: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Rating 
                        value={story.rating || 5} 
                        readOnly 
                        size="small" 
                        sx={{ color: 'var(--accent-green)' }} 
                      />
                    </Box>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        mb: 4, 
                        fontStyle: 'italic',
                        fontSize: '1.1rem',
                        lineHeight: 1.7,
                        color: '#666',
                        position: 'relative',
                        zIndex: 1
                      }}
                    >
                      "{story.content}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'var(--primary-green)', 
                          width: 40, 
                          height: 40,
                          fontSize: '1rem',
                          fontWeight: 700
                        }}
                      >
                        {(story.author || 'A').charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            color: '#01371f',
                            fontSize: '1rem'
                          }}
                        >
                          {story.author || 'Anonymous'}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#666',
                            fontSize: '0.9rem'
                          }}
                        >
                          {story.date ? new Date(story.date).toLocaleDateString() : ''}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Call to Action */}
            <Box 
              sx={{ 
                textAlign: 'center',
                p: 4,
                background: 'linear-gradient(135deg, var(--light-green), var(--white))',
                borderRadius: 4,
                border: '1px solid rgba(0,255,140,0.1)',
                maxWidth: 1200,
                mx: 'auto',
                mt: 4
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 2,
                  fontWeight: 700,
                  color: 'var(--primary-green)'
                }}
              >
                Share Your Story
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 3,
                  color: 'var(--gray)',
                  fontSize: '1.1rem',
                  maxWidth: 500,
                  mx: 'auto'
                }}
              >
                Have you been impacted by our programs? We'd love to hear your story and share it with our community.
              </Typography>
              <Button 
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={handleOpenStoryDialog}
                sx={{
                  background: 'linear-gradient(135deg, var(--primary-green), var(--dark-green))',
                  color: 'var(--white)',
                  px: 4,
                  py: 2,
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  boxShadow: 'var(--shadow-md)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, var(--dark-green), var(--primary-green))',
                    transform: 'translateY(-2px)',
                    boxShadow: 'var(--shadow-lg)'
                  }
                }}
              >
                Share Your Story
              </Button>
          </Box>
          </>
        )}
      </Container>

      {/* Story Submission Dialog */}
      <StorySubmission 
        open={storyDialogOpen} 
        onClose={handleCloseStoryDialog} 
      />
    </Box>
  );
} 