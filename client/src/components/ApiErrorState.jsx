import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Refresh } from '@mui/icons-material';

export default function ApiErrorState({
  title = 'Unable to load data',
  message = 'We could not reach our servers. Please check your connection and try again.',
  onRetry,
  compact = false
}) {
  return (
    <Box sx={{ textAlign: 'center', py: compact ? 2 : 4, px: 2 }}>
      <Alert
        severity="warning"
        sx={{
          maxWidth: 520,
          mx: 'auto',
          mb: onRetry ? 2 : 0,
          textAlign: 'left'
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2">{message}</Typography>
      </Alert>
      {onRetry && (
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={onRetry}
          sx={{
            borderColor: 'var(--primary-green)',
            color: 'var(--primary-green)',
            '&:hover': { borderColor: 'var(--dark-green)', background: 'var(--light-green)' }
          }}
        >
          Try again
        </Button>
      )}
    </Box>
  );
}
