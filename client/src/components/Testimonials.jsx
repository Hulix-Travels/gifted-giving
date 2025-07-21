import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import { FormatQuote as FormatQuoteIcon } from '@mui/icons-material';

export default function Testimonials() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${API_BASE_URL}/success-stories?limit=20`)
      .then(res => res.json())
      .then(data => {
        setStories(data.stories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Box id="stories" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f5f5f5' }}>
      <Container maxWidth={false} sx={{ px: 0 }}>
        <Typography variant="h3" component="h2" textAlign="center" sx={{ mb: 6, fontWeight: 700, color: '#01371f' }}>
          Success Stories
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : stories.length === 0 ? (
          <Typography textAlign="center">No stories yet.</Typography>
        ) : (
          <Box
            sx={{
              display: 'flex',
              overflowX: 'auto',
              gap: 4,
              py: 2,
              scrollSnapType: 'x mandatory'
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
                '&:hover': { boxShadow: 6 },
                transition: 'box-shadow 0.3s ease'
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
                  <Typography variant="body1" sx={{ 
                    mb: 4, 
                    fontStyle: 'italic',
                    fontSize: '1.1rem',
                    lineHeight: 1.7,
                    color: '#666',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    "{story.content}"
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    color: '#01371f',
                    textAlign: 'right'
                  }}>
                    — {story.author || 'Anonymous'}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#666',
                    textAlign: 'right'
                  }}>
                    {story.date ? new Date(story.date).toLocaleDateString() : ''}
                  </Typography>
                </CardContent>
              </Card>
          ))}
          </Box>
        )}
      </Container>
    </Box>
  );
} 