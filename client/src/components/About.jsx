import React from 'react';
import { Box, Container, Typography, Grid, Button, CircularProgress, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useLiveStats from '../hooks/useLiveStats';
import formatStatValue from '../utils/formatStatValue';
import ApiErrorState from './ApiErrorState';
import SectionHeader from './ui/SectionHeader';
import StatStrip from './ui/StatStrip';
import { sectionWhite } from '../theme/styles';

export default function About() {
  const navigate = useNavigate();
  const { stats, loading, error, refetch } = useLiveStats();

  const impactStats = [
    {
      number: formatStatValue(stats?.childrenHelped, { loading, error }),
      label: 'Children helped'
    },
    {
      number: formatStatValue(stats?.communities, { loading, error }),
      label: 'Communities'
    },
    {
      number: formatStatValue(stats?.volunteers, { loading, error }),
      label: 'Volunteers'
    },
    {
      number: formatStatValue(stats?.countries, { loading, error }),
      label: 'Countries'
    },
    {
      number: formatStatValue(stats?.funds, { loading, error, prefix: '$' }),
      label: 'Funds raised'
    }
  ];

  return (
    <Box id="about" sx={sectionWhite}>
      <Container maxWidth="lg">
        <SectionHeader
          title="Our mission"
          subtitle="Education, nutrition, and healthcare for children — delivered with transparency and local partnership."
        />

        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center" sx={{ mb: { xs: 6, md: 8 } }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h5"
              component="h3"
              sx={{
                mb: 2,
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                color: 'var(--primary-green)',
                fontSize: { xs: '1.375rem', md: '1.5rem' },
                lineHeight: 1.35
              }}
            >
              Gratitude-driven giving creates lasting impact
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.75, color: 'var(--gray)' }}>
              Founded in 2020, Gifted givings combines gratitude with meaningful action. We work directly
              with schools, clinics, and community leaders so every contribution reaches the children who
              need it most.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.75, color: 'var(--gray)' }}>
              Over 90% of donations go to programs. We report openly on outcomes so you can see the
              difference your support makes.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => document.querySelector('#donate')?.scrollIntoView({ behavior: 'smooth' })}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Donate
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/volunteer')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: 'var(--primary-green)',
                  color: 'var(--primary-green)',
                  '&:hover': { borderColor: 'var(--dark-green)', backgroundColor: 'var(--light-green)' }
                }}
              >
                Volunteer
              </Button>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              component="img"
              src="/aboutimage.jpg"
              alt="Children learning"
              loading="lazy"
              decoding="async"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                display: 'block'
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              color: 'var(--primary-green)',
              textAlign: 'center',
              mb: 3
            }}
          >
            Our impact at a glance
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={40} sx={{ color: 'var(--accent-green)' }} />
            </Box>
          ) : error ? (
            <ApiErrorState
              title="Impact stats unavailable"
              message="We couldn't load our latest impact numbers. Please try again in a moment."
              onRetry={refetch}
            />
          ) : (
            <StatStrip stats={impactStats} />
          )}
        </Box>
      </Container>
    </Box>
  );
}
