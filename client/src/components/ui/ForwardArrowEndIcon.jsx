import { Box } from '@mui/material';
import { ChevronRight, ArrowForward } from '@mui/icons-material';

export default function ForwardArrowEndIcon({ fontSize = 'small' }) {
  return (
    <Box
      component="span"
      aria-hidden
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: 20,
        height: 20,
        flexShrink: 0,
        '& .forward-arrow-angle': {
          display: 'inline-flex',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
        },
        '& .forward-arrow-full': {
          position: 'absolute',
          display: 'inline-flex',
          opacity: 0,
          transform: 'translateX(-5px)',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
        },
        '.MuiButton-root:hover & .forward-arrow-angle, button:hover & .forward-arrow-angle': {
          opacity: 0,
          transform: 'translateX(4px)',
        },
        '.MuiButton-root:hover & .forward-arrow-full, button:hover & .forward-arrow-full': {
          opacity: 1,
          transform: 'translateX(0)',
        },
      }}
    >
      <ChevronRight className="forward-arrow-angle" fontSize={fontSize} />
      <ArrowForward
        className="forward-arrow-full"
        sx={{ fontSize: fontSize === 'small' ? '1.125rem' : '1.25rem' }}
      />
    </Box>
  );
}
