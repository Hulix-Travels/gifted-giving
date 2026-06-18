import { Box, Typography } from '@mui/material';

export default function FormSection({ title, description, children, last }) {
  return (
    <Box
      sx={{
        mb: last ? 0 : 4,
        pb: last ? 0 : 4,
        borderBottom: last ? 'none' : '1px solid var(--color-border)'
      }}
    >
      <Typography
        variant="h6"
        component="h3"
        sx={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          color: 'var(--primary-green)',
          mb: description ? 0.5 : 2,
          fontSize: '1.0625rem'
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" sx={{ color: 'var(--gray)', mb: 2.5, lineHeight: 1.6 }}>
          {description}
        </Typography>
      )}
      {children}
    </Box>
  );
}
