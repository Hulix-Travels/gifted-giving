import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material';
import { FormatQuote as FormatQuoteIcon } from '@mui/icons-material';

const testimonials = [
  {
    quote: "Because of Gifted Giving, my daughter can now attend school. She dreams of becoming a doctor and helping others just as she's been helped. This program has changed our lives.",
    author: "Amina",
    role: "Mother from Kenya"
  },
  {
    quote: "The health kit saved my son's life when he had malaria. We couldn't afford treatment, but Gifted Giving provided everything needed. We're forever grateful for their support.",
    author: "James",
    role: "Father from Uganda"
  },
  {
    quote: "Volunteering with Gifted Giving changed my perspective on life. The children's resilience is inspiring. Seeing the direct impact of our work keeps me motivated to do more.",
    author: "Sarah",
    role: "Volunteer since 2018"
  }
];

export default function Testimonials() {
  return (
    <Box id="stories" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f5f5f5' }}>
      <Container maxWidth="lg">
        <Typography variant="h3" component="h2" textAlign="center" sx={{ mb: 6, fontWeight: 700, color: '#01371f' }}>
          Success Stories
        </Typography>
        
        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ 
                height: '100%',
                p: 4,
                bgcolor: '#fff',
                boxShadow: 3,
                position: 'relative',
                '&:hover': { boxShadow: 6 },
                transition: 'box-shadow 0.3s ease'
              }}>
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
                    "{testimonial.quote}"
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    color: '#01371f',
                    textAlign: 'right'
                  }}>
                    — {testimonial.author}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#666',
                    textAlign: 'right'
                  }}>
                    {testimonial.role}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
} 