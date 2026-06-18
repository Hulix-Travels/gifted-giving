import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { Home, VolunteerActivism } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

export default function NotFound() {
  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        mt: 8,
        py: { xs: 10, md: 14 },
        background: 'var(--light-gray)',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <Typography variant="h1" sx={{ fontWeight: 800, color: 'var(--primary-green)', fontSize: { xs: '4rem', md: '5rem' }, mb: 1 }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--primary-green)', mb: 2 }}>
          Page not found
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--gray)', mb: 4, lineHeight: 1.7 }}>
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button component={RouterLink} to="/" variant="contained" startIcon={<Home />} sx={{ background: 'var(--primary-green)' }}>
            Back to Home
          </Button>
          <Button component={RouterLink} to="/volunteer" variant="outlined" startIcon={<VolunteerActivism />} sx={{ borderColor: 'var(--primary-green)', color: 'var(--primary-green)' }}>
            Volunteer
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
