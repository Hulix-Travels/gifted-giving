import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';

const stats = [
  { number: '10,000+', label: 'Children Helped', icon: '👶' },
  { number: '50+', label: 'Communities', icon: '🏘️' },
  { number: '500+', label: 'Volunteers', icon: '🤝' },
  { number: '15+', label: 'Countries', icon: '🌍' }
];

export default function Stats() {
  return (
    <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#fff' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper 
                elevation={2}
                sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  '&:hover': { 
                    elevation: 4,
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <Typography variant="h2" sx={{ mb: 1, fontSize: '2.5rem' }}>
                  {stat.icon}
                </Typography>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  color: '#00ff8c',
                  mb: 1
                }}>
                  {stat.number}
                </Typography>
                <Typography variant="body1" sx={{ color: '#666' }}>
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
} 