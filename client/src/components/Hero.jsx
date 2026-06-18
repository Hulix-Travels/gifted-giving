import React from 'react';
import { Box, Typography, Button, Stack, Container, Grid } from '@mui/material';
import useLiveStats from '../hooks/useLiveStats';
import formatStatValue from '../utils/formatStatValue';
import { typeScale } from '../theme/typography';
import StatStrip from './ui/StatStrip';

export default function Hero() {
  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const { stats: liveStats, loading: statsLoading, error: statsError } = useLiveStats();

  const heroStats = [
    {
      number: formatStatValue(liveStats?.childrenHelped, { loading: false, error: statsError }),
      label: 'Children helped'
    },
    {
      number: formatStatValue(liveStats?.communities, { loading: false, error: statsError }),
      label: 'Communities'
    },
    { number: '90%+', label: 'To programs' }
  ];

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        minHeight: { xs: 'auto', md: 'min(88vh, 780px)' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        overflow: 'hidden',
        backgroundColor: 'var(--dark-green)'
      }}
    >
      <Box
        component="img"
        src="/heroimge.jpg"
        alt=""
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 30%',
          display: 'block'
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 1,
          py: { xs: 4, md: 6 },
          px: { xs: 2, md: 3 }
        }}
      >
        <Grid container spacing={3} alignItems="flex-end">
          <Grid size={{ xs: 12, md: 7, lg: 6 }}>
            <Box
              sx={{
                backgroundColor: 'rgba(250, 247, 242, 0.97)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                p: { xs: 3, md: 4 },
                maxWidth: 540
              }}
            >
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 600,
                  color: 'var(--primary-green)',
                  fontSize: typeScale.heroTitle,
                  lineHeight: 1.2,
                  mb: 2
                }}
              >
                Give with gratitude.
                <Box component="span" sx={{ display: 'block', color: 'var(--accent-green)', mt: 0.5 }}>
                  Change a child&apos;s future.
                </Box>
              </Typography>

              <Typography
                component="p"
                sx={{
                  color: 'var(--gray)',
                  fontSize: typeScale.heroLead,
                  lineHeight: 1.6,
                  mb: 3,
                  maxWidth: 460
                }}
              >
                Support education, health, and nutrition for children in need — with full transparency
                about where every dollar goes.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  onClick={() => scrollToSection('#donate')}
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ px: 3, py: 1.25, fontWeight: 600, textTransform: 'none' }}
                >
                  Donate now
                </Button>
                <Button
                  onClick={() => scrollToSection('#programs')}
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 3,
                    py: 1.25,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderColor: 'var(--primary-green)',
                    color: 'var(--primary-green)',
                    '&:hover': {
                      borderColor: 'var(--dark-green)',
                      backgroundColor: 'var(--light-green)'
                    }
                  }}
                >
                  View programs
                </Button>
              </Stack>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <StatStrip stats={heroStats} loading={statsLoading} error={statsError} />
        </Box>
      </Container>
    </Box>
  );
}
