import { Fragment } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

export default function StatStrip({ stats = [], loading = false, error = false }) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={32} sx={{ color: 'var(--accent-green)' }} />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mb: 1.5, color: 'var(--gray)' }}>
          Live stats temporarily unavailable
        </Typography>
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'stretch',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--white)',
          minHeight: { md: 72 }
        }}
      >
        {stats.map((stat, index) => (
          <Fragment key={stat.label}>
            {index > 0 && (
              <Box
                aria-hidden
                sx={{
                  flexShrink: 0,
                  bgcolor: 'var(--color-border)',
                  alignSelf: { xs: 'stretch', md: 'stretch' },
                  width: { xs: 'auto', md: '1px' },
                  height: { xs: '1px', md: 'auto' },
                  mx: { xs: 1.5, md: 0 },
                  my: { xs: 0, md: 1.5 }
                }}
              />
            )}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                px: { xs: 2, md: 1.5 },
                py: { xs: 2, md: 1.75 },
                textAlign: 'center',
                minWidth: 0
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 600,
                  color: 'var(--primary-green)',
                  fontSize: { xs: '1.125rem', md: '1.375rem' },
                  lineHeight: 1.2,
                  mb: 0.25
                }}
              >
                {stat.number}
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--gray)', fontWeight: 500, lineHeight: 1.3 }}>
                {stat.label}
              </Typography>
            </Box>
          </Fragment>
        ))}
      </Box>
    </Box>
  );
}
