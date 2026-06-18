import { Box, Typography } from '@mui/material';

export default function CtaPanel({ title, description, children }) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        mt: 6,
        p: { xs: 3, md: 4 },
        backgroundColor: 'var(--white)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)'
      }}
    >
      {title && (
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            color: 'var(--primary-green)',
            mb: description ? 1 : 2
          }}
        >
          {title}
        </Typography>
      )}
      {description && (
        <Typography
          variant="body2"
          sx={{ color: 'var(--gray)', mb: 2.5, maxWidth: 480, mx: 'auto', lineHeight: 1.65 }}
        >
          {description}
        </Typography>
      )}
      {children}
    </Box>
  );
}
